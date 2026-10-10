import { useState } from "react";
import { ArrowRight, Phone, Mail, MapPin, Clock, Menu, X, Heart } from "lucide-react";
import { Logo } from "@/components/gsr/Logo";
import { Reveal } from "@/components/gsr/Reveal";
import { AGENCIES, FORMATIONS, NAV, IMG, PUBLICS } from "@/data/gsr";

export const Kicker = ({ children }) => (
  <p className="font-cormorant italic text-xl text-[#F29A58]">{children}</p>
);

export const Nav = ({ onRdv }) => {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-[#FFF4EA]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-24 flex items-center justify-between">
        <Logo className="h-16" testId="p3-logo" />
        <nav className="hidden lg:flex items-center gap-1 bg-white/70 rounded-full p-1.5 text-sm">
          {NAV.map((n) => <a key={n} href="#" data-testid={`p3-nav-${n}`} className="px-4 py-2 rounded-full text-[#53616B] hover:bg-[#FFF4EA] hover:text-[#25333D] transition-colors">{n}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <button data-testid="p3-nav-rdv-button" onClick={onRdv} className="hidden sm:block rounded-full bg-[#25333D] text-white px-6 py-3 text-sm font-medium hover:bg-[#F29A58] hover:text-[#25333D] transition-colors">Prendre rendez-vous</button>
          <button data-testid="p3-mobile-menu-toggle" onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && (
        <div data-testid="p3-mobile-menu" className="lg:hidden px-6 pb-6 space-y-3">
          {NAV.map((n) => <a key={n} href="#" className="block text-[#25333D]">{n}</a>)}
          <button onClick={onRdv} className="w-full rounded-full bg-[#25333D] text-white py-3 text-sm">Prendre rendez-vous</button>
        </div>
      )}
    </header>
  );
};

export const Hero = ({ onRdv }) => (
  <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-10 pb-24 grid lg:grid-cols-12 gap-14 items-center">
    <Reveal className="lg:col-span-6">
      <Kicker>Génération Sécurité Routière</Kicker>
      <h1 className="mt-5 font-cormorant font-semibold text-5xl sm:text-6xl lg:text-[5.5rem] leading-[0.98] text-[#25333D]">
        À vos côtés, <em className="font-medium">sur la route</em> de demain.
      </h1>
      <p className="mt-8 text-lg text-[#53616B] leading-relaxed max-w-lg">
        Une auto-école sociale et solidaire qui prend le temps d'écouter, d'expliquer et d'accompagner chacun, quel que soit son parcours.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-6">
        <button data-testid="p3-hero-rdv-button" onClick={onRdv} className="group rounded-full bg-[#F29A58] text-[#25333D] px-8 py-4 text-sm font-semibold hover:bg-[#25333D] hover:text-white transition-colors inline-flex items-center gap-3">
          Prendre rendez-vous <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
        <a href="#p3-agences" data-testid="p3-hero-agences-link" className="text-sm font-medium text-[#25333D] underline decoration-[#F29A58] underline-offset-8">Trouver mon agence</a>
      </div>
    </Reveal>
    <Reveal delay={0.15} className="lg:col-span-6 relative">
      <div className="rounded-t-full rounded-b-[2.5rem] overflow-hidden aspect-[4/5] max-w-md ml-auto">
        <img src={IMG.eleveVoiture} alt="Élève souriante dans sa voiture" className="h-full w-full object-cover" />
      </div>
      <div className="absolute left-0 bottom-8 h-40 w-40 rounded-full overflow-hidden ring-8 ring-[#FFF4EA] hidden sm:block">
        <img src={IMG.groupe} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="absolute right-4 -bottom-6 bg-white rounded-3xl px-6 py-4 shadow-lg flex items-center gap-3">
        <Heart size={18} className="text-[#F29A58]" />
        <span className="text-sm text-[#25333D]">Association loi 1901</span>
      </div>
    </Reveal>
  </section>
);

export const Projet = () => (
  <section className="bg-white rounded-t-[3rem] py-24 lg:py-36">
    <div className="max-w-5xl mx-auto px-6 lg:px-10">
      <Reveal><Kicker>Notre projet</Kicker></Reveal>
      <Reveal delay={0.1}>
        <p className="mt-6 font-cormorant text-3xl sm:text-4xl lg:text-5xl leading-[1.2] text-[#25333D]">
          <span className="float-left font-semibold text-[#F29A58] text-7xl lg:text-8xl leading-[0.8] mr-3 mt-1">N</span>
          ous croyons que la mobilité ne devrait jamais être un privilège. Former au permis, prévenir les risques, accompagner vers l'emploi : trois engagements, une même attention portée à chaque personne.
        </p>
      </Reveal>
      <div className="clear-both mt-14 flex flex-wrap gap-3">
        {PUBLICS.map((p) => <span key={p} className="rounded-full border border-[#25333D]/15 px-5 py-2.5 text-sm text-[#53616B]">{p}</span>)}
      </div>
    </div>
  </section>
);

export const Agences = ({ onRdv }) => (
  <section id="p3-agences" className="bg-white pb-24 lg:pb-36">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <div className="max-w-xl"><Kicker>Nos lieux d'accueil</Kicker><h2 className="mt-3 font-cormorant text-5xl font-semibold text-[#25333D]">Poussez la porte, on vous écoute.</h2></div>
      <div className="mt-16 grid md:grid-cols-2 gap-10 lg:gap-16">
        {AGENCIES.map((a, i) => (
          <Reveal key={a.id} delay={i * 0.12} className={i ? "md:mt-24" : ""}>
            <article data-testid={`p3-agency-${a.id}`} className="rounded-[2.5rem] bg-[#FFF4EA] p-4">
              <img src={a.image} alt={`Agence ${a.city}`} className="rounded-[2rem] aspect-[16/10] w-full object-cover" />
              <div className="p-6 lg:p-8">
                <h3 className="font-cormorant text-4xl font-semibold text-[#25333D]">{a.city}</h3>
                <ul className="mt-6 space-y-3 text-sm text-[#53616B]">
                  <li className="flex gap-3"><MapPin size={16} className="text-[#F29A58] mt-0.5 shrink-0" />{a.street}, {a.zip}</li>
                  <li className="flex gap-3"><Phone size={16} className="text-[#F29A58] mt-0.5 shrink-0" /><a href={`tel:${a.tel}`} data-testid={`p3-agency-${a.id}-phone`}>{a.phone}</a></li>
                  <li className="flex gap-3"><Mail size={16} className="text-[#F29A58] mt-0.5 shrink-0" /><a href={`mailto:${a.email}`} data-testid={`p3-agency-${a.id}-email`} className="break-all">{a.email}</a></li>
                  <li className="flex gap-3"><Clock size={16} className="text-[#F29A58] mt-0.5 shrink-0" />{a.hours}</li>
                </ul>
                <button data-testid={`p3-agency-${a.id}-rdv`} onClick={() => onRdv(a.id)} className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-medium text-[#25333D] hover:bg-[#25333D] hover:text-white transition-colors">Rendez-vous à {a.city}</button>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export const Formations = ({ onRdv }) => (
  <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-36 grid lg:grid-cols-12 gap-14">
    <div className="lg:col-span-4">
      <Kicker>Formations</Kicker>
      <h2 className="mt-3 font-cormorant text-5xl font-semibold text-[#25333D] leading-tight">Chacun son chemin vers le permis.</h2>
      <p className="mt-6 text-[#53616B] text-sm leading-relaxed">Description, prérequis, modalités, tarifs réglementaires et financements possibles sont détaillés sur chaque fiche.</p>
    </div>
    <div className="lg:col-span-8 grid sm:grid-cols-2 gap-5">
      {FORMATIONS.map((f, i) => (
        <Reveal key={f.id} delay={i * 0.06} className={i === 0 ? "sm:col-span-2" : ""}>
          <button data-testid={`p3-formation-${f.id}`} onClick={onRdv} className="group w-full h-full text-left rounded-[2rem] bg-white p-8 hover:shadow-[0_20px_50px_-25px_rgba(37,51,61,0.35)] transition-shadow">
            <span className="rounded-full bg-[#FFF4EA] px-3 py-1 text-xs text-[#53616B]">{f.tag}</span>
            <p className={`mt-5 font-cormorant font-semibold text-[#25333D] ${i === 0 ? "text-5xl" : "text-3xl"}`}>{f.title}</p>
            <p className="mt-3 text-sm text-[#53616B] leading-relaxed">{f.text}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm text-[#25333D] group-hover:gap-3 transition-all">Voir la fiche <ArrowRight size={14} className="text-[#F29A58]" /></span>
          </button>
        </Reveal>
      ))}
    </div>
  </section>
);
