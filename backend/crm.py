import uuid
import re
from datetime import datetime, timezone, timedelta, date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, EmailStr
from auth import get_current_user, require_roles, public_user, hash_password, ROLE_LABELS, log_action

router = APIRouter(prefix="/crm")
_db = {}
STATUSES = ["nouveau", "en_cours", "rdv_fixe", "inscrit", "traite", "annule"]
STATUS_LABELS = {"nouveau": "Nouveau", "en_cours": "En cours", "rdv_fixe": "RDV fixé", "inscrit": "Inscrit", "traite": "Traité", "annule": "Annulé"}


def init(db):
    _db["db"] = db


def db():
    return _db["db"]


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def scope(user, q: dict):
    q = dict(q)
    if user["role"] in ("responsable", "accueil"):
        if user.get("agency") not in ("creteil", "bonneuil"):
            raise HTTPException(403, "Aucune agence autorisée pour ce compte")
        q["agency"] = user["agency"]
    elif user["role"] != "direction":
        raise HTTPException(403, "Accès aux dossiers non autorisé")
    return q


def norm_phone(p):
    return "".join(c for c in (p or "") if c.isdigit())[-9:]


async def find_duplicates(d, user):
    ors = []
    if norm_phone(d.get("phone")):
        # Existing historical records need not have a materialized phone_norm field.
        digits = norm_phone(d["phone"])
        pattern = r"\D*".join(re.escape(c) for c in digits) + r"\D*$"
        ors.append({"phone": {"$regex": pattern}})
    if (d.get("email") or "").strip():
        ors.append({"email": {"$regex": f"^{re.escape(d['email'].strip())}$", "$options": "i"}})
    if not ors:
        return []
    cur = db().demandes.find(scope(user, {"$or": ors, "id": {"$ne": d["id"]}}), {"_id": 0, "id": 1, "reference": 1, "name": 1, "type": 1, "status": 1, "created_at": 1, "agency": 1})
    return await cur.to_list(20)


async def attach(d):
    slot = await db().creneaux.find_one({"id": d.get("creneau_id")}, {"_id": 0}) if d.get("creneau_id") else None
    d["creneau"] = slot
    d["session"] = await db().sessions_ia.find_one({"id": d["session_id"]}, {"_id": 0, "id": 1, "title": 1, "date_start": 1, "time_start": 1, "location": 1}) if d.get("session_id") else None
    d.setdefault("history", [])
    d.setdefault("status", "nouveau")
    d["status_label"] = STATUS_LABELS.get(d["status"], d["status"])
    return d


# ---------- dashboard ----------
@router.get("/dashboard")
async def dashboard(user=Depends(get_current_user)):
    # Preserve the editor dashboard layout without exposing prospect data or counts.
    if user["role"] == "editeur":
        return {"total": 0, "by_status": {s: 0 for s in STATUSES}, "by_type": {},
                "rdv_week": 0, "relances_due": 0, "recent": [], "status_labels": STATUS_LABELS}
    q = scope(user, {})
    by_status = {s: await db().demandes.count_documents({**q, "status": s}) for s in STATUSES}
    by_status["nouveau"] += await db().demandes.count_documents({**q, "status": {"$exists": False}})
    today = date.today().isoformat()
    week = (date.today() + timedelta(days=7)).isoformat()
    slots = await db().creneaux.find({**({"agency": q["agency"]} if "agency" in q else {}), "date": {"$gte": today, "$lte": week}, "booked": {"$gt": 0}}, {"_id": 0}).to_list(500)
    rdv_week = sum(s["booked"] for s in slots)
    relances = await db().relances.find({**q, "done": False, "due_date": {"$lte": today}}, {"_id": 0}).to_list(100)
    recent = await db().demandes.find(q, {"_id": 0}).sort("created_at", -1).limit(6).to_list(6)
    by_type = {}
    async for d in db().demandes.find(q, {"_id": 0, "type": 1}):
        by_type[d["type"]] = by_type.get(d["type"], 0) + 1
    return {"total": sum(by_status.values()), "by_status": by_status, "by_type": by_type, "rdv_week": rdv_week, "relances_due": len(relances), "recent": [await attach(d) for d in recent], "status_labels": STATUS_LABELS}


