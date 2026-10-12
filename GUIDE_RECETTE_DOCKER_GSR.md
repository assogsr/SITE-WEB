# Recette fonctionnelle GSR — Docker local, 12 octobre 2026

Cette recette utilise exclusivement des comptes, contacts, organismes et pièces fictifs. Elle n’autorise ni mise en production, ni WordPress/LWS, ni envoi SMTP/SMS/WhatsApp réel, ni transfert de sauvegarde extérieur. La dernière version comprend les huit modules et les sept priorités de finalisation. Les 358 tests backend et 397 contrôles navigateur du lot précédent sont historiques ; la vérification Docker des interfaces du 12 octobre est consignée séparément.

## 1. Préparer et lancer la dernière version

Prérequis : Docker Desktop ouvert sous Windows/macOS, ou Docker Engine avec Compose v2 sous Linux. Sous Windows, utiliser les conteneurs Linux et WSL2 si Docker le demande. La première préparation peut télécharger des **images logicielles Docker**, sans activer de service métier externe.

Utiliser le dossier **de la version actuelle** contenant `local-test/compose.yaml`, `local-test/frontend/`, `backend/business_agenda.py`, `backend/document_antivirus.py` et ce guide. Une ancienne archive `GSR_Projet_Emergent.zip` ou une ancienne copie de SITE-WEB ne se met pas à jour en lançant Docker. Le frontend livré dans `local-test/frontend` est déjà compilé ; le build Docker le copie, il ne recompile pas automatiquement d’éventuelles modifications ultérieures de JSX.

Dans l’Explorateur Windows, ouvrir le dossier racine de cette version, cliquer la barre d’adresse, saisir `powershell` puis Entrée. Exécuter :

```powershell
$env:GSR_SMTP_SEND_ENABLED="false"
$env:GSR_SMTP_TEST_ENABLED="false"
$env:GSR_OFFSITE_ENABLED="false"
docker version
docker compose version
docker compose -f local-test/compose.yaml config --quiet
docker compose -f local-test/compose.yaml up -d --build --wait --wait-timeout 180
docker compose -f local-test/compose.yaml ps
```

macOS/Linux, depuis ce même dossier racine :

```sh
export GSR_SMTP_SEND_ENABLED=false GSR_SMTP_TEST_ENABLED=false GSR_OFFSITE_ENABLED=false
docker compose -f local-test/compose.yaml config --quiet
docker compose -f local-test/compose.yaml up -d --build --wait --wait-timeout 180
docker compose -f local-test/compose.yaml ps
```

Attendre la réussite du démarrage. Les cinq services sont `mongo`, `backend`, `site`, `notifications`, `backup`. Les services disposant d’un contrôle de santé doivent être `healthy`. Le site seul est publié sur **127.0.0.1:3000** ; MongoDB et l’API restent dans le réseau privé Docker. Les volumes existants sont conservés, aucune remise à zéro des dossiers.

Autre méthode Windows : ouvrir `local-test`, puis double-cliquer `DEMARRER-WINDOWS.cmd`. Les commandes ci-dessus sont préférables pour fixer explicitement les trois garde-fous d’environnement.

Arrêter sans perdre les données :

```sh
docker compose -f local-test/compose.yaml stop
```

Relancer : reprendre la commande `up` ci-dessus. **Ne pas utiliser `down -v`, supprimer les volumes, supprimer les dossiers ou remplacer les clés.**

Si le port 3000 est occupé, choisir 3001 : PowerShell `$env:GSR_PORT="3001"`, ou shell `export GSR_PORT=3001`, puis relancer `up`. Remplacer 3000 par 3001 dans toutes les URL. Ces deux ports sont prévus par CORS. Pour un autre port, une configuration complémentaire est nécessaire.

Diagnostic : `docker compose -f local-test/compose.yaml ps`, puis logs du seul service en erreur. Les logs peuvent contenir des références/liens de gestion de rendez-vous : les examiner localement, ne pas envoyer de secrets ou journaux complets dans une messagerie.

