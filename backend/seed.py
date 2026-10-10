import os
import uuid
import random
from datetime import datetime, timezone, timedelta, date
from auth import hash_password

NAMES = ["Awa Diallo", "Lucas Martin", "Inès Benali", "Mehdi Haddad", "Chloé Lefèvre", "Yanis Traoré", "Sarah Cohen", "Mamadou Sow", "Léa Moreau", "Karim Bouzid", "Fatou Ndiaye", "Thomas Petit"]
TYPES = ["rendez-vous", "informations", "inscription", "rappel", "intervention", "partenariat"]
STATUSES = ["nouveau", "nouveau", "en_cours", "rdv_fixe", "inscrit", "traite"]



async def seed_users(db):
    accounts = [
        {"email": os.environ["ADMIN_EMAIL"], "name": "Direction GSR", "role": "direction", "agency": None, "pw": os.environ["ADMIN_PASSWORD"]},
        {"email": "responsable.creteil@gsr-demo.fr", "name": "Nadia Responsable", "role": "responsable", "agency": "creteil", "pw": os.environ["DEMO_PASSWORD"]},
        {"email": "accueil.bonneuil@gsr-demo.fr", "name": "Samir Accueil", "role": "accueil", "agency": "bonneuil", "pw": os.environ["DEMO_PASSWORD"]},
        {"email": "editeur@gsr-demo.fr", "name": "Camille Éditrice", "role": "editeur", "agency": None, "pw": os.environ["DEMO_PASSWORD"]},
    ]
    for a in accounts:
        ex = await db.users.find_one({"email": a["email"]})
        if not ex:
            await db.users.insert_one({"id": str(uuid.uuid4()), "email": a["email"], "name": a["name"], "role": a["role"], "agency": a["agency"], "password_hash": hash_password(a["pw"]), "created_at": datetime.now(timezone.utc).isoformat()})


async def seed_demandes(db, next_reference):
    if await db.demandes.count_documents({"seeded": True}) > 0:
        return
    rnd = random.Random(42)
    today = date.today()
    for i, name in enumerate(NAMES):
        agency = "creteil" if i % 2 == 0 else "bonneuil"
        phone = f"06{rnd.randint(10000000, 99999999)}"
        email = f"{name.split()[0].lower()}.{name.split()[1].lower()}@exemple.fr"
        created = datetime.now(timezone.utc) - timedelta(days=rnd.randint(0, 20), hours=rnd.randint(0, 10))
        d = {"id": str(uuid.uuid4()), "reference": await next_reference(agency), "type": TYPES[i % len(TYPES)], "agency": agency, "name": name, "phone": phone, "email": email, "message": "Demande fictive de démonstration.", "formation": "permis-b" if i % 3 == 0 else "", "structure": "Collège fictif" if TYPES[i % len(TYPES)] == "intervention" else "", "creneau_id": None, "status": STATUSES[i % len(STATUSES)], "created_at": created.isoformat(), "seeded": True, "history": [{"at": created.isoformat(), "by": "Site web", "kind": "creation", "text": "Demande reçue via le formulaire"}]}
        if d["status"] == "rdv_fixe":
            slot = await db.creneaux.find_one_and_update({"agency": agency, "$expr": {"$lt": ["$booked", "$capacity"]}}, {"$inc": {"booked": 1}}, sort=[("date", 1)])
            if slot:
                d["creneau_id"] = slot["id"]
        await db.demandes.insert_one({**d})
        if i in (1, 4):
            await db.relances.insert_one({"id": str(uuid.uuid4()), "demande_id": d["id"], "reference": d["reference"], "name": name, "agency": agency, "due_date": (today - timedelta(days=1 if i == 1 else -2)).isoformat(), "note": "Rappeler pour confirmer les pièces du dossier", "channel": "telephone", "done": False, "created_by": "Nadia Responsable", "created_at": created.isoformat()})
    # doublon volontaire : même téléphone qu'Awa Diallo, autre agence
    first = await db.demandes.find_one({"name": NAMES[0]}, {"_id": 0})
    dup = {**first, "id": str(uuid.uuid4()), "reference": await next_reference("bonneuil"), "agency": "bonneuil", "type": "rappel", "status": "nouveau", "created_at": datetime.now(timezone.utc).isoformat(), "history": [{"at": datetime.now(timezone.utc).isoformat(), "by": "Site web", "kind": "creation", "text": "Demande reçue via le formulaire"}]}
    await db.demandes.insert_one(dup)
    if await db.articles.count_documents({}) == 0:
        await db.articles.insert_one({"id": str(uuid.uuid4()), "title": "Journée prévention au lycée (exemple)", "cat": "Prévention", "body": "Article fictif rédigé par l'éditeur, en attente de validation par la Direction.", "status": "en_attente", "author": "Camille Éditrice", "created_at": datetime.now(timezone.utc).isoformat(), "history": []})
