import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useRdv } from "@/components/site/Layout";
import { PageHero, Section, Label, Btn } from "@/components/site/Page";
import { Reveal } from "@/components/gsr/Reveal";
import { FORMATIONS, FORMATION_DETAILS, FINANCEMENTS, IMG } from "@/data/gsr";

export default function Formations() {
  const open = useRdv();
  return (
    <div data-testid="formations-page">
      <PageHero testId="formations-hero" label="Formations" title="Votre permis, votre parcours." image={IMG.leconRoute}
        text="Cinq formations encadrées par des enseignants diplômés, un suivi pédagogique attentif et des solutions de financement adaptées à chaque situation." />
      <Section tone="cream">
        <div className="space-y-6">
          {FORMATIONS.map((f, i) => {
            const d = FORMATION_DETAILS[f.id];
            return (
              <Reveal key={f.id} delay={i * 0.05}>
                <article id={f.id} data-testid={`formation-card-${f.id}`} className={`grid lg:grid-cols-12 gap-0 bg-white overflow-hidden ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                  <div className="lg:col-span-5 min-h-[260px] relative"><img src={d.image} alt={f.title} className="absolute inset-0 h-full w-full object-cover" /></div>
                  <div className="lg:col-span-7 p-8 lg:p-12">
                    <span className="text-xs uppercase tracking-widest text-[#F29A58]">{f.tag}</span>
                    <h2 className="mt-2 font-clash text-3xl lg:text-4xl font-semibold">{f.title}</h2>
                    <p className="mt-4 text-[#53616B]">{f.text}</p>
                    <dl className="mt-8 grid sm:grid-cols-3 gap-6 text-sm">
                      {[["Âge", d.age], ["Durée", d.duree], ["Prérequis", d.prerequis]].map(([k, v]) => (
                        <div key={k}><dt className="text-[11px] uppercase tracking-widest text-[#53616B]">{k}</dt><dd className="mt-1 font-medium">{v}</dd></div>
                      ))}
                    </dl>
                    <p className="mt-6 text-xs text-[#53616B]">Tarif : [à compléter par GSR] — devis personnalisé en agence selon votre situation et vos financements.</p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Btn testId={`formation-inscription-${f.id}`} onClick={() => open("creteil", "inscription")}>Demander une inscription</Btn>
                      <Btn ghost testId={`formation-info-${f.id}`} onClick={() => open("creteil", "informations")}>Poser une question</Btn>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Section>
      <Section tone="dark">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5"><Label light>Financements</Label><h2 className="mt-4 font-clash text-4xl lg:text-5xl font-semibold">Le coût ne doit pas être un frein.</h2><p className="mt-6 text-white/70">Nous vous aidons à identifier et mobiliser les aides auxquelles vous avez droit. Les dispositifs ci-dessous sont donnés à titre indicatif.</p></div>
          <ul className="lg:col-span-6 lg:col-start-7 space-y-4">
            {FINANCEMENTS.map((x) => <li key={x} data-testid="financement-item" className="flex gap-3 items-start border-b border-white/10 pb-4"><CheckCircle2 className="text-[#F29A58] shrink-0" size={20} />{x}</li>)}
          </ul>
        </div>
      </Section>
      <Section>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div><Label>Et après ?</Label><h2 className="mt-4 font-clash text-3xl lg:text-4xl font-semibold">Une question sur votre situation ?</h2></div>
          <Link to="/faq" data-testid="formations-faq-link" className="inline-flex items-center gap-2 font-semibold hover:text-[#F29A58]">Consulter la FAQ <ArrowUpRight size={18} /></Link>
        </div>
      </Section>
    </div>
  );
}
