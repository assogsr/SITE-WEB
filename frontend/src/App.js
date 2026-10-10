import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import Selector from "@/pages/Selector";
import Proposition1 from "@/pages/p1/Proposition1";
import Proposition2 from "@/pages/p2/Proposition2";
import Proposition3 from "@/pages/p3/Proposition3";
import { ProposalSwitcher } from "@/components/gsr/ProposalSwitcher";
import Layout from "@/components/site/Layout";
import Home from "@/pages/site/Home";
import Formations from "@/pages/site/Formations";
import SecuriteRoutiere from "@/pages/site/SecuriteRoutiere";
import Mobilite from "@/pages/site/Mobilite";
import Agences from "@/pages/site/Agences";
import Actualites from "@/pages/site/Actualites";
import { Faq, Partenaires, Legal } from "@/pages/site/Misc";
import { Contact, Suivi } from "@/pages/site/Contact";
import { AuthProvider, Protected, RoleRoute } from "@/crm/auth";
import Login from "@/crm/Login";
import CrmLayout from "@/crm/CrmLayout";
import Dashboard from "@/crm/Dashboard";
import Prospects from "@/crm/Prospects";
import ProspectDetail from "@/crm/ProspectDetail";
import Calendrier from "@/crm/Calendrier";
import Relances from "@/crm/Relances";
import Contenus from "@/crm/Contenus";
import Utilisateurs from "@/crm/Utilisateurs";
import Journal from "@/crm/Journal";
import Exports from "@/crm/Exports";
import SessionsIA from "@/crm/SessionsIA";
import FormationIA from "@/pages/ia/FormationIA";
import ApercuApp from "@/pages/mobile/ApercuApp";

const ScrollTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return pathname.startsWith("/proposition") ? <ProposalSwitcher /> : null;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
        <ScrollTop />
        <Routes>
          <Route path="/crm/login" element={<Login />} />
          <Route path="/formation-ia/*" element={<FormationIA />} />
          <Route path="/crm" element={<Protected><CrmLayout /></Protected>}>
            <Route index element={<Dashboard />} />
            <Route path="prospects" element={<RoleRoute roles={["direction", "responsable", "accueil"]}><Prospects /></RoleRoute>} />
            <Route path="prospects/:id" element={<RoleRoute roles={["direction", "responsable", "accueil"]}><ProspectDetail /></RoleRoute>} />
            <Route path="calendrier" element={<RoleRoute roles={["direction", "responsable", "accueil"]}><Calendrier /></RoleRoute>} />
            <Route path="relances" element={<RoleRoute roles={["direction", "responsable", "accueil"]}><Relances /></RoleRoute>} />
            <Route path="contenus" element={<RoleRoute roles={["direction", "editeur"]}><Contenus /></RoleRoute>} />
            <Route path="utilisateurs" element={<RoleRoute roles={["direction"]}><Utilisateurs /></RoleRoute>} />
            <Route path="journal" element={<RoleRoute roles={["direction"]}><Journal /></RoleRoute>} />
            <Route path="exports" element={<RoleRoute roles={["direction"]}><Exports /></RoleRoute>} />
            <Route path="sessions-ia" element={<RoleRoute roles={["direction", "responsable", "editeur"]}><SessionsIA /></RoleRoute>} />
          </Route>
          <Route path="/propositions" element={<Selector />} />
          <Route path="/proposition-1" element={<Proposition1 />} />
          <Route path="/proposition-2" element={<Proposition2 />} />
          <Route path="/proposition-3" element={<Proposition3 />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/formations" element={<Formations />} />
            <Route path="/securite-routiere" element={<SecuriteRoutiere />} />
            <Route path="/mobilite-solidaire" element={<Mobilite />} />
            <Route path="/agences" element={<Agences />} />
            <Route path="/agences/:id" element={<Agences />} />
            <Route path="/actualites" element={<Actualites />} />
            <Route path="/actualites/:id" element={<Actualites />} />
            <Route path="/partenaires" element={<Partenaires />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/suivi" element={<Suivi />} />
            <Route path="/mentions-legales" element={<Legal />} />
            <Route path="/confidentialite" element={<Legal />} />
            <Route path="/cookies" element={<Legal />} />
            <Route path="/apercu-app" element={<ApercuApp />} />
          </Route>
        </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
