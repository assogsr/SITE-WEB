import { toast } from "sonner";
import { useRdv } from "@/components/site/Layout";
import { Hero, Bento, AgencyTabs } from "@/pages/p2/sections-a";
import { PreventionStrip, MobiliteSplit, NewsRows, QuickForm } from "@/pages/p2/sections-b";

export default function Home() {
  const open = useRdv();
  return (
    <div data-testid="home-page">
      <Hero />
      <Bento onRdv={() => open("creteil", "informations")} />
      <AgencyTabs onRdv={open} />
      <PreventionStrip onIntervention={() => open("creteil", "intervention")} />
      <MobiliteSplit />
      <NewsRows />
      <QuickForm onDone={(ref) => toast.success(`Demande enregistrée — référence ${ref}`, { description: "Conservez cette référence pour suivre votre demande." })} />
    </div>
  );
}
