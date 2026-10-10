"""Isolated local API/database per pytest worker; never target production or a preview."""
import ast
import os
import secrets
import socket
import subprocess
import sys
import time
from pathlib import Path

import pytest
import requests


def pytest_configure(config):
    if getattr(config.option, 'numprocesses', 0) and not hasattr(config, 'workerinput'):
        os.environ['REACT_APP_BACKEND_URL'] = 'http://127.0.0.1:1'
        return
    backend = Path(__file__).resolve().parents[1]
    credentials = {}
    for node in ast.parse((backend / 'tests/test_batch6_security_rappel_export_sessions.py').read_text()).body:
        if isinstance(node, ast.Assign) and isinstance(node.targets[0], ast.Name) and node.targets[0].id in ('DIRECTION', 'RESPONSABLE'):
            credentials[node.targets[0].id] = ast.literal_eval(node.value)
    with socket.socket() as bound:
        bound.bind(('127.0.0.1', 0))
        port = bound.getsockname()[1]
    run = secrets.token_hex(8)
    settings = {
        'MONGO_URL': os.environ.get('GSR_TEST_MONGO_URL', 'mongodb://127.0.0.1:27017'),
        'DB_NAME': 'gsr_security_test_' + run,
        'JWT_SECRET': secrets.token_urlsafe(48),
        'ADMIN_EMAIL': credentials['DIRECTION']['email'],
        'ADMIN_PASSWORD': credentials['DIRECTION']['password'],
        'DEMO_PASSWORD': credentials['RESPONSABLE']['password'],
        'ENABLE_DEMO_SEED': 'true',
        'CORS_ORIGINS': 'http://127.0.0.1:3000,http://localhost:3000',
        # Functional suites send many valid requests from one IP. Default quotas are tested separately.
        'PUBLIC_RATE_LIMIT_MAX': '1000', 'PUBLIC_READ_RATE_LIMIT_MAX': '1000', 'LOGIN_IP_LIMIT': '1000',
        'REACT_APP_BACKEND_URL': f'http://127.0.0.1:{port}',
    }
    if not settings['MONGO_URL'].startswith('mongodb://127.0.0.1:'):
        raise pytest.UsageError('Les tests exigent une base MongoDB locale dédiée')
    os.environ.update(settings)
    logs = Path('/workspace/gsr-security')
    logs.mkdir(exist_ok=True)
    output = (logs / f'pytest-api-{run}.log').open('w')
    process = subprocess.Popen(
        [sys.executable, '-m', 'uvicorn', 'server:app', '--host', '127.0.0.1', '--port', str(port), '--no-proxy-headers'],
        cwd=backend, env=os.environ.copy(), stdout=output, stderr=subprocess.STDOUT)
    config._gsr_process = process
    config._gsr_output = output
    for _ in range(150):
        if process.poll() is not None:
            raise pytest.UsageError('Échec du lancement de l’API de test ; consulter son log local')
        try:
            if requests.get(settings['REACT_APP_BACKEND_URL'] + '/api/', timeout=.2).status_code == 200:
                return
        except requests.RequestException:
            pass
        time.sleep(.1)
    process.terminate()
    raise pytest.UsageError('L’API de test ne répond pas dans le délai prévu')


def pytest_unconfigure(config):
    process = getattr(config, '_gsr_process', None)
    if process:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
        config._gsr_output.close()
    # Do not drop databases: only unique fictitious test databases were created.
