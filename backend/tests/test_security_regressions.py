"""Real MongoDB / FastAPI regression checks using isolated fictitious data."""
import csv
import io
import ipaddress
import json
import logging
import os
import secrets
import sys
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone, timedelta
from pathlib import Path

import jwt
import pytest
from fastapi.testclient import TestClient
from pymongo import MongoClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import auth
import crm
import security
import seed
import server


class ClientIdentity:
    """Simulate the transport's client address, without trusting HTTP headers."""
    host = '198.51.100.1'

    async def __call__(self, scope, receive, send):
        if scope['type'] == 'http':
            scope = {**scope, 'client': (self.host, 12345)}
        await server.app(scope, receive, send)


@pytest.fixture(scope='module')
def app_client():
    identity = ClientIdentity()
    with TestClient(identity) as client:
        yield identity, client


@pytest.fixture
def api(app_client):
    identity, client = app_client
    identity.host = str(ipaddress.IPv6Address(int(ipaddress.IPv6Address('2001:db8::')) | secrets.randbits(96)))
    return client


@pytest.fixture(scope='module')
def database():
    with MongoClient(os.environ['MONGO_URL']) as client:
        yield client[os.environ['DB_NAME']]


@pytest.fixture
def account(database):
    def create(role='direction', agency=None, active=True):
        password = secrets.token_urlsafe(18)
        user = {'id': uuid.uuid4().hex, 'email': f'fictif-{uuid.uuid4().hex}@example.com',
                'name': 'TEST Compte fictif', 'role': role, 'agency': agency, 'active': active,
                'password_hash': auth.hash_password(password), 'created_at': datetime.now(timezone.utc).isoformat()}
        database.users.insert_one(dict(user))
        return user, {'email': user['email'], 'password': password}
    return create


def login(api, credentials):
    r = api.post('/api/auth/login', json=credentials)
    assert r.status_code == 200
    return r.json()['token']


def bearer(token):
    return {'Authorization': 'Bearer ' + token}


def signed_payload(user, **changes):
    timestamp = datetime.now(timezone.utc).timestamp()
    payload = {'sub': user['id'], 'email': user['email'], 'jti': uuid.uuid4().hex,
               'type': 'access', 'ver': user.get('session_version', 0), 'iat': timestamp,
               'nbf': timestamp, 'exp': timestamp + 3600, 'iss': auth.JWT_ISSUER, 'aud': auth.JWT_AUDIENCE}
    payload.update(changes)
    return payload


def signed(user, **changes):
    return jwt.encode(signed_payload(user, **changes), os.environ['JWT_SECRET'], algorithm='HS256')


def demand(api, agency='creteil', **fields):
    r = api.post('/api/demandes', json={'type': 'informations', 'agency': agency,
        'name': 'TEST Dossier fictif', 'email': 'fictif@example.com', **fields})
    assert r.status_code == 201
    return r.json()


def test_revocation_and_relogin_in_exact_same_instant(api, account, monkeypatch):
    admin, admin_creds = account()
    user, credentials = account('responsable', 'creteil')
    admin_token = login(api, admin_creds)
    fixed = datetime.now(timezone.utc).replace(microsecond=100000)
    monkeypatch.setattr(auth, 'now', lambda: fixed)
    old = login(api, credentials)
    assert api.get('/api/auth/me', headers=bearer(old)).status_code == 200
    assert api.patch('/api/crm/users/' + user['id'], json={'revoke_sessions': True},
                     headers=bearer(admin_token)).status_code == 200
    fresh = login(api, credentials)
    assert jwt.decode(old, options={'verify_signature': False})['iat'] == jwt.decode(fresh, options={'verify_signature': False})['iat']
    assert api.get('/api/auth/me', headers=bearer(old)).status_code == 401
    assert api.get('/api/auth/me', headers=bearer(fresh)).status_code == 200


def test_logout_revokes_only_that_session(api, account):
    user, credentials = account()
    first, second = login(api, credentials), login(api, credentials)
    assert api.post('/api/auth/logout', headers=bearer(first)).status_code == 200
    assert api.get('/api/auth/me', headers=bearer(first)).status_code == 401
    assert api.get('/api/auth/me', headers=bearer(second)).status_code == 200
    assert api.post('/api/auth/logout', headers=bearer(first)).status_code == 401


