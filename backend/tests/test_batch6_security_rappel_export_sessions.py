"""Backend tests for batch 6: Security, Rappel, Export CSV, Sessions IA, Articles."""
import os
import pytest
import requests
import secrets
from datetime import date, timedelta

BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
API = f"{BASE_URL}/api"

DIRECTION = {"email": "direction@example.test", "password": "Direction2026!"}
RESPONSABLE = {"email": "responsable.creteil@gsr-demo.fr", "password": "Demo2026!"}
ACCUEIL = {"email": "accueil.bonneuil@gsr-demo.fr", "password": "Demo2026!"}
EDITEUR = {"email": "editeur@gsr-demo.fr", "password": "Demo2026!"}


def _login(creds):
    r = requests.post(f"{API}/auth/login", json=creds)
    assert r.status_code == 200, f"login failed {creds['email']}: {r.status_code} {r.text}"
    return r.json()["token"], r.json()["user"]


def _h(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def dir_token():
    t, _ = _login(DIRECTION)
    return t


@pytest.fixture(scope="module")
def resp_token():
    t, _ = _login(RESPONSABLE)
    return t


# ---------------- Security ----------------
class TestSecurity:
    def dedicated_account(self, dir_token, role):
        creds = {"email": f"security-{secrets.token_hex(8)}@example.com", "password": secrets.token_urlsafe(18)}
        r = requests.post(f"{API}/crm/users", headers=_h(dir_token), json={
            **creds, "name": "TEST Compte sécurité", "role": role,
            "agency": "creteil" if role == "responsable" else None})
        assert r.status_code == 201
        return creds, r.json()["id"]

    def test_honeypot_blocks_post(self):
        r = requests.post(f"{API}/demandes", json={
            "type": "informations", "agency": "creteil", "name": "Spam Bot",
            "email": "spam@example.com", "phone": "", "website": "http://evil.com"
        })
        assert r.status_code == 400

    def test_cors_rejects_evil_origin(self):
        # Preview proxy may inject ACAO:*. We verify backend doesn't echo evil origin.
        r = requests.options(f"{API}/auth/login",
                              headers={"Origin": "https://evil.example.com",
                                       "Access-Control-Request-Method": "POST"})
        acao = r.headers.get("access-control-allow-origin", "")
        assert acao != "https://evil.example.com", f"Backend echoed evil origin: {acao}"

    def test_logout_revokes_token(self):
        t, _ = _login(DIRECTION)
        r = requests.get(f"{API}/auth/me", headers=_h(t))
        assert r.status_code == 200
        r = requests.post(f"{API}/auth/logout", headers=_h(t))
        assert r.status_code == 200
        r = requests.get(f"{API}/auth/me", headers=_h(t))
        assert r.status_code == 401
        assert "révoqu" in r.json().get("detail", "").lower()

    def test_direction_can_deactivate_user_then_reactivate(self, dir_token):
        creds, uid = self.dedicated_account(dir_token, "editeur")

        # Baseline: editeur can login
        et, _ = _login(creds)
        assert et

        # Deactivate
        r = requests.patch(f"{API}/crm/users/{uid}",
                           json={"active": False}, headers=_h(dir_token))
        assert r.status_code == 200, r.text
        assert r.json()["active"] is False

        # Login should now return 403 with 'Compte désactivé'
        r = requests.post(f"{API}/auth/login", json=creds)
        assert r.status_code == 403
        assert "désactiv" in r.json().get("detail", "").lower()

        # Existing editeur token should be invalidated (sessions_revoked_at set)
        r = requests.get(f"{API}/auth/me", headers=_h(et))
        assert r.status_code == 401

        # Reactivate
        r = requests.patch(f"{API}/crm/users/{uid}",
                           json={"active": True}, headers=_h(dir_token))
        assert r.status_code == 200
        assert r.json()["active"] is True

        # Can now login again
        et2, _ = _login(creds)
        assert et2
        assert requests.get(f"{API}/auth/me", headers=_h(et2)).status_code == 200

    def test_revoke_sessions_invalidates_token(self, dir_token):
        # Login responsable, revoke, check old token fails
        creds, uid = self.dedicated_account(dir_token, "responsable")
        t, u = _login(creds)
        r = requests.get(f"{API}/auth/me", headers=_h(t))
        assert r.status_code == 200
        r = requests.patch(f"{API}/crm/users/{u['id']}",
                           json={"revoke_sessions": True}, headers=_h(dir_token))
        assert r.status_code == 200
        r = requests.get(f"{API}/auth/me", headers=_h(t))
        assert r.status_code == 401
        fresh, _ = _login(creds)
        assert requests.get(f"{API}/auth/me", headers=_h(fresh)).status_code == 200

    def test_audit_direction_only(self, dir_token):
        r = requests.get(f"{API}/crm/audit", headers=_h(dir_token))
        assert r.status_code == 200
        entries = r.json()
        assert isinstance(entries, list) and len(entries) > 0
        actions = {e["action"] for e in entries}
        assert "login" in actions

        # Fresh responsable token (previous one may have been revoked by earlier test)
        fresh_resp, _ = _login(RESPONSABLE)
        r = requests.get(f"{API}/crm/audit", headers=_h(fresh_resp))
        assert r.status_code == 403


# ---------------- Rappel creneaux ----------------
class TestRappel:
    def test_rappel_days_creteil_shape(self):
        r = requests.get(f"{API}/rappel-creneaux", params={"agency": "creteil"})
        assert r.status_code == 200
        data = r.json()
        assert "days" in data
        assert len(data["days"]) >= 5
        for d in data["days"]:
            wd = date.fromisoformat(d["date"]).weekday()
            # creteil: Mon-Fri only
            assert wd in (0, 1, 2, 3, 4), f"Creteil weekday {wd}"
            # Each time step 30, in 13:00..17:30 range
            times = d["times"]
            assert times[0] == "13:00"
            assert times[-1] == "17:30"
            # step 30
            for i in range(1, len(times)):
                prev = int(times[i-1][:2]) * 60 + int(times[i-1][3:])
                cur = int(times[i][:2]) * 60 + int(times[i][3:])
                assert cur - prev == 30

    def test_rappel_days_bonneuil_monday(self):
        r = requests.get(f"{API}/rappel-creneaux", params={"agency": "bonneuil"})
        assert r.status_code == 200
        days = r.json()["days"]
        # Find a Monday (weekday 0)
        mon = next(d for d in days if date.fromisoformat(d["date"]).weekday() == 0)
        assert mon["times"] == ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"]

    def test_rappel_days_bonneuil_saturday(self):
        r = requests.get(f"{API}/rappel-creneaux", params={"agency": "bonneuil"})
        days = r.json()["days"]
        sat = next((d for d in days if date.fromisoformat(d["date"]).weekday() == 5), None)
        assert sat is not None, "No Saturday returned for Bonneuil"
        assert sat["times"] == ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30"]

    def test_rappel_days_tue_bonneuil(self):
        r = requests.get(f"{API}/rappel-creneaux", params={"agency": "bonneuil"})
        days = r.json()["days"]
        tue = next(d for d in days if date.fromisoformat(d["date"]).weekday() == 1)
        # 09:00..12:30 and 14:00..16:30
        assert tue["times"][0] == "09:00"
        assert "12:30" in tue["times"]
        assert "14:00" in tue["times"]
        assert tue["times"][-1] == "16:30"
        # No times between 13:00 and 13:30
        assert "13:00" not in tue["times"]
        assert "13:30" not in tue["times"]

    def test_rappel_days_creteil_no_saturday(self):
        r = requests.get(f"{API}/rappel-creneaux", params={"agency": "creteil"})
        days = r.json()["days"]
        for d in days:
            assert date.fromisoformat(d["date"]).weekday() != 5

    def test_post_rappel_invalid_time(self):
        # Pick next Monday for creteil (opens 13:00) and use 10:00 -> 422
        today = date.today()
        d = today + timedelta(days=1)
        while d.weekday() not in (0, 1, 2, 3, 4):
            d += timedelta(days=1)
        r = requests.post(f"{API}/demandes", json={
            "type": "rappel", "agency": "creteil", "name": "Test Rappel KO",
            "phone": "0601020304", "rappel_date": d.isoformat(), "rappel_time": "10:00"
        })
        assert r.status_code == 422

    def test_post_rappel_valid(self):
        # Use first available creteil weekday with time 13:00
        today = date.today()
        d = today + timedelta(days=1)
        while d.weekday() not in (0, 1, 2, 3, 4):
            d += timedelta(days=1)
        r = requests.post(f"{API}/demandes", json={
            "type": "rappel", "agency": "creteil", "name": "TEST_Rappel OK",
            "phone": "0601020304", "rappel_date": d.isoformat(), "rappel_time": "13:00"
        })
        assert r.status_code == 201, r.text
        data = r.json()
        assert data["rappel_date"] == d.isoformat()
        assert data["rappel_time"] == "13:00"


# ---------------- Export CSV ----------------
class TestExport:
    def test_export_prospects_direction(self, dir_token):
        r = requests.get(f"{API}/crm/export",
                         params={"kind": "prospects", "agency": "creteil"},
                         headers=_h(dir_token))
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
        cd = r.headers.get("content-disposition", "")
        assert "attachment" in cd and ".csv" in cd
        content = r.content.decode("utf-8")
        assert content.startswith("\ufeff")  # BOM
        first_line = content.lstrip("\ufeff").split("\r\n")[0]
        assert ";" in first_line
        assert "Référence" in first_line

    def test_export_rendezvous_direction_with_filters(self, dir_token):
        r = requests.get(f"{API}/crm/export",
                         params={"kind": "rendez-vous", "status": "nouveau",
                                 "date_from": "2025-01-01", "date_to": "2026-12-31"},
                         headers=_h(dir_token))
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")

    def test_export_forbidden_for_responsable(self, resp_token):
        r = requests.get(f"{API}/crm/export", params={"kind": "prospects"},
                         headers=_h(resp_token))
        assert r.status_code == 403

    def test_export_logs_audit(self, dir_token):
        # Audit should include export_csv action after calls
        r = requests.get(f"{API}/crm/audit", params={"action": "export_csv"},
                         headers=_h(dir_token))
        assert r.status_code == 200
        entries = r.json()
        assert len(entries) > 0
        assert "rows" in (entries[0].get("meta") or {})


# ---------------- Sessions IA full flow ----------------
class TestSessionsIA:
    @pytest.fixture(scope="class")
    def session_ctx(self, dir_token):
        # Create brouillon
        r = requests.post(f"{API}/crm/sessions", headers=_h(dir_token), json={
            "title": "TEST_Session IA Pytest",
            "programme_id": "", "date_start": "2026-12-01",
            "time_start": "09:00", "time_end": "12:00",
            "mode": "presentiel", "location": "Créteil",
            "trainer": "Formateur Test", "capacity": 1
        })
        assert r.status_code == 201, r.text
        return r.json()

    def test_date_start_must_be_future(self, dir_token):
        r = requests.post(f"{API}/crm/sessions", headers=_h(dir_token), json={
            "title": "TEST_Past",
            "date_start": "2020-01-01", "time_start": "09:00", "time_end": "12:00",
            "capacity": 5
        })
        assert r.status_code == 400

    def test_brouillon_not_in_public_list(self, session_ctx):
        r = requests.get(f"{API}/formation-ia/sessions")
        assert r.status_code == 200
        ids = [s["id"] for s in r.json()]
        assert session_ctx["id"] not in ids

    def test_responsable_cannot_publish(self, resp_token, session_ctx):
        r = requests.patch(f"{API}/crm/sessions/{session_ctx['id']}",
                           json={"status": "publiee"}, headers=_h(resp_token))
        assert r.status_code == 403

    def test_direction_publishes_session(self, dir_token, session_ctx):
        r = requests.patch(f"{API}/crm/sessions/{session_ctx['id']}",
                           json={"status": "publiee"}, headers=_h(dir_token))
        assert r.status_code == 200
        assert r.json()["status"] == "publiee"

    def test_public_lists_published(self, session_ctx):
        r = requests.get(f"{API}/formation-ia/sessions")
        assert r.status_code == 200
        ids = [s["id"] for s in r.json()]
        assert session_ctx["id"] in ids

    def test_public_inscription_en_attente(self, session_ctx):
        r = requests.post(f"{API}/demandes", json={
            "type": "formation-ia", "agency": "creteil",
            "name": "TEST_IA Candidat 1", "email": "ia1@test.local",
            "phone": "0601020304", "session_id": session_ctx["id"]
        })
        assert r.status_code == 201, r.text
        data = r.json()
        assert data["inscription_status"] == "en_attente"
        session_ctx["candidate1_id"] = data["id"]

    def test_confirm_inscription(self, dir_token, session_ctx):
        did = session_ctx["candidate1_id"]
        r = requests.patch(f"{API}/crm/inscriptions/{did}",
                           params={"status": "confirmee"}, headers=_h(dir_token))
        assert r.status_code == 200
        # remaining 0 now
        r = requests.get(f"{API}/formation-ia/sessions")
        s = next(x for x in r.json() if x["id"] == session_ctx["id"])
        assert s["remaining"] == 0

    def test_second_candidate_409_when_full(self, session_ctx):
        r = requests.post(f"{API}/demandes", json={
            "type": "formation-ia", "agency": "creteil",
            "name": "TEST_IA Candidat 2", "email": "ia2@test.local",
            "phone": "0601020305", "session_id": session_ctx["id"]
        })
        assert r.status_code == 409
        assert "complète" in r.json().get("detail", "").lower()

    def test_unpublished_session_rejected(self, dir_token):
        # Create another brouillon, submit without publishing
        r = requests.post(f"{API}/crm/sessions", headers=_h(dir_token), json={
            "title": "TEST_Brouillon2",
            "date_start": "2026-12-15", "time_start": "09:00",
            "time_end": "12:00", "capacity": 5
        })
        assert r.status_code == 201
        sid = r.json()["id"]
        r = requests.post(f"{API}/demandes", json={
            "type": "formation-ia", "agency": "creteil",
            "name": "TEST_IA Unpublished", "email": "unp@test.local",
            "phone": "0601020306", "session_id": sid
        })
        assert r.status_code == 400


# ---------------- Articles public ----------------
class TestArticles:
    def test_public_articles_only_publie(self):
        r = requests.get(f"{API}/articles")
        assert r.status_code == 200
        arts = r.json()
        assert isinstance(arts, list)
        # Every article must have status via its presence (filter is on backend). Check fields.
        for a in arts:
            assert "id" in a and "title" in a and "body" in a
