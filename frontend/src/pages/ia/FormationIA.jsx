import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, BrainCircuit, ShieldCheck, Users, ChevronDown } from "lucide-react";
import "@/pages/ia/ia.css";
import { IA_PROGRAMMES, IA_FINANCEMENTS, IA_FAQ } from "@/pages/ia/data";
import { AGENCIES } from "@/data/gsr";
import { createDemande, apiError, getIaSessions } from "@/lib/api";
import { Reveal } from "@/components/gsr/Reveal";

const setMeta = (name, content) => {
  let m = document.querySelector(`meta[name="${name}"]`);
  if (!m) { m = document.createElement("meta"); m.setAttribute("name", name); document.head.appendChild(m); }
  m.setAttribute("content", content);
};

const Nav = () => (
  <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0E1420]/80 border-b border-white/10">
    <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <Link to="/formation-ia/" data-testid="ia-logo" className="ia-display text-lg font-semibold flex items-center gap-2"><BrainCircuit size={22} className="text-[#7DF5C8]" /> Formation<span className="text-[#7DF5C8]">IA</span></Link>
      <nav className="hidden md:flex gap-8 text-sm text-[#9AA8BA]">
        {[["#programmes", "Programmes"], ["#sessions", "Sessions"], ["#financement", "Financement"], ["#faq", "FAQ"]].map(([h, l]) => <a key={h} href={h} data-testid={`ia-nav-${h.slice(1)}`} className="hover:text-white transition-colors">{l}</a>)}
      </nav>
      <a href="#inscription" data-testid="ia-nav-cta" className="ia-btn !py-2.5 !px-4 text-sm">S'inscrire</a>
    </div>
  </header>
);

const Hero = () => (
  <section className="ia-grid-bg relative overflow-hidden">
    <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 lg:pt-32 lg:pb-36 grid lg:grid-cols-12 gap-12 items-center">
      <div className="lg:col-span-7">
        <Reveal><span className="ia-tag">Val-de-Marne · Formations courtes · Tous publics</span></Reveal>
        <Reveal delay={0.1}><h1 data-testid="ia-hero-title" className="ia-display mt-8 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.02]">L'intelligence artificielle, <span className="text-[#7DF5C8]">expliquée simplement</span>, utile tout de suite.</h1></Reveal>
        <Reveal delay={0.2}><p className="mt-7 text-[#9AA8BA] text-base md:text-lg max-w-xl leading-relaxed">Des formations accessibles sans prérequis pour comprendre et utiliser l'IA dans sa vie quotidienne, sa recherche d'emploi ou son métier.</p></Reveal>
        <Reveal delay={0.3}><div className="mt-10 flex flex-wrap gap-4"><a href="#programmes" data-testid="ia-hero-cta" className="ia-btn inline-flex items-center gap-2">Voir les programmes <ArrowRight size={18} /></a><a href="#inscription" className="px-6 py-3.5 rounded-md border border-white/15 hover:border-[#7DF5C8] transition-colors text-sm font-medium">Demander un rappel</a></div></Reveal>
      </div>
      <div className="lg:col-span-5 relative">
        <div className="ia-float bg-[#16202F] ia-glow rounded-xl p-6 lg:p-8">
          <div className="flex items-center gap-2 text-xs text-[#9AA8BA]"><Sparkles size={14} className="text-[#7DF5C8]" /> Exemple d'exercice</div>
          <p className="mt-4 text-sm bg-[#0B111B] rounded-md p-4 border border-white/5">« Réécris ma lettre de motivation pour un poste d'agent d'accueil, en gardant mon expérience en restauration. »</p>
          <p className="mt-3 text-sm text-[#C9B6FF] border-l-2 border-[#C9B6FF] pl-4">L'IA propose → le stagiaire relit, corrige, s'approprie. Toujours.</p>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[["0", "prérequis"], ["3", "programmes"], ["2", "sites"]].map(([n, l]) => <div key={l} className="bg-[#0B111B] rounded-md py-3"><p className="ia-display text-2xl font-bold text-[#7DF5C8]">{n}</p><p className="text-[11px] text-[#9AA8BA] uppercase tracking-wider">{l}</p></div>)}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Programmes = () => (
  <section id="programmes" className="max-w-6xl mx-auto px-6 py-24">
    <Reveal><span className="ia-tag">Programmes</span><h2 className="ia-display mt-6 text-3xl md:text-5xl font-bold max-w-2xl">Trois parcours, un même objectif : l'autonomie.</h2></Reveal>
    <div className="mt-14 grid md:grid-cols-3 gap-5">
      {IA_PROGRAMMES.map((p, i) => (
        <Reveal key={p.id} delay={i * 0.08}>
          <article data-testid={`ia-programme-${p.id}`} className="h-full bg-[#16202F] rounded-xl p-7 border border-white/5 hover:border-[#7DF5C8]/40 transition-colors flex flex-col">
            <div className="flex items-center justify-between text-xs text-[#9AA8BA]"><span className="text-[#7DF5C8] font-semibold uppercase tracking-widest">{p.level}</span><span>{p.duration}</span></div>
            <h3 className="ia-display mt-4 text-2xl font-semibold">{p.title}</h3>
            <p className="mt-3 text-sm text-[#9AA8BA] leading-relaxed flex-1">{p.text}</p>
            <ul className="mt-6 space-y-2 text-sm">{p.points.map((x) => <li key={x} className="flex gap-2"><span className="text-[#7DF5C8]">—</span>{x}</li>)}</ul>
            <a href="#inscription" data-testid={`ia-programme-cta-${p.id}`} className="mt-8 text-sm font-semibold text-[#7DF5C8] inline-flex items-center gap-1 hover:gap-2 transition-all">Demander ce programme <ArrowRight size={16} /></a>
          </article>
        </Reveal>
      ))}
    </div>
    <p className="mt-6 text-xs text-[#9AA8BA]">Contenus pédagogiques indicatifs — programmes détaillés et dates de sessions à publier.</p>
  </section>
);

