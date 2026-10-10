import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Logo } from "@/components/gsr/Logo";
import { Reveal } from "@/components/gsr/Reveal";
import { Kicker } from "@/pages/p3/sections-a";
import { AGENCIES, PREVENTION, MOBILITE, NEWS, IMG, LEGAL_LINKS } from "@/data/gsr";

export const Pavillon = ({ onIntervention }) => (
  <section className="bg-[#25333D] text-white rounded-[3rem] mx-3 lg:mx-6 py-24 lg:py-32">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <div className="grid lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-7"><Kicker>Prévention & sécurité routière</Kicker><h2 className="mt-3 font-cormorant text-5xl lg:text-6xl font-semibold leading-tight">Sensibiliser, à tous les âges de la vie.</h2></div>
        <div className="lg:col-span-5 lg:text-right"><button data-testid="p3-intervention-button" onClick={onIntervention} className="rounded-full border border-white/30 px-6 py-3 text-sm hover:bg-white hover:text-[#25333D] transition-colors">Demander une intervention</button></div>
      </div>
      <div className="mt-16 columns-1 sm:columns-2 lg:columns-3 gap-6 [&>*]:mb-6">
        {PREVENTION.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 0.08} className="break-inside-avoid">
            <article data-testid={`p3-prevention-${p.id}`} className="rounded-[2rem] bg-white/5 ring-1 ring-white/10 overflow-hidden hover:bg-white/10 transition-colors">
              {i % 2 === 0 && <img src={p.image} alt={p.title} className="w-full aspect-[4/3] object-cover" />}
              <div className="p-7">
                <h3 className="font-cormorant text-3xl font-semibold">{p.title}</h3>
                <p className="mt-3 text-sm text-white/65 leading-relaxed">{p.text}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export const Inclusion = () => (
  <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-36 grid lg:grid-cols-12 gap-14 items-center">
    <Reveal className="lg:col-span-5">
      <div className="rounded-[2.5rem] rounded-tr-[10rem] overflow-hidden aspect-[4/5]">
        <img src={IMG.femmeConduite} alt="Femme au volant" className="h-full w-full object-cover" />
      </div>
    </Reveal>
    <div className="lg:col-span-6 lg:col-start-7">
      <Kicker>Mobilité solidaire</Kicker>
      <h2 className="mt-3 font-cormorant text-5xl lg:text-6xl font-semibold text-[#25333D] leading-tight">Women Permis, et bien d'autres chemins.</h2>
      <div className="mt-12 space-y-8">
        {MOBILITE.map((m, i) => (
          <Reveal key={m.id} delay={i * 0.07}>
            <div data-testid={`p3-mobilite-${m.id}`} className="flex gap-6">
              <span className="font-cormorant italic text-3xl text-[#F29A58] w-10 shrink-0">{i + 1}.</span>
              <div><h3 className="text-lg font-semibold text-[#25333D]">{m.title}</h3><p className="mt-1 text-sm text-[#53616B] leading-relaxed">{m.text}</p></div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export const Actus = () => (
  <section className="bg-white rounded-[3rem] mx-3 lg:mx-6 py-24 lg:py-32">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <Kicker>Actualités</Kicker>
      <h2 className="mt-3 font-cormorant text-5xl font-semibold text-[#25333D]">Nouvelles de l'association</h2>
      <div className="mt-14 grid md:grid-cols-3 gap-8">
        {NEWS.map((n, i) => (
          <Reveal key={n.id} delay={i * 0.08} className={i === 1 ? "md:mt-14" : ""}>
            <a href="#" data-testid={`p3-news-${n.id}`} className="group block">
              <div className="rounded-[2rem] overflow-hidden aspect-[4/5]"><img src={n.image} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" /></div>
              <p className="mt-5 text-xs text-[#53616B]">{n.date} · <span className="text-[#F29A58]">{n.cat}</span></p>
              <h3 className="mt-2 font-cormorant text-2xl font-semibold text-[#25333D]">{n.title}</h3>
            </a>
          </Reveal>
        ))}
      </div>
      <p className="mt-10 text-xs text-[#53616B]">Actualités fictives — exemples de contenu.</p>
    </div>
  </section>
);

const MOTIFS = ["Découvrir les formations", "M'inscrire", "Être rappelé·e", "Un accompagnement mobilité"];

export const ThreeSteps = () => {
  const [agency, setAgency] = useState(null);
  const [motif, setMotif] = useState(null);
  const [contact, setContact] = useState("");
  const [ref, setRef] = useState(null);
  const step = !agency ? 1 : !motif ? 2 : 3;
  const reset = () => { setAgency(null); setMotif(null); setContact(""); setRef(null); };
  const send = (e) => {
    e.preventDefault();
    if (!contact.trim()) return;
    setRef(`GSR-${agency === "creteil" ? "CRE" : "BON"}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  };
  const pill = (active) => `rounded-full px-6 py-3 text-sm border transition-colors ${active ? "bg-[#25333D] text-white border-[#25333D]" : "bg-white border-[#25333D]/15 text-[#25333D] hover:border-[#F29A58]"}`;
  return (
    <section id="p3-rdv" className="max-w-4xl mx-auto px-6 lg:px-10 py-24 lg:py-36">
      <div className="text-left"><Kicker>Prendre rendez-vous</Kicker><h2 className="mt-3 font-cormorant text-5xl lg:text-6xl font-semibold text-[#25333D]">En trois gestes simples.</h2></div>
      {ref ? (
        <div data-testid="p3-steps-confirmation" className="mt-12 rounded-[2rem] bg-white p-10">
          <Check className="text-[#F29A58]" size={36} />
          <p className="mt-4 font-cormorant text-3xl text-[#25333D]">Merci, votre demande est enregistrée.</p>
          <p className="mt-2 text-[#53616B]">Référence : <span data-testid="p3-steps-reference" className="font-mono text-[#25333D]">{ref}</span></p>
          <p className="mt-1 text-xs text-[#53616B]">Démonstration : aucune donnée transmise.</p>
          <button data-testid="p3-steps-reset" onClick={reset} className="mt-6 text-sm underline decoration-[#F29A58] underline-offset-4">Nouvelle demande</button>
        </div>
      ) : (
        <div className="mt-12 space-y-10">
          <div><p className="text-sm text-[#53616B] mb-4"><span className="font-cormorant italic text-2xl text-[#F29A58] mr-2">1.</span>Votre agence</p>
            <div className="flex flex-wrap gap-3">{AGENCIES.map((a) => <button key={a.id} data-testid={`p3-step-agency-${a.id}`} onClick={() => setAgency(a.id)} className={pill(agency === a.id)}>{a.city}</button>)}</div></div>
          {step >= 2 && <div><p className="text-sm text-[#53616B] mb-4"><span className="font-cormorant italic text-2xl text-[#F29A58] mr-2">2.</span>Votre besoin</p>
            <div className="flex flex-wrap gap-3">{MOTIFS.map((m, i) => <button key={m} data-testid={`p3-step-motif-${i}`} onClick={() => setMotif(m)} className={pill(motif === m)}>{m}</button>)}</div></div>}
          {step >= 3 && <form onSubmit={send}><p className="text-sm text-[#53616B] mb-4"><span className="font-cormorant italic text-2xl text-[#F29A58] mr-2">3.</span>Comment vous joindre ? (téléphone ou e-mail)</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input data-testid="p3-step-contact-input" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="06 00 00 00 00 ou prenom@exemple.fr" className="flex-1 rounded-full bg-white border border-[#25333D]/15 px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#F29A58]/50" />
              <button data-testid="p3-step-submit" type="submit" disabled={!contact.trim()} className="rounded-full bg-[#F29A58] text-[#25333D] px-8 py-4 text-sm font-semibold disabled:opacity-40 hover:bg-[#25333D] hover:text-white transition-colors inline-flex items-center justify-center gap-2">Envoyer <ArrowRight size={14} /></button>
            </div></form>}
        </div>
      )}
    </section>
  );
};

export const Footer = () => (
  <footer className="bg-[#25333D] text-white/70 rounded-t-[3rem] pt-20 pb-28">
    <div className="max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-12 gap-10">
      <div className="md:col-span-5">
        <Logo chip className="h-12" testId="p3-footer-logo" />
        <p className="mt-8 font-cormorant italic text-3xl text-white">À vos côtés, sur la route de demain.</p>
      </div>
      {AGENCIES.map((a) => (
        <div key={a.id} className="md:col-span-2 text-sm space-y-1"><p className="text-white mb-2">{a.city}</p><p>{a.street}</p><p>{a.zip}</p><p>{a.phone}</p><p className="break-all">{a.email}</p></div>
      ))}
      <ul className="md:col-span-3 text-sm space-y-2 md:pl-8">{LEGAL_LINKS.map((l) => <li key={l}><a href="#" className="hover:text-[#F29A58]">{l}</a></li>)}</ul>
    </div>
  </footer>
);