## 2. URL sur l’ordinateur qui exécute Docker

| Interface | URL à saisir dans le navigateur |
|---|---|
| Site GSR | `http://localhost:3000/` |
| Connexion CRM | `http://localhost:3000/crm/login` |
| Tableau de bord CRM après connexion | `http://localhost:3000/crm` |
| Espace Formation IA séparé | `http://localhost:3000/formation-ia/` |
| Formulaire intervention | `http://localhost:3000/securite-routiere` |
| Intervention par action, exemple | `http://localhost:3000/securite-routiere/jeunes` |
| Solidarité | `http://localhost:3000/mobilite-solidaire` |
| Partenariat | `http://localhost:3000/partenaires` |
| Médias publics | `http://localhost:3000/actualites` |

`localhost` désigne votre ordinateur. Démarrer Docker dans l’environnement cloud Codex ne démarre pas un serveur sur votre PC. Ne pas ouvrir ces URL avant d’avoir lancé le dossier actuel sur votre ordinateur. Aucune URL publique n’est créée par cette procédure.

## 3. Connexion et rôles, sans afficher de mots de passe existants

Pour une première exploration locale, la page de connexion possède des boutons **Direction**, **Responsable Créteil** et **Accueil Bonneuil**. Cliquer le bouton souhaité, puis **Se connecter**. Le bouton préremplit les informations fictives ; aucun mot de passe existant n’est donné dans ce guide. Si le compte a été désactivé ou son mot de passe changé, ne pas écraser ses données pour rétablir le bouton.

Pour une recette nominative des cinq profils, se connecter comme Direction, ouvrir **Utilisateurs** (`/crm/utilisateurs`), et créer **de nouveaux comptes TEST RECETTE** : Responsable Créteil, Responsable Bonneuil, Accueil Créteil, Accueil Bonneuil ; éventuellement une nouvelle Direction de recette. Ne pas modifier les comptes existants. Nom fictif et email unique sous `example.com`, mot de passe temporaire unique d’au moins 16 caractères généré par votre gestionnaire de mots de passe. Stocker ces mots de passe uniquement dans ce gestionnaire ; ne pas les inscrire au PV, dans des captures, dans le code ou dans le chat. Le formulaire Utilisateurs permet de choisir le rôle et l’agence, puis **Créer le compte**.

Utiliser un profil de navigateur distinct pour chaque rôle, ou se déconnecter avant chaque changement ; éviter plusieurs rôles dans un même profil simultanément. Sur téléphone, la déconnexion est accessible dans la barre du CRM. Ne pas activer la synchronisation/sauvegarde des comptes de démonstration vers un profil professionnel.

| Profil | Vérification attendue |
|---|---|
| Direction | Agences Créteil/Bonneuil, administration des comptes, exports, archivage/suppression sous confirmation, décisions sensibles |
| Responsable Créteil/Bonneuil | Consultation/modification des prospects des **deux agences** ; documents/modules/calendrier limités à son agence et aux permissions documentaires ; aucune gestion de comptes/export/suppression Direction |
| Accueil Créteil/Bonneuil | Même transversalité des seuls prospects ; agenda de son agence, fermetures autorisées, capacités/récurrence restreintes ; aucun export ni suppression Direction |

Sur un prospect de l’autre agence, la fiche reste consultable, mais les pièces privées ne deviennent pas accessibles. Une réaffectation ne transfère pas automatiquement leurs autorisations. Vérifier ces refus aussi par accès direct aux écrans, sans chercher à contourner la confidentialité.

Après recette : Direction désactive **uniquement les nouveaux comptes TEST RECETTE** et révoque leurs sessions. Tester qu’ils ne peuvent plus accéder au CRM ; conserver les comptes et dossiers existants.

## 4. Démonstration des huit modules depuis les menus

