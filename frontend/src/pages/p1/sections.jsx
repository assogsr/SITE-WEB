import { useState } from "react";
import { ArrowRight, ArrowUpRight, Phone, Mail, MapPin, Clock, Menu, X } from "lucide-react";
import { Logo } from "@/components/gsr/Logo";
import { Reveal } from "@/components/gsr/Reveal";
import { AGENCIES, FORMATIONS, PREVENTION, MOBILITE, NEWS, NAV, IMG, PUBLICS, LEGAL_LINKS } from "@/data/gsr";

const Eyebrow = ({ n, children, light }) => (
  <p className={`flex items-center gap-3 text-xs uppercase tracking-[0.22em] ${light ? "text-white/60" : "text-[#53616B]"}`}>
    <span className="text-[#F29A58] font-semibold">{n}</span>
    <span className={`h-px w-10 ${light ? "bg-white/30" : "bg-[#25333D]/25"}`} />
    {children}
  </p>
);

const Nav = ({ onRdv }) => {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-[#25333D]/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <Logo className="h-14" testId="p1-logo" />
        <nav className="hidden lg:flex items-center gap-8 text-sm text-[#25333D]">
          {NAV.map((n) => (
            <a key={n} href="#" data-testid={`p1-nav-${n}`} className="relative hover:text-[#F29A58] transition-colors">{n}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button data-testid="p1-nav-rdv-button" onClick={onRdv} className="hidden sm:inline-flex items-center gap-2 rounded-full border-2 border-[#F29A58] px-5 py-2.5 text-sm font-semibold text-[#25333D] hover:bg-[#F29A58] transition-colors">
            Prendre rendez-vous
          </button>
          <button data-testid="p1-mobile-menu-toggle" onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <div data-testid="p1-mobile-menu" className="lg:hidden border-t border-[#25333D]/10 bg-white px-6 py-4 space-y-3">
          {NAV.map((n) => <a key={n} href="#" className="block py-1 text-[#25333D]">{n}</a>)}
          <button onClick={onRdv} className="w-full rounded-full bg-[#25333D] text-white py-3 text-sm">Prendre rendez-vous</button>
        </div>
      )}
    </header>
  );
};

const Hero = ({ onRdv }) => (
  <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-14 lg:pt-20 pb-20 grid lg:grid-cols-12 gap-12 items-end">
    <Reveal className="lg:col-span-7">
      <Eyebrow n="GSR">Auto-école sociale et solidaire · Val-de-Marne</Eyebrow>
      <h1 className="mt-8 font-outfit font-semibold text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight text-[#25333D]">
        À vos côtés,<br />sur la route<br />
        <span className="relative inline-block">
          de demain.
          <span className="absolute left-0 -bottom-2 w-full road-dash road-dash-anim" />
        </span>
      </h1>
      <p className="mt-10 max-w-xl text-lg text-[#53616B] leading-relaxed">
        Génération Sécurité Routière forme au permis, sensibilise aux dangers de la route et accompagne chacun vers plus de mobilité et d'autonomie.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <button data-testid="p1-hero-rdv-button" onClick={onRdv} className="group inline-flex items-center gap-3 rounded-full bg-[#25333D] text-white px-7 py-4 text-sm font-semibold hover:bg-[#1b262e] transition-colors">
          Prendre rendez-vous <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
        <a href="#formations" data-testid="p1-hero-formations-link" className="inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold text-[#25333D] ring-1 ring-[#25333D]/20 hover:ring-[#F29A58] transition-shadow">
          Découvrir les formations
        </a>
      </div>
    </Reveal>
    <Reveal delay={0.15} className="lg:col-span-5 relative">
      <div className="rounded-2xl overflow-hidden aspect-[4/5] shadow-[0_30px_60px_-30px_rgba(37,51,61,0.5)]">
        <img src={IMG.sourireVolant} alt="Élève souriant au volant" className="h-full w-full object-cover" />
      </div>
      <div className="absolute -left-6 bottom-10 bg-white rounded-2xl px-5 py-4 shadow-xl max-w-[220px]">
        <p className="text-[11px] uppercase tracking-wider text-[#F29A58] font-semibold">Association loi 1901</p>
        <p className="mt-1 text-sm text-[#25333D]">Une auto-école qui n'est pas comme les autres.</p>
      </div>
    </Reveal>
  </section>
);

const Facts = () => (
  <section className="border-y border-[#25333D]/10 bg-white">
    <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-4">
      {[["2", "agences, Créteil et Bonneuil"], ["3", "domaines d'action"], ["5", "formations au permis"], ["Loi 1901", "association à but non lucratif"]].map(([k, v], i) => (
        <div key={k} className={`py-8 px-2 lg:px-6 ${i ? "lg:border-l border-[#25333D]/10" : ""}`}>
          <p className="font-outfit text-4xl font-semibold text-[#25333D]">{k}</p>
          <p className="mt-1 text-sm text-[#53616B]">{v}</p>
        </div>
      ))}
    </div>
  </section>
);

const About = () => (
  <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32 grid lg:grid-cols-12 gap-12">
    <Reveal className="lg:col-span-4"><Eyebrow n="01">Qui sommes-nous</Eyebrow></Reveal>
    <Reveal delay={0.1} className="lg:col-span-8">
      <p className="font-outfit text-3xl lg:text-4xl leading-snug text-[#25333D]">
        GSR n'est pas une auto-école commerciale ordinaire. Nous sommes une <span className="text-[#F29A58]">association engagée</span>, qui fait du permis un levier d'insertion, d'emploi et de liberté.
      </p>
      <div className="mt-10 flex flex-wrap gap-2">
        {PUBLICS.map((p) => <span key={p} className="rounded-full bg-[#FFF4EA] px-4 py-2 text-sm text-[#25333D]">{p}</span>)}
      </div>
    </Reveal>
  </section>
);

export { Eyebrow, Nav, Hero, Facts, About };

export const Formations = ({ onRdv }) => (
  <section id="formations" className="bg-white py-24 lg:py-32">
    <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-12">
      <Reveal className="lg:col-span-4 lg:sticky lg:top-28 self-start">
        <Eyebrow n="02">Formations</Eyebrow>
        <h2 className="mt-6 font-outfit text-4xl font-semibold text-[#25333D] leading-tight">Apprendre à conduire, à son rythme.</h2>
        <p className="mt-5 text-[#53616B]">Tarifs et financements présentés sur chaque fiche. Prérequis et modalités détaillés lors de votre rendez-vous.</p>
        <img src={IMG.leconMoniteur} alt="Leçon de conduite" className="mt-8 rounded-2xl aspect-[4/3] object-cover w-full hidden lg:block" />
      </Reveal>
      <div className="lg:col-span-8">
        {FORMATIONS.map((f, i) => (
          <Reveal key={f.id} delay={i * 0.05}>
            <button data-testid={`p1-formation-${f.id}`} onClick={onRdv} className="group w-full text-left grid grid-cols-12 gap-4 items-baseline py-8 border-b border-[#25333D]/10 hover:pl-3 transition-[padding] duration-300">
              <span className="col-span-2 sm:col-span-1 text-sm text-[#F29A58] font-semibold">0{i + 1}</span>
              <span className="col-span-10 sm:col-span-5">
                <span className="block font-outfit text-2xl lg:text-3xl font-medium text-[#25333D]">{f.title}</span>
                <span className="text-xs uppercase tracking-wider text-[#53616B]">{f.tag}</span>
              </span>
              <span className="col-span-10 col-start-3 sm:col-start-auto sm:col-span-5 text-sm text-[#53616B] leading-relaxed">{f.text}</span>
              <ArrowUpRight className="hidden sm:block col-span-1 justify-self-end text-[#25333D]/30 group-hover:text-[#F29A58] group-hover:rotate-45 transition-all" />
            </button>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export const Prevention = ({ onRdv }) => {
  const [active, setActive] = useState(PREVENTION[0]);
  return (
    <section className="bg-[#25333D] text-white py-24 lg:py-32 relative grain overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-12 relative">
        <div className="lg:col-span-6">
          <Eyebrow n="03" light>Sécurité routière</Eyebrow>
          <h2 className="mt-6 font-outfit text-4xl lg:text-5xl font-semibold leading-tight">Prévenir, sur le terrain et avec les jeunes.</h2>
          <ul className="mt-12">
            {PREVENTION.map((p) => (
              <li key={p.id}>
                <button
                  data-testid={`p1-prevention-${p.id}`}
                  onMouseEnter={() => setActive(p)}
                  onClick={() => setActive(p)}
                  className={`w-full text-left py-4 border-b border-white/10 flex items-center justify-between gap-4 transition-colors ${active.id === p.id ? "text-[#F29A58]" : "text-white/80 hover:text-white"}`}
                >
                  <span className="font-outfit text-xl">{p.title}</span>
                  <ArrowRight size={18} className={active.id === p.id ? "opacity-100" : "opacity-0"} />
                </button>
              </li>
            ))}
          </ul>
          <button data-testid="p1-intervention-button" onClick={onRdv} className="mt-10 rounded-full border-2 border-[#F29A58] px-6 py-3 text-sm font-semibold hover:bg-[#F29A58] hover:text-[#25333D] transition-colors">
            Demander une intervention
          </button>
        </div>
        <div className="lg:col-span-6 lg:pl-8">
          <div className="rounded-2xl overflow-hidden aspect-[4/5] lg:aspect-auto lg:h-full relative">
            <img key={active.id} src={active.image} alt={active.title} className="h-full w-full object-cover animate-in fade-in duration-500" />
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#25333D]/90 to-transparent">
              <p data-testid="p1-prevention-active-text" className="text-white/90 max-w-md">{active.text}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Mobilite = () => (
  <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32 grid lg:grid-cols-12 gap-12 items-center">
    <Reveal className="lg:col-span-5 relative order-2 lg:order-1">
      <img src={IMG.femmeConduite} alt="Femme au volant" className="rounded-2xl aspect-[3/4] object-cover w-full" />
      <div className="absolute -right-4 lg:-right-10 top-10 bg-[#FFF4EA] rounded-2xl p-6 max-w-[240px] shadow-lg">
        <p className="font-outfit text-2xl font-semibold text-[#25333D]">Women Permis</p>
        <p className="mt-2 text-sm text-[#53616B]">Un programme dédié à l'autonomie des femmes.</p>
      </div>
    </Reveal>
    <div className="lg:col-span-6 lg:col-start-7 order-1 lg:order-2">
      <Eyebrow n="04">Mobilité solidaire</Eyebrow>
      <h2 className="mt-6 font-outfit text-4xl lg:text-5xl font-semibold text-[#25333D] leading-tight">Lever les freins, ouvrir des portes.</h2>
      <div className="mt-12 grid sm:grid-cols-2 gap-x-10 gap-y-10">
        {MOBILITE.map((m, i) => (
          <Reveal key={m.id} delay={i * 0.08}>
            <div data-testid={`p1-mobilite-${m.id}`} className="border-t-2 border-[#F29A58] pt-5">
              <h3 className="font-outfit text-xl font-semibold text-[#25333D]">{m.title}</h3>
              <p className="mt-2 text-sm text-[#53616B] leading-relaxed">{m.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export const Agences = ({ onRdv }) => (
  <section className="bg-white py-24 lg:py-32">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <Eyebrow n="05">Nos agences</Eyebrow>
      <h2 className="mt-6 font-outfit text-4xl lg:text-5xl font-semibold text-[#25333D] max-w-2xl leading-tight">Deux lieux d'accueil, au cœur du Val-de-Marne.</h2>
      <div className="mt-16 grid md:grid-cols-2 border-t border-[#25333D]/10">
        {AGENCIES.map((a, i) => (
          <Reveal key={a.id} delay={i * 0.1} className={`py-10 ${i ? "md:pl-12 md:border-l border-[#25333D]/10" : "md:pr-12"}`}>
            <div data-testid={`p1-agency-${a.id}`}>
              <h3 className="font-outfit text-3xl font-semibold text-[#25333D]">{a.city}</h3>
              <ul className="mt-8 space-y-4 text-[#53616B]">
                <li className="flex gap-3"><MapPin size={18} className="text-[#F29A58] shrink-0 mt-0.5" />{a.street}, {a.zip}</li>
                <li className="flex gap-3"><Phone size={18} className="text-[#F29A58] shrink-0 mt-0.5" /><a data-testid={`p1-agency-${a.id}-phone`} href={`tel:${a.tel}`} className="hover:text-[#25333D]">{a.phone}</a></li>
                <li className="flex gap-3"><Mail size={18} className="text-[#F29A58] shrink-0 mt-0.5" /><a data-testid={`p1-agency-${a.id}-email`} href={`mailto:${a.email}`} className="hover:text-[#25333D] break-all">{a.email}</a></li>
                <li className="flex gap-3"><Clock size={18} className="text-[#F29A58] shrink-0 mt-0.5" />{a.hours}</li>
              </ul>
              <button data-testid={`p1-agency-${a.id}-rdv`} onClick={() => onRdv(a.id)} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#25333D] border-b-2 border-[#F29A58] pb-1 hover:gap-3 transition-all">
                Rendez-vous à {a.city} <ArrowRight size={14} />
              </button>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export const News = () => (
  <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32">
    <div className="flex items-end justify-between gap-6">
      <div>
        <Eyebrow n="06">Actualités</Eyebrow>
        <h2 className="mt-6 font-outfit text-4xl font-semibold text-[#25333D]">La vie de l'association</h2>
      </div>
      <a href="#" data-testid="p1-news-all-link" className="hidden sm:inline text-sm font-semibold border-b-2 border-[#F29A58] pb-1">Toutes les actualités</a>
    </div>
    <div className="mt-14 grid lg:grid-cols-12 gap-8">
      {NEWS.map((n, i) => (
        <Reveal key={n.id} delay={i * 0.08} className={i === 0 ? "lg:col-span-6 lg:row-span-2" : "lg:col-span-6"}>
          <a href="#" data-testid={`p1-news-${n.id}`} className={`group flex ${i === 0 ? "flex-col" : "gap-6 items-center"}`}>
            <div className={`overflow-hidden rounded-2xl ${i === 0 ? "aspect-[16/10]" : "w-40 shrink-0 aspect-square"}`}>
              <img src={n.image} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className={i === 0 ? "mt-6" : ""}>
              <p className="text-xs uppercase tracking-wider text-[#F29A58] font-semibold">{n.cat} · {n.date}</p>
              <h3 className={`mt-2 font-outfit font-medium text-[#25333D] group-hover:underline decoration-[#F29A58] underline-offset-4 ${i === 0 ? "text-3xl" : "text-xl"}`}>{n.title}</h3>
            </div>
          </a>
        </Reveal>
      ))}
    </div>
    <p className="mt-10 text-xs text-[#53616B]">Actualités fictives — exemples de contenu.</p>
  </section>
);

export const Cta = ({ onRdv }) => (
  <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
    <div className="rounded-3xl bg-white ring-1 ring-[#25333D]/10 p-10 lg:p-16 grid lg:grid-cols-12 gap-8 items-center">
      <h2 className="lg:col-span-8 font-outfit text-3xl lg:text-5xl font-semibold text-[#25333D] leading-tight">
        Un projet de permis, une question sur nos accompagnements ? <span className="text-[#F29A58]">Parlons-en.</span>
      </h2>
      <div className="lg:col-span-4 flex flex-col gap-3">
        <button data-testid="p1-cta-rdv-button" onClick={onRdv} className="rounded-full bg-[#25333D] text-white px-7 py-4 text-sm font-semibold hover:bg-[#1b262e] transition-colors">Prendre rendez-vous</button>
        <button data-testid="p1-cta-callback-button" onClick={onRdv} className="rounded-full ring-1 ring-[#25333D]/20 px-7 py-4 text-sm font-semibold text-[#25333D] hover:ring-[#F29A58] transition-shadow">Être rappelé</button>
      </div>
    </div>
  </section>
);

export const Footer = () => (
  <footer className="bg-[#25333D] text-white/70 pt-20 pb-28">
    <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-10">
      <div className="lg:col-span-4">
        <Logo chip className="h-12" testId="p1-footer-logo" />
        <p className="mt-6 text-sm max-w-xs">Génération Sécurité Routière — association loi 1901, auto-école sociale et solidaire du Val-de-Marne.</p>
      </div>
      {AGENCIES.map((a) => (
        <div key={a.id} className="lg:col-span-3 text-sm space-y-1">
          <p className="text-white font-semibold mb-3">{a.city}</p>
          <p>{a.street}</p><p>{a.zip}</p><p>{a.phone}</p><p>{a.email}</p>
        </div>
      ))}
      <ul className="lg:col-span-2 text-sm space-y-2">
        {LEGAL_LINKS.map((l) => <li key={l}><a href="#" className="hover:text-[#F29A58]">{l}</a></li>)}
      </ul>
    </div>
  </footer>
);
