from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReturnDocument
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, model_validator
from typing import List, Optional, Literal
import uuid
import secrets
from datetime import datetime, timezone, timedelta, date

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

import auth as auth_mod
import crm as crm_mod
import sessions as sessions_mod
from seed import seed_users, seed_demandes
from security import cors_origins, consume_limit, PrivateAccessLog

app = FastAPI()
ALLOWED_ORIGINS = cors_origins(os.environ.get('CORS_ORIGINS', ''))
api_router = APIRouter(prefix="/api")

AGENCY_CODE = {"creteil": "CRE", "bonneuil": "BON"}
DEMANDE_TYPES = ("informations", "inscription", "rendez-vous", "rappel", "intervention", "partenariat", "formation-ia")
SLOT_HOURS = ["09:30", "11:00", "14:00", "15:30", "17:00"]
OPENING = {
    "creteil": {0: [("13:00", "18:00")], 1: [("13:00", "18:00")], 2: [("13:00", "18:00")], 3: [("13:00", "18:00")], 4: [("13:00", "18:00")]},
    "bonneuil": {0: [("13:00", "17:00")], 1: [("09:00", "13:00"), ("14:00", "17:00")], 2: [("09:00", "13:00"), ("14:00", "17:00")], 3: [("09:00", "13:00"), ("14:00", "17:00")], 4: [("09:00", "13:00"), ("14:00", "17:00")], 5: [("10:00", "13:00")]},
}


def rappel_times(agency: str, weekday: int):
    out = []
    for start, end in OPENING[agency].get(weekday, []):
        h, m = map(int, start.split(":"))
        eh, em = map(int, end.split(":"))
        while (h, m) < (eh, em):
            out.append(f"{h:02d}:{m:02d}")
            m += 30
            if m == 60:
                h, m = h + 1, 0
    return out


def rappel_days(agency: str, count: int = 10):
    days, d = [], date.today()
    while len(days) < count:
        d += timedelta(days=1)
        times = rappel_times(agency, d.weekday())
        if times:
            days.append({"date": d.isoformat(), "times": times})
    return days


def now_iso():
    return datetime.now(timezone.utc).isoformat()


class Creneau(BaseModel):
    id: str
    agency: str
    date: str
    time: str
    capacity: int
    booked: int
    remaining: int


class DemandeCreate(BaseModel):
    type: Literal[DEMANDE_TYPES]
    agency: Literal["creteil", "bonneuil"]
    name: str = Field(min_length=2, max_length=120)
    phone: Optional[str] = Field(default="", max_length=40)
    email: Optional[str] = Field(default="", max_length=254)
    message: Optional[str] = Field(default="", max_length=2000)
    formation: Optional[str] = Field(default="", max_length=120)
    structure: Optional[str] = Field(default="", max_length=200)
    creneau_id: Optional[str] = Field(default=None, max_length=120)
    website: Optional[str] = Field(default="", max_length=200)
    rappel_date: Optional[str] = None
    rappel_time: Optional[str] = None
    session_id: Optional[str] = Field(default=None, max_length=100)

    @model_validator(mode="after")
    def rappel_in_opening_hours(self):
        if self.type != "rappel":
            return self
        if not self.rappel_date or not self.rappel_time:
            raise ValueError("Choisissez une date et un horaire de rappel")
        d = date.fromisoformat(self.rappel_date)
        if d <= date.today():
            raise ValueError("La date de rappel doit être ultérieure à aujourd'hui")
        if self.rappel_time not in rappel_times(self.agency, d.weekday()):
            raise ValueError("Cet horaire est en dehors des heures d'ouverture de l'agence")
        return self

    @model_validator(mode="after")
    def phone_or_email(self):
        if not (self.phone or "").strip() and not (self.email or "").strip():
            raise ValueError("Téléphone ou e-mail obligatoire")
        return self


class Demande(DemandeCreate):
    id: str
    reference: str
    status: str
    created_at: str
    creneau: Optional[Creneau] = None
    inscription_status: Optional[str] = None


class PublicCreneau(BaseModel):
    date: str
    time: str


class PublicDemande(BaseModel):
    # Only what the existing tracking page renders; never return CRM IDs, contacts or messages.
    reference: str
    status: str
    agency: str
    type: str
    created_at: str
    creneau: Optional[PublicCreneau] = None


def slot_out(d) -> Creneau:
    return Creneau(id=d["id"], agency=d["agency"], date=d["date"], time=d["time"], capacity=d["capacity"], booked=d["booked"], remaining=max(0, d["capacity"] - d["booked"]))


