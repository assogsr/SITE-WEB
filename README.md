# Projet GSR — version sécurisée à tester

Version de test local : site public et CRM, avec données fictives. Aucun déploiement sur WordPress ou LWS.

## Tester sur Windows

1. Téléchargez cette branche avec **Code → Download ZIP** sur GitHub, puis extrayez entièrement le ZIP.
2. Installez et ouvrez [Docker Desktop](https://www.docker.com/products/docker-desktop/).
3. Ouvrez le dossier `local-test` et double-cliquez sur **DEMARRER-WINDOWS.cmd**.
4. Attendez le démarrage : le navigateur ouvre **http://localhost:3000**.
5. Pour le CRM : **http://localhost:3000/crm/login**. Choisissez un compte fictif proposé et cliquez sur **Se connecter**.
6. Pour arrêter, utilisez **ARRETER-WINDOWS.cmd**. Les données locales restent conservées.

La première préparation télécharge les images Docker. Les dépendances Python et le site compilé sont inclus dans le paquet local. Le site compilé correspond à cette étape de sécurité ; après une modification du frontend, il faut le recompiler pour actualiser le paquet de test. Les images et styles existants sont conservés. N’utilisez que des données fictives : les mots de passe visibles de démonstration ne conviennent pas à un hébergement public.

Pour macOS, Linux, les comptes et le dépannage, consultez [les instructions de test](local-test/LISEZ-MOI.md).

## Sécurité et validation

[Rapport de sécurité](RAPPORT-SECURITE-GSR.md) : corrections, fichiers, résultats des tests et risques ouverts. Suite backend : **123 tests réussis** ; contrôles navigateur du projet : **78 réussis**. Paquet Docker : trois services sains et six contrôles navigateur de démarrage/connexion réussis.

Les anciennes références publiques prévisibles sont refusées ; créez une nouvelle demande pour tester le suivi. Les anciens JWT nécessitent une nouvelle connexion.

Cette branche est destinée à la revue et aux essais locaux. Elle ne déploie aucun service à distance.
