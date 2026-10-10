import os
import uuid
import math
import secrets
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from security import consume_limit, private_key, secret_key

JWT_ALGORITHM = 'HS256'
JWT_ISSUER = 'gsr-api'
JWT_AUDIENCE = 'gsr-crm'
TOKEN_LIFETIME_SECONDS = 8 * 3600
ROLES = ('direction', 'responsable', 'accueil', 'editeur')
ROLE_LABELS = {'direction': 'Direction', 'responsable': "Responsable d'agence", 'accueil': 'Accueil', 'editeur': 'Éditeur de contenu'}
AGENCIES = ('creteil', 'bonneuil')
router = APIRouter(prefix='/auth')
_db = {}
secret_key()  # Fail closed, including when deployment accidentally supplies an empty/weak key.
_DUMMY_HASH = bcrypt.hashpw(secrets.token_bytes(32), bcrypt.gensalt()).decode()


def init(db):
    _db['db'] = db


def db():
    return _db['db']


def now():
    return datetime.now(timezone.utc)


def client_ip(request: Request) -> str:
    # Forwarded headers are resolved ONLY by the server's explicitly trusted proxy config.
    # Never trust a caller-supplied X-Forwarded-For directly.
    return request.client.host if request.client else '?'


async def log_action(action: str, request: Request = None, user: dict = None, target: str = '', meta: dict = None):
    if target.startswith('GSR-') and len(target.split('-')) == 5:
        target = '-'.join(target.split('-')[:4])  # No tracking capability in the audit log.
    await db().audit_log.insert_one({
        'id': str(uuid.uuid4()), 'at': now().isoformat(), 'action': action, 'target': target, 'meta': meta or {},
        'user': user['email'] if user else None, 'role': user['role'] if user else None,
        'ip': client_ip(request) if request else None,
    })


def hash_password(p: str) -> str:
    encoded = p.encode()
    if not 8 <= len(encoded) <= 72:
        raise HTTPException(422, 'Le mot de passe doit contenir entre 8 et 72 octets.')
    return bcrypt.hashpw(encoded, bcrypt.gensalt()).decode()


def verify_password(p: str, h: str) -> bool:
    if len(p.encode()) > 72:
        return False
    try:
        return bcrypt.checkpw(p.encode(), h.encode())
    except ValueError:
        return False


def create_access_token(user_id: str, email: str, session_version: int = 0) -> str:
    issued = now().timestamp()
    payload = {'sub': user_id, 'email': email, 'jti': str(uuid.uuid4()), 'iat': issued,
               'nbf': issued, 'exp': issued + TOKEN_LIFETIME_SECONDS, 'type': 'access',
               'ver': session_version, 'iss': JWT_ISSUER, 'aud': JWT_AUDIENCE}
    return jwt.encode(payload, secret_key(), algorithm=JWT_ALGORITHM)


def public_user(u: dict) -> dict:
    return {'id': u['id'], 'email': u['email'], 'name': u['name'], 'role': u['role'],
            'role_label': ROLE_LABELS[u['role']], 'agency': u.get('agency'), 'active': u.get('active', True),
            'last_login': u.get('last_login'), 'sessions_revoked_at': u.get('sessions_revoked_at')}


def _token_from(request: Request):
    h = request.headers.get('Authorization', '')
    return h[7:] if h.startswith('Bearer ') else None


