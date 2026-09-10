from __future__ import annotations

import mimetypes
import os
from pathlib import Path

import requests


class AssetStoreError(RuntimeError):
    pass


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
        self.key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
        self.bucket = os.environ.get("SUPABASE_ASSET_BUCKET", "growth-assets")
        if not self.url or not self.key:
            raise AssetStoreError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required")
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
        }

    def put(self, path: Path, key: str) -> str:
        if not path.exists():
            raise AssetStoreError(f"Asset does not exist: {path}")
        mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        headers = dict(self.headers)
        headers["Content-Type"] = mime
        headers["x-upsert"] = "true"
        response = requests.post(
            f"{self.url}/storage/v1/object/{self.bucket}/{key}",
            headers=headers,
            data=path.read_bytes(),
            timeout=120,
        )
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
        response = requests.get(
            f"{self.url}/storage/v1/object/{bucket}/{key}",
            headers=self.headers,
            timeout=120,
        )
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