# ---------- prospects ----------
@router.get("/demandes")
async def list_demandes(status: Optional[str] = None, type: Optional[str] = None, agency: Optional[str] = None, q: Optional[str] = None, user=Depends(require_roles("direction", "responsable", "accueil"))):
    f = scope(user, {})
    if agency and "agency" not in f:
        f["agency"] = agency
    if status:
        f["status"] = status
    if type:
        f["type"] = type
    if q:
        if len(q) > 120:
            raise HTTPException(422, "Recherche trop longue")
        q = re.escape(q)
        f["$or"] = [{"name": {"$regex": q, "$options": "i"}}, {"reference": {"$regex": q, "$options": "i"}}, {"email": {"$regex": q, "$options": "i"}}, {"phone": {"$regex": q, "$options": "i"}}]
    docs = await db().demandes.find(f, {"_id": 0}).sort("created_at", -1).to_list(500)
    out = []
    for d in docs:
        d = await attach(d)
        d["duplicates_count"] = len(await find_duplicates(d, user))
        out.append(d)
    return out


@router.get("/demandes/{id}")
async def get_demande(id: str, user=Depends(require_roles("direction", "responsable", "accueil"))):
    d = await db().demandes.find_one(scope(user, {"id": id}), {"_id": 0})
    if not d:
        raise HTTPException(404, "Dossier introuvable")
    d = await attach(d)
    d["duplicates"] = await find_duplicates(d, user)
    d["relances"] = await db().relances.find(scope(user, {"demande_id": id}), {"_id": 0}).sort("due_date", 1).to_list(50)
    return d


class DemandeUpdate(BaseModel):
    status: Optional[str] = None
    note: Optional[str] = Field(default=None, max_length=1000)
    assigned_to: Optional[str] = None


@router.patch("/demandes/{id}")
async def update_demande(id: str, body: DemandeUpdate, request: Request, user=Depends(require_roles("direction", "responsable", "accueil"))):
    d = await db().demandes.find_one(scope(user, {"id": id}), {"_id": 0})
    if not d:
        raise HTTPException(404, "Dossier introuvable")
    if body.status and body.status not in STATUSES:
        raise HTTPException(400, "Statut inconnu")
    sets, events = {}, []
    if body.status and body.status != d.get("status"):
        sets["status"] = body.status
        events.append({"at": now_iso(), "by": user["name"], "kind": "statut", "text": f"{STATUS_LABELS.get(d.get('status','nouveau'))} → {STATUS_LABELS[body.status]}"})
    if body.note:
        events.append({"at": now_iso(), "by": user["name"], "kind": "note", "text": body.note})
    if body.assigned_to is not None:
        sets["assigned_to"] = body.assigned_to
        events.append({"at": now_iso(), "by": user["name"], "kind": "attribution", "text": f"Attribué à {body.assigned_to or '—'}"})
    upd = {}
    if sets:
        upd["$set"] = {**sets, "updated_at": now_iso()}
    if events:
        upd["$push"] = {"history": {"$each": events}}
    if upd:
        await db().demandes.update_one({"id": id}, upd)
        await log_action("demande_update", request, user, target=d["reference"], meta={k: v for k, v in sets.items()} | ({"note": True} if body.note else {}))
    return await get_demande(id, user)


# ---------- relances ----------
class RelanceCreate(BaseModel):
    due_date: str
    note: str = Field(min_length=2, max_length=500)
    channel: str = "telephone"


@router.get("/relances")
async def list_relances(all: bool = False, user=Depends(require_roles("direction", "responsable", "accueil"))):
    f = scope(user, {} if all else {"done": False})
    rel = await db().relances.find(f, {"_id": 0}).sort("due_date", 1).to_list(300)
    today = date.today().isoformat()
    for r in rel:
        r["overdue"] = (not r["done"]) and r["due_date"] < today
    return rel


