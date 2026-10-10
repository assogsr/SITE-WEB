"""Shared fail-closed security controls; no application secrets in diagnostics."""
import hashlib
import hmac
import logging
import math
import os
from datetime import datetime, timezone, timedelta
from urllib.parse import urlsplit

from fastapi import HTTPException
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError


def cors_origins(value):
    origins = []
    for origin in value.split(','):
        origin = origin.strip().rstrip('/')
        if not origin:
            continue
        parsed = urlsplit(origin)
        if (parsed.scheme not in ('http', 'https') or not parsed.hostname
                or '*' in origin or parsed.username or parsed.password
                or parsed.path or parsed.query or parsed.fragment):
            raise ValueError('CORS_ORIGINS exige des origines HTTP(S) explicites, sans wildcard ni chemin')
        # Accessing port also validates a malformed/non-numeric port.
        parsed.port
        origins.append(origin)
    return list(dict.fromkeys(origins))


def secret_key():
    value = os.environ.get('JWT_SECRET', '')
    if len(value.encode()) < 32:
        raise RuntimeError('JWT_SECRET doit contenir au moins 32 octets')
    return value


def private_key(value):
    return hmac.new(secret_key().encode(), value.encode(), hashlib.sha256).hexdigest()


async def consume_limit(db, bucket, identifier, maximum, window_seconds, at=None):
    """MongoDB atomic fixed-window quota shared across all API workers."""
    if maximum < 1 or window_seconds < 1:
        raise RuntimeError('Les quotas doivent être strictement positifs')
    at = at or datetime.now(timezone.utc)
    epoch = math.floor(at.timestamp() / window_seconds)
    key = private_key(f'{bucket}:{identifier}:{epoch}')
    expires = datetime.fromtimestamp((epoch + 1) * window_seconds, timezone.utc)
    update = {'$inc': {'count': 1}, '$setOnInsert': {'expires_at': expires, 'bucket': bucket}}
    try:
        result = await db.security_limits.find_one_and_update(
            {'_id': key}, update, upsert=True, return_document=ReturnDocument.AFTER)
    except DuplicateKeyError:
        result = await db.security_limits.find_one_and_update(
            {'_id': key}, {'$inc': {'count': 1}}, return_document=ReturnDocument.AFTER)
    if result['count'] > maximum:
        retry = max(1, math.ceil((expires - at).total_seconds()))
        exc = HTTPException(429, 'Trop de tentatives. Merci de réessayer plus tard.',
                            headers={'Retry-After': str(retry)})
        exc.audit_first = result['count'] == maximum + 1
        raise exc


class PrivateAccessLog(logging.Filter):
    def filter(self, record):
        # A public tracking reference is a bearer capability; never put it in access logs.
        if isinstance(record.args, tuple) and len(record.args) == 5:
            args = list(record.args)
            if str(args[2]).startswith('/api/demandes/'):
                args[2] = '/api/demandes/[suivi]'
            else:
                args[2] = str(args[2]).split('?')[0]
            record.args = tuple(args)
        return True