async def get_current_user(request: Request) -> dict:
    token = _token_from(request)
    if not token:
        raise HTTPException(401, 'Non authentifié', headers={'WWW-Authenticate': 'Bearer'})
    try:
        payload = jwt.decode(token, secret_key(), algorithms=[JWT_ALGORITHM], issuer=JWT_ISSUER,
                             audience=JWT_AUDIENCE,
                             options={'require': ['sub', 'email', 'jti', 'iat', 'nbf', 'exp', 'type', 'ver', 'iss', 'aud']})
        if (payload['type'] != 'access' or not payload['sub'] or not payload['jti']
                or not isinstance(payload['email'], str)
                or type(payload['ver']) is not int or payload['ver'] < 0
                or any(type(payload[k]) not in (int, float) or not math.isfinite(payload[k])
                       for k in ('iat', 'nbf', 'exp'))
                or not 0 < payload['exp'] - payload['iat'] <= TOKEN_LIFETIME_SECONDS
                or payload['nbf'] < payload['iat']):
            raise jwt.InvalidTokenError()
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, 'Session expirée')
    except (jwt.InvalidTokenError, TypeError, ValueError, OverflowError):
        raise HTTPException(401, 'Jeton invalide')
    if await db().revoked_tokens.find_one({'jti': payload['jti']}):
        raise HTTPException(401, 'Session révoquée')
    user = await db().users.find_one({'id': payload['sub']}, {'_id': 0})
    if not user or user.get('role') not in ROLES:
        raise HTTPException(401, 'Session invalide')
    if not user.get('active', True):
        raise HTTPException(401, 'Compte désactivé')
    # Integer version makes revocation independent of clock precision and simultaneous logins.
    if payload['ver'] != user.get('session_version', 0):
        raise HTTPException(401, 'Session révoquée')
    request.state.jti = payload['jti']
    request.state.exp = payload['exp']
    return user


def require_roles(*roles):
    async def dep(user=Depends(get_current_user)):
        if user['role'] not in roles:
            raise HTTPException(403, 'Accès réservé : ' + ', '.join(ROLE_LABELS[r] for r in roles))
        if user['role'] in ('responsable', 'accueil') and user.get('agency') not in AGENCIES:
            raise HTTPException(403, 'Aucune agence autorisée pour ce compte')
        return user
    return dep


class LoginBody(BaseModel):
    email: str = Field(min_length=1, max_length=254)
    password: str = Field(min_length=1, max_length=72)


@router.post('/login')
async def login(body: LoginBody, request: Request):
    email = body.email.strip().lower()
    ident = private_key('login:' + email)
    att = await db().login_attempts.find_one({'_id': ident})
    if att and att['expires_at'].replace(tzinfo=timezone.utc) <= now():
        await db().login_attempts.delete_one({'_id': ident, 'expires_at': att['expires_at']})
        att = None
    if att and att.get('count', 0) >= 5:
        await log_action('login_blocked', request, target=email)
        raise HTTPException(429, 'Trop de tentatives. Réessayez dans 15 minutes.', headers={'Retry-After': '900'})
    user = await db().users.find_one({'email': email}, {'_id': 0})
    valid = verify_password(body.password, user['password_hash'] if user else _DUMMY_HASH)
    if not user or not valid:
        await db().login_attempts.update_one({'_id': ident},
            {'$inc': {'count': 1}, '$setOnInsert': {'expires_at': now() + timedelta(minutes=15)}}, upsert=True)
        await log_action('login_failed', request, target=email)
        raise HTTPException(401, 'E-mail ou mot de passe incorrect')
    if not user.get('active', True):
        await log_action('login_inactive', request, target=email)
        raise HTTPException(403, 'Compte désactivé. Contactez la Direction.')
    await db().login_attempts.delete_one({'_id': ident})
    await db().users.update_one({'id': user['id']}, {'$set': {'last_login': now().isoformat()}})
    await log_action('login', request, user)
    return {'token': create_access_token(user['id'], user['email'], user.get('session_version', 0)),
            'user': public_user(user)}


@router.get('/me')
async def me(user=Depends(get_current_user)):
    return public_user(user)


@router.post('/logout')
async def logout(request: Request, user=Depends(get_current_user)):
    await db().revoked_tokens.update_one({'jti': request.state.jti},
        {'$setOnInsert': {'exp': datetime.fromtimestamp(request.state.exp, tz=timezone.utc)}}, upsert=True)
    await log_action('logout', request, user)
    return {'ok': True}
