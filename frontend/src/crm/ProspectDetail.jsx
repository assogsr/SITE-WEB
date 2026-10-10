import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AlertTriangle, Phone, Mail, CheckCircle2 } from "lucide-react";
import { crm, useAuth, can } from "@/crm/auth";
import { PageTitle, StatusBadge, TYPE_LABEL, fmt, fmtD, Card, inputCls, AGENCY_LABEL } from "@/crm/CrmLayout";
import { apiError } from "@/lib/api";

export default function ProspectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [d, setD] = useState(null);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState({ statuses: {} });
  const [note, setNote] = useState("");
  const [rel, setRel] = useState({ due_date: "", note: "", channel: "telephone" });
  const editable = can(user, "direction", "responsable", "accueil");
  const load = () => {
    setD(null); setError("");
    return crm.get(`/crm/demandes/${id}`).then((r) => setD(r.data))
      .catch((e) => setError(apiError(e, "Dossier introuvable")));
  };
  useEffect(() => { load(); crm.get("/crm/meta").then((r) => setMeta(r.data)); }, [id]);
  const patch = async (body) => { try { setD((await crm.patch(`/crm/demandes/${id}`, body)).data); toast.success("Dossier mis à jour"); } catch (e) { toast.error(apiError(e)); } };
  const addRel = async (e) => {
    e.preventDefault();
    try { await crm.post(`/crm/demandes/${id}/relances`, rel); setRel({ due_date: "", note: "", channel: "telephone" }); toast.success("Relance planifiée"); load(); } catch (x) { toast.error(apiError(x)); }
  };
  const doneRel = async (rid) => { await crm.patch(`/crm/relances/${rid}`, null, { params: { done: true } }); load(); };
  if (error) return <p data-testid="crm-prospect-error" className="text-[#53616B]">{error}</p>;
  if (!d) return <p className="text-[#53616B]">Chargement…</p>;
  return (
    <div data-testid="crm-prospect-detail">
      <Link to="/crm/prospects" className="text-sm text-[#53616B] hover:text-[#F29A58]">← Prospects</Link>
      <PageTitle label={<span className="font-mono normal-case tracking-normal" data-testid="detail-reference">{d.reference}</span>} title={d.name}>
        <StatusBadge status={d.status} label={d.status_label} />
      </PageTitle>
      {d.duplicates.length > 0 && (
        <div data-testid="detail-duplicates" className="mb-5 bg-[#FFF4EA] border-l-4 border-[#F29A58] p-4 text-sm">
          <p className="font-semibold inline-flex items-center gap-2"><AlertTriangle size={16} className="text-[#F29A58]" /> Doublon potentiel : {d.duplicates.length} dossier(s) avec le même téléphone ou e-mail. Aucune fusion automatique — vérifiez manuellement.</p>
          <ul className="mt-2 space-y-1">{d.duplicates.map((x) => <li key={x.id}><Link to={`/crm/prospects/${x.id}`} className="font-mono text-xs hover:text-[#F29A58]">{x.reference}</Link> · {TYPE_LABEL[x.type]} · {AGENCY_LABEL[x.agency]} · {fmt(x.created_at)}</li>)}</ul>
        </div>
      )}
      <div className="grid lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 space-y-4">
          <Card testId="detail-info">
            <h2 className="font-clash text-xl font-semibold">Demande</h2>
            <dl className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><dt className="text-[#53616B]">Motif</dt><dd className="font-medium">{TYPE_LABEL[d.type]}</dd></div>
              <div><dt className="text-[#53616B]">Agence</dt><dd className="font-medium">{AGENCY_LABEL[d.agency]}</dd></div>
              <div><dt className="text-[#53616B]">Téléphone</dt><dd className="font-medium">{d.phone ? <a href={`tel:${d.phone}`} className="inline-flex items-center gap-1 hover:text-[#F29A58]"><Phone size={13} />{d.phone}</a> : "—"}</dd></div>
              <div><dt className="text-[#53616B]">E-mail</dt><dd className="font-medium break-all">{d.email ? <a href={`mailto:${d.email}`} className="inline-flex items-center gap-1 hover:text-[#F29A58]"><Mail size={13} />{d.email}</a> : "—"}</dd></div>
              {d.formation && <div><dt className="text-[#53616B]">Formation</dt><dd className="font-medium">{d.formation}</dd></div>}
              {d.structure && <div><dt className="text-[#53616B]">Structure</dt><dd className="font-medium">{d.structure}</dd></div>}
              <div><dt className="text-[#53616B]">Créneau</dt><dd className="font-medium">{d.creneau ? `${fmtD(d.creneau.date)} · ${d.creneau.time}` : "—"}</dd></div>
              {d.rappel_date && <div><dt className="text-[#53616B]">Rappel souhaité</dt><dd className="font-medium" data-testid="detail-rappel">{fmtD(d.rappel_date)} · {d.rappel_time}</dd></div>}
              {d.session && <div className="sm:col-span-2"><dt className="text-[#53616B]">Session Formation IA</dt><dd className="font-medium" data-testid="detail-session">{d.session.title} · {fmtD(d.session.date_start)} {d.session.time_start} — <span className="text-[#b4532a]">{({ en_attente: "En attente de validation", confirmee: "Confirmée", refusee: "Refusée", liste_attente: "Liste d'attente" })[d.inscription_status] || d.inscription_status}</span> <Link to="/crm/sessions-ia" className="underline text-xs">gérer</Link></dd></div>}
              <div><dt className="text-[#53616B]">Reçue le</dt><dd className="font-medium">{fmt(d.created_at)}</dd></div>
            </dl>
            {d.message && <p className="mt-4 text-sm bg-[#F6F3EE] p-3">{d.message}</p>}
          </Card>
          <Card testId="detail-history">
            <h2 className="font-clash text-xl font-semibold">Historique</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {[...d.history].reverse().map((h, i) => <li key={i} className="grid grid-cols-[120px_1fr] gap-3"><span className="text-xs text-[#53616B]">{fmt(h.at)}<br />{h.by}</span><span><span className="text-[10px] uppercase tracking-widest text-[#F29A58] mr-2">{h.kind}</span>{h.text}</span></li>)}
            </ul>
          </Card>
        </div>
        <div className="lg:col-span-5 space-y-4">
          {editable && (
            <Card testId="detail-actions">
              <h2 className="font-clash text-xl font-semibold">Traitement</h2>
              <label className="block mt-4 text-xs text-[#53616B]">Statut</label>
              <select data-testid="detail-status-select" value={d.status} onChange={(e) => patch({ status: e.target.value })} className={`${inputCls} w-full mt-1`}>{Object.entries(meta.statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
              <label className="block mt-4 text-xs text-[#53616B]">Ajouter une note</label>
              <textarea data-testid="detail-note-input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={`${inputCls} w-full mt-1`} placeholder="Compte-rendu d'appel, pièces reçues…" />
              <button data-testid="detail-note-submit" onClick={() => note.trim() && patch({ note }).then(() => setNote(""))} className="mt-2 bg-[#25333D] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#F29A58] hover:text-[#25333D] transition-colors">Enregistrer la note</button>
            </Card>
          )}
          <Card testId="detail-relances">
            <h2 className="font-clash text-xl font-semibold">Relances</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {d.relances.map((r) => (
                <li key={r.id} data-testid={`relance-${r.id}`} className={`flex items-start gap-3 p-3 ${r.done ? "bg-[#F6F3EE] text-[#53616B]" : "bg-[#FFF4EA]"}`}>
                  <button disabled={r.done || !editable} onClick={() => doneRel(r.id)} data-testid="relance-done-btn" className="mt-0.5 disabled:opacity-40"><CheckCircle2 size={18} className={r.done ? "text-emerald-600" : "text-[#F29A58]"} /></button>
                  <div><p className="font-semibold">{fmtD(r.due_date)} · {r.channel}</p><p>{r.note}</p></div>
                </li>
              ))}
              {d.relances.length === 0 && <li className="text-[#53616B]">Aucune relance planifiée.</li>}
            </ul>
            {editable && (
              <form onSubmit={addRel} className="mt-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input data-testid="relance-date-input" type="date" required value={rel.due_date} onChange={(e) => setRel({ ...rel, due_date: e.target.value })} className={inputCls} />
                  <select data-testid="relance-channel-select" value={rel.channel} onChange={(e) => setRel({ ...rel, channel: e.target.value })} className={inputCls}><option value="telephone">Téléphone</option><option value="email">E-mail</option><option value="sms">SMS</option></select>
                </div>
                <input data-testid="relance-note-input" required placeholder="Objet de la relance" value={rel.note} onChange={(e) => setRel({ ...rel, note: e.target.value })} className={`${inputCls} w-full`} />
                <button data-testid="relance-submit" className="w-full border border-[#25333D] py-2.5 text-sm font-semibold hover:bg-[#25333D] hover:text-white transition-colors">Planifier une relance</button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