@router.post("/demandes/{id}/relances", status_code=201)
async def create_relance(id: str, body: RelanceCreate, request: Request, user=Depends(require_roles("direction", "responsable", "accueil"))):
    d = await db().demandes.find_one(scope(user, {"id": id}), {"_id": 0})
    if not d:
        raise HTTPException(404, "Dossier introuvable")
    r = {"id": str(uuid.uuid4()), "demande_id": id, "reference": d["reference"], "name": d["name"], "agency": d["agency"], "due_date": body.due_date, "note": body.note, "channel": body.channel, "done": False, "created_by": user["name"], "created_at": now_iso()}
    await db().relances.insert_one({**r})
    await log_action("relance_create", request, user, target=d["reference"], meta={"due_date": body.due_date})
    await db().demandes.update_one({"id": id}, {"$push": {"history": {"at": now_iso(), "by": user["name"], "kind": "relance", "text": f"Relance planifiée le {body.due_date} : {body.note}"}}})
    return r


@router.patch("/relances/{rid}")
async def toggle_relance(rid: str, done: bool = True, user=Depends(require_roles("direction", "responsable", "accueil"))):
    r = await db().relances.find_one_and_update(scope(user, {"id": rid}), {"$set": {"done": done, "done_at": now_iso() if done else None, "done_by": user["name"] if done else None}}, projection={"_id": 0}, return_document=True)
    if not r:
        raise HTTPException(404, "Relance introuvable")
    if done:
        await db().demandes.update_one({"id": r["demande_id"]}, {"$push": {"history": {"at": now_iso(), "by": user["name"], "kind": "relance", "text": f"Relance effectuée : {r['note']}"}}})
    return r


# ---------- calendrier ----------
@router.get("/calendrier")
async def calendrier(agency: Optional[str] = None, user=Depends(require_roles("direction", "responsable", "accueil"))):
    f = scope(user, {})
    if agency and "agency" not in f:
        f["agency"] = agency
    today = date.today().isoformat()
    slots = await db().creneaux.find({**f, "date": {"$gte": today}}, {"_id": 0}).sort([("date", 1), ("time", 1)]).to_list(500)
    booked_ids = [s["id"] for s in slots if s["booked"]]
    dem = await db().demandes.find(scope(user, {"creneau_id": {"$in": booked_ids}}), {"_id": 0, "id": 1, "reference": 1, "name": 1, "phone": 1, "type": 1, "status": 1, "creneau_id": 1}).to_list(500)
    by_slot = {}
    for d in dem:
        by_slot.setdefault(d["creneau_id"], []).append(d)
    for s in slots:
        s["demandes"] = by_slot.get(s["id"], [])
        s["remaining"] = max(0, s["capacity"] - s["booked"])
    return slots


class SlotUpdate(BaseModel):
    capacity: int = Field(ge=0, le=10)


@router.patch("/calendrier/{sid}")
async def update_slot(sid: str, body: SlotUpdate, request: Request, user=Depends(require_roles("direction", "responsable"))):
    s = await db().creneaux.find_one_and_update(scope(user, {"id": sid}), {"$set": {"capacity": body.capacity}}, projection={"_id": 0}, return_document=True)
    if not s:
        raise HTTPException(404, "Créneau introuvable")
    await log_action("slot_capacity", request, user, target=sid, meta={"capacity": body.capacity})
    return s


# ---------- contenus (actualités) ----------
class ArticleBody(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    cat: str = "Actualités"
    body: str = Field(min_length=10, max_length=5000)


@router.get("/articles")
async def list_articles(user=Depends(require_roles("direction", "editeur"))):
    return await db().articles.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)