def test_disable_reactivate_never_restores_old_session(api, account):
    admin, admin_creds = account()
    user, credentials = account('accueil', 'bonneuil')
    h = bearer(login(api, admin_creds))
    old = login(api, credentials)
    assert api.patch('/api/crm/users/' + user['id'], json={'active': False}, headers=h).status_code == 200
    assert api.post('/api/auth/login', json=credentials).status_code == 403
    assert api.get('/api/auth/me', headers=bearer(old)).status_code == 401
    assert api.patch('/api/crm/users/' + user['id'], json={'active': True}, headers=h).status_code == 200
    assert api.get('/api/auth/me', headers=bearer(old)).status_code == 401
    assert api.get('/api/auth/me', headers=bearer(login(api, credentials))).status_code == 200


@pytest.mark.parametrize('field', ['sub', 'email', 'jti', 'exp', 'iat', 'nbf', 'ver', 'type', 'iss', 'aud'])
def test_missing_required_claim_denied(api, account, field):
    user, _ = account()
    payload = signed_payload(user)
    payload.pop(field)
    token = jwt.encode(payload, os.environ['JWT_SECRET'], algorithm='HS256')
    assert api.get('/api/auth/me', headers=bearer(token)).status_code == 401


@pytest.mark.parametrize('changes', [
    {'aud': 'other-service'}, {'iss': 'other-issuer'}, {'type': 'refresh'}, {'ver': '0'},
    {'ver': True}, {'ver': -1}, {'email': None}, {'exp': float('nan')},
    {'iat': datetime.now(timezone.utc).timestamp() + 300},
    {'nbf': datetime.now(timezone.utc).timestamp() + 300},
    {'exp': datetime.now(timezone.utc).timestamp() - 300},
    {'exp': datetime.now(timezone.utc).timestamp() + 90000},
])
def test_invalid_or_expired_claim_denied(api, account, changes):
    user, _ = account()
    assert api.get('/api/auth/me', headers=bearer(signed(user, **changes))).status_code == 401


def test_wrong_signature_algorithm_cookie_and_legacy_tokens_denied(api, account):
    user, _ = account()
    payload = signed_payload(user)
    wrong_key = jwt.encode(payload, secrets.token_urlsafe(48), algorithm='HS256')
    wrong_algorithm = jwt.encode(payload, os.environ['JWT_SECRET'], algorithm='HS384')
    legacy = jwt.encode({'sub': user['id'], 'email': user['email'], 'jti': uuid.uuid4().hex,
                        'iat': datetime.now(timezone.utc).timestamp(), 'exp': datetime.now(timezone.utc).timestamp() + 3600,
                        'type': 'access'}, os.environ['JWT_SECRET'], algorithm='HS256')
    for token in (wrong_key, wrong_algorithm, legacy, 'malformed'):
        assert api.get('/api/auth/me', headers=bearer(token)).status_code == 401
    assert api.get('/api/auth/me', headers={'Cookie': 'access_token=' + signed(user)}).status_code == 401


def test_deactivated_or_deleted_user_denied(api, account):
    user, _ = account(active=False)
    assert api.get('/api/auth/me', headers=bearer(signed(user))).status_code == 401
    nonexistent = {'id': uuid.uuid4().hex, 'email': 'absent@example.com'}
    assert api.get('/api/auth/me', headers=bearer(signed(nonexistent))).status_code == 401


@pytest.mark.parametrize('path', ['/demandes', '/demandes/unknown', '/relances', '/calendrier',
                                  '/users', '/audit', '/export?kind=prospects', '/sessions/unknown/inscriptions'])
def test_editor_cannot_read_private_resources(api, account, path):
    user, credentials = account('editeur')
    h = bearer(login(api, credentials))
    assert api.get('/api/crm' + path, headers=h).status_code == 403


def test_editor_dashboard_contains_no_dossiers_or_activity(api, account):
    demand(api)
    user, credentials = account('editeur')
    r = api.get('/api/crm/dashboard', headers=bearer(login(api, credentials)))
    assert r.status_code == 200
    assert r.json()['recent'] == [] and r.json()['total'] == 0 and r.json()['by_type'] == {}


