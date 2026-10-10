import { useRdv } from "@/components/site/Layout";
import { PageHero, Section, Label, Btn } from "@/components/site/Page";
import { Reveal } from "@/components/gsr/Reveal";
import { MOBILITE, PUBLICS, IMG } from "@/data/gsr";

const STEPS = ["Premier contact en agence ou via un partenaire", "Diagnostic mobilité et étude des financements", "Parcours de formation personnalisé", "Suivi jusqu'à l'obtention du permis et après"];

export default function Mobilite() {
  const open = useRdv();
  return (
    <div data-testid="mobilite-page">
      <PageHero testId="mobilite-hero" label="Mobilité solidaire" title="Le permis, un tremplin vers l'emploi." image={IMG.femmeConduite}
        text="Parce que la mobilité conditionne l'accès à l'emploi, à la formation et à l'autonomie, GSR accompagne les personnes qui en sont le plus éloignées." />
      <Section tone="cream">
        <div className="grid lg:grid-cols-2 gap-6">
          {MOBILITE.map((m, i) => (
            <Reveal key={m.id} delay={i * 0.05}>
              <article data-testid={`mobilite-card-${m.id}`} className={`p-8 lg:p-10 h-full ${i === 0 ? "bg-[#25333D] text-white" : "bg-white"}`}>
                <span className="font-clash text-[#F29A58] text-xl">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="mt-3 font-clash text-3xl font-semibold">{m.title}</h2>
                <p className={`mt-4 ${i === 0 ? "text-white/70" : "text-[#53616B]"}`}>{m.text}</p>
                {i === 0 && <p className="mt-6 text-xs uppercase tracking-widest text-[#F29A58]">Programme phare</p>}
              </article>
            </Reveal>
          ))}
        </div>
      </Section>
      <Section>
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5"><Label>Comment ça marche ?</Label><h2 className="mt-4 font-clash text-4xl font-semibold">Un parcours en quatre étapes.</h2>
            <p className="mt-6 text-[#53616B]">Publics accompagnés : {PUBLICS.join(", ").toLowerCase()}.</p>
            <div className="mt-8"><Btn testId="mobilite-rdv-button" onClick={() => open("creteil", "rendez-vous")}>Prendre rendez-vous</Btn></div>
          </div>
          <ol className="lg:col-span-6 lg:col-start-7 divide-y divide-[#25333D]/10">
            {STEPS.map((s, i) => <li key={s} data-testid={`mobilite-step-${i}`} className="py-5 grid grid-cols-[48px_1fr] gap-4"><span className="font-clash text-[#F29A58] text-xl">0{i + 1}</span><span className="font-medium">{s}</span></li>)}
          </ol>
        </div>
      </Section>
    </div>
  );
}
