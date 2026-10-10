"""Backend tests for GSR CRM endpoints (auth, RBAC, prospects, relances, calendrier, contenus, users)."""
import os
import pytest
import requests
from datetime import date, timedelta

BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL")
            or open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split("\n")[0].strip())
API = f"{BASE_URL.rstrip('/')}/api"

CRED = {
    "direction": ("direction@example.test", "Direction2026!"),
    "responsable": ("responsable.creteil@gsr-demo.fr", "Demo2026!"),
    "accueil": ("accueil.bonneuil@gsr-demo.fr", "Demo2026!"),
    "editeur": ("editeur@gsr-demo.fr", "Demo2026!"),
}


def login(role):
    email, pw = CRED[role]
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": pw}, timeout=10)
    assert r.status_code == 200, f"login {role} failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and "user" in data
    assert data["user"]["role"] == role
    return data["token"], data["user"]


@pytest.fixture(scope="session")
def tokens():
    return {role: login(role) for role in CRED}


def H(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- AUTH ----------
class TestAuth:
    def test_login_all_roles(self, tokens):
        for role, (tok, user) in tokens.items():
            assert user["role"] == role
            if role == "responsable":
                assert user["agency"] == "creteil"
            if role == "accueil":
                assert user["agency"] == "bonneuil"

    def test_login_wrong_password(self):
        # use a dedicated email to not pollute real account lockout counters
        r = requests.post(f"{API}/auth/login", json={"email": "nobody.test.gsr@example.com", "password": "WrongPass!"}, timeout=10)
        assert r.status_code == 401

    def test_me_with_token(self, tokens):
        tok, _ = tokens["direction"]
        r = requests.get(f"{API}/auth/me", headers=H(tok), timeout=10)
        assert r.status_code == 200
        assert r.json()["role"] == "direction"

    def test_me_without_token(self):
        r = requests.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 401


# ---------- RBAC ----------
class TestRBAC:
    def test_editeur_cannot_list_users(self, tokens):
        tok, _ = tokens["editeur"]
        r = requests.get(f"{API}/crm/users", headers=H(tok), timeout=10)
        assert r.status_code == 403

    def test_direction_lists_users(self, tokens):
        tok, _ = tokens["direction"]
        r = requests.get(f"{API}/crm/users", headers=H(tok), timeout=10)
        assert r.status_code == 200
        users = r.json()
        assert len(users) >= 4

    def test_responsable_sees_only_creteil_demandes(self, tokens):
        tok, _ = tokens["responsable"]
        r = requests.get(f"{API}/crm/demandes", headers=H(tok), timeout=10)
        assert r.status_code == 200
        for d in r.json():
            assert d["agency"] == "creteil"

    def test_accueil_sees_only_bonneuil_demandes(self, tokens):
        tok, _ = tokens["accueil"]
        r = requests.get(f"{API}/crm/demandes", headers=H(tok), timeout=10)
        assert r.status_code == 200
        for d in r.json():
            assert d["agency"] == "bonneuil"

    def test_direction_sees_both_agencies(self, tokens):
        tok, _ = tokens["direction"]
        r = requests.get(f"{API}/crm/demandes", headers=H(tok), timeout=10)
        assert r.status_code == 200
        agencies = {d["agency"] for d in r.json()}
        assert {"creteil", "bonneuil"}.issubset(agencies)

    def test_editeur_cannot_publish_article(self, tokens):
        # Find en_attente article id (as direction)
        tok_d, _ = tokens["direction"]
        articles = requests.get(f"{API}/crm/articles", headers=H(tok_d), timeout=10).json()
        pending = next((a for a in articles if a["status"] == "en_attente"), None)
        if not pending:
            # create one as editeur
            tok_e, _ = tokens["editeur"]
            cr = requests.post(f"{API}/crm/articles", headers=H(tok_e), json={"title": "TEST pending article", "body": "Contenu de test en attente de publication."}, timeout=10)
            assert cr.status_code == 201
            aid = cr.json()["id"]
            # move to en_attente
            requests.patch(f"{API}/crm/articles/{aid}?status=en_attente", headers=H(tok_e), timeout=10)
        else:
            aid = pending["id"]
        tok_e, _ = tokens["editeur"]
        r = requests.patch(f"{API}/crm/articles/{aid}?status=publie", headers=H(tok_e), timeout=10)
        assert r.status_code == 403


# ---------- PROSPECTS ----------
class TestProspects:
    def test_duplicates_count_for_awa(self, tokens):
        tok, _ = tokens["direction"]
        r = requests.get(f"{API}/crm/demandes", headers=H(tok), timeout=10)
        assert r.status_code == 200
        awa_rows = [d for d in r.json() if d["name"] == "Awa Diallo"]
        assert len(awa_rows) >= 2
        for row in awa_rows:
            assert row["duplicates_count"] >= 1

    def test_detail_contains_duplicates_history_relances(self, tokens):
        tok, _ = tokens["direction"]
        rows = requests.get(f"{API}/crm/demandes", headers=H(tok), timeout=10).json()
        awa = next(d for d in rows if d["name"] == "Awa Diallo")
        r = requests.get(f"{API}/crm/demandes/{awa['id']}", headers=H(tok), timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert "duplicates" in d and len(d["duplicates"]) >= 1
        assert "history" in d
        assert "relances" in d

    def test_patch_status_and_note_appends_history(self, tokens):
        tok, _ = tokens["direction"]
        rows = requests.get(f"{API}/crm/demandes", headers=H(tok), timeout=10).json()
        target = next(d for d in rows if d["status"] == "nouveau")
        before_hist = len(requests.get(f"{API}/crm/demandes/{target['id']}", headers=H(tok), timeout=10).json().get("history", []))
        r = requests.patch(f"{API}/crm/demandes/{target['id']}", headers=H(tok),
                           json={"status": "en_cours", "note": "TEST note from pytest"}, timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "en_cours"
        assert len(d["history"]) >= before_hist + 2  # status change + note


# ---------- RELANCES ----------
class TestRelances:
    def test_create_relance(self, tokens):
        tok, _ = tokens["direction"]
        rows = requests.get(f"{API}/crm/demandes", headers=H(tok), timeout=10).json()
        target = rows[0]
        due = (date.today() + timedelta(days=3)).isoformat()
        r = requests.post(f"{API}/crm/demandes/{target['id']}/relances", headers=H(tok),
                          json={"due_date": due, "note": "TEST relance", "channel": "telephone"}, timeout=10)
        assert r.status_code == 201, r.text
        assert r.json()["due_date"] == due

    def test_relances_lists_with_overdue_flag(self, tokens):
        tok, _ = tokens["direction"]
        r = requests.get(f"{API}/crm/relances", headers=H(tok), timeout=10)
        assert r.status_code == 200
        rel = r.json()
        assert any(x.get("overdue") for x in rel), "no overdue relance found"

    def test_mark_relance_done(self, tokens):
        tok, _ = tokens["direction"]
        rel = requests.get(f"{API}/crm/relances", headers=H(tok), timeout=10).json()
        pending = next(r for r in rel if not r["done"])
        r = requests.patch(f"{API}/crm/relances/{pending['id']}?done=true", headers=H(tok), timeout=10)
        assert r.status_code == 200
        assert r.json()["done"] is True


# ---------- CALENDRIER ----------
class TestCalendrier:
    def test_calendrier_creteil(self, tokens):
        tok, _ = tokens["direction"]
        r = requests.get(f"{API}/crm/calendrier?agency=creteil", headers=H(tok), timeout=10)
        assert r.status_code == 200
        slots = r.json()
        assert len(slots) > 0
        for s in slots:
            assert s["agency"] == "creteil"
            assert "demandes" in s

    def test_direction_can_update_capacity(self, tokens):
        tok, _ = tokens["direction"]
        slots = requests.get(f"{API}/crm/calendrier?agency=creteil", headers=H(tok), timeout=10).json()
        sid = slots[0]["id"]
        orig = slots[0]["capacity"]
        r = requests.patch(f"{API}/crm/calendrier/{sid}", headers=H(tok), json={"capacity": orig + 1}, timeout=10)
        assert r.status_code == 200
        assert r.json()["capacity"] == orig + 1
        # restore
        requests.patch(f"{API}/crm/calendrier/{sid}", headers=H(tok), json={"capacity": orig}, timeout=10)

    def test_accueil_cannot_update_capacity(self, tokens):
        tok_d, _ = tokens["direction"]
        slots = requests.get(f"{API}/crm/calendrier?agency=bonneuil", headers=H(tok_d), timeout=10).json()
        sid = slots[0]["id"]
        tok_a, _ = tokens["accueil"]
        r = requests.patch(f"{API}/crm/calendrier/{sid}", headers=H(tok_a), json={"capacity": 3}, timeout=10)
        assert r.status_code == 403