@pytest.mark.parametrize('role,agency,other', [('responsable', 'creteil', 'bonneuil'), ('accueil', 'bonneuil', 'creteil')])
def test_all_prospect_paths_respect_agency(api, account, role, agency, other):
    local = demand(api, agency)
    local_duplicate = demand(api, agency)
    foreign = demand(api, other)
    user, credentials = account(role, agency)
    h = bearer(login(api, credentials))
    listed = api.get('/api/crm/demandes', params={'agency': other, 'q': 'TEST'}, headers=h)
    assert listed.status_code == 200 and listed.json()
    assert all(d['agency'] == agency for d in listed.json())
    own = api.get('/api/crm/demandes/' + local['id'], headers=h).json()
    assert local_duplicate['id'] in {d['id'] for d in own['duplicates']}
    assert all(d['agency'] == agency for d in own['duplicates'])
    assert foreign['id'] not in {d['id'] for d in own['duplicates']}
    for method, path, body in [
        ('get', '/demandes/' + foreign['id'], None),
        ('patch', '/demandes/' + foreign['id'], {'status': 'traite'}),
        ('post', '/demandes/' + foreign['id'] + '/relances', {'due_date': '2026-12-01', 'note': 'TEST Relance'}),
    ]:
        assert api.request(method, '/api/crm' + path, json=body, headers=h).status_code == 404
    dashboard = api.get('/api/crm/dashboard', headers=h).json()
    assert all(d['agency'] == agency for d in dashboard['recent'])
    slots = api.get('/api/crm/calendrier', params={'agency': other}, headers=h).json()
    assert slots and all(s['agency'] == agency for s in slots)
    assert foreign['id'] not in {d['id'] for s in slots for d in s['demandes']}


def test_scope_missing_or_invalid_agency_fails_closed(api, account):
    for agency in (None, 'invalid'):
        user, credentials = account('responsable', agency)
        h = bearer(login(api, credentials))
        for path in ('/demandes', '/calendrier', '/relances', '/dashboard', '/sessions'):
            assert api.get('/api/crm' + path, headers=h).status_code == 403


def test_relance_and_capacity_cannot_be_modified_across_agencies(api, account):
    admin, admin_creds = account()
    user, credentials = account('responsable', 'creteil')
    admin_h = bearer(login(api, admin_creds))
    h = bearer(login(api, credentials))
    foreign = demand(api, 'bonneuil')
    rel = api.post('/api/crm/demandes/' + foreign['id'] + '/relances', headers=admin_h,
                   json={'due_date': '2026-12-01', 'note': 'TEST Relance fictive'})
    assert rel.status_code == 201
    assert api.patch('/api/crm/relances/' + rel.json()['id'], headers=h).status_code == 404
    assert rel.json()['id'] not in {r['id'] for r in api.get('/api/crm/relances', headers=h).json()}
    slot = api.get('/api/creneaux?agency=bonneuil').json()[0]
    assert api.patch('/api/crm/calendrier/' + slot['id'], json={'capacity': 3}, headers=h).status_code == 404


def test_calendar_filters_foreign_records_even_if_slot_id_is_inconsistent(api, account, database):
    local_slot = api.get('/api/creneaux?agency=creteil').json()[0]
    foreign = demand(api, 'bonneuil')
    database.demandes.update_one({'id': foreign['id']}, {'$set': {'creneau_id': local_slot['id']}})
    database.creneaux.update_one({'id': local_slot['id']}, {'$inc': {'booked': 1}})
    user, credentials = account('responsable', 'creteil')
    slots = api.get('/api/crm/calendrier', headers=bearer(login(api, credentials))).json()
    assert foreign['id'] not in {d['id'] for s in slots for d in s['demandes']}


