from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import requests

from .config import load_config

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"


class StateStoreError(RuntimeError):
    pass


def _key_parts(key: str) -> list[str]:
    return [part.strip() for part in key.split(",") if part.strip()]


def _supabase_server_key() -> str:
    return (os.environ.get("SUPABASE_SECRET_KEY", "") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")).strip()


def _supabase_headers(key: str) -> dict[str, str]:
    headers = {
        "apikey": key,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    # Legacy service_role keys are JWTs. Modern sb_secret_* keys are API keys,
    # not bearer JWTs.
    if key.startswith("eyJ"):
        headers["Authorization"] = f"Bearer {key}"
    return headers


class LocalJsonStore:
    def __init__(self, base_dir: Path | None = None):
        self.base_dir = base_dir or DATA_DIR
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _path(self, table: str) -> Path:
        return self.base_dir / f"{table}.json"

    def list(self, table: str) -> list[dict[str, Any]]:
        path = self._path(table)
        if not path.exists():
            return []
        return json.loads(path.read_text(encoding="utf-8"))

    def replace_all(self, table: str, rows: list[dict[str, Any]]) -> None:
        self._path(table).write_text(json.dumps(rows, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    def insert(self, table: str, row: dict[str, Any]) -> dict[str, Any]:
        rows = self.list(table)
        rows.append(row)
        self.replace_all(table, rows)
        return row

    def upsert(self, table: str, row: dict[str, Any], key: str) -> dict[str, Any]:
        rows = self.list(table)
        keys = _key_parts(key)
        replaced = False
        for i, current in enumerate(rows):
            if all(current.get(k) == row.get(k) for k in keys):
                rows[i] = row
                replaced = True
                break
        if not replaced:
            rows.append(row)
        self.replace_all(table, rows)
        return row

    def update(self, table: str, key: str, value: Any, changes: dict[str, Any]) -> dict[str, Any] | None:
        rows = self.list(table)
        result = None
        for row in rows:
            if row.get(key) == value:
                row.update(changes)
                result = row.copy()
                break
        self.replace_all(table, rows)
        return result

    def filter(self, table: str, **filters: Any) -> list[dict[str, Any]]:
        return [row for row in self.list(table) if all(row.get(key) == value for key, value in filters.items())]


class SupabaseRestStore:
    """Minimal PostgREST adapter. Uses server-only credentials in trusted runtimes."""

    def __init__(self):
        self.url = os.environ.get("SUPABASE_URL", "").rstrip("/")
        self.key = _supabase_server_key()
        if not self.url or not self.key:
            raise StateStoreError("SUPABASE_URL and SUPABASE_SECRET_KEY are required")
        self.headers = _supabase_headers(self.key)

    def _endpoint(self, table: str) -> str:
        return f"{self.url}/rest/v1/{table}"

    def list(self, table: str) -> list[dict[str, Any]]:
        response = requests.get(self._endpoint(table), headers=self.headers, params={"select": "*"}, timeout=30)
        self._check(response)
        return response.json()

    def insert(self, table: str, row: dict[str, Any]) -> dict[str, Any]:
        response = requests.post(self._endpoint(table), headers=self.headers, json=row, timeout=30)
        self._check(response)
        payload = response.json()
        return payload[0] if isinstance(payload, list) and payload else row

    def upsert(self, table: str, row: dict[str, Any], key: str) -> dict[str, Any]:
        headers = dict(self.headers)
        headers["Prefer"] = "resolution=merge-duplicates,return=representation"
        response = requests.post(self._endpoint(table), headers=headers, params={"on_conflict": key}, json=row, timeout=30)
        self._check(response)
        payload = response.json()
        return payload[0] if isinstance(payload, list) and payload else row

    def update(self, table: str, key: str, value: Any, changes: dict[str, Any]) -> dict[str, Any] | None:
        response = requests.patch(self._endpoint(table), headers=self.headers, params={key: f"eq.{value}"}, json=changes, timeout=30)
        self._check(response)
        payload = response.json()
        return payload[0] if isinstance(payload, list) and payload else None

    def filter(self, table: str, **filters: Any) -> list[dict[str, Any]]:
        params = {"select": "*"}
        for key, value in filters.items():
            params[key] = f"eq.{value}"
        response = requests.get(self._endpoint(table), headers=self.headers, params=params, timeout=30)
        self._check(response)
        return response.json()

    @staticmethod
    def _check(response: requests.Response) -> None:
        if response.status_code >= 400:
            raise StateStoreError(f"Supabase error {response.status_code}: {response.text[:500]}")


def get_store():
    configured = load_config()["providers"]["state"]["provider"]
    provider = os.environ.get("STATE_PROVIDER", configured).strip().lower()
    if provider == "supabase":
        return SupabaseRestStore()
    if provider == "local":
        return LocalJsonStore()
    raise StateStoreError(f"Unsupported state provider: {provider}")
