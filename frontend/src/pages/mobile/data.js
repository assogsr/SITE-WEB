export const ELEVE = {
  prenom: "Inès",
  nom: "Benali",
  reference: "GSR-CRE-2026-0003",
  agence: "creteil",
  formation: "Permis B",
  heures: { faites: 12, total: 20 },
  code: { series: 18, moyenne: 34, obtenu: true, date: "12 sept. 2026" },
  competences: [
    { id: 1, label: "Maîtriser le véhicule", etat: "acquis" },
    { id: 2, label: "Appréhender la route", etat: "acquis" },
    { id: 3, label: "Circuler dans des conditions difficiles", etat: "en-cours" },
    { id: 4, label: "Pratiquer une conduite autonome", etat: "a-venir" },
  ],
};

export const RDV = [
  { id: "r1", date: "Lun. 13 oct.", heure: "14:00 – 15:00", type: "Leçon de conduite", lieu: "Agence de Créteil", moniteur: "Karim", statut: "confirme" },
  { id: "r2", date: "Jeu. 16 oct.", heure: "17:00 – 18:00", type: "Leçon de conduite", lieu: "Agence de Créteil", moniteur: "Karim", statut: "confirme" },
  { id: "r3", date: "Sam. 25 oct.", heure: "10:30 – 11:00", type: "Bilan de parcours", lieu: "Agence de Créteil", moniteur: "Nadia", statut: "a-confirmer" },
];

export const DOCS = [
  { id: "d1", nom: "Contrat de formation", etat: "signe", date: "02/09/2026" },
  { id: "d2", nom: "Pièce d'identité", etat: "valide", date: "02/09/2026" },
  { id: "d3", nom: "Justificatif de domicile", etat: "valide", date: "02/09/2026" },
  { id: "d4", nom: "Attestation ASSR 2", etat: "manquant", date: null },
  { id: "d5", nom: "Livret d'apprentissage", etat: "disponible", date: "20/09/2026" },
];

export const NOTIFS = [
  { id: "n1", quand: "Il y a 2 h", titre: "Leçon confirmée", texte: "Votre leçon du lundi 13 oct. à 14 h est confirmée avec Karim.", lu: false },
  { id: "n2", quand: "Hier", titre: "Document manquant", texte: "Merci de déposer votre attestation ASSR 2 avant le 20 oct.", lu: false },
  { id: "n3", quand: "Il y a 3 jours", titre: "Compétence validée", texte: "« Appréhender la route » est acquise. Bravo !", lu: true },
  { id: "n4", quand: "Il y a 1 semaine", titre: "Rappel agence", texte: "L'agence de Créteil est ouverte du lundi au vendredi de 13 h à 18 h.", lu: true },
];