def test_inscriptions_and_confirmation_respect_agency(api, account):
    admin, admin_creds = account()
    user, credentials = account('responsable', 'creteil')
    editor, editor_creds = account('editeur')
    admin_h = bearer(login(api, admin_creds))
    h = bearer(login(api, credentials))
    s = api.post('/api/crm/sessions', headers=admin_h, json={'title': 'TEST Session fictive',
        'date_start': (datetime.now(timezone.utc) + timedelta(days=30)).date().isoformat(),
        'time_start': '09:00', 'time_end': '12:00', 'capacity': 10}).json()
    assert api.patch('/api/crm/sessions/' + s['id'], json={'status': 'publiee'}, headers=admin_h).status_code == 200
    own = demand(api, 'creteil', type='formation-ia', session_id=s['id'])
    foreign = demand(api, 'bonneuil', type='formation-ia', session_id=s['id'])
    inscriptions = api.get('/api/crm/sessions/' + s['id'] + '/inscriptions', headers=h)
    assert inscriptions.status_code == 200
    assert {d['id'] for d in inscriptions.json()} == {own['id']}
    assert api.patch('/api/crm/inscriptions/' + foreign['id'] + '?status=confirmee', headers=h).status_code == 404
    assert api.patch('/api/crm/inscriptions/' + own['id'] + '?status=confirmee', headers=h).status_code == 200
    assert api.get('/api/crm/sessions/' + s['id'] + '/inscriptions', headers=bearer(login(api, editor_creds))).status_code == 403
    assert api.patch('/api/crm/sessions/' + s['id'], json={'capacity': 20}, headers=h).status_code == 404
    assert api.patch('/api/crm/inscriptions/' + foreign['id'] + '?status=confirmee', headers=admin_h).status_code == 200


def test_user_creation_requires_a_valid_agency(api, account):
    user, credentials = account()
    h = bearer(login(api, credentials))
    for agency in (None, 'invalid'):
        r = api.post('/api/crm/users', headers=h, json={'email': f'{uuid.uuid4().hex}@example.com',
              'name': 'TEST Compte', 'password': secrets.token_urlsafe(18), 'role': 'accueil', 'agency': agency})
        assert r.status_code == 422


def test_public_tracking_unguessable_minimal_and_legacy_closed(api, database):
    d = demand(api, message='TEST Message privé fictif', phone='0600000000')
    ref = d['reference']
    assert len(ref.split('-')[4]) == 32
    r = api.get('/api/demandes/' + ref)
    assert r.status_code == 200
    assert set(r.json()) == {'reference', 'status', 'agency', 'type', 'created_at', 'creneau'}
    for value in (d['email'], d['name'], d['phone'], d['message'], d['id']):
        assert value not in r.text
    assert api.get('/api/demandes/' + ref.upper()).status_code == 200
    legacy = '-'.join(ref.split('-')[:4])
    for guessed in (legacy, legacy + '-' + '0' * 32, 'GSR-CRE-1999-9999'):
        assert api.get('/api/demandes/' + guessed).status_code == 404
    database.demandes.insert_one({'reference': legacy, 'name': 'TEST Historique privé'})
    assert api.get('/api/demandes/' + legacy).status_code == 404


def test_tracking_of_past_rappel_uses_read_model_not_creation_rules(api, database):
    day = (datetime.now(timezone.utc) + timedelta(days=1)).date()
    while day.weekday() > 4:
        day += timedelta(days=1)
    d = demand(api, type='rappel', rappel_date=day.isoformat(), rappel_time='13:00')
    database.demandes.update_one({'id': d['id']}, {'$set': {'rappel_date': '2020-01-01'}})
    assert api.get('/api/demandes/' + d['reference']).status_code == 200


def test_rate_limit_atomic_and_forwarded_spoofing_cannot_bypass(api, monkeypatch, app_client, database):
    monkeypatch.setattr(server, 'RATE_LIMIT_MAX', 5)
    def submit(index):
        return api.post('/api/demandes', headers={'X-Forwarded-For': f'192.0.2.{index}'},
                        json={'type': 'informations', 'agency': 'creteil', 'name': 'TEST Quota', 'email': 'rate@example.com'}).status_code
    with ThreadPoolExecutor(max_workers=10) as pool:
        results = list(pool.map(submit, range(20)))
    assert results.count(201) == 5 and results.count(429) == 15
    r = api.post('/api/demandes', headers={'X-Forwarded-For': '203.0.113.99', 'Forwarded': 'for=203.0.113.99'}, json={})
    assert r.status_code == 429 and int(r.headers['Retry-After']) > 0
    assert database.audit_log.count_documents({'action': 'rate_limited', 'target': 'demandes',
                                               'ip': app_client[0].host}) == 1


def test_public_invalid_payloads_also_consume_quota(api, monkeypatch):
    monkeypatch.setattr(server, 'RATE_LIMIT_MAX', 2)
    assert api.post('/api/demandes', content='{bad json').status_code == 422
    assert api.post('/api/demandes', json={}).status_code == 422
    assert api.post('/api/demandes', json={}).status_code == 429


