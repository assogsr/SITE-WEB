import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL') or open('/app/frontend/.env').read().split('REACT_APP_BACKEND_URL=')[1].split('\n')[0].strip()
API = f"{BASE_URL.rstrip('/')}/api"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


class TestCreneaux:
    def test_creneaux_creteil(self, s):
        r = s.get(f"{API}/creneaux", params={"agency": "creteil"})
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) > 0
        slot = data[0]
        for k in ("id", "agency", "date", "time", "capacity", "booked", "remaining"):
            assert k in slot
        assert slot["agency"] == "creteil"
        # no sundays (weekday 6)
        from datetime import date
        for s_ in data:
            assert date.fromisoformat(s_["date"]).weekday() != 6

    def test_creneaux_bonneuil(self, s):
        r = s.get(f"{API}/creneaux", params={"agency": "bonneuil"})
        assert r.status_code == 200
        assert len(r.json()) > 0

    def test_creneaux_invalid_agency(self, s):
        r = s.get(f"{API}/creneaux", params={"agency": "foo"})
        assert r.status_code == 400


class TestDemandes:
    def test_missing_phone_and_email(self, s):
        r = s.post(f"{API}/demandes", json={
            "type": "informations", "agency": "creteil", "name": "TEST User"
        })
        assert r.status_code == 422
        body = r.text
        assert "Téléphone ou e-mail obligatoire" in body

    def test_create_valid_and_get(self, s):
        r = s.post(f"{API}/demandes", json={
            "type": "informations", "agency": "creteil",
            "name": "TEST Alpha", "email": "test_alpha@example.com",
            "message": "Bonjour"
        })
        assert r.status_code == 201, r.text
        d = r.json()
        ref = d["reference"]
        import re
        assert re.match(r"^GSR-CRE-\d{4}-\d{4,}-[0-9a-f]{32}$", ref), ref
        assert d["status"] == "nouveau"

        g = s.get(f"{API}/demandes/{ref}")
        assert g.status_code == 200
        assert g.json()["reference"] == ref

    def test_sequential_reference(self, s):
        r1 = s.post(f"{API}/demandes", json={
            "type": "informations", "agency": "creteil",
            "name": "TEST Seq1", "phone": "0601020304"
        })
        r2 = s.post(f"{API}/demandes", json={
            "type": "informations", "agency": "creteil",
            "name": "TEST Seq2", "phone": "0601020305"
        })
        assert r1.status_code == 201 and r2.status_code == 201
        n1 = int(r1.json()["reference"].split("-")[3])
        n2 = int(r2.json()["reference"].split("-")[3])
        assert n2 == n1 + 1

    def test_get_unknown_reference_404(self, s):
        r = s.get(f"{API}/demandes/GSR-CRE-1999-9999")
        assert r.status_code == 404

    def test_capacity_409(self, s):
        # Pick a creneau with remaining > 0
        creneaux = s.get(f"{API}/creneaux", params={"agency": "bonneuil"}).json()
        slot = next((c for c in creneaux if c["remaining"] == 2), None)
        assert slot, "no fully free slot found"
        sid = slot["id"]
        for i in range(2):
            r = s.post(f"{API}/demandes", json={
                "type": "rendez-vous", "agency": "bonneuil",
                "name": f"TEST Cap{i}", "phone": f"060000000{i}",
                "creneau_id": sid
            })
            assert r.status_code == 201, r.text
        r3 = s.post(f"{API}/demandes", json={
            "type": "rendez-vous", "agency": "bonneuil",
            "name": "TEST Cap3", "phone": "0600000099",
            "creneau_id": sid
        })
        assert r3.status_code == 409
        assert "complet" in r3.text.lower()

        # Verify remaining=0
        creneaux2 = s.get(f"{API}/creneaux", params={"agency": "bonneuil"}).json()
        updated = next(c for c in creneaux2 if c["id"] == sid)
        assert updated["remaining"] == 0
        assert updated["booked"] == 2
