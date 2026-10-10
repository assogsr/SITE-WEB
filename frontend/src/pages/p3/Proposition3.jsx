import { useState } from "react";
import { RdvDialog } from "@/components/gsr/RdvDialog";
import { Nav, Hero, Projet, Agences, Formations } from "@/pages/p3/sections-a";
import { Pavillon, Inclusion, Actus, ThreeSteps, Footer } from "@/pages/p3/sections-b";

export default function Proposition3() {
  const [rdv, setRdv] = useState({ open: false, agency: "creteil" });
  const open = (agency) => setRdv({ open: true, agency: typeof agency === "string" ? agency : "creteil" });
  return (
    <div data-testid="proposition-3-page" className="font-manrope bg-[#FFF4EA] text-[#25333D]">
      <Nav onRdv={open} />
      <Hero onRdv={open} />
      <Projet />
      <Agences onRdv={open} />
      <Formations onRdv={open} />
      <Pavillon onIntervention={open} />
      <Inclusion />
      <Actus />
      <ThreeSteps />
      <Footer />
      <RdvDialog key={rdv.agency + rdv.open} open={rdv.open} defaultAgency={rdv.agency} onOpenChange={(v) => setRdv({ ...rdv, open: v })} fontClass="font-manrope" />
    </div>
  );
}
