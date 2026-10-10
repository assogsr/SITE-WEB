import { useState } from "react";
import { Phone, Mail, MapPin, Search } from "lucide-react";
import { PageHero, Section, Label } from "@/components/site/Page";
import { RdvForm, TYPES } from "@/components/gsr/RdvForm";
import { AGENCIES, IMG } from "@/data/gsr";
import { getDemande, apiError } from "@/lib/api";

const STATUS = { nouveau: "Nouvelle demande — en attente de traitement", en_cours: "En cours de traitement", traite: "Traitée", annule: "Annulée" };

export function Contact() {
  const [done, setDone] = useState(null);
  return (
    <div data-testid="contact-page">
      <PageHero testId="contact-hero" label="Contact" title="On vous rappelle, on vous reçoit." image={IMG.sourireVolant} text="Information, inscription, rendez-vous, rappel, intervention ou partenariat : une seule demande suffit." />
      <Section tone="cream">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-10">
            {AGENCIES.map((a) => (
              <div key={a.id} data-testid={`contact-agency-${a.id}`}>
                <Label>{a.city}</Label>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex gap-3"><MapPin size={18} className="text-[#F29A58] shrink-0" />{a.street}, {a.zip}</li>
                  <li className="flex gap-3"><Phone size={18} className="text-[#F29A58] shrink-0" /><a href={`tel:${a.tel}`} className="hover:text-[#F29A58]">{a.phone}</a></li>
                  <li className="flex gap-3"><Mail size={18} className="text-[#F29A58] shrink-0" /><a href={`mailto:${a.email}`} className="hover:text-[#F29A58] break-all">{a.email}</a></li>
                </ul>
              </div>
            ))}
          </div>
          <div className="lg:col-span-6 lg:col-start-7 bg-white p-6 lg:p-10">
            {done ? (
              <div data-testid="contact-confirmation" className="space-y-3">
                <h2 className="font-clash text-3xl font-semibold">Demande enregistrée</h2>
                <p className="text-[#53616B]">Référence de votre dossier :</p>
                <p data-testid="contact-reference" className="font-mono break-all text-xl bg-[#FFF4EA] px-4 py-3 inline-block">{done.reference}</p>
                {done.creneau && <p className="text-sm">Créneau réservé : {done.creneau.date} à {done.creneau.time}</p>}
                {done.rappel_date && <p data-testid="contact-rappel" className="text-sm">Rappel souhaité : {done.rappel_date} à {done.rappel_time}</p>}
                <button data-testid="contact-new-request" onClick={() => setDone(null)} className="block mt-4 text-sm font-semibold hover:text-[#F29A58]">Faire une autre demande</button>
              </div>
            ) : <RdvForm idPrefix="contact" onDone={(_, d) => setDone(d)} />}
          </div>
        </div>
      </Section>
    </div>
  );
}

export function Suivi() {
  const [ref, setRef] = useState("");
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const search = async (e) => {
    e.preventDefault();
    setErr(""); setD(null);
    try { setD(await getDemande(ref.trim())); } catch (x) { setErr(apiError(x, "Référence introuvable")); }
  };
  return (
    <div data-testid="suivi-page">
      <PageHero testId="suivi-hero" label="Suivre ma demande" title="Où en est mon dossier ?" text="Saisissez la référence complète reçue lors de votre demande." />
      <Section>
        <form onSubmit={search} className="max-w-xl flex gap-3">
          <input data-testid="suivi-ref-input" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Votre référence complète" className="flex-1 min-w-0 rounded-xl border border-[#25333D]/15 px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#F29A58]/60" />
          <button data-testid="suivi-submit-button" className="bg-[#25333D] text-white px-6 rounded-xl hover:bg-[#F29A58] hover:text-[#25333D] transition-colors"><Search size={18} /></button>
        </form>
        {err && <p data-testid="suivi-error" className="mt-4 text-sm text-[#b4532a]">{err}</p>}
        {d && (
          <dl data-testid="suivi-result" className="mt-8 max-w-xl grid grid-cols-[140px_1fr] gap-y-3 text-sm bg-[#FFF4EA] p-6">
            <dt className="text-[#53616B]">Référence</dt><dd className="font-mono break-all">{d.reference}</dd>
            <dt className="text-[#53616B]">Statut</dt><dd data-testid="suivi-status" className="font-semibold">{STATUS[d.status] || d.status}</dd>
            <dt className="text-[#53616B]">Motif</dt><dd>{TYPES.find((t) => t.id === d.type)?.label}</dd>
            <dt className="text-[#53616B]">Agence</dt><dd>{AGENCIES.find((a) => a.id === d.agency)?.city}</dd>
            {d.creneau && <><dt className="text-[#53616B]">Créneau</dt><dd>{d.creneau.date} à {d.creneau.time}</dd></>}
            <dt className="text-[#53616B]">Déposée le</dt><dd>{new Date(d.created_at).toLocaleString("fr-FR")}</dd>
          </dl>
        )}
      </Section>
    </div>
  );
}
