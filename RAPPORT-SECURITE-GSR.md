# Rapport de sécurité GSR — 10 octobre 2026

Étape exclusivement locale, effectuée sur des données fictives. Aucun accès, changement ou déploiement sur WordPress ou LWS ; aucune publication, aucun commit ni push. Le design, les styles, les images et la navigation ont été conservés. Les adaptations visibles concernent les références de suivi plus longues, les messages d’accès refusé et la fermeture des sessions expirées.

## Vulnérabilités corrigées

- **Sessions JWT et révocation :** correction des deux tests initialement en échec. Validation stricte des claims, de l’émetteur, de l’audience et de la durée maximale de huit heures ; secret obligatoire suffisamment long. Version de session atomique par utilisateur : révocation et désactivation prennent effet sur la prochaine requête, même pour une reconnexion dans la même seconde. La réactivation ne rétablit aucun ancien jeton. Déconnexion avec révocation du jeton courant et conservation des autres sessions autorisées.
- **Connexion :** limitation des tentatives par compte et par IP, verrouillage temporaire, traitement uniforme des comptes inconnus, limites de taille des mots de passe et absence d’écho des secrets dans les erreurs. Les en-têtes X-Forwarded-For fournis par le client ne permettent pas de contourner les quotas locaux.
- **RBAC et séparation des agences :** contrôle côté serveur des dossiers, recherches, doublons, relances, calendrier, inscriptions et modifications de sessions IA. Un responsable ou un accueil sans agence valide est refusé. Un accès à un dossier d’une autre agence retourne 404, y compris lorsque son identifiant est connu. La Direction conserve son accès global autorisé. Le rôle éditeur ne reçoit plus les données commerciales privées.
- **Confidentialité du suivi public :** références dotées de 128 bits aléatoires ; réponse limitée au statut et aux renseignements de suivi nécessaires, sans nom, courriel, téléphone ni message. Références sensibles masquées dans les journaux applicatifs ; suppression des scripts tiers de télémétrie de la page et politique de référent restrictive. Réponses privées non mises en cache.
- **CORS et formulaires publics :** liste explicite d’origines, rejet des configurations permissives et des écritures depuis une origine non autorisée. Quotas atomiques partagés dans MongoDB, y compris pour les requêtes invalides et concurrentes ; taille maximale des corps, champs bornés et contrôle du piège antirobot. Une seule trace est enregistrée au premier dépassement de chaque quota, pour limiter l’abus des journaux.
- **Autres protections :** neutralisation des formules dans les exports CSV, recherches littérales échappées, absence de réinitialisation des mots de passe au redémarrage. Données et comptes de démonstration désactivés par défaut ; aucun mot de passe de démonstration trouvé dans la compilation de production. Les jetons du navigateur sont conservés en sessionStorage et supprimés à l’expiration ; les anciens jetons persistants sont retirés.

## Conséquences à connaître

Les anciens JWT doivent être remplacés par une nouvelle connexion. Les anciennes références de suivi prévisibles ne sont plus consultables publiquement : l’équipe habilitée devra organiser leur réémission sécurisée si nécessaire. Les dossiers restent accessibles dans le CRM selon les droits ; aucune donnée existante n’a été supprimée. Une référence publique reste une capacité d’accès à un suivi minimal et doit rester confidentielle.

## Fichiers modifiés ou ajoutés

- `backend/sessions.py`
- `backend/requirements.txt`
- `backend/auth.py`
- `backend/seed.py`
- `backend/server.py`
- `backend/crm.py`
- `backend/tests/test_gsr_api.py`
- `backend/tests/test_formation_ia.py`
- `backend/tests/test_batch6_security_rappel_export_sessions.py`
- `backend/tests/test_crm_api.py`
- `frontend/public/index.html`
- `frontend/src/crm/auth.jsx`
- `frontend/src/crm/Login.jsx`
- `frontend/src/crm/ProspectDetail.jsx`
- `frontend/src/pages/site/Contact.jsx`
- `frontend/src/pages/ia/FormationIA.jsx`
- `frontend/src/components/gsr/RdvDialog.jsx`
- `backend/security.py`
- `backend/tests/conftest.py`
- `backend/tests/test_security_regressions.py`
- `tests/security-browser.cjs`

