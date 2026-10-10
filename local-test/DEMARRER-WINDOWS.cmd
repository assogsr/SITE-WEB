@echo off
cd /d "%~dp0"
docker info >nul 2>&1
if errorlevel 1 (
 echo Ouvrez Docker Desktop avant de relancer ce fichier.
 pause
 exit /b 1
)
docker compose up -d --build --wait --wait-timeout 180
if errorlevel 1 (
 echo Le demarrage a echoue. Copiez le message affiche pour demander de l'aide.
 pause
 exit /b 1
)
start "" "http://localhost:3000"
echo Projet disponible sur http://localhost:3000
pause
