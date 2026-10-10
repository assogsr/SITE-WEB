import os, secrets
from pathlib import Path
secret = Path('/settings/jwt-secret')
if not secret.exists():
    with secret.open('x') as f:
        f.write(secrets.token_urlsafe(48))
    secret.chmod(0o600)
os.environ['JWT_SECRET'] = secret.read_text().strip()
os.execvp('uvicorn', ['uvicorn', 'server:app', '--host', '0.0.0.0', '--port', '8001', '--no-proxy-headers'])