@router.post("/articles", status_code=201)
async def create_article(body: ArticleBody, user=Depends(require_roles("direction", "editeur"))):
    a = {**body.model_dump(), "id": str(uuid.uuid4()), "status": "brouillon", "author": user["name"], "created_at": now_iso(), "history": [{"at": now_iso(), "by": user["name"], "text": "Brouillon créé"}]}
    await db().articles.insert_one({**a})
    return a


@router.patch("/articles/{aid}")
async def article_status(aid: str, status: str, request: Request, user=Depends(require_roles("direction", "editeur"))):
    allowed = {"editeur": ("brouillon", "en_attente"), "direction": ("brouillon", "en_attente", "publie", "refuse")}
    if status not in allowed[user["role"]]:
        raise HTTPException(403, "Seule la Direction peut publier ou refuser un contenu.")
    a = await db().articles.find_one_and_update({"id": aid}, {"$set": {"status": status, **({"published_at": now_iso()} if status == "publie" else {})}, "$push": {"history": {"at": now_iso(), "by": user["name"], "text": f"Statut : {status}"}}}, projection={"_id": 0}, return_document=True)
    if not a:
        raise HTTPException(404, "Article introuvable")
    await log_action("article_status", request, user, target=a["title"], meta={"status": status})
    return a


# ---------- utilisateurs ----------
@router.get("/users")
async def list_users(user=Depends(require_roles("direction"))):
    return [public_user(u) for u in await db().users.find({}, {"_id": 0}).to_list(50)]


class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(min_length=2, max_length=120)
    role: str
    agency: Optional[str] = None
    password: str = Field(min_length=8, max_length=72)


@router.post("/users", status_code=201)
async def create_user(body: UserCreate, request: Request, user=Depends(require_roles("direction"))):
    if body.role not in ROLE_LABELS:
        raise HTTPException(400, "Rôle inconnu")
    if (body.agency not in (None, "creteil", "bonneuil")
            or body.role in ("responsable", "accueil") and body.agency is None):
        raise HTTPException(422, "Une agence valide est obligatoire pour ce rôle")
    if await db().users.find_one({"email": body.email.lower()}):
        raise HTTPException(409, "Cet e-mail existe déjà")
    u = {"id": str(uuid.uuid4()), "email": body.email.lower(), "name": body.name, "role": body.role, "agency": body.agency, "active": True, "password_hash": hash_password(body.password), "created_at": now_iso()}
    await db().users.insert_one({**u})
    await log_action("user_create", request, user, target=u["email"], meta={"role": body.role, "agency": body.agency})
    return public_user(u)


class UserPatch(BaseModel):
    active: Optional[bool] = None
    revoke_sessions: Optional[bool] = None


@router.patch("/users/{uid}")
async def patch_user(uid: str, body: UserPatch, request: Request, user=Depends(require_roles("direction"))):
    target = await db().users.find_one({"id": uid}, {"_id": 0})
    if not target:
        raise HTTPException(404, "Utilisateur introuvable")
    if uid == user["id"] and body.active is False:
        raise HTTPException(400, "Vous ne pouvez pas désactiver votre propre compte.")
    sets = {}
    if body.active is not None:
        sets["active"] = body.active
    revoke = body.revoke_sessions or body.active is False
    if revoke:
        sets["sessions_revoked_at"] = now_iso()
    if sets:
        await db().users.update_one({"id": uid}, {"$set": sets, **({"$inc": {"session_version": 1}} if revoke else {})})
        await log_action("user_update", request, user, target=target["email"], meta=sets)
    return public_user(await db().users.find_one({"id": uid}, {"_id": 0}))


@router.get("/audit")
async def audit(action: Optional[str] = None, q: Optional[str] = None, limit: int = 200, user=Depends(require_roles("direction"))):
    f = {}
    if action:
        f["action"] = action
    if q:
        if len(q) > 120:
            raise HTTPException(422, "Recherche trop longue")
        q = re.escape(q)
        f["$or"] = [{"user": {"$regex": q, "$options": "i"}}, {"target": {"$regex": q, "$options": "i"}}]
    return await db().audit_log.find(f, {"_id": 0}).sort("at", -1).limit(max(1, min(limit, 1000))).to_list(1000)