async def ensure_slots():
    today = date.today()
    for agency in AGENCY_CODE:
        for i in range(1, 15):
            d = today + timedelta(days=i)
            if d.weekday() == 6:
                continue
            for t in SLOT_HOURS:
                sid = f"{agency}-{d.isoformat()}-{t}"
                await db.creneaux.update_one(
                    {"id": sid},
                    {"$setOnInsert": {"id": sid, "agency": agency, "date": d.isoformat(), "time": t, "capacity": 2, "booked": 0}},
                    upsert=True,
                )


async def next_reference(agency: str) -> str:
    year = datetime.now(timezone.utc).year
    key = f"{agency}-{year}"
    c = await db.counters.find_one_and_update({"_id": key}, {"$inc": {"seq": 1}}, upsert=True, return_document=ReturnDocument.AFTER)
    return f"GSR-{AGENCY_CODE[agency]}-{year}-{c['seq']:04d}-{secrets.token_hex(16)}"


@api_router.get("/")
async def root():
    return {"message": "GSR API", "demo": True}


@api_router.get("/creneaux", response_model=List[Creneau])
async def list_creneaux(agency: str):
    if agency not in AGENCY_CODE:
        raise HTTPException(400, "Agence inconnue")
    today = date.today().isoformat()
    docs = await db.creneaux.find({"agency": agency, "date": {"$gt": today}}, {"_id": 0}).sort([("date", 1), ("time", 1)]).to_list(200)
    return [slot_out(d) for d in docs]


RATE_LIMIT_MAX = int(os.environ.get("PUBLIC_RATE_LIMIT_MAX", "5"))
RATE_LIMIT_WINDOW_MIN = int(os.environ.get("PUBLIC_RATE_LIMIT_WINDOW_MIN", "10"))


async def check_rate_limit(request: Request, bucket: str):
    await consume_limit(db, bucket, auth_mod.client_ip(request), RATE_LIMIT_MAX,
                        RATE_LIMIT_WINDOW_MIN * 60)


@app.exception_handler(RequestValidationError)
async def validation_error(request, exc):
    # Pydantic's default input/context fields can echo passwords or whole personal records.
    return JSONResponse(status_code=422, content={'detail': [
        {k: e[k] for k in ('loc', 'msg', 'type')} for e in exc.errors()]})


@app.middleware('http')
async def api_security(request: Request, call_next):
    path = request.url.path
    if not path.startswith('/api/'):
        return await call_next(request)
    if request.method in ('POST', 'PATCH', 'DELETE', 'PUT'):
        origin = request.headers.get('origin')
        if origin is not None and origin not in ALLOWED_ORIGINS:
            return JSONResponse({'detail': 'Origine non autorisée'}, status_code=403,
                                headers={'Cache-Control': 'no-store'})
    try:
        if request.method == 'POST' and path == '/api/demandes':
            await check_rate_limit(request, 'demandes')
        elif request.method == 'POST' and path == '/api/auth/login':
            await consume_limit(db, 'login-ip', auth_mod.client_ip(request),
                                int(os.environ.get('LOGIN_IP_LIMIT', '120')), 900)
        elif request.method == 'GET' and path.startswith('/api/demandes/'):
            await consume_limit(db, 'suivi', auth_mod.client_ip(request),
                                int(os.environ.get('PUBLIC_READ_RATE_LIMIT_MAX', '60')), 600)
    except HTTPException as exc:
        if getattr(exc, 'audit_first', False):
            await auth_mod.log_action('rate_limited', request, target='connexion' if path == '/api/auth/login'
                                     else 'demandes' if path == '/api/demandes' else 'suivi')
        return JSONResponse({'detail': exc.detail}, status_code=exc.status_code,
                            headers={**(exc.headers or {}), 'Cache-Control': 'no-store'})
    if request.method in ('POST', 'PATCH', 'PUT'):
        chunks, size = [], 0
        async for chunk in request.stream():
            size += len(chunk)
            if size > 32768:
                return JSONResponse({'detail': 'Requête trop volumineuse'}, status_code=413,
                                    headers={'Cache-Control': 'no-store'})
            chunks.append(chunk)
        request._body = b''.join(chunks)
    response = await call_next(request)
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Referrer-Policy'] = 'no-referrer'
    if path.startswith(('/api/auth/', '/api/crm/', '/api/demandes')):
        response.headers['Cache-Control'] = 'no-store'
    return response


