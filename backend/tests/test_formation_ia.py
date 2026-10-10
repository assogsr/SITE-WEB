"""Backend tests for /formation-ia/ feature (type=formation-ia demandes)."""
import os
import re
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def direction_token(session):
    r = session.post(f"{API}/auth/login", json={"email": "direction@example.test", "password": "Direction2026!"})
    assert r.status_code == 200, r.text
    return r.json()["token"]


def test_create_formation_ia_demande(session):
    payload = {
        "name": "TEST_IA User",
        "phone": "0601020304",
        "email": "test_ia@example.com",
        "agency": "creteil",
        "formation": "ia-decouverte",
        "message": "test",
        "type": "formation-ia",
        "structure": "Formation IA",
    }
    r = session.post(f"{API}/demandes", json=payload)
    assert r.status_code in (200, 201), r.text
    data = r.json()
    assert "reference" in data
    assert re.match(r"^GSR-(CRE|BON)-\d{4}-\d{4,}-[0-9a-f]{32}$", data["reference"]), data["reference"]
    ref = data["reference"]

    # Verify persistence + type is formation-ia
    g = session.get(f"{API}/demandes/{ref}")
    assert g.status_code == 200, g.text
    gd = g.json()
    assert gd.get("type") == "formation-ia"
    pytest.ref_ia = ref  # share across tests


def test_formation_ia_in_crm_prospects(session, direction_token):
    session.headers.update({"Authorization": f"Bearer {direction_token}"})
    # Try common filter param formats
    r = session.get(f"{API}/crm/demandes", params={"type": "formation-ia"})
    assert r.status_code == 200, r.text
    data = r.json()
    items = data if isinstance(data, list) else data.get("items", data.get("results", []))
    assert any(it.get("type") == "formation-ia" for it in items), f"No formation-ia in {len(items)} items"


def test_invalid_type_rejected(session):
    r = session.post(f"{API}/demandes", json={"name": "x", "phone": "0601020304", "type": "nonsense"})
    assert r.status_code in (400, 422)
