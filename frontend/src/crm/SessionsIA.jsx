import { useEffect, useState } from "react";
import { toast } from "sonner";
import { crm, useAuth, can } from "@/crm/auth";
import { PageTitle, Card, inputCls, fmtD, fmt } from "@/crm/CrmLayout";
import { apiError } from "@/lib/api";
import { IA_PROGRAMMES } from "@/pages/ia/data";

const EMPTY = { title: "", programme_id: "", date_start: "", date_end: "", time_start: "09:30", time_end: "17:00", mode: "presentiel", location: "Agence de Créteil", trainer: "", capacity: 12 };

const Inscriptions = ({ session, meta, canValidate, onChange }) => {
  const [rows, setRows] = useState(null);
  const load = () => crm.get(`/crm/sessions/${session.id}/inscriptions`).then((r) => setRows(r.data));
  useEffect(() => { load(); }, [session.id]);
  const set = async (d, status) => { try { await crm.patch(`/crm/inscriptions/${d.id}`, null, { params: { status } }); toast.success(meta.inscription_status[status]); load(); onChange(); } catch (x) { toast.error(apiError(x)); } };
  if (!rows) return null;
  return (
    <ul className="mt-3 divide-y divide-[#25333D]/10 text-sm" data-testid={`session-inscriptions-${session.id}`}>
      {rows.map((d) => (
        <li key={d.id} data-testid={`inscription-${d.reference}`} className="py-2 flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs">{d.reference}</span><b>{d.name}</b><span className="text-[#53616B]">{d.phone || d.email}</span>
          <span data-testid="inscription-status" className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 ${d.inscription_status === "confirmee" ? "bg-emerald-100 text-emerald-900" : d.inscription_status === "refusee" ? "bg-rose-100 text-rose-900" : "bg-[#FFF4EA] text-[#b4532a]"}`}>{meta.inscription_status[d.inscription_status] || d.inscription_status}</span>
          {canValidate && d.inscription_status !== "confirmee" && <span className="ml-auto flex gap-2 text-xs"><button data-testid="inscription-confirm" onClick={() => set(d, "confirmee")} className="bg-[#F29A58] px-2.5 py-1 font-semibold">Confirmer</button><button data-testid="inscription-waitlist" onClick={() => set(d, "liste_attente")} className="border px-2.5 py-1">Liste d'attente</button><button data-testid="inscription-refuse" onClick={() => set(d, "refusee")} className="border px-2.5 py-1">Refuser</button></span>}
        </li>
      ))}
      {rows.length === 0 && <li className="py-2 text-[#53616B]">Aucune demande d'inscription.</li>}
    </ul>
  );
};

export default function SessionsIA() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ session_status: {}, inscription_status: {} });
  const [f, setF] = useState(EMPTY);
  const [openId, setOpenId] = useState(null);
  const manage = can(user, "direction", "responsable");
  const load = () => crm.get("/crm/sessions").then((r) => setRows(r.data));
  useEffect(() => { load(); crm.get("/crm/sessions-meta").then((r) => setMeta(r.data)); }, []);
  const create = async (e) => { e.preventDefault(); try { await crm.post("/crm/sessions", { ...f, date_end: f.date_end || null, capacity: Number(f.capacity) }); toast.success("Session créée (brouillon)"); setF(EMPTY); load(); } catch (x) { toast.error(apiError(x)); } };
  const patch = async (s, body) => { try { await crm.patch(`/crm/sessions/${s.id}`, body); toast.success("Session mise à jour"); load(); } catch (x) { toast.error(apiError(x)); } };
  return (
    <div data-testid="crm-sessions">
      <PageTitle label="Formation IA" title="Sessions datées" />
      <p className="mb-5 text-sm text-[#53616B]">Seules les sessions <b>publiées</b> et à venir sont visibles sur /formation-ia/. Toute inscription reçue reste <b>en attente</b> jusqu'à validation humaine. Publication réservée à la Direction.</p>
      <div className="grid lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 space-y-3">
          {rows.map((s) => (
            <Card key={s.id} testId={`session-${s.id}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="text-[11px] uppercase tracking-widest text-[#F29A58]">{IA_PROGRAMMES.find((p) => p.id === s.programme_id)?.title || "Programme libre"}</p><h2 className="font-clash text-xl font-semibold">{s.title}</h2>
                  <p className="text-sm text-[#53616B] mt-1">{fmtD(s.date_start)}{s.date_end ? ` → ${fmtD(s.date_end)}` : ""} · {s.time_start}–{s.time_end} · {s.mode === "distanciel" ? "À distance" : s.location} · {s.trainer || "Formateur à confirmer"}</p></div>
                <span data-testid="session-status" className="text-[11px] uppercase tracking-wider font-semibold bg-[#F6F3EE] px-2.5 py-1">{s.status_label}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm"><span data-testid="session-capacity">Capacité <b>{s.capacity}</b></span><span>Confirmées <b>{s.confirmed}</b></span><span>En attente <b className="text-[#b4532a]">{s.pending}</b></span><span data-testid="session-remaining">Places restantes <b>{s.remaining}</b></span></div>
              {manage && (
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {s.status !== "publiee" && can(user, "direction") && <button data-testid="session-publish" onClick={() => patch(s, { status: "publiee" })} className="bg-[#F29A58] px-3 py-1.5 font-semibold">Publier</button>}
                  {s.status !== "publiee" && !can(user, "direction") && <button data-testid="session-publish-forbidden" onClick={() => patch(s, { status: "publiee" })} className="border px-3 py-1.5 text-[#53616B]">Publier (réservé Direction)</button>}
                  {s.status === "publiee" && <button data-testid="session-close" onClick={() => patch(s, { status: "fermee" })} className="border border-[#25333D] px-3 py-1.5 font-semibold">Fermer les inscriptions</button>}
                  {s.status !== "annulee" && <button data-testid="session-cancel" onClick={() => patch(s, { status: "annulee" })} className="border px-3 py-1.5">Annuler</button>}
                  <button data-testid="session-cap-plus" onClick={() => patch(s, { capacity: s.capacity + 1 })} className="border px-3 py-1.5">Capacité +1</button>
                  <button data-testid="session-toggle-inscriptions" onClick={() => setOpenId(openId === s.id ? null : s.id)} className="ml-auto underline">{openId === s.id ? "Masquer" : "Inscriptions"} ({s.confirmed + s.pending})</button>
                </div>
              )}
              {openId === s.id && <Inscriptions session={s} meta={meta} canValidate={manage} onChange={load} />}
            </Card>
          ))}
          {rows.length === 0 && <Card><p className="text-[#53616B]">Aucune session créée. Aucune date n'est inventée : créez la première session réelle ci-contre.</p></Card>}
        </div>
        {manage && (
          <Card className="lg:col-span-5" testId="session-form">
            <h2 className="font-clash text-xl font-semibold">Nouvelle session</h2>
            <form onSubmit={create} className="mt-4 space-y-3">
              <input data-testid="session-title" required placeholder="Intitulé" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={`${inputCls} w-full`} />
              <select data-testid="session-programme" value={f.programme_id} onChange={(e) => setF({ ...f, programme_id: e.target.value })} className={`${inputCls} w-full`}><option value="">Programme (facultatif)</option>{IA_PROGRAMMES.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-[#53616B]">Début<input data-testid="session-date-start" type="date" required value={f.date_start} onChange={(e) => setF({ ...f, date_start: e.target.value })} className={`${inputCls} w-full mt-1`} /></label>
                <label className="text-xs text-[#53616B]">Fin (si plusieurs jours)<input data-testid="session-date-end" type="date" value={f.date_end} onChange={(e) => setF({ ...f, date_end: e.target.value })} className={`${inputCls} w-full mt-1`} /></label>
                <label className="text-xs text-[#53616B]">Heure début<input data-testid="session-time-start" type="time" required value={f.time_start} onChange={(e) => setF({ ...f, time_start: e.target.value })} className={`${inputCls} w-full mt-1`} /></label>
                <label className="text-xs text-[#53616B]">Heure fin<input data-testid="session-time-end" type="time" required value={f.time_end} onChange={(e) => setF({ ...f, time_end: e.target.value })} className={`${inputCls} w-full mt-1`} /></label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select data-testid="session-mode" value={f.mode} onChange={(e) => setF({ ...f, mode: e.target.value })} className={inputCls}><option value="presentiel">Présentiel</option><option value="distanciel">À distance</option></select>
                <input data-testid="session-capacity-input" type="number" min={1} max={200} required value={f.capacity} onChange={(e) => setF({ ...f, capacity: e.target.value })} className={inputCls} placeholder="Capacité" />
              </div>
              <input data-testid="session-location" placeholder="Lieu" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} className={`${inputCls} w-full`} disabled={f.mode === "distanciel"} />
              <input data-testid="session-trainer" placeholder="Formateur·rice" value={f.trainer} onChange={(e) => setF({ ...f, trainer: e.target.value })} className={`${inputCls} w-full`} />
              <button data-testid="session-create" className="w-full bg-[#25333D] text-white py-3 text-sm font-semibold hover:bg-[#F29A58] hover:text-[#25333D] transition-colors">Créer en brouillon</button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