@api_router.get("/articles")
async def public_articles():
    docs = await db.articles.find({"status": "publie"}, {"_id": 0, "id": 1, "title": 1, "cat": 1, "body": 1, "author": 1, "published_at": 1, "created_at": 1}).sort("published_at", -1).to_list(50)
    return docs


@api_router.get("/rappel-creneaux")
async def list_rappel_creneaux(agency: str):
    if agency not in AGENCY_CODE:
        raise HTTPException(400, "Agence inconnue")
    return {"agency": agency, "days": rappel_days(agency)}


@api_router.post("/demandes", response_model=Demande, status_code=201)
async def create_demande(body: DemandeCreate, request: Request):
    if (body.website or "").strip():
        await auth_mod.log_action("spam_honeypot", request, target="demandes")
        raise HTTPException(400, "Requête invalide.")
    session = None
    if body.session_id:
        if body.type != "formation-ia":
            raise HTTPException(400, "Session réservée aux demandes Formation IA.")
        session = await sessions_mod.validate_session_choice(body.session_id)
    slot = None
    if body.creneau_id:
        slot = await db.creneaux.find_one_and_update(
            {"id": body.creneau_id, "agency": body.agency, "$expr": {"$lt": ["$booked", "$capacity"]}},
            {"$inc": {"booked": 1}},
            return_document=ReturnDocument.AFTER,
        )
        if not slot:
            raise HTTPException(409, "Ce créneau est complet, merci d'en choisir un autre.")
    reference = await next_reference(body.agency)
    doc = {**body.model_dump(exclude={"website"}), "id": str(uuid.uuid4()), "reference": reference, "public_tracking": True, "status": "nouveau", "created_at": now_iso(),
           "history": [{"at": now_iso(), "by": "Site web", "kind": "creation", "text": "Demande reçue via le formulaire" + (f" — rappel souhaité le {body.rappel_date} à {body.rappel_time}" if body.type == "rappel" else "") + (f" — session « {session['title']} » du {session['date_start']} (en attente de validation)" if session else "")}]}
    if session:
        doc["inscription_status"] = "en_attente"
    await db.demandes.insert_one({**doc})
    return Demande(**doc, creneau=slot_out(slot) if slot else None)


@api_router.get("/demandes/{reference}", response_model=PublicDemande)
async def get_demande(reference: str):
    # Normalize the fixed prefix and keep the random suffix canonical.
    parts = reference.split('-')
    if len(parts) != 5 or len(parts[-1]) != 32 or any(c not in '0123456789abcdefABCDEF' for c in parts[-1]):
        raise HTTPException(404, "Référence introuvable")
    reference = '-'.join(parts[:4]).upper() + '-' + parts[-1].lower()
    doc = await db.demandes.find_one({"reference": reference, "public_tracking": True},
                                   {"_id": 0, "reference": 1, "status": 1, "agency": 1,
                                    "type": 1, "created_at": 1, "creneau_id": 1})
    if not doc:
        raise HTTPException(404, "Référence introuvable")
    slot = await db.creneaux.find_one({"id": doc.get("creneau_id")}, {"_id": 0}) if doc.get("creneau_id") else None
    return PublicDemande(**doc, creneau=PublicCreneau(**slot) if slot else None)


auth_mod.init(db)
crm_mod.init(db)
sessions_mod.init(db)
api_router.include_router(auth_mod.router)
api_router.include_router(crm_mod.router)
api_router.include_router(sessions_mod.router)
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["Content-Disposition"],
)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logging.getLogger('uvicorn.access').addFilter(PrivateAccessLog())


@app.on_event("startup")
async def startup():
    await db.creneaux.create_index("id", unique=True)
    await db.demandes.create_index("reference", unique=True)
    await ensure_slots()
    await db.users.create_index("email", unique=True)
    await db.revoked_tokens.create_index("exp", expireAfterSeconds=0)
    await db.rate_limit.create_index("at")
    await db.audit_log.create_index("at")
    await db.sessions_ia.create_index("id", unique=True)
    await db.demandes.create_index("session_id")
    await db.login_attempts.create_index("identifier")
    await db.login_attempts.create_index('expires_at', expireAfterSeconds=0)
    await db.security_limits.create_index('expires_at', expireAfterSeconds=0)
    await db.revoked_tokens.create_index('jti', unique=True)
    if os.environ.get('ENABLE_DEMO_SEED') == 'true':
        await seed_users(db)
        await seed_demandes(db, next_reference)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