def test_tracking_has_a_quota_and_cache_is_disabled(api, monkeypatch):
    monkeypatch.setenv('PUBLIC_READ_RATE_LIMIT_MAX', '2')
    for _ in range(2):
        r = api.get('/api/demandes/GSR-CRE-1999-9999')
        assert r.status_code == 404 and r.headers['Cache-Control'] == 'no-store'
    assert api.get('/api/demandes/GSR-CRE-1999-9999').status_code == 429


def test_honeypot_oversized_body_and_credentials_not_echoed(api):
    assert api.post('/api/demandes', json={'type': 'informations', 'agency': 'creteil',
        'name': 'TEST Spam', 'email': 'spam@example.com', 'website': 'https://example.com'}).status_code == 400
    assert api.post('/api/demandes', content=b'x' * 32769).status_code == 413
    r = api.post('/api/auth/login', json={'email': 'fictif@example.com', 'password': 'PRIVATE-FICTIF-' * 10})
    assert r.status_code == 422 and 'PRIVATE-FICTIF-' not in r.text
    assert api.post('/api/auth/login', json={'email': 'fictif@example.com', 'password': 'é' * 72}).status_code == 401


def test_login_failures_lock_account_across_client_ips_and_expire(api, app_client, account, database):
    user, credentials = account()
    identity, _ = app_client
    for index in range(5):
        identity.host = '192.0.2.' + str(index + 1)
        assert api.post('/api/auth/login', json={**credentials, 'password': 'Wrong-Fictif'}).status_code == 401
    identity.host = '192.0.2.50'
    assert api.post('/api/auth/login', json=credentials).status_code == 429
    database.login_attempts.update_one({'_id': security.private_key('login:' + user['email'])},
                                      {'$set': {'expires_at': datetime.now(timezone.utc) - timedelta(seconds=1)}})
    assert api.post('/api/auth/login', json=credentials).status_code == 200


def test_login_ip_quota_catches_rotating_accounts_and_invalid_requests(api, monkeypatch):
    monkeypatch.setenv('LOGIN_IP_LIMIT', '2')
    assert api.post('/api/auth/login', json={}).status_code == 422
    assert api.post('/api/auth/login', json={}).status_code == 422
    assert api.post('/api/auth/login', headers={'X-Forwarded-For': '203.0.113.5'}, json={}).status_code == 429


@pytest.mark.parametrize('origin', ['*', 'https://*.example.com', 'https://x.example.com/path',
                                   'https://user:pw@example.com', 'https://example.com?query', 'null'])
def test_cors_configuration_rejects_unsafe_origins(origin):
    with pytest.raises(ValueError):
        security.cors_origins(origin)


def test_cors_and_simple_cross_site_post_are_blocked(api):
    for path in ('/api/auth/login', '/api/demandes'):
        r = api.options(path, headers={'Origin': 'https://evil.example.com', 'Access-Control-Request-Method': 'POST'})
        assert r.status_code == 400 and 'access-control-allow-origin' not in r.headers
        r = api.post(path, headers={'Origin': 'https://evil.example.com'}, content='plain text')
        assert r.status_code == 403
    r = api.options('/api/demandes', headers={'Origin': 'http://127.0.0.1:3000',
        'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type'})
    assert r.status_code == 200 and r.headers['access-control-allow-origin'] == 'http://127.0.0.1:3000'
    assert 'access-control-allow-credentials' not in r.headers
    assert api.options('/api/demandes', headers={'Origin': 'http://127.0.0.1:3000',
                                                'Access-Control-Request-Method': 'DELETE'}).status_code == 400


def test_quota_retention_and_no_raw_ip(database, api):
    api.get('/api/demandes/unknown')
    index = database.security_limits.index_information()
    assert any(v.get('expireAfterSeconds') == 0 for v in index.values())
    row = database.security_limits.find_one({'bucket': 'suivi'})
    assert row and 'ip' not in row and len(row['_id']) == 64