Commencer avec Direction. Préparer des intitulés `TEST RECETTE`, une agence et des dates fictives clairement repérables. Refaire les parcours non sensibles avec Responsable/Accueil de chaque agence. Pour chaque sauvegarde, rouvrir la fiche et vérifier valeurs/historique ; ne pas confondre écran visible et opération métier validée.

| Ordre | Menu / écran | Parcours de démonstration | Résultat / réserve |
|---|---|---|---|
| 1 | **Documents privés** — `/crm/documents` | Déposer un petit PDF créé pour la recette, titre/catégorie/agence fictifs ; ouvrir versions et permissions, ajouter une version, associer la pièce depuis une fiche prospect | Dans la pile actuelle, le dépôt/association reste possible mais le fichier reste **en quarantaine**. Contrôle humain ne débloque pas téléchargement/partage. Ne jamais modifier le verdict pour simuler un résultat sain |
| 2 | **Partenaires et organismes** — `/crm/organisations` | Créer `TEST RECETTE Organisme`, ajouter deux interlocuteurs fictifs, un échange, prochaine action et date ; rouvrir la fiche | Historique conservé ; contacts/organisme restent liés aux demandes. Fiche privée par agence, aucune fusion interagences automatique |
| 3 | **Dispositifs solidaires** — `/crm/solidarite` | Direction prépare un dispositif **de recette uniquement** ; créer une candidature liée au prospect/organisme, renseigner orientation, examiner critères et statuts | Admission humaine, jamais automatique. Ne pas inventer des critères officiels ; utiliser des notes de test identifiées. La pièce exigée ne peut pas être déclarée saine faute d’antivirus qualifié |
| 4 | **Formations et sessions** — `/crm/formations` | Onglets Catalogue, Apprenants, Sessions, Inscriptions : créer un catalogue fictif Direction, apprenant fictif et session future ; préinscrire ; tester capacité/attente | Admission soumise aux vérifications humaines/pièces. Présences/évaluations actives absentes volontairement : phase 2, schéma préparé seulement |
| 5 | **Intervenants** — `/crm/intervenants` | Créer une fiche fictive, compétences, disponibilité et justificatif de recette ; associer l’intervenant à une session compatible ; essayer un conflit | Disponibilités connues/contrôle des conflits ; pas de planning avancé. Justificatifs restent en quarantaine si non analysés |
| 6 | **Équipements** — `/crm/equipements` | Créer une salle ou un matériel fictif, agence/état, plage d’indisponibilité, événement de maintenance manuel | Historique et immobilisation ; aucune réservation ou maintenance automatique phase 2 |
| 7 | **Échéances** — `/crm/echeances` | Créer une échéance fictive avec responsable/date, observer alerte/retard ; examiner renouvellement Direction et preuve requise | Pas de périodicité réglementaire inventée. Validation documentaire/renouvellement exigeant une pièce exploitable sous réserve antivirus |
| 8 | **Sécurité routière** — `/crm/securite-routiere` | Créer une demande liée à l’organisme/contact/prospect, action/public/effectif/lieu/dates ; suivre les statuts, responsable et prochaine action | Devis externe PDF avec approbation Direction de sa version exacte ; pas d’envoi réel. Qualification documentaire et diffusion restent sous réserve antivirus ; aucun devis calculé/bilan automatique |

Compléter par **Prospects** (création, modification, historique de réaffectation, préférences, contact, relances), **Calendrier** (jour/semaine, fermeture/exception, règles Direction), **Médiathèque et storyboards** (brouillon, sources/droits, séquences, validation Direction) et **Notifications métier**. Les commandes existent dans les interfaces ; le schéma pédagogique futur et le transport de sauvegarde sont des préparations techniques, pas des écrans de phase 2.

Côté site : cliquer une action sécurité routière et remplir sa demande dédiée ; tester aussi solidarité/partenariat avec chaque agence ; conserver la référence, puis ouvrir **Suivi**. Rechercher la demande dans le CRM et qualifier humainement avant rapprochement d’organisme/candidature/intervention. Téléphone **ou** email suffit ; ne jamais saisir de vraie coordonnée pour obtenir un message.

