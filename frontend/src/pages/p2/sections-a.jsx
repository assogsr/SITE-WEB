import { useState } from "react";
import { ArrowRight, ArrowUpRight, Phone, Mail, MapPin, Clock, Car, ShieldCheck, Users, Menu, X } from "lucide-react";
import { Logo } from "@/components/gsr/Logo";
import { Reveal } from "@/components/gsr/Reveal";
import { AGENCIES, FORMATIONS, NAV, IMG, mapSrc } from "@/data/gsr";

const Label = ({ children, light }) => (
  <span className={`inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-medium ${light ? "text-white/70" : "text-[#53616B]"}`}>
    <span className="h-2 w-2 bg-[#F29A58]" /> {children}
  </span>
);

export const Nav = ({ onRdv }) => {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-4 inset-x-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 bg-[#25333D]/90 backdrop-blur-xl px-3 py-2.5 text-white">
        <Logo chip className="h-9" testId="p2-logo" />
        <nav className="hidden lg:flex gap-7 text-sm text-white/80">
          {NAV.map((n) => <a key={n} href="#" data-testid={`p2-nav-${n}`} className="hover:text-[#F29A58] transition-colors">{n}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden md:flex items-center gap-2 text-xs text-white/60 pr-2"><span className="h-2 w-2 rounded-full bg-[#F29A58] animate-pulse" /> Créteil · Bonneuil</span>
          <button data-testid="p2-nav-rdv-button" onClick={onRdv} className="hidden sm:block bg-[#F29A58] text-[#25333D] px-5 py-2.5 text-sm font-semibold hover:bg-white transition-colors">Rendez-vous</button>
          <button data-testid="p2-mobile-menu-toggle" onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && (
        <div data-testid="p2-mobile-menu" className="lg:hidden max-w-7xl mx-auto bg-[#25333D] text-white px-5 py-4 space-y-3">
          {NAV.map((n) => <a key={n} href="#" className="block">{n}</a>)}
          <button onClick={onRdv} className="w-full bg-[#F29A58] text-[#25333D] py-3 text-sm font-semibold">Rendez-vous</button>
        </div>
      )}
    </header>
  );
};

const NEEDS = [
  { icon: Car, label: "Passer mon permis", href: "#p2-formations" },
  { icon: ShieldCheck, label: "Une intervention prévention", href: "#p2-prevention" },
  { icon: Users, label: "Un accompagnement mobilité", href: "#p2-mobilite" },
];

export const Hero = () => (
  <section className="relative min-h-[100svh] flex items-end overflow-hidden bg-[#25333D]">
    <img src={IMG.leconMoniteur} alt="Moniteur et élève en voiture" className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#25333D] via-[#25333D]/55 to-[#25333D]/10" />
    <div className="relative max-w-7xl mx-auto w-full px-6 lg:px-10 pb-16 pt-40">
      <Reveal><Label light>Auto-école sociale et solidaire · Val-de-Marne</Label></Reveal>
      <Reveal delay={0.1}>
        <h1 className="mt-6 font-clash font-semibold text-white text-5xl sm:text-6xl lg:text-8xl leading-[0.95] max-w-5xl">
          À vos côtés, sur la route <span className="text-[#F29A58]">de demain.</span>
        </h1>
      </Reveal>
      <Reveal delay={0.2} className="mt-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <p className="text-white/70 text-sm mb-4">J'ai besoin de…</p>
          <div className="flex flex-wrap gap-3">
            {NEEDS.map(({ icon: I, label, href }, i) => (
              <a key={label} href={href} data-testid={`p2-need-${i}`} className="group flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-3.5 text-sm hover:bg-white hover:text-[#25333D] transition-colors">
                <I size={18} className="text-[#F29A58]" /> {label} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </a>
            ))}
          </div>
        </div>
        <p className="text-white/70 max-w-sm text-sm leading-relaxed">Formation au permis, prévention routière et mobilité solidaire : une association loi 1901 au service de tous.</p>
      </Reveal>
    </div>
  </section>
);

export const Bento = ({ onRdv }) => (
  <section id="p2-formations" className="bg-[#FFF4EA] py-24 lg:py-32">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div><Label>Formations</Label><h2 className="mt-4 font-clash text-4xl lg:text-6xl font-semibold text-[#25333D]">Votre permis, votre parcours.</h2></div>
        <p className="max-w-sm text-[#53616B] text-sm">Chaque fiche détaille prérequis, modalités, tarifs réglementaires et financements possibles.</p>
      </div>
      <div className="mt-14 grid grid-cols-1 md:grid-cols-6 gap-4 md:auto-rows-[220px]">
        <div className="md:col-span-3 md:row-span-2 relative overflow-hidden group">
          <img src={IMG.eleveVoiture} alt="Élève au volant" className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#25333D]/85 to-transparent" />
          <button data-testid="p2-formation-permis-b" onClick={onRdv} className="relative h-full min-h-[320px] w-full text-left p-8 flex flex-col justify-end text-white">
            <span className="text-xs uppercase tracking-widest text-[#F29A58]">{FORMATIONS[0].tag}</span>
            <span className="font-clash text-4xl font-semibold mt-2">{FORMATIONS[0].title}</span>
            <span className="mt-3 text-white/80 text-sm max-w-sm">{FORMATIONS[0].text}</span>
          </button>
        </div>
        {FORMATIONS.slice(1).map((f, i) => (
          <button
            key={f.id}
            data-testid={`p2-formation-${f.id}`}
            onClick={onRdv}
            className={`group md:col-span-3 min-h-[200px] text-left p-7 flex flex-col justify-between transition-colors ${
              i === 0 ? "bg-[#25333D] text-white hover:bg-[#2e3f4b]" : "bg-white hover:bg-[#25333D] hover:text-white"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase tracking-widest text-[#F29A58]">{f.tag}</span>
              <ArrowUpRight className="opacity-40 group-hover:opacity-100 group-hover:rotate-45 transition-all" />
            </div>
            <div>
              <p className="font-clash text-3xl font-semibold">{f.title}</p>
              <p className="mt-2 text-sm opacity-70 max-w-md">{f.text}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  </section>
);

export const AgencyTabs = ({ onRdv }) => {
  const [id, setId] = useState("creteil");
  const a = AGENCIES.find((x) => x.id === id);
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <Label>Nos agences</Label>
          <h2 className="mt-4 font-clash text-4xl lg:text-5xl font-semibold text-[#25333D]">Deux adresses, une même exigence.</h2>
          <div className="mt-10 flex border-b border-[#25333D]/10">
            {AGENCIES.map((x) => (
              <button key={x.id} data-testid={`p2-agency-tab-${x.id}`} onClick={() => setId(x.id)} className={`pb-3 mr-8 text-lg font-clash font-medium border-b-2 -mb-px transition-colors ${id === x.id ? "border-[#F29A58] text-[#25333D]" : "border-transparent text-[#53616B] hover:text-[#25333D]"}`}>
                {x.city}
              </button>
            ))}
          </div>
          <ul data-testid="p2-agency-details" className="mt-8 space-y-5 text-[#25333D]">
            <li className="flex gap-4"><MapPin className="text-[#F29A58] shrink-0" /><span>{a.street}<br />{a.zip}</span></li>
            <li className="flex gap-4"><Phone className="text-[#F29A58] shrink-0" /><a href={`tel:${a.tel}`} data-testid="p2-agency-phone" className="font-clash text-2xl hover:text-[#F29A58]">{a.phone}</a></li>
            <li className="flex gap-4"><Mail className="text-[#F29A58] shrink-0" /><a href={`mailto:${a.email}`} data-testid="p2-agency-email" className="break-all hover:text-[#F29A58]">{a.email}</a></li>
            <li className="flex gap-4 text-[#53616B]"><Clock className="text-[#F29A58] shrink-0" />{a.hours}</li>
          </ul>
          <button data-testid="p2-agency-rdv-button" onClick={() => onRdv(a.id)} className="mt-10 bg-[#25333D] text-white px-7 py-4 text-sm font-semibold hover:bg-[#F29A58] hover:text-[#25333D] transition-colors">
            Rendez-vous à {a.city}
          </button>
        </div>
        <div className="lg:col-span-7 min-h-[380px] bg-[#FFF4EA]">
          <iframe key={a.id} title={`Carte ${a.city}`} data-testid="p2-agency-map" src={mapSrc(a)} className="h-full w-full min-h-[380px] grayscale-[40%]" loading="lazy" />
        </div>
      </div>
    </section>
  );
};