def test_access_and_audit_logs_mask_tracking_capabilities(api, account, database):
    d = demand(api)
    r = logging.LogRecord('uvicorn.access', logging.INFO, '', 1, '%s - "%s %s HTTP/%s" %s',
                          ('127.0.0.1', 'GET', '/api/demandes/' + d['reference'], '1.1', 200), None)
    assert security.PrivateAccessLog().filter(r)
    assert d['reference'] not in r.getMessage()
    user, credentials = account()
    h = bearer(login(api, credentials))
    assert api.patch('/api/crm/demandes/' + d['id'], headers=h, json={'status': 'traite'}).status_code == 200
    event = database.audit_log.find_one({'action': 'demande_update', 'user': user['email']})
    assert event['target'] == '-'.join(d['reference'].split('-')[:4])


def test_spreadsheet_formula_injection_is_neutralized():
    values = ['=1+1', '+cmd', '-cmd', '@SUM(A1)', '  =1+1', '\t=1+1', '\rpayload', '\npayload', 'Texte normal']
    rows = list(csv.reader(io.StringIO(crm._csv([values], ['TEST']).lstrip('\ufeff')), delimiter=';'))
    assert all(rows[1][i].startswith("'") for i in range(8))
    assert rows[1][-1] == 'Texte normal'


def test_search_regex_is_treated_as_literal(api, account):
    user, credentials = account()
    h = bearer(login(api, credentials))
    literal = demand(api, name='TEST .* Littéral')
    r = api.get('/api/crm/demandes', params={'q': '.*'}, headers=h)
    assert r.status_code == 200 and {d['id'] for d in r.json()} == {literal['id']}
    assert api.get('/api/crm/demandes', params={'q': 'x' * 121}, headers=h).status_code == 422


def test_demo_seed_does_not_reset_existing_password(api, database):
    user = database.users.find_one({'email': os.environ['ADMIN_EMAIL']})
    # Reuse an independent hash from a fictitious account without revealing a password.
    changed = auth.hash_password(secrets.token_urlsafe(18))
    database.users.update_one({'id': user['id']}, {'$set': {'password_hash': changed}})
    # Execute seed on the running application loop via an isolated administrative helper call.
    import asyncio
    async def run():
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(os.environ['MONGO_URL'])
        try:
            await seed.seed_users(client[os.environ['DB_NAME']])
        finally:
            client.close()
    asyncio.run(run())
    assert database.users.find_one({'id': user['id']})['password_hash'] == changed
    # Restore only this fictitious account's original hash so existing independent tests retain access.
    database.users.update_one({'id': user['id']}, {'$set': {'password_hash': user['password_hash']}})


def test_weak_secret_fails_closed(monkeypatch):
    monkeypatch.setenv('JWT_SECRET', 'weak')
    with pytest.raises(RuntimeError):
        security.secret_key()


def test_duplicate_email_regex_does_not_match_unrelated_contacts(api, account):
    user, credentials = account()
    first = demand(api, email='dup.name@example.com')
    exact = demand(api, email='dup.name@example.com')
    different = demand(api, email='dupXname@example.com')
    detail = api.get('/api/crm/demandes/' + first['id'], headers=bearer(login(api, credentials))).json()
    ids = {d['id'] for d in detail['duplicates']}
    assert exact['id'] in ids and different['id'] not in ids


def test_default_startup_without_demo_flag_creates_no_demo_users_or_dossiers(database):
    import socket
    import subprocess
    import time
    import requests
    env = os.environ.copy()
    env['DB_NAME'] = 'gsr_security_seedoff_' + uuid.uuid4().hex
    for key in ('ENABLE_DEMO_SEED', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'DEMO_PASSWORD'):
        env.pop(key, None)
    with socket.socket() as bound:
        bound.bind(('127.0.0.1', 0))
        port = bound.getsockname()[1]
    backend = Path(__file__).resolve().parents[1]
    process = subprocess.Popen([sys.executable, '-m', 'uvicorn', 'server:app', '--host', '127.0.0.1',
                                '--port', str(port), '--no-proxy-headers'], cwd=backend, env=env,
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        ready = False
        for _ in range(100):
            assert process.poll() is None
            try:
                if requests.get(f'http://127.0.0.1:{port}/api/', timeout=.2).status_code == 200:
                    ready = True
                    break
            except requests.RequestException:
                pass
            time.sleep(.1)
        assert ready
        with MongoClient(env['MONGO_URL']) as client:
            isolated = client[env['DB_NAME']]
            assert isolated.users.count_documents({}) == 0
            assert isolated.demandes.count_documents({}) == 0
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
