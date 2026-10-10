import { useState } from "react";
import { toast } from "sonner";
import { RdvDialog } from "@/components/gsr/RdvDialog";
import { Nav, Hero, Bento, AgencyTabs } from "@/pages/p2/sections-a";
import { PreventionStrip, MobiliteSplit, NewsRows, QuickForm, Footer } from "@/pages/p2/sections-b";

export default function Proposition2() {
  const [rdv, setRdv] = useState({ open: false, agency: "creteil" });
  const open = (agency) => setRdv({ open: true, agency: typeof agency === "string" ? agency : "creteil" });
  return (
    <div data-testid="proposition-2-page" className="font-satoshi bg-white text-[#25333D]">
      <Nav onRdv={open} />
      <Hero />
      <Bento onRdv={open} />
      <AgencyTabs onRdv={open} />
      <PreventionStrip onIntervention={open} />
      <MobiliteSplit />
      <NewsRows />
      <QuickForm onDone={(ref) => toast.success(`Demande enregistrée — référence ${ref}`, { description: "Démonstration : aucune donnée transmise." })} />
      <Footer />
      <RdvDialog key={rdv.agency + rdv.open} open={rdv.open} defaultAgency={rdv.agency} onOpenChange={(v) => setRdv({ ...rdv, open: v })} fontClass="font-satoshi" />
    </div>
  );
}
