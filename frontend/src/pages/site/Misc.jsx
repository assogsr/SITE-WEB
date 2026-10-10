import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useRdv } from "@/components/site/Layout";
import { PageHero, Section, Label, Btn } from "@/components/site/Page";
import { FAQ, PARTNERS, IMG } from "@/data/gsr";

export function Faq() {
  const [i, setI] = useState(0);
  return (
    <div data-testid="faq-page">
      <PageHero testId="faq-hero" label="Questions fréquentes" title="Vos questions, nos réponses." image={IMG.atelier} />
      <Section>
        <div className="max-w-3xl divide-y divide-[#25333D]/10 border-t border-[#25333D]">
          {FAQ.map((f, k) => (
            <div key={f.q}>
              <button data-testid={`faq-question-${k}`} onClick={() => setI(i === k ? -1 : k)} className="w-full flex items-center justify-between gap-6 py-6 text-left font-clash text-xl font-medium hover:text-[#F29A58] transition-colors">
                {f.q}<ChevronDown className={`shrink-0 transition-transform ${i === k ? "rotate-180" : ""}`} />
              </button>
              {i === k && <p data-testid={`faq-answer-${k}`} className="pb-6 text-[#53616B] leading-relaxed">{f.a}</p>}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

export function Partenaires() {
  const open = useRdv();
  return (
    <div data-testid="partenaires-page">
      <PageHero testId="partenaires-hero" label="Partenaires" title="Agir ensemble pour la mobilité de tous." image={IMG.groupe}
        text="Collectivités, acteurs de l'insertion, établissements scolaires et entreprises : nos actions s'appuient sur un réseau de partenaires engagés." />
      <Section tone="cream">
        <div className="grid md:grid-cols-3 gap-6">
          {PARTNERS.map((p) => (
            <div key={p.cat} data-testid={`partner-group-${p.cat}`} className="bg-white p-8">
              <Label>{p.cat}</Label>
              <ul className="mt-6 space-y-3">{p.items.map((x) => <li key={x} className="border border-dashed border-[#25333D]/20 px-4 py-3 text-sm text-[#53616B]">{x}</li>)}</ul>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-[#53616B]">Emplacements réservés — logos et noms des partenaires à fournir par GSR.</p>
      </Section>
      <Section tone="dark">
        <div className="flex flex-wrap items-center justify-between gap-8">
          <div><Label light>Devenir partenaire</Label><h2 className="mt-4 font-clash text-3xl lg:text-5xl font-semibold">Vous souhaitez travailler avec GSR ?</h2></div>
          <Btn ghost testId="partenaires-contact-button" onClick={() => open("creteil", "partenariat")}>Proposer un partenariat</Btn>
        </div>
      </Section>
    </div>
  );
}

const LEGAL = {
  "/mentions-legales": { title: "Mentions légales", blocks: [["Éditeur", "Génération Sécurité Routière, association loi 1901. Siège : [adresse du siège à compléter]. N° RNA / SIRET : [à compléter]. Directeur de la publication : [à compléter]."], ["Hébergement", "[Hébergeur à compléter — LWS pour le site de production]."], ["Propriété intellectuelle", "L'ensemble des contenus (textes, visuels, logo) est la propriété de GSR ou utilisé sous licence libre de droits. Toute reproduction est soumise à autorisation."]] },
  "/confidentialite": { title: "Politique de confidentialité", blocks: [["Données collectées", "Les formulaires collectent uniquement les informations nécessaires au traitement de votre demande : nom, téléphone et/ou e-mail, agence, motif et message."], ["Finalité et durée", "Les données servent exclusivement à vous recontacter et à suivre votre dossier. Elles sont conservées [durée à définir] puis supprimées."], ["Vos droits", "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression : écrivez à [adresse de contact RGPD à compléter]."]] },
  "/cookies": { title: "Gestion des cookies", blocks: [["Cookies utilisés", "Ce prototype n'utilise aucun cookie de mesure d'audience ni de publicité. Seuls des cookies techniques strictement nécessaires peuvent être déposés."], ["Cartes", "Les cartes des agences sont fournies par Google Maps, qui peut déposer ses propres cookies lors de leur affichage."], ["Paramétrage", "Vous pouvez configurer votre navigateur pour refuser les cookies. [Bandeau de consentement à prévoir en production.]"]] },
};

export function Legal() {
  const { pathname } = useLocation();
  const l = LEGAL[pathname];
  return (
    <div data-testid={`legal-page${pathname.replace(/\//g, "-")}`}>
      <PageHero testId="legal-hero" label="Informations légales" title={l.title} />
      <Section>
        <div className="max-w-3xl space-y-10">
          {l.blocks.map(([h, t]) => <div key={h}><h2 className="font-clash text-2xl font-medium">{h}</h2><p className="mt-3 text-[#53616B] leading-relaxed">{t}</p></div>)}
          <p className="text-xs text-[#53616B]">Texte de démonstration à valider par GSR et son conseil juridique.</p>
        </div>
      </Section>
    </div>
  );
}
