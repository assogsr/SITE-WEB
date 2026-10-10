# Audit du projet GSR — 2026-10-10

Prototype React + FastAPI + MongoDB (pas Laravel). Aucune modification de code effectuée pendant l'audit.

## 1. Fonctionnalités réellement développées (terminées, persistées, testées)
- Site public complet (Proposition 2) : /, /formations, /securite-routiere, /mobilite-solidaire, /agences(+/:id), /actualites(+/:id), /partenaires, /faq, /contact, /suivi, /mentions-legales, /confidentialite, /cookies.
- Formulaire unique 6 motifs (informations, inscription, rendez-vous, rappel, intervention, partenariat) + motif formation-ia : persistance Mongo, règle tél OU e-mail, référence séquentielle GSR-CRE/BON-AAAA-NNNN, créneaux de RDV à capacité (refus 409 si complet), suivi par référence.
- CRM /crm : auth JWT (bcrypt, verrouillage 5 échecs/15 min), 4 rôles, scope agence, tableau de bord, prospects (filtres, recherche, doublons signalés sans fusion), fiche (statuts, notes, historique, relances), calendrier (capacité), relances, contenus (éditeur soumet / Direction publie), utilisateurs.
- Espace /formation-ia/ : identité propre, SEO (title, meta, robots, sitemap), formulaire relié au CRM, aucun lien depuis GSR.
- Aperçu app élève /apercu-app (prototype cliquable, frontend uniquement).

## 2. Fonctionnalités simulées / données fictives (fonctionnent mais contenu non réel)
- Toutes les demandes, prospects, relances, articles, comptes CRM (seed).
- Données de l'aperçu mobile (élève, RDV, documents, notifications) : statiques, non reliées au CRM.
- Programmes, financements et FAQ Formation IA : contenus indicatifs, placeholders [à confirmer].
- Tarifs, partenaires, mentions légales, horaires du bandeau : placeholders.
- Articles CRM « publiés » : non affichés sur le site public (actualités publiques = données statiques).

## 3. Fonctionnalités manquantes (validées, non commencées)
- Demande de rappel avec créneau dans les horaires d'ouverture réels (horaires déjà saisis dans data/gsr.js, pas de sélecteur de créneau ni de contrôle serveur).
- Export CSV Direction (filtres période/agence/statut, contrôle serveur, journal des exports).
- Sessions Formation IA datées (module CRM + affichage public + inscription avec validation humaine).

## 4. Partiellement terminées
- Contenus : workflow de validation OK, mais pas de rendu public des articles publiés, pas d'édition/suppression.
- Documents élèves, formations/sessions permis, interventions, statistiques avancées, paramètres : non développés (cahier des charges initial).
- Mot de passe oublié, modification/désactivation de compte : absents.

## 5. Sécurité et permissions
- Contrôles serveur : require_roles sur toutes les routes sensibles, scope agence côté API, Direction seule pour publier/créer des comptes/modifier capacité (avec Responsable).
- Points d'attention : CORS « * » (à restreindre en production), JWT 8 h sans refresh ni révocation, pas de limitation de débit sur les formulaires publics (spam possible), pas de CAPTCHA, pas de journal d'audit général (seulement historique par dossier), secrets en .env de démo.

## 6. Tests
| Itération | Périmètre | Résultat |
|---|---|---|
| 1 | 3 propositions | 36/36 |
| 2 | Site public + API demandes/créneaux | 100 % back + front |
| 3 | CRM 4 rôles | 19/19 back ; front OK après 3 correctifs |
| 4 | Formation IA | 100 % |
| 5 | Aperçu mobile | 100 % |
Tests automatisés backend : 30 (pytest, /app/backend/tests).

## 7. Anomalies / corrections prioritaires
- P1 : restreindre CORS et ajouter un rate-limit sur POST /api/demandes avant toute mise en ligne.
- P1 : horaires affichés dans certains textes statiques (p2 sections) à vérifier vs horaires réels.
- P2 : articles publiés non visibles côté public ; aperçu mobile non relié au CRM.
- P2 : nettoyage des données de test « TEST_* » dans la base de démo avant présentation.
