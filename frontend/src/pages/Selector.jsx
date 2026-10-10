import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/gsr/Logo";
import { Reveal } from "@/components/gsr/Reveal";
import { IMG } from "@/data/gsr";

const PROPOSALS = [
  {
    n: "01", to: "/proposition-1", name: "Éditorial institutionnel",
    pitch: "Une mise en page de magazine contemporain : grandes titrailles, colonnes asymétriques, rubriques numérotées. Sérieux et chaleureux à la fois.",
    fonts: "Outfit · Plus Jakarta Sans", sample: "font-outfit", image: IMG.leconMoniteur, bg: "bg-[#FFF4EA]",
  },
  {
    n: "02", to: "/proposition-2", name: "Énergie citoyenne",
    pitch: "Photographie plein écran, typographie monumentale, grille modulaire et contrastes bleu nuit. Dynamique, direct, tourné vers l'action.",
    fonts: "Clash Display · Satoshi", sample: "font-clash", image: IMG.sourireVolant, bg: "bg-[#25333D] text-white",
  },
  {
    n: "03", to: "/proposition-3", name: "Sérénité & accueil",
    pitch: "Une narration douce : serif élégant, formes en arche, beaucoup de respiration. L'accent est mis sur l'écoute et l'accompagnement.",
    fonts: "Cormorant Garamond · Manrope", sample: "font-cormorant italic", image: IMG.femmeConduite, bg: "bg-white",
  },
];

export default function Selector() {
  return (
    <main data-testid="selector-page" className="min-h-screen bg-[#FFF4EA] text-[#25333D] font-manrope">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-16">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <Logo className="h-20" testId="selector-logo" />
          <span className="text-xs uppercase tracking-[0.2em] text-[#53616B]">Phase 1 · Validation visuelle</span>
        </header>
        <Reveal className="mt-16 lg:mt-24 max-w-3xl">
          <h1 className="font-cormorant text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
            Trois propositions pour la page d'accueil de <em className="text-[#F29A58]">GSR</em>.
          </h1>
          <p className="mt-6 text-base md:text-lg text-[#53616B] max-w-2xl">
            Chaque proposition est une page réellement navigable, avec le même contenu et la même palette.
            Parcourez-les, puis indiquez celle à développer pour l'ensemble du site.
          </p>
        </Reveal>
        <div className="mt-16 grid lg:grid-cols-3 gap-6 lg:gap-8">
          {PROPOSALS.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.1} className={i === 1 ? "lg:mt-16" : ""}>
              <Link
                to={p.to}
                data-testid={`selector-proposal-${i + 1}`}
                className={`group block rounded-3xl overflow-hidden ${p.bg} ring-1 ring-[#25333D]/10 hover:-translate-y-1 transition-transform duration-500`}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={p.image} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-7">
                  <div className="flex items-center justify-between">
                    <span className="text-xs tracking-[0.2em] opacity-60">PROPOSITION {p.n}</span>
                    <ArrowUpRight className="text-[#F29A58] group-hover:rotate-45 transition-transform" />
                  </div>
                  <h2 className={`mt-4 text-3xl ${p.sample}`}>{p.name}</h2>
                  <p className="mt-3 text-sm leading-relaxed opacity-75">{p.pitch}</p>
                  <p className="mt-6 text-xs uppercase tracking-wider opacity-60">{p.fonts}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <p className="mt-20 text-xs text-[#53616B] max-w-3xl leading-relaxed">
          Prototype de démonstration réalisé avec React, FastAPI et MongoDB (environnement Emergent) — ce n'est pas une application Laravel.
          L'architecture cible du projet réel reste Laravel + MySQL/MariaDB. Données et actualités fictives. Photographies libres de droits (Unsplash).
        </p>
      </div>
    </main>
  );
}
