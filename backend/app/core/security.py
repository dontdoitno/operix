from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional


_PASSWORD_SALT_BYTES = 16
_PASSWORD_ITERATIONS = 120_000
_SESSION_TOKEN_BYTES = 48


def hash_password(password: str) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with random per-password salt."""
    salt = secrets.token_bytes(_PASSWORD_SALT_BYTES)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        _PASSWORD_ITERATIONS,
    )
    return f"{_PASSWORD_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, password_hash: Optional[str]) -> bool:
    """Verify incoming password against stored PBKDF2 hash payload."""
    if not password_hash:
        return False

    try:
        rounds_raw, salt_hex, digest_hex = password_hash.split("$", 2)
        rounds = int(rounds_raw)
        salt = bytes.fromhex(salt_hex)
    except (ValueError, TypeError):
        return False

    candidate_digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        rounds,
    )

    return hmac.compare_digest(candidate_digest.hex(), digest_hex)


def create_session_token() -> str:
    """Create a cryptographically secure bearer token."""
    return secrets.token_urlsafe(_SESSION_TOKEN_BYTES)


def hash_session_token(token: str) -> str:
    """Store only token hash in DB to reduce token leakage impact."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def get_session_expiration(hours: int = 24) -> datetime:
    """Return UTC expiration timestamp for newly created auth session."""
    return datetime.now(timezone.utc) + timedelta(hours=hours)