@router.get("/meta")
async def meta():
    return {"statuses": STATUS_LABELS, "roles": ROLE_LABELS}


# ---------- export CSV (Direction) ----------
TYPE_LABELS = {"rendez-vous": "Rendez-vous", "informations": "Informations", "inscription": "Inscription", "rappel": "Rappel", "intervention": "Intervention", "partenariat": "Partenariat", "formation-ia": "Formation IA"}
INSC_LABELS = {"en_attente": "En attente", "confirmee": "Confirmée", "refusee": "Refusée", "liste_attente": "Liste d'attente"}


def _csv(rows, headers):
    import csv
    import io
    buf = io.StringIO()
    w = csv.writer(buf, delimiter=";", lineterminator="\r\n")
    w.writerow(headers)
    for r in rows:
        # Spreadsheet quoting alone does not stop formula execution.
        w.writerow(["'" + str(v) if str(v).lstrip().startswith(("=", "+", "-", "@", "\t", "\r", "\n"))
                    or str(v).startswith(("\t", "\r", "\n")) else v for v in r])
    return "\ufeff" + buf.getvalue()


@router.get("/export")
async def export_csv(kind: str, request: Request, date_from: Optional[str] = None, date_to: Optional[str] = None, agency: Optional[str] = None, status: Optional[str] = None, user=Depends(require_roles("direction"))):
    from fastapi.responses import Response
    if kind not in ("prospects", "rendez-vous"):
        raise HTTPException(400, "Type d'export inconnu")
    f = {}
    if agency:
        f["agency"] = agency
    if status:
        f["status"] = status
    if date_from or date_to:
        f["created_at"] = {}
        if date_from:
            f["created_at"]["$gte"] = date_from
        if date_to:
            f["created_at"]["$lte"] = date_to + "T23:59:59"
    if kind == "rendez-vous":
        f["$or"] = [{"creneau_id": {"$nin": [None, ""]}}, {"type": "rendez-vous"}]
    docs = await db().demandes.find(f, {"_id": 0}).sort("created_at", 1).to_list(5000)
    slots = {s["id"]: s for s in await db().creneaux.find({"id": {"$in": [d.get("creneau_id") for d in docs if d.get("creneau_id")]}}, {"_id": 0}).to_list(5000)}
    rows = []
    for d in docs:
        s = slots.get(d.get("creneau_id"))
        base = [d["reference"], d["created_at"][:19].replace("T", " "), TYPE_LABELS.get(d["type"], d["type"]), d["agency"], STATUS_LABELS.get(d.get("status", "nouveau")), d["name"], d.get("phone", ""), d.get("email", "")]
        if kind == "prospects":
            rows.append(base + [d.get("formation", ""), d.get("structure", ""), f"{d.get('rappel_date') or ''} {d.get('rappel_time') or ''}".strip(), INSC_LABELS.get(d.get("inscription_status"), ""), (d.get("message") or "").replace("\n", " ")])
        else:
            rows.append(base + [s["date"] if s else "", s["time"] if s else "", f"{d.get('rappel_date') or ''} {d.get('rappel_time') or ''}".strip()])
    headers = ["Référence", "Reçue le", "Motif", "Agence", "Statut", "Nom", "Téléphone", "E-mail"] + (["Formation", "Structure", "Rappel souhaité", "Inscription session IA", "Message"] if kind == "prospects" else ["Date RDV", "Heure RDV", "Rappel souhaité"])
    filters = {k: v for k, v in {"date_from": date_from, "date_to": date_to, "agency": agency, "status": status}.items() if v}
    await log_action("export_csv", request, user, target=kind, meta={**filters, "rows": len(rows)})
    name = f"gsr-{kind}-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M')}.csv"
    return Response(content=_csv(rows, headers), media_type="text/csv; charset=utf-8", headers={"Content-Disposition": f'attachment; filename="{name}"'})