const Valeurs = () => (
  <section className="border-y border-white/10 bg-[#0B111B]">
    <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-10">
      {[[ShieldCheck, "Esprit critique d'abord", "On apprend à vérifier, pas à copier. Protection des données et usages responsables à chaque séance."], [Users, "Petits groupes", "Douze participants maximum, un formateur, du temps pour chacun."], [BrainCircuit, "Ancré dans le réel", "Chaque exercice part d'une situation concrète : une démarche, un document, un métier."]].map(([I, t, x]) => (
        <div key={t}><I size={26} className="text-[#C9B6FF]" /><h3 className="ia-display mt-4 text-xl font-semibold">{t}</h3><p className="mt-2 text-sm text-[#9AA8BA] leading-relaxed">{x}</p></div>
      ))}
    </div>
  </section>
);

const Financement = () => (
  <section id="financement" className="max-w-6xl mx-auto px-6 py-24 grid lg:grid-cols-12 gap-12">
    <div className="lg:col-span-4"><span className="ia-tag">Financement</span><h2 className="ia-display mt-6 text-3xl md:text-4xl font-bold">Des solutions selon votre situation.</h2><p className="mt-4 text-sm text-[#9AA8BA]">Informations indicatives, à confirmer lors de votre premier échange avec l'équipe.</p></div>
    <div className="lg:col-span-8 grid sm:grid-cols-2 gap-4">
      {IA_FINANCEMENTS.map((f) => <div key={f.title} data-testid="ia-financement-item" className="bg-[#16202F] rounded-xl p-6 border border-white/5"><h3 className="ia-display text-lg font-semibold">{f.title}</h3><p className="mt-2 text-sm text-[#9AA8BA] leading-relaxed">{f.text}</p></div>)}
    </div>
  </section>
);

