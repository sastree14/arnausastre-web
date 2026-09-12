from __future__ import annotations

import mimetypes
import os
from pathlib import Path

import requests

from .http_retry import request_with_retry


class AssetStoreError(RuntimeError):
    pass


def _supabase_key() -> str:
    return (os.environ.get("SUPABASE_SECRET_KEY", "") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")).strip()


def _headers(key: str) -> dict[str, str]:
    headers = {"apikey": key}
    if key.startswith("eyJ"):
        headers["Authorization"] = f"Bearer {key}"
    return headers


class LocalAssetStore:
    def put(self, path: Path, key: str) -> str:
        return str(path)

    def get(self, ref: str, destination: Path) -> Path:
        source = Path(ref)
        if not source.exists():
            raise AssetStoreError(f"Local asset not found: {ref}")
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(source.read_bytes())
        return destination


class SupabaseAssetStore:
    def __init__(self):
        self.url = os.environ.get("SUPABASE_URL", "").rstrip("/")
        self.key = _supabase_key()
        self.bucket = os.environ.get("SUPABASE_ASSET_BUCKET", "growth-assets")
        if not self.url or not self.key:
            raise AssetStoreError("SUPABASE_URL and SUPABASE_SECRET_KEY are required")
        self.headers = _headers(self.key)

    def put(self, path: Path, key: str) -> str:
        if not path.exists():
            raise AssetStoreError(f"Asset does not exist: {path}")
        mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        headers = dict(self.headers)
        headers["Content-Type"] = mime
        headers["x-upsert"] = "true"
        try:
            # x-upsert + deterministic object key makes retries idempotent.
            response = request_with_retry(
                "POST",
                f"{self.url}/storage/v1/object/{self.bucket}/{key}",
                attempts=4,
                headers=headers,
                data=path.read_bytes(),
                timeout=120,
            )
        except requests.RequestException as exc:
            raise AssetStoreError(f"Supabase asset upload failed: {exc}") from exc
        if response.status_code >= 400:
            raise AssetStoreError(f"Supabase asset upload failed {response.status_code}: {response.text[:500]}")
        return f"supabase://{self.bucket}/{key}"

    def get(self, ref: str, destination: Path) -> Path:
        prefix = "supabase://"
        if not ref.startswith(prefix):
            raise AssetStoreError(f"Unsupported Supabase asset ref: {ref}")
        rest = ref[len(prefix):]
        bucket, _, key = rest.partition("/")
        if not bucket or not key:
            raise AssetStoreError(f"Malformed asset ref: {ref}")
        try:
            response = request_with_retry(
                "GET",
                f"{self.url}/storage/v1/object/{bucket}/{key}",
                attempts=4,
                headers=self.headers,
                timeout=120,
            )
        except requests.RequestException as exc:
            raise AssetStoreError(f"Supabase asset download failed: {exc}") from exc
        if response.status_code >= 400:
            raise AssetStoreError(f"Supabase asset download failed {response.status_code}: {response.text[:500]}")
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(response.content)
        return destination


def get_asset_store():
    provider = os.environ.get("ASSET_PROVIDER", "local").strip().lower()
    if provider == "supabase":
        return SupabaseAssetStore()
    if provider == "local":
        return LocalAssetStore()
    raise AssetStoreError(f"Unsupported asset provider: {provider}")
