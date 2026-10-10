# Tester GSR sur votre ordinateur

Ce paquet démarre la version sécurisée du projet localement. Il ne publie rien et ne contacte ni WordPress ni LWS. Tous les comptes et dossiers fournis sont fictifs.

## Windows

1. Installez Docker Desktop depuis https://www.docker.com/products/docker-desktop/ puis ouvrez-le. Il peut nécessiter WSL2 et un redémarrage ; attendez que Docker soit prêt.
2. Extrayez complètement cette archive ZIP dans un dossier.
3. Double-cliquez sur DEMARRER-WINDOWS.cmd. La première préparation nécessite Internet et plusieurs minutes pour télécharger les images Docker. Les dépendances Python sont incluses.
4. Le navigateur ouvre http://localhost:3000. Gardez Docker Desktop ouvert pendant les essais.
5. Pour arrêter, utilisez ARRETER-WINDOWS.cmd. Les données fictives sont conservées pour la prochaine ouverture.

## macOS / Linux ou terminal Windows

Sur les Mac à puce Apple, le backend utilise l’émulation amd64 fournie par Docker Desktop.

Depuis le dossier extrait, avec Docker Desktop ou Docker Engine et Compose installés :

```
docker compose up -d --build --wait --wait-timeout 180
```

Ouvrez http://localhost:3000. Pour arrêter : `docker compose stop`.

## Parcours de test

- Site public : navigation, formations, agences et contact. Envoyez uniquement des coordonnées fictives et utilisez la référence complète dans /suivi.
- CRM : http://localhost:3000/crm/login. Cliquez sur l’un des comptes de démonstration proposés puis connectez-vous.
- Direction : direction@example.test / GsrTestDirection2026!
- Responsable Créteil : responsable.creteil@gsr-demo.fr / GsrTestEquipe2026!
- Accueil Bonneuil : accueil.bonneuil@gsr-demo.fr / GsrTestEquipe2026!
- Éditeur : editeur@gsr-demo.fr / GsrTestEquipe2026!

Vérifiez que le responsable de Créteil ne consulte pas les dossiers de Bonneuil, et que l’éditeur accède aux contenus sans données commerciales privées. Les anciennes références fictives fournies dans le CRM ne sont pas utilisables en suivi public : créez une nouvelle demande pour tester ce suivi.

Les quotas de formulaires restent actifs (cinq demandes par dix minutes dans ce paquet local). En cas de 429, attendez avant de recommencer. Ne saisissez pas de données réelles : cette version contient volontairement des identifiants de démonstration visibles et ne convient pas à un hébergement public.

## En cas de problème

- Connexion refusée : vérifiez que Docker Desktop fonctionne et que le lancement est terminé.
- Port 3000 occupé : fermez le programme qui l’utilise. Dans PowerShell, vous pouvez aussi lancer `$env:GSR_PORT="3001"; docker compose up -d --build --wait` puis ouvrir http://localhost:3001. Les ports locaux 3000 et 3001 sont déjà autorisés.
- Diagnostic : `docker compose ps` puis `docker compose logs --tail=50`.

MongoDB et l’API ne sont pas exposés à votre réseau ; seul le site est accessible sur la boucle locale. Une clé JWT aléatoire est créée au premier démarrage et conservée dans un volume local. N’utilisez jamais les mots de passe de ce paquet pour une application réelle.

## Validation du paquet

Démarrage Docker vérifié : trois services sains. Six contrôles navigateur réussis, sans erreur JavaScript : accueil, contact et connexion au CRM avec chacun des quatre rôles. Validation exécutée localement sur le port 3001 pour conserver le serveur cloud existant. Les tests ont modifié uniquement une base fictive propre à ce paquet.
