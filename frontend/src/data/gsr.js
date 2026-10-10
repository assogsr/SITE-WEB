export const IMG = {
  logo: "/assets/logo-gsr-crop.png",
  leconMoniteur: "/assets/lecon-moniteur.jpg",
  sourireVolant: "/assets/sourire-volant.jpg",
  eleveVoiture: "/assets/eleve-voiture.jpg",
  femmeConduite: "/assets/femme-conduite.jpg",
  trottinettesJeunes: "/assets/trottinettes-jeunes.jpg",
  trottinette: "/assets/trottinette.jpg",
  amis: "/assets/amis.jpg",
  groupe: "/assets/groupe.jpg",
  atelier: "/assets/atelier.jpg",
  leconRoute: "/assets/lecon-route.jpg",
  prevention: "/assets/prevention.jpg",
  veloGroupe: "/assets/velo-groupe.jpg",
};

export const TAGLINE = "À vos côtés, sur la route de demain.";

export const AGENCIES = [
  {
    id: "creteil",
    city: "Créteil",
    name: "Agence de Créteil",
    street: "33 allée de la Toison d'Or",
    zip: "94000 Créteil",
    phone: "09 56 40 84 54",
    tel: "+33956408454",
    email: "creteil.gsr@gmail.com",
    hours: "Lundi au vendredi : 13 h – 18 h",
    opening: { 1: [["13:00", "18:00"]], 2: [["13:00", "18:00"]], 3: [["13:00", "18:00"]], 4: [["13:00", "18:00"]], 5: [["13:00", "18:00"]] },
    image: IMG.leconMoniteur,
  },
  {
    id: "bonneuil",
    city: "Bonneuil-sur-Marne",
    name: "Agence de Bonneuil-sur-Marne",
    street: "2 place des Libertés",
    zip: "94380 Bonneuil-sur-Marne",
    phone: "09 54 98 20 77",
    tel: "+33954982077",
    email: "accueil.gsr@gmail.com",
    hours: "Lundi : 13 h – 17 h · Mardi au vendredi : 9 h – 13 h et 14 h – 17 h · Samedi : 10 h – 13 h",
    opening: { 1: [["13:00", "17:00"]], 2: [["09:00", "13:00"], ["14:00", "17:00"]], 3: [["09:00", "13:00"], ["14:00", "17:00"]], 4: [["09:00", "13:00"], ["14:00", "17:00"]], 5: [["09:00", "13:00"], ["14:00", "17:00"]], 6: [["10:00", "13:00"]] },
    image: IMG.eleveVoiture,
  },
];

export const mapSrc = (a) =>
  `https://www.google.com/maps?q=${encodeURIComponent(`${a.street}, ${a.zip}`)}&output=embed`;

export const FORMATIONS = [
  { id: "permis-b", title: "Permis B", tag: "Boîte manuelle", text: "La formation complète au permis voiture, à votre rythme, avec un suivi pédagogique attentif." },
  { id: "boite-auto", title: "Boîte automatique", tag: "Permis B78", text: "Une conduite simplifiée pour apprendre plus sereinement et se concentrer sur la route." },
  { id: "code", title: "Code de la route", tag: "Théorie", text: "Cours en salle et entraînements pour comprendre les règles et réussir l'examen du code." },
  { id: "acceleree", title: "Formation accélérée", tag: "Intensif", text: "Un parcours resserré pour les personnes qui doivent obtenir leur permis dans un délai court." },
  { id: "permis-am", title: "Permis AM", tag: "Cyclomoteur", text: "La formation obligatoire pour conduire un deux-roues ou un quadricycle léger dès 14 ans." },
];

export const PREVENTION = [
  { id: "rodeos", title: "Stop aux rodéos sauvages", text: "Dialoguer avec les jeunes sur les risques des rodéos urbains, pour eux et pour les autres.", image: IMG.amis },
  { id: "stage", title: "Stage de sensibilisation à la sécurité routière", text: "Un temps d'échange et de prise de conscience autour des comportements à risque.", image: IMG.atelier },
  { id: "trottinette", title: "Balades en trottinette", text: "Apprendre les bons réflexes en situation réelle, encadrés par nos formateurs.", image: IMG.trottinettesJeunes },
  { id: "jeunes", title: "Les jeunes et les dangers de la route", text: "Interventions en établissements scolaires et structures jeunesse.", image: IMG.groupe },
  { id: "circuler", title: "Circuler en sécurité", text: "Piétons, cyclistes, usagers d'EDPM : partager la rue en toute sécurité.", image: IMG.veloGroupe },
  { id: "secucity", title: "Panique à SécuCity", text: "Un atelier ludique et interactif pour apprendre en situation.", image: IMG.prevention },
];

export const MOBILITE = [
  { id: "women", title: "Women Permis", text: "Un accompagnement dédié aux femmes pour lever les freins à l'accès au permis et à l'autonomie." },
  { id: "parcours", title: "Parcours mobilité", text: "Un diagnostic et un parcours sur-mesure pour retrouver de la mobilité au quotidien." },
  { id: "jeunes", title: "Accompagnement des jeunes", text: "Un suivi renforcé pour les jeunes, de la première démarche à l'obtention du permis." },
  { id: "insertion", title: "Insertion professionnelle", text: "Le permis comme levier d'accès à l'emploi, en lien avec les acteurs de l'insertion." },
];

