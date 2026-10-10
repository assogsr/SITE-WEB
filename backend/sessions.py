import uuid
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from auth import get_current_user, require_roles, log_action
from crm import scope

router = APIRouter()
_db = {}
SESSION_STATUS = {"brouillon": "Brouillon", "publiee": "Publiée (ouverte)", "fermee": "Fermée", "annulee": "Annulée"}
INSC_STATUS = {"en_attente": "En attente de validation", "confirmee": "Confirmée", "refusee": "Refusée", "liste_attente": "Liste d'attente"}


def init(db):
    _db["db"] = db


def db():
    return _db["db"]


def now_iso():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


async def with_counts(s: dict, user=None) -> dict:
    query = {"session_id": s["id"]}
    if user and user["role"] == "responsable":
        query = scope(user, query)
    confirmed = await db().demandes.count_documents({**query, "inscription_status": "confirmee"})
    pending = await db().demandes.count_documents({**query, "inscription_status": "en_attente"})
    global_confirmed = confirmed
    if user and user["role"] == "responsable":
        global_confirmed = await db().demandes.count_documents({"session_id": s["id"], "inscription_status": "confirmee"})
    return {**s, "confirmed": confirmed, "pending": pending, "remaining": max(0, s["capacity"] - global_confirmed), "status_label": SESSION_STATUS.get(s["status"], s["status"])}


def is_open(s: dict) -> bool:
    return s["status"] == "publiee" and s["date_start"] > date.today().isoformat()


# ---------- public ----------
@router.get("/formation-ia/sessions")
async def public_sessions():
    docs = await db().sessions_ia.find({"status": "publiee", "date_start": {"$gt": date.today().isoformat()}}, {"_id": 0}).sort("date_start", 1).to_list(50)
    out = []
    for s in docs:
        c = await with_counts(s)
        out.append({k: c[k] for k in ("id", "title", "programme_id", "date_start", "date_end", "time_start", "time_end", "mode", "location", "trainer", "capacity", "remaining")})
    return out


async def validate_session_choice(session_id: str):
    s = await db().sessions_ia.find_one({"id": session_id}, {"_id": 0})
    if not s or not is_open(s):
        raise HTTPException(400, "Cette session n'est pas ouverte aux inscriptions.")
    c = await with_counts(s)
    if c["remaining"] <= 0:
        raise HTTPException(409, "Cette session est complète.")
    return s


# ---------- CRM ----------
class SessionBody(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    programme_id: str = ""
    date_start: str
    date_end: Optional[str] = None
    time_start: str
    time_end: str
    mode: str = "presentiel"
    location: str = ""
    trainer: str = ""
    capacity: int = Field(ge=1, le=200)


@router.get("/crm/sessions")
async def list_sessions(user=Depends(require_roles("direction", "responsable", "editeur"))):
    docs = await db().sessions_ia.find({}, {"_id": 0}).sort("date_start", 1).to_list(200)
    out = []
    for s in docs:
        if user["role"] == "editeur":
            # Session content remains visible, but enrollment activity and applicant data do not.
            remaining = (await with_counts(s))["remaining"]
            out.append({**s, "confirmed": 0, "pending": 0, "remaining": remaining,
                        "status_label": SESSION_STATUS.get(s["status"], s["status"])})
        else:
            out.append(await with_counts(s, user))
    return out


@router.post("/crm/sessions", status_code=201)
async def create_session(body: SessionBody, request: Request, user=Depends(require_roles("direction", "responsable"))):
    if body.date_start <= date.today().isoformat():
        raise HTTPException(400, "La date de début doit être ultérieure à aujourd'hui.")
    s = {**body.model_dump(), "id": str(uuid.uuid4()), "agency": user.get("agency") if user["role"] == "responsable" else None, "status": "brouillon", "created_by": user["name"], "created_at": now_iso(), "history": [{"at": now_iso(), "by": user["name"], "text": "Session créée (brouillon)"}]}
    await db().sessions_ia.insert_one({**s})
    await log_action("session_create", request, user, target=body.title, meta={"date_start": body.date_start, "capacity": body.capacity})
    return await with_counts(s)


class SessionPatch(BaseModel):
    status: Optional[str] = None
    capacity: Optional[int] = Field(default=None, ge=1, le=200)
    trainer: Optional[str] = None
    location: Optional[str] = None


@router.patch("/crm/sessions/{sid}")
async def patch_session(sid: str, body: SessionPatch, request: Request, user=Depends(require_roles("direction", "responsable"))):
    s = await db().sessions_ia.find_one({"id": sid}, {"_id": 0})
    if not s:
        raise HTTPException(404, "Session introuvable")
    sets = {k: v for k, v in body.model_dump().items() if v is not None}
    if "status" in sets:
        if sets["status"] not in SESSION_STATUS:
            raise HTTPException(400, "Statut inconnu")
        if sets["status"] == "publiee" and user["role"] != "direction":
            raise HTTPException(403, "Seule la Direction peut publier une session.")
    if user["role"] == "responsable" and s.get("agency") != user.get("agency"):
        raise HTTPException(404, "Session introuvable")
    if sets:
        await db().sessions_ia.update_one({"id": sid}, {"$set": sets, "$push": {"history": {"at": now_iso(), "by": user["name"], "text": "Modification : " + ", ".join(f"{k}={v}" for k, v in sets.items())}}})
        await log_action("session_update", request, user, target=s["title"], meta=sets)
    return await with_counts(await db().sessions_ia.find_one({"id": sid}, {"_id": 0}))


@router.get("/crm/sessions/{sid}/inscriptions")
async def session_inscriptions(sid: str, user=Depends(require_roles("direction", "responsable"))):
    return await db().demandes.find(scope(user, {"session_id": sid}), {"_id": 0, "id": 1, "reference": 1, "name": 1, "phone": 1, "email": 1, "inscription_status": 1, "created_at": 1, "agency": 1}).sort("created_at", 1).to_list(500)


@router.patch("/crm/inscriptions/{did}")
async def validate_inscription(did: str, status: str, request: Request, user=Depends(require_roles("direction", "responsable"))):
    if status not in INSC_STATUS:
        raise HTTPException(400, "Statut inconnu")
    d = await db().demandes.find_one(scope(user, {"id": did, "session_id": {"$ne": None}}), {"_id": 0})
    if not d:
        raise HTTPException(404, "Inscription introuvable")
    if status == "confirmee":
        s = await db().sessions_ia.find_one({"id": d["session_id"]}, {"_id": 0})
        c = await with_counts(s)
        if d.get("inscription_status") != "confirmee" and c["remaining"] <= 0:
            raise HTTPException(409, "Capacité atteinte : placez le candidat en liste d'attente ou augmentez la capacité.")
    await db().demandes.update_one({"id": did}, {"$set": {"inscription_status": status, "status": "inscrit" if status == "confirmee" else d.get("status", "nouveau")}, "$push": {"history": {"at": now_iso(), "by": user["name"], "kind": "inscription", "text": f"Inscription : {INSC_STATUS[status]}"}}})
    await log_action("inscription_validate", request, user, target=d["reference"], meta={"status": status})
    return {"ok": True, "inscription_status": status}


@router.get("/crm/sessions-meta")
async def sessions_meta(user=Depends(get_current_user)):
    return {"session_status": SESSION_STATUS, "inscription_status": INSC_STATUS}
