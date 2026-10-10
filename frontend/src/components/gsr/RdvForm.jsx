import { useEffect, useState } from "react";
import { AGENCIES, FORMATIONS } from "@/data/gsr";
import { createDemande, getCreneaux, getRappelCreneaux, apiError } from "@/lib/api";

export const TYPES = [
  { id: "rendez-vous", label: "Prise de rendez-vous" },
  { id: "informations", label: "Demande d'informations" },
  { id: "inscription", label: "Demande d'inscription" },
  { id: "rappel", label: "Demande de rappel" },
  { id: "intervention", label: "Demande d'intervention" },
  { id: "partenariat", label: "Proposition de partenariat" },
];

const field = "w-full rounded-xl border border-[#25333D]/15 bg-white px-4 py-3 text-sm text-[#25333D] placeholder:text-[#53616B]/60 focus:outline-none focus:ring-2 focus:ring-[#F29A58]/60 transition-shadow";

const fmtDate = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });

export const RdvForm = ({ defaultAgency = "creteil", defaultType = "rendez-vous", defaultFormation = "", onDone, idPrefix = "rdv" }) => {
  const [f, setF] = useState({ agency: defaultAgency, type: defaultType, name: "", phone: "", email: "", message: "", formation: defaultFormation, structure: "", creneau_id: "", website: "", rappel_date: "", rappel_time: "" });
  const [slots, setSlots] = useState([]);
  const [rappelDays, setRappelDays] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    if (f.type === "rendez-vous") getCreneaux(f.agency).then(setSlots).catch(() => setSlots([]));
    if (f.type === "rappel") getRappelCreneaux(f.agency).then(setRappelDays).catch(() => setRappelDays([]));
  }, [f.agency, f.type]);

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim()) return setError("Merci d'indiquer votre nom.");
    if (!f.phone.trim() && !f.email.trim()) return setError("Indiquez au moins un téléphone ou une adresse e-mail.");
    if (f.type === "rappel" && (!f.rappel_date || !f.rappel_time)) return setError("Choisissez le jour et l'heure auxquels vous souhaitez être rappelé.");
    setError("");
    setBusy(true);
    try {
      const d = await createDemande({ ...f, creneau_id: f.type === "rendez-vous" && f.creneau_id ? f.creneau_id : null, rappel_date: f.type === "rappel" ? f.rappel_date : null, rappel_time: f.type === "rappel" ? f.rappel_time : null });
      onDone(d.reference, d);
    } catch (err) {
      setError(apiError(err));
      if (err?.response?.status === 409) getCreneaux(f.agency).then(setSlots);
    } finally {
      setBusy(false);
    }
  };

  const needsStructure = f.type === "intervention" || f.type === "partenariat";
  const needsFormation = f.type === "inscription" || f.type === "informations";

  return (
    <form onSubmit={submit} className="space-y-4" data-testid={`${idPrefix}-form`} noValidate>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Agence">
        {AGENCIES.map((a) => (
          <button type="button" key={a.id} data-testid={`${idPrefix}-agency-${a.id}`} onClick={() => setF({ ...f, agency: a.id, creneau_id: "" })}
            className={`rounded-xl px-3 py-3 text-sm text-left border transition-colors ${f.agency === a.id ? "border-[#F29A58] bg-white ring-2 ring-[#F29A58]/30" : "border-[#25333D]/15 bg-white/60 hover:bg-white"}`}>
            <span className="block text-[11px] uppercase tracking-wider text-[#53616B]">Agence</span>
            <span className="font-semibold">{a.city}</span>
            {f.type === "rappel" && <span className="block mt-1 text-[10px] leading-snug text-[#53616B]">{a.hours}</span>}
          </button>
        ))}
      </div>
      <select data-testid={`${idPrefix}-motif-select`} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value, rappel_date: "", rappel_time: "" })} className={field}>
        {TYPES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
      </select>
      {f.type === "rappel" && (
        <div className="grid grid-cols-2 gap-3" data-testid={`${idPrefix}-rappel-block`}>
          <select data-testid={`${idPrefix}-rappel-date-select`} value={f.rappel_date} onChange={(e) => setF({ ...f, rappel_date: e.target.value, rappel_time: "" })} className={field}>
            <option value="">Jour du rappel</option>
            {rappelDays.map((d) => <option key={d.date} value={d.date}>{fmtDate(d.date)}</option>)}
          </select>
          <select data-testid={`${idPrefix}-rappel-time-select`} value={f.rappel_time} onChange={set("rappel_time")} className={field} disabled={!f.rappel_date}>
            <option value="">Heure</option>
            {(rappelDays.find((d) => d.date === f.rappel_date)?.times || []).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <p className="col-span-2 text-[11px] text-[#53616B]">Un membre de l'équipe vous rappelle au créneau choisi, pendant les horaires d'ouverture de l'agence. Aucun appel automatique.</p>
        </div>
      )}
      {f.type === "rendez-vous" && (
        <select data-testid={`${idPrefix}-creneau-select`} value={f.creneau_id} onChange={set("creneau_id")} className={field}>
          <option value="">Créneau souhaité (facultatif — nous vous rappelons)</option>
          {slots.map((s) => (
            <option key={s.id} value={s.id} disabled={s.remaining === 0}>
              {`${fmtDate(s.date)} · ${s.time} ${s.remaining === 0 ? "— complet" : `(${s.remaining} place${s.remaining > 1 ? "s" : ""})`}`}
            </option>
          ))}
        </select>
      )}
      {needsFormation && (
        <select data-testid={`${idPrefix}-formation-select`} value={f.formation} onChange={set("formation")} className={field}>
          <option value="">Formation concernée (facultatif)</option>
          {FORMATIONS.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
        </select>
      )}
      {needsStructure && <input data-testid={`${idPrefix}-structure-input`} className={field} placeholder="Structure / établissement / entreprise" value={f.structure} onChange={set("structure")} />}
      <input data-testid={`${idPrefix}-name-input`} className={field} placeholder="Nom et prénom" value={f.name} onChange={set("name")} />
      <div className="grid sm:grid-cols-2 gap-3">
        <input data-testid={`${idPrefix}-phone-input`} className={field} placeholder="Téléphone" value={f.phone} onChange={set("phone")} />
        <input data-testid={`${idPrefix}-email-input`} type="email" className={field} placeholder="E-mail" value={f.email} onChange={set("email")} />
      </div>
      <textarea data-testid={`${idPrefix}-message-input`} rows={3} className={field} placeholder="Votre message (facultatif)" value={f.message} onChange={set("message")} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} className="absolute opacity-0 h-0 w-0 pointer-events-none" aria-hidden="true" />
      {error && <p data-testid={`${idPrefix}-error`} className="text-sm text-[#b4532a]">{error}</p>}
      <button type="submit" disabled={busy} data-testid={`${idPrefix}-submit-button`} className="w-full rounded-full bg-[#25333D] text-white py-3.5 text-sm font-semibold hover:bg-[#F29A58] hover:text-[#25333D] transition-colors disabled:opacity-60">
        {busy ? "Envoi…" : "Envoyer ma demande"}
      </button>
      <p className="text-[11px] text-[#53616B]">Téléphone ou e-mail obligatoire. Prototype de démonstration — données fictives uniquement.</p>
    </form>
  );
};