const Faq = () => {
  const [i, setI] = useState(0);
  return (
    <section id="faq" className="max-w-3xl mx-auto px-6 py-20">
      <span className="ia-tag">FAQ</span>
      <div className="mt-8 divide-y divide-white/10 border-t border-white/10">
        {IA_FAQ.map(([q, a], k) => (
          <div key={q}>
            <button data-testid={`ia-faq-${k}`} onClick={() => setI(i === k ? -1 : k)} className="w-full py-5 flex justify-between items-center gap-6 text-left ia-display text-lg font-medium hover:text-[#7DF5C8] transition-colors">{q}<ChevronDown className={`shrink-0 transition-transform ${i === k ? "rotate-180" : ""}`} /></button>
            {i === k && <p className="pb-5 text-sm text-[#9AA8BA] leading-relaxed">{a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
};

const Sessions = ({ sessions, onPick, picked }) => (
  <section id="sessions" className="max-w-6xl mx-auto px-6 py-20">
    <span className="ia-tag">Sessions à venir</span>
    <h2 className="ia-display mt-6 text-3xl md:text-4xl font-bold">Dates ouvertes aux inscriptions</h2>
    {sessions.length === 0 ? (
      <p data-testid="ia-no-sessions" className="mt-6 text-[#9AA8BA] max-w-xl">Aucune session n'est ouverte pour le moment. Laissez vos coordonnées ci-dessous : nous vous prévenons dès l'ouverture des prochaines dates.</p>
    ) : (
      <div className="mt-10 grid md:grid-cols-2 gap-4">
        {sessions.map((s) => (
          <article key={s.id} data-testid={`ia-session-${s.id}`} className={`bg-[#16202F] rounded-xl p-6 border transition-colors ${picked === s.id ? "border-[#7DF5C8]" : "border-white/5"}`}>
            <p className="text-xs text-[#7DF5C8] uppercase tracking-widest">{new Date(s.date_start + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}{s.date_end ? ` → ${new Date(s.date_end + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}` : ""}</p>
            <h3 className="ia-display mt-2 text-xl font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-[#9AA8BA]">{s.time_start}–{s.time_end} · {s.mode === "distanciel" ? "À distance" : s.location}{s.trainer ? ` · ${s.trainer}` : ""}</p>
            <div className="mt-4 flex items-center justify-between">
              <span data-testid="ia-session-remaining" className="text-sm">{s.remaining > 0 ? `${s.remaining} place${s.remaining > 1 ? "s" : ""} disponible${s.remaining > 1 ? "s" : ""}` : "Complet"}</span>
              <a href="#inscription" data-testid={`ia-session-pick-${s.id}`} onClick={() => s.remaining > 0 && onPick(s.id)} className={`text-sm font-semibold ${s.remaining > 0 ? "text-[#7DF5C8]" : "text-[#9AA8BA] pointer-events-none"}`}>{s.remaining > 0 ? "Choisir cette session →" : "Liste d'attente en agence"}</a>
            </div>
          </article>
        ))}
      </div>
    )}
    <p className="mt-6 text-xs text-[#9AA8BA]">Toute demande d'inscription est examinée par l'équipe avant confirmation définitive.</p>
  </section>
);

const Inscription = ({ sessions, picked, setPicked }) => {
  const [f, setF] = useState({ name: "", phone: "", email: "", agency: "creteil", formation: "", message: "", website: "" });
  const [done, setDone] = useState(null);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try { setDone(await createDemande({ ...f, type: "formation-ia", structure: "Formation IA", session_id: picked || null })); } catch (x) { setErr(apiError(x)); }
  };
  return (
    <section id="inscription" className="bg-[#0B111B] border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-24 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5"><span className="ia-tag">Inscription</span><h2 className="ia-display mt-6 text-3xl md:text-5xl font-bold">On vous rappelle.</h2><p className="mt-5 text-[#9AA8BA] leading-relaxed">Laissez vos coordonnées, l'équipe vous recontacte pour préciser votre besoin, le programme adapté et les financements possibles.</p>
          <p className="mt-8 text-xs text-[#9AA8BA]">Formation IA est un espace porté par l'association <strong className="text-white">Génération Sécurité Routière</strong>. Vos données ne servent qu'au traitement de votre demande.</p></div>
        <div className="lg:col-span-7 bg-[#16202F] rounded-xl p-6 lg:p-10 ia-glow">
          {done ? (
            <div data-testid="ia-confirmation"><p className="text-[#7DF5C8] text-sm uppercase tracking-widest">Demande enregistrée</p><p data-testid="ia-reference" className="ia-display break-all mt-3 text-3xl font-bold">{done.reference}</p>{done.inscription_status && <p data-testid="ia-inscription-pending" className="mt-3 text-sm text-[#C9B6FF]">Votre demande d'inscription à la session est <b>en attente de validation</b> par l'équipe. Vous serez recontacté·e pour confirmation.</p>}<p className="mt-4 text-sm text-[#9AA8BA]">Conservez cette référence. Démonstration : aucune donnée réelle n'est transmise.</p></div>
          ) : (
            <form onSubmit={submit} data-testid="ia-form" className="grid sm:grid-cols-2 gap-4" noValidate>
              {sessions.length > 0 && (
                <select data-testid="ia-session-select" className="ia-field sm:col-span-2" value={picked || ""} onChange={(e) => setPicked(e.target.value)}>
                  <option value="">Sans session précise (être recontacté·e)</option>
                  {sessions.map((s) => <option key={s.id} value={s.id} disabled={s.remaining === 0}>{s.title} — {s.date_start} {s.remaining === 0 ? "(complet)" : ""}</option>)}
                </select>
              )}
              <input data-testid="ia-name-input" className="ia-field sm:col-span-2" placeholder="Nom et prénom" value={f.name} onChange={set("name")} />
              <input data-testid="ia-phone-input" className="ia-field" placeholder="Téléphone" value={f.phone} onChange={set("phone")} />
              <input data-testid="ia-email-input" className="ia-field" type="email" placeholder="E-mail" value={f.email} onChange={set("email")} />
              <select data-testid="ia-programme-select" className="ia-field" value={f.formation} onChange={set("formation")}><option value="">Programme souhaité</option>{IA_PROGRAMMES.map((p) => <option key={p.id} value={`ia-${p.id}`}>{p.title}</option>)}</select>
              <select data-testid="ia-site-select" className="ia-field" value={f.agency} onChange={set("agency")}>{AGENCIES.map((a) => <option key={a.id} value={a.id}>Site de {a.city}</option>)}</select>
              <textarea data-testid="ia-message-input" className="ia-field sm:col-span-2" rows={3} placeholder="Votre situation, vos attentes (facultatif)" value={f.message} onChange={set("message")} />
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} className="absolute opacity-0 h-0 w-0 pointer-events-none" aria-hidden="true" />
              {err && <p data-testid="ia-error" className="sm:col-span-2 text-sm text-[#ff9b9b]">{err}</p>}
              <button data-testid="ia-submit-button" className="ia-btn sm:col-span-2">Envoyer ma demande</button>
              <p className="sm:col-span-2 text-[11px] text-[#9AA8BA]">Téléphone ou e-mail obligatoire.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default function FormationIA() {
  const [sessions, setSessions] = useState([]);
  const [picked, setPicked] = useState("");
  useEffect(() => { getIaSessions().then(setSessions).catch(() => setSessions([])); }, []);
  useEffect(() => {
    const prev = document.title;
    document.title = "Formation IA — Comprendre et utiliser l'intelligence artificielle | Val-de-Marne";
    setMeta("description", "Formations courtes à l'intelligence artificielle, sans prérequis, à Créteil et Bonneuil-sur-Marne. Découverte, recherche d'emploi, usages métier. Portées par Génération Sécurité Routière.");
    setMeta("robots", "index, follow");
    return () => { document.title = prev; setMeta("robots", "index, follow"); };
  }, []);
  return (
    <div className="ia-root min-h-screen" data-testid="ia-page">
      <Nav />
      <main><Hero /><Programmes /><Sessions sessions={sessions} picked={picked} onPick={setPicked} /><Valeurs /><Financement /><Faq /><Inscription sessions={sessions} picked={picked} setPicked={setPicked} /></main>
      <footer className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-wrap justify-between gap-4 text-xs text-[#9AA8BA]">
          <p data-testid="ia-footer-mention">Formation IA — un espace porté par l'association Génération Sécurité Routière (loi 1901), Val-de-Marne.</p>
          <p>{AGENCIES.map((a) => `${a.city} · ${a.phone}`).join("  |  ")}</p>
        </div>
      </footer>
    </div>
  );
}
