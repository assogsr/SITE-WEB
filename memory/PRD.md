# GSR — Génération Sécurité Routière · PRD

## Original problem statement
PROJET GSR — Création d'un site web et d'un CRM interactif pour GSR (association loi 1901, auto-école sociale et solidaire, Val-de-Marne ; agences Créteil 33 allée de la Toison d'Or 94000 · 09 56 40 84 54 · creteil.gsr@gmail.com et Bonneuil-sur-Marne 2 place des Libertés 94380 · 09 54 98 20 77 · accueil.gsr@gmail.com). Site public (Accueil, Formations, Sécurité routière, Mobilité solidaire, Agences, Actualités, Partenaires, FAQ, Contact, pages légales), formulaires avec agence + téléphone OU e-mail + référence de dossier + créneaux à capacité, CRM interne avec rôles (Direction, Responsable d'agence, Accueil, Éditeur), espace /formation-ia/ séparé et jamais lié depuis le site GSR, aperçu app mobile élèves. Palette #F29A58 / #25333D / #FFF4EA / #FFFFFF / #53616B. Cible réelle : Laravel + MySQL/MariaDB (LWS) — prototype Emergent en React/FastAPI/MongoDB. « Commence par concevoir trois propositions visuelles différentes pour la page d'accueil. Présente-les pour validation avant de développer l'ensemble du site. »

## User choices
- Logo original fourni (/assets/logo-gsr-crop.png)
- 3 propositions navigables (/proposition-1, -2, -3)
- CRM : JWT e-mail + mot de passe, comptes fictifs par rôle
- Formations confirmées : Permis B, Boîte auto, Code, Accélérée, Permis AM
- Pas de témoignages ; photos libres de droits (Unsplash, enregistrées dans /public/assets)

## Architecture
React (CRA + Tailwind + shadcn) / FastAPI / MongoDB. Phase 1 = frontend uniquement.
- src/data/gsr.js : contenu partagé
- src/components/gsr : Logo, Reveal, RdvForm, RdvDialog, ProposalSwitcher
- src/pages : Selector, p1, p2, p3

## Implemented
- 2026-10-09 : Phase 1 — page de sélection + 3 propositions d'accueil (Éditorial institutionnel / Énergie citoyenne / Sérénité & accueil), formulaire RDV démo. Testé 100 %.
- 2026-10-09 : **Proposition 2 validée par le client.** Phase 2 — site public complet (Layout nav/footer, /, /formations, /securite-routiere, /mobilite-solidaire, /agences(+/:id), /actualites(+/:id), /partenaires, /faq, /contact, /suivi, /mentions-legales, /confidentialite, /cookies). Backend FastAPI : GET /api/creneaux?agency= (14 jours, capacité 2, atomique), POST /api/demandes (6 types, tél OU e-mail, référence séquentielle persistée GSR-CRE/BON-AAAA-NNNN, 409 si créneau complet), GET /api/demandes/{ref}. Anciennes propositions déplacées sous /propositions. Testé 100 % (iteration_2).

- 2026-10-09 : Phase 3a — **CRM interne** `/crm` (login JWT Bearer, 4 rôles seedés → memory/test_credentials.md, verrouillage 5 échecs/15 min). Modules : tableau de bord KPI, prospects (filtres, recherche, doublons tél/e-mail signalés sans fusion, scope agence pour Responsable/Accueil), fiche dossier (statuts, notes, historique, relances), calendrier des créneaux (capacité modifiable Direction/Responsable), relances (retard), contenus (éditeur soumet → Direction publie/refuse), utilisateurs (Direction). Backend : auth.py, crm.py, seed.py. Testé iteration_3 (19/19 backend, frontend OK après correctifs testid/403/overflow mobile).

- 2026-10-10 : Phase 3b — **Espace Formation IA** `/formation-ia/` (identité propre : navy #0E1420 / menthe #7DF5C8, Space Grotesk ; 3 programmes, financements placeholders, FAQ, formulaire → type `formation-ia` dans le CRM ; title/meta/robots index ; robots.txt + sitemap.xml ; mention « porté par GSR » ; aucun lien depuis le site GSR). Horaires d'ouverture réels des agences ajoutés dans gsr.js (`opening`). Testé iteration_4 : 100 %.

- 2026-10-10 : Phase 3c — **Aperçu application élève** `/apercu-app` (maquette téléphone iOS/Android cliquable : connexion fictive, accueil, RDV, progression, documents, notifications avec badge, agence ; données fictives ; aucun lien depuis l'accueil). Testé iteration_5 : 100 %.

## Backlog
- P0 (validé client, ordre) : 4) demande de rappel avec créneau dans les horaires d'ouverture (traitée par l'équipe) · 5) export CSV Direction (filtres période/agence/statut, contrôle serveur, journal des exports) · 6) sessions Formation IA datées (admin CRM + affichage public des sessions publiées/ouvertes, inscription = demande CRM avec validation humaine)
- P0 : CRM (JWT, rôles Direction/Responsable/Accueil/Éditeur, comptes fictifs → test_credentials.md, dashboard, prospects = demandes, statuts, relances, doublons, calendrier créneaux, validation publications par Direction) — appeler integration_expert avant l'auth
- P1 : espace /formation-ia/ (identité propre, jamais lié depuis GSR), aperçu app mobile élèves
- P2 : statistiques, documents, paramètres
- Placeholders : horaires des agences, tarifs, partenaires, mentions légales (RNA/SIRET, hébergeur)