export const NEWS = [
  { id: "n1", date: "12 septembre 2026", cat: "Prévention", title: "Retour sur une journée de sensibilisation en collège", image: IMG.atelier },
  { id: "n2", date: "28 août 2026", cat: "Mobilité", title: "Women Permis : une nouvelle session se prépare", image: IMG.femmeConduite },
  { id: "n3", date: "3 juillet 2026", cat: "Agences", title: "Balade trottinette encadrée à Bonneuil-sur-Marne", image: IMG.trottinette },
];

export const PUBLICS = ["Jeunes", "Demandeurs d'emploi", "Familles", "Personnes en difficulté de mobilité"];

export const LEGAL_LINKS = ["Mentions légales", "Politique de confidentialité", "Gestion des cookies", "Partenaires", "Questions fréquentes", "Contact"];

export const NAV = ["Formations", "Sécurité routière", "Mobilité solidaire", "Nos agences", "Actualités"];

export const ROUTES = [
  { label: "Formations", to: "/formations" },
  { label: "Sécurité routière", to: "/securite-routiere" },
  { label: "Mobilité solidaire", to: "/mobilite-solidaire" },
  { label: "Nos agences", to: "/agences" },
  { label: "Actualités", to: "/actualites" },
];

export const FOOTER_LINKS = [
  { label: "Partenaires", to: "/partenaires" },
  { label: "Questions fréquentes", to: "/faq" },
  { label: "Contact", to: "/contact" },
  { label: "Suivre ma demande", to: "/suivi" },
  { label: "Mentions légales", to: "/mentions-legales" },
  { label: "Politique de confidentialité", to: "/confidentialite" },
  { label: "Gestion des cookies", to: "/cookies" },
];

export const FORMATION_DETAILS = {
  "permis-b": { age: "Dès 17 ans (conduite accompagnée dès 15 ans)", duree: "20 h de conduite minimum (réglementaire)", prerequis: "Code de la route obtenu ou en cours", image: IMG.eleveVoiture },
  "boite-auto": { age: "Dès 17 ans", duree: "13 h de conduite minimum (réglementaire)", prerequis: "Code de la route obtenu ou en cours", image: IMG.femmeConduite },
  code: { age: "Dès 15 ans", duree: "Cours collectifs + entraînement en ligne", prerequis: "Aucun", image: IMG.atelier },
  acceleree: { age: "Dès 17 ans", duree: "Parcours intensif sur quelques semaines", prerequis: "Disponibilité importante, code validé", image: IMG.leconRoute },
  "permis-am": { age: "Dès 14 ans", duree: "8 h de formation (réglementaire)", prerequis: "ASSR 1 ou 2, ou ASR", image: IMG.trottinette },
};

export const FINANCEMENTS = ["Aide au permis (Région / Département)", "Compte personnel de formation (CPF)", "France Travail / Mission locale", "Permis à 1 € par jour", "Dispositifs d'insertion partenaires"];

export const FAQ = [
  { q: "Qui peut s'inscrire chez GSR ?", a: "Tout le monde. En tant qu'auto-école sociale et solidaire, nous accueillons en priorité les personnes orientées par un partenaire (mission locale, France Travail, structures d'insertion), mais nos formations sont ouvertes à tous les habitants du Val-de-Marne." },
  { q: "Quels sont vos tarifs ?", a: "[Tarifs à compléter par GSR] Les tarifs dépendent de votre situation et des financements mobilisables. Un rendez-vous en agence permet d'établir un devis personnalisé." },
  { q: "Quels documents dois-je apporter ?", a: "Une pièce d'identité, un justificatif de domicile, une photo d'identité numérique (e-photo), l'ASSR2 ou ASR pour les moins de 21 ans, et le cas échéant le document d'orientation de votre structure." },
  { q: "Comment prendre rendez-vous ?", a: "Via le formulaire du site (vous recevez une référence de dossier), par téléphone ou directement en agence à Créteil ou Bonneuil-sur-Marne." },
  { q: "Proposez-vous des interventions dans les établissements ?", a: "Oui : collèges, lycées, structures jeunesse, entreprises et collectivités. Faites une demande d'intervention depuis la page Sécurité routière." },
  { q: "Qu'est-ce que Women Permis ?", a: "Un programme d'accompagnement dédié aux femmes pour lever les freins (financiers, organisationnels, confiance en soi) à l'obtention du permis et à l'autonomie." },
];

export const PARTNERS = [
  { cat: "Institutions", items: ["[Collectivité partenaire]", "[Département du Val-de-Marne]", "[Région Île-de-France]"] },
  { cat: "Insertion & emploi", items: ["[Mission locale]", "[France Travail]", "[Structure d'insertion]"] },
  { cat: "Éducation & jeunesse", items: ["[Établissement scolaire]", "[Centre social]", "[Association jeunesse]"] },
];

export const NEWS_BODY = {
  n1: "Nos formateurs sont intervenus auprès de quatre classes pour échanger sur les comportements à risque, les distracteurs au volant et le partage de la rue. Un atelier « Panique à SécuCity » a clôturé la journée.",
  n2: "La prochaine session du programme Women Permis s'organise : réunion d'information collective, diagnostic mobilité et constitution des dossiers de financement. Les inscriptions se font en agence.",
  n3: "Une quinzaine de jeunes ont participé à une balade encadrée en trottinette pour apprendre les bons réflexes : équipement, signalisation, cohabitation avec les piétons et les voitures.",
};
