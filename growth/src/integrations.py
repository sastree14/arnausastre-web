from __future__ import annotations

import base64
import os
from datetime import datetime, timezone

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from .storage import get_store


class IntegrationError(RuntimeError):
    pass


def _decode_key() -> bytes:
    raw = os.environ.get("GROWTH_ENCRYPTION_KEY", "").strip()
    if not raw:
        raise IntegrationError("GROWTH_ENCRYPTION_KEY is required")
    try:
        key = base64.b64decode(raw, validate=True)
    except Exception as exc:
        raise IntegrationError("GROWTH_ENCRYPTION_KEY must be base64") from exc
    if len(key) != 32:
        raise IntegrationError("GROWTH_ENCRYPTION_KEY must decode to exactly 32 bytes")
    return key


def _b64url_decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def decrypt_secret(value: str) -> str:
    parts = value.split(".")
    if len(parts) != 4 or parts[0] != "v1":
        raise IntegrationError("Unsupported encrypted secret format")
    iv = _b64url_decode(parts[1])
    tag = _b64url_decode(parts[2])
    ciphertext = _b64url_decode(parts[3])
    aes = AESGCM(_decode_key())
    try:
        plaintext = aes.decrypt(iv, ciphertext + tag, None)
    except Exception as exc:
        raise IntegrationError("Could not decrypt integration secret") from exc
    return plaintext.decode("utf-8")


def get_linkedin_access() -> tuple[str, str]:
    """Return (access_token, person_urn) for the latest active LinkedIn member connection."""
    store = get_store()
    rows = store.filter(
        "integration_connections",
        tenant_id="sc-analytics",
        provider="linkedin",
        account_type="member",
    )
    if not rows:
        raise IntegrationError("LinkedIn is not connected")
    rows.sort(key=lambda row: row.get("updated_at") or row.get("connected_at") or "", reverse=True)
    connection = rows[0]
    metadata = connection.get("metadata") or {}
    if metadata.get("disconnected"):
        raise IntegrationError("LinkedIn is disconnected")
    expires_at = connection.get("token_expires_at")
    if expires_at:
        expiry = datetime.fromisoformat(str(expires_at).replace("Z", "+00:00"))
        if expiry <= datetime.now(timezone.utc):
            raise IntegrationError("LinkedIn token expired; reconnect LinkedIn from Growth Admin")
    person_urn = str(metadata.get("person_urn") or "")
    if not person_urn:
        raise IntegrationError("LinkedIn connection is missing person_urn")
    return decrypt_secret(str(connection["access_token_ciphertext"])), person_urn