## 5. Bloqué, désactivé ou non couvert par ce lot

- **ClamAV opérationnel** : intégration privée livrée, mais la pile standard n’active pas un scanner non qualifié. Les dernières signatures réelles vérifiées étaient anciennes ; mise à jour officielle bloquée dans le cloud. Téléchargements/liens/images documentaires sains et récents restent conditionnés à un moteur privé avec signatures actuelles. Pas de scanner simulé dans cette pile Docker. L’extension `compose.antivirus.yaml` n’est pas activée pour cette recette ; sa qualification est une étape distincte.
- **Emails réels** et tests de connexion Gmail : désactivés ; les trois adresses officielles et modèles/configuration sont disponibles. L’outbox/journal peut montrer des événements en attente sans aucun email envoyé.
- **WhatsApp** : bouton visible mais liens désactivés sans deux numéros validés ; ne pas les configurer pour la recette sans appel externe. Aucun SMS réel ni fournisseur SMS configuré.
- **Sauvegarde extérieure** : configuration/procédure préparées, aucun transfert. La sauvegarde chiffrée locale ne protège pas contre la perte du PC ; ne pas confondre les deux.
- **Motifs de non-inscription** : référentiel officiel vide à compléter Direction ; ne pas le remplacer par une liste inventée. Pour tester la clôture, utiliser uniquement un environnement fictif et des libellés explicitement `TEST`, sans les présenter comme décision GSR.
- **Données officielles** : tarifs, critères, photos/droits, partenaires, contenus juridiques, paramètres d’agenda et modèles restent à valider/configurer. Les exemples existants ne sont pas des informations officielles approuvées.
- **Phases 2/3** : présences/évaluations actives, plannings avancés, automatisation de maintenance, devis avancés et bilans/rapports enrichis non développés.
- **Conformité globale** : compléments de maquette/administration générale, identité interagences, qualification à grands volumes, architecture cible, SMS et recette humaine restent détaillés dans `BILAN_CONFORMITE_FINAL.md`. Aucun écart phase 1 n’est reporté silencieusement en phase 2.

## 6. Données et procès-verbal de recette

Utiliser `TEST RECETTE Prospect Créteil`, `TEST RECETTE Prospect Bonneuil`, des organismes/personnes/salles inventés et emails uniques `recette-IDENTIFIANT@example.com`. Aucun email réel n’est envoyé. Préférer email fictif seul plutôt que d’inventer un numéro pouvant appartenir à quelqu’un. Aucun vrai nom, téléphone, adresse de particulier, dossier, justificatif, pièce d’identité, photo de personne, plaque, signature ou document financier. Créer soi-même les petits PDF/images de test avec la mention **DOCUMENT FICTIF — RECETTE**.

Conserver noms des scénarios et références de dossiers fictifs, jamais mots de passe, jetons de session, liens de partage ou clés de sauvegarde dans les captures/PV. Ne pas importer une base CRM réelle. Ne pas tester un antivirus avec un malware : EICAR est réservé à un essai technique isolé séparé, pas nécessaire à cette recette humaine.

Les formulaires publics conservent leurs quotas : **5 demandes par 10 minutes et par IP** dans la pile locale. Répartir les essais en plusieurs séquences ; un refus 429 est attendu au dépassement. Ne pas désactiver les protections pour remplir le PV.

Pour chaque scénario de `RECETTE_FONCTIONNELLE_GSR.md` et `PV_RECETTE_A_COMPLETER.csv`, inscrire profil/agence, version/date, résultat **réussi / échoué / bloqué / non exécuté**, attendu/observé, preuve sans secret, anomalie et retest. Ne jamais valider par avance un parcours bloqué par ClamAV ou une décision GSR. Faire signer Direction et les quatre profils d’agence. La réussite de cette recette n’autorise toujours aucune mise en production.
