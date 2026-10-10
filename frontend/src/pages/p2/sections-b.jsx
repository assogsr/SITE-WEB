import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/gsr/Logo";
import { Reveal } from "@/components/gsr/Reveal";
import { RdvForm } from "@/components/gsr/RdvForm";
import { AGENCIES, PREVENTION, MOBILITE, NEWS, IMG, LEGAL_LINKS } from "@/data/gsr";

const Label = ({ children, light }) => (
  <span className={`inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-medium ${light ? "text-white/70" : "text-[#53616B]"}`}>
    <span className="h-2 w-2 bg-[#F29A58]" /> {children}
  </span>
);

export const PreventionStrip = ({ onIntervention }) => (
  <section id="p2-prevention" className="bg-[#25333D] text-white py-24 lg:py-32 overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-wrap items-end justify-between gap-6">
      <div><Label light>Sécurité routière</Label><h2 className="mt-4 font-clash text-4xl lg:text-6xl font-semibold max-w-3xl">Six actions de terrain pour changer les comportements.</h2></div>
      <button data-testid="p2-intervention-button" onClick={onIntervention} className="border border-[#F29A58] text-[#F29A58] px-6 py-3 text-sm font-semibold hover:bg-[#F29A58] hover:text-[#25333D] transition-colors">Demander une intervention</button>
    </div>
    <div className="mt-14 flex gap-5 overflow-x-auto no-scrollbar snap-x px-6 lg:px-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] pb-4">
      {PREVENTION.map((p, i) => (
        <article key={p.id} data-testid={`p2-prevention-${p.id}`} className={`group snap-start shrink-0 ${i % 2 ? "w-[300px]" : "w-[380px]"} max-w-[85vw]`}>
          <div className={`overflow-hidden ${i % 2 ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
            <img src={p.image} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
          <p className="mt-5 font-clash text-sm text-[#F29A58]">0{i + 1}</p>
          <h3 className="mt-1 font-clash text-2xl font-medium">{p.title}</h3>
          <p className="mt-2 text-sm text-white/65">{p.text}</p>
        </article>
      ))}
    </div>
  </section>
);

export const MobiliteSplit = () => (
  <section id="p2-mobilite" className="grid lg:grid-cols-2 bg-[#FFF4EA]">
    <div className="relative min-h-[420px]">
      <img src={IMG.femmeConduite} alt="Femme au volant" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute left-6 bottom-6 bg-white px-6 py-5 max-w-xs">
        <p className="text-[11px] uppercase tracking-widest text-[#F29A58] font-semibold">Programme phare</p>
        <p className="font-clash text-3xl font-semibold text-[#25333D] mt-1">Women Permis</p>
      </div>
    </div>
    <div className="px-6 lg:px-16 py-20 lg:py-28">
      <Label>Mobilité solidaire</Label>
      <h2 className="mt-4 font-clash text-4xl lg:text-5xl font-semibold text-[#25333D]">Le permis, un tremplin vers l'emploi.</h2>
      <div className="mt-12 divide-y divide-[#25333D]/10">
        {MOBILITE.map((m, i) => (
          <Reveal key={m.id} delay={i * 0.06}>
            <div data-testid={`p2-mobilite-${m.id}`} className="py-6 grid grid-cols-[48px_1fr] gap-4">
              <span className="font-clash text-[#F29A58] text-xl">{String(i + 1).padStart(2, "0")}</span>
              <div><h3 className="font-clash text-xl font-semibold text-[#25333D]">{m.title}</h3><p className="mt-1 text-sm text-[#53616B]">{m.text}</p></div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export const NewsRows = () => (
  <section className="bg-white py-24 lg:py-32">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <Label>Actualités</Label>
      <h2 className="mt-4 font-clash text-4xl lg:text-5xl font-semibold text-[#25333D]">Sur le terrain.</h2>
      <div className="mt-12 border-t border-[#25333D]">
        {NEWS.map((n) => (
          <Link key={n.id} to={`/actualites/${n.id}`} data-testid={`p2-news-${n.id}`} className="group grid grid-cols-12 gap-4 items-center py-7 border-b border-[#25333D]/15 hover:bg-[#FFF4EA] transition-colors px-2">
            <span className="col-span-12 md:col-span-2 text-xs text-[#53616B]">{n.date}</span>
            <span className="col-span-12 md:col-span-2"><span className="text-[11px] uppercase tracking-widest border border-[#F29A58] text-[#25333D] px-2 py-1">{n.cat}</span></span>
            <span className="col-span-10 md:col-span-6 font-clash text-xl lg:text-2xl font-medium text-[#25333D]">{n.title}</span>
            <span className="col-span-2 md:col-span-2 flex justify-end"><img src={n.image} alt="" className="h-14 w-20 object-cover opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" /><ArrowRight className="md:hidden text-[#F29A58]" /></span>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-xs text-[#53616B]">Actualités fictives — exemples de contenu.</p>
    </div>
  </section>
);

export const QuickForm = ({ onDone }) => (
  <section id="p2-rdv" className="bg-[#FFF4EA] py-24 lg:py-32">
    <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-12">
      <div className="lg:col-span-5">
        <Label>Prendre rendez-vous</Label>
        <h2 className="mt-4 font-clash text-4xl lg:text-6xl font-semibold text-[#25333D] leading-[1]">On vous rappelle, on vous reçoit.</h2>
        <p className="mt-6 text-[#53616B]">Information, inscription, rappel : une seule demande suffit. Vous recevez une référence de dossier.</p>
      </div>
      <div className="lg:col-span-6 lg:col-start-7 bg-white p-6 lg:p-10">
        <RdvForm idPrefix="p2-rdv" onDone={onDone} />
      </div>
    </div>
  </section>
);

export const Footer = () => (
  <footer className="bg-[#25333D] text-white pt-20 pb-28">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <p className="font-clash text-4xl lg:text-7xl font-semibold leading-none">Génération<br /><span className="text-[#F29A58]">Sécurité Routière</span></p>
      <div className="mt-16 grid md:grid-cols-4 gap-10 text-sm text-white/65 border-t border-white/10 pt-10">
        <div><Logo chip className="h-10" testId="p2-footer-logo" /><p className="mt-4">Association loi 1901</p></div>
        {AGENCIES.map((a) => (
          <div key={a.id} className="space-y-1"><p className="text-white font-semibold mb-2">{a.city}</p><p>{a.street}, {a.zip}</p><p>{a.phone}</p><p>{a.email}</p></div>
        ))}
        <ul className="space-y-2">{LEGAL_LINKS.map((l) => <li key={l}><a href="#" className="hover:text-[#F29A58]">{l}</a></li>)}</ul>
      </div>
    </div>
  </footer>
);