Les scripts de préparation et de démarrage locaux sous `/workspace/gsr-tools` ont également été adaptés ; ils restent hors du code du projet. Le brouillon de configuration cloud a été enregistré (révision 3), sans application ni publication. Le dépôt local possède une branche sans commit : la restauration dans une nouvelle tâche n’est pas démontrée ; les archives conservent le code local.

## Résultats des validations

- Suite backend complète : **123 tests réussis**, aucun échec, en 35,17 secondes : 57 tests existants et 66 tests de sécurité. Treize avertissements de dépréciation subsistent. Résultats détaillés : `all-tests-final.log` et `all-tests-final.xml`.
- Les tests de sécurité couvrent notamment l’expiration, la révocation immédiate, la déconnexion, la désactivation/réactivation, les accès interagences, le rôle éditeur, les inscriptions IA, les références publiques, CORS, les quotas concurrents, les tentatives de connexion, les corps excessifs, les exports CSV et les journaux.
- Navigateur : **78 contrôles réussis** — 60 de navigation, 7 de formulaires et 11 de sécurité, sur ordinateur et mobile ; aucune erreur JavaScript détectée. Les tests vérifient notamment qu’un dossier étranger n’affiche pas de données, qu’une révocation ferme la session et que l’expiration retire l’accès.
- Test de non-régression React réussi ; compilation de production réussie, avec quatre avertissements existants liés aux hooks. Installation répétée réussie, vérification des dépendances Python sans incohérence.
- Redémarrage local : API, MongoDB et HTML React accessibles. Les tests créent des bases locales distinctes et fictives ; ils ne suppriment pas les bases existantes. Les quotas élevés de la suite fonctionnelle sont distincts des tests vérifiant explicitement les limites réelles.
- Les polices et intégrations externes ne sont pas entièrement vérifiées dans le navigateur : les requêtes externes sont bloquées lors des tests. Aucune validation d’un hébergement de production n’a été effectuée.

## Risques restant ouverts

- La confirmation des places IA utilise encore une vérification puis une mise à jour non atomiques : une course peut dépasser la capacité. La réduction d’une capacité sous le nombre déjà réservé mérite aussi une règle métier explicite.
- Les jetons restent accessibles au JavaScript : une faille XSS pourrait les voler. Une stratégie CSP complète, des cookies HttpOnly avec protection CSRF et une authentification multifacteur nécessitent une étape dédiée. Si le serveur est indisponible lors d’une déconnexion, la révocation distante ne peut pas être garantie avant son retour ou l’expiration.
- Les quotas limitent les abus courants mais pas un bot distribué sur de nombreuses IP ; leurs fenêtres fixes autorisent des rafales aux frontières. Le verrouillage d’un compte peut être exploité pour un déni de service temporaire. CAPTCHA, protection en bordure et surveillance restent à étudier.
- HTTPS, configuration du proxy de confiance, restriction réseau de MongoDB, coffre et rotation des secrets, sauvegardes et restauration doivent être validés sur l’infrastructure réelle. Les journaux du proxy doivent eux aussi masquer les références de suivi.
- La politique de conservation des données et des audits, ainsi que la journalisation supplémentaire des lectures sensibles, restent à définir. L’audit exhaustif des versions de dépendances et leur modernisation n’ont pas été réalisés ; aucune absence globale de vulnérabilités n’est revendiquée.

## Livrables

`GSR_Projet_Securise.zip` contient le code sans dépendances installées, builds, métadonnées Git, caches ni fichier de credentials de démonstration. `security.patch` et `changed-files.json` permettent de revoir les changements ; `before-security.zip` conserve l’état précédent local. Aucun secret de configuration d’exécution n’est inclus dans l’archive sécurisée.

Cette étape est terminée. Toute poursuite attend la validation de l’utilisateur.
