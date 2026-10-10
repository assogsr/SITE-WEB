import { useRdv } from "@/components/site/Layout";
import { PageHero, Section, Label, Btn } from "@/components/site/Page";
import { Reveal } from "@/components/gsr/Reveal";
import { PREVENTION, PUBLICS, IMG } from "@/data/gsr";

export default function SecuriteRoutiere() {
  const open = useRdv();
  return (
    <div data-testid="securite-page">
      <PageHero testId="securite-hero" label="Sécurité routière" title="Six actions de terrain pour changer les comportements." image={IMG.prevention}
        text="Nos formateurs interviennent dans les établissements scolaires, les structures jeunesse, les entreprises et les collectivités du Val-de-Marne." />
      <Section>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PREVENTION.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <article data-testid={`prevention-card-${p.id}`} className="group bg-[#FFF4EA] h-full flex flex-col">
                <div className="aspect-[4/3] overflow-hidden"><img src={p.image} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" /></div>
                <div className="p-7 flex-1 flex flex-col">
                  <p className="font-clash text-sm text-[#F29A58]">0{i + 1}</p>
                  <h2 className="mt-1 font-clash text-2xl font-medium">{p.title}</h2>
                  <p className="mt-3 text-sm text-[#53616B] flex-1">{p.text}</p>
                  <button data-testid={`prevention-request-${p.id}`} onClick={() => open("creteil", "intervention")} className="mt-6 text-sm font-semibold text-left hover:text-[#F29A58] transition-colors">Demander cette intervention →</button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>
      <Section tone="dark">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <Label light>Pour qui ?</Label>
            <h2 className="mt-4 font-clash text-4xl lg:text-5xl font-semibold">Des interventions adaptées à chaque public.</h2>
            <ul className="mt-8 flex flex-wrap gap-3">{PUBLICS.concat(["Collèges et lycées", "Entreprises", "Collectivités"]).map((p) => <li key={p} className="border border-white/20 px-4 py-2 text-sm">{p}</li>)}</ul>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 bg-white/5 p-8">
            <h3 className="font-clash text-2xl font-medium">Organiser une intervention</h3>
            <p className="mt-3 text-white/70 text-sm">Décrivez votre structure, le public et vos disponibilités : nous construisons avec vous un format adapté (atelier, stage, balade encadrée…).</p>
            <div className="mt-6"><Btn ghost testId="securite-intervention-button" onClick={() => open("creteil", "intervention")}>Demander une intervention</Btn></div>
          </div>
        </div>
      </Section>
    </div>
  );
}
