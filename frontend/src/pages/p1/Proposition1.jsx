import { useState } from "react";
import { RdvDialog } from "@/components/gsr/RdvDialog";
import { Nav, Hero, Facts, About, Formations, Prevention, Mobilite, Agences, News, Cta, Footer } from "@/pages/p1/sections";

export default function Proposition1() {
  const [rdv, setRdv] = useState({ open: false, agency: "creteil" });
  const open = (agency) => setRdv({ open: true, agency: typeof agency === "string" ? agency : "creteil" });
  return (
    <div data-testid="proposition-1-page" className="bg-[#FFF4EA] font-jakarta text-[#25333D]">
      <Nav onRdv={open} />
      <Hero onRdv={open} />
      <Facts />
      <About />
      <Formations onRdv={open} />
      <Prevention onRdv={open} />
      <Mobilite />
      <Agences onRdv={open} />
      <News />
      <Cta onRdv={open} />
      <Footer />
      <RdvDialog key={rdv.agency + rdv.open} open={rdv.open} defaultAgency={rdv.agency} onOpenChange={(v) => setRdv({ ...rdv, open: v })} fontClass="font-jakarta" />
    </div>
  );
}
