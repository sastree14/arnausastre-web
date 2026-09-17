from __future__ import annotations

from datetime import datetime, timedelta, timezone
import html
import os
import re
from dataclasses import dataclass
from urllib.parse import urlparse

import requests

from .config import load_config
from .http_retry import request_with_retry
from .storage import get_store


class ResearchError(RuntimeError):
    pass


@dataclass
class SearchHit:
    title: str
    url: str
    snippet: str
    query: str


def _int_list(value: str | None) -> list[int]:
    result: list[int] = []
    for part in (value or "").split(","):
        try:
            result.append(int(part.strip()))
        except (TypeError, ValueError):
            pass
    return result


def _rate_windows(policy: str | None) -> list[int]:
    windows: list[int] = []
    for part in (policy or "").split(","):
        match = re.search(r"w=(\d+)", part)
        if match:
            windows.append(int(match.group(1)))
    return windows


def _record_brave_quota(response: requests.Response) -> None:
    """Persist Brave-reported quota metadata without ever storing the API key."""
    try:
        limits = _int_list(response.headers.get("X-RateLimit-Limit"))
        remaining = _int_list(response.headers.get("X-RateLimit-Remaining"))
        resets = _int_list(response.headers.get("X-RateLimit-Reset"))
        windows = _rate_windows(response.headers.get("X-RateLimit-Policy"))
        count = max(len(limits), len(remaining), len(resets), len(windows))
        if count == 0:
            return

        monthly_index = -1
        if windows:
            monthly_index = max(range(len(windows)), key=lambda index: windows[index])
        elif len(limits) > 1:
            monthly_index = len(limits) - 1

        def at(values: list[int], index: int) -> int | None:
            if not values:
                return None
            actual = index if index >= 0 else len(values) - 1
            return values[actual] if 0 <= actual < len(values) else None

        monthly_limit = at(limits, monthly_index)
        monthly_remaining = at(remaining, monthly_index)
        reset_seconds = at(resets, monthly_index)
        now = datetime.now(timezone.utc).replace(microsecond=0)
        reset_at = (now + timedelta(seconds=reset_seconds)).isoformat().replace("+00:00", "Z") if reset_seconds is not None else None
        monthly_used = (
            max(0, monthly_limit - monthly_remaining)
            if monthly_limit is not None and monthly_remaining is not None and monthly_limit > 0
            else None
        )
        value = {
            "provider": "brave_search",
            "status_code": response.status_code,
            "limit": limits,
            "remaining": remaining,
            "reset_seconds": resets,
            "windows_seconds": windows,
            "monthly_limit": monthly_limit,
            "monthly_remaining": monthly_remaining,
            "monthly_used": monthly_used,
            "monthly_reset_at": reset_at,
            "updated_at": now.isoformat().replace("+00:00", "Z"),
        }
        tenant_id = str(load_config()["company"]["tenant_id"])
        get_store().upsert(
            "growth_workspace_settings",
            {
                "tenant_id": tenant_id,
                "setting_key": "brave_quota",
                "value": value,
                "updated_at": value["updated_at"],
            },
            key="tenant_id,setting_key",
        )
    except Exception:
        # Quota telemetry must never break editorial research.
        return


class BraveResearchClient:
    endpoint = "https://api.search.brave.com/res/v1/web/search"

    def __init__(self):
        self.api_key = os.environ.get("BRAVE_API_KEY", "")
        if not self.api_key:
            raise ResearchError("BRAVE_API_KEY is required")

    def search(self, query: str, count: int = 10) -> list[SearchHit]:
        try:
            response = request_with_retry(
                "GET",
                self.endpoint,
                attempts=4,
                headers={"Accept": "application/json", "X-Subscription-Token": self.api_key},
                params={"q": query, "count": count},
                timeout=30,
            )
        except requests.RequestException as exc:
            raise ResearchError(f"Brave Search request failed: {exc}") from exc
        _record_brave_quota(response)
        if response.status_code >= 400:
            raise ResearchError(f"Brave Search error {response.status_code}: {response.text[:400]}")
        items = response.json().get("web", {}).get("results", [])
        return [
            SearchHit(
                title=(item.get("title") or "").strip(),
                url=(item.get("url") or "").strip(),
                snippet=(item.get("description") or "").strip(),
                query=query,
            )
            for item in items
            if item.get("url")
        ]


def dedupe_hits(hits: list[SearchHit]) -> list[SearchHit]:
    seen: set[str] = set()
    result: list[SearchHit] = []
    for hit in hits:
        normalized = hit.url.rstrip("/")
        if normalized in seen:
            continue
        seen.add(normalized)
        result.append(hit)
    return result


def domain(url: str) -> str:
    return urlparse(url).netloc.lower().removeprefix("www.")


def fetch_public_page_text(url: str, max_chars: int = 12000) -> str:
    """Fetch a normal public webpage. Never use this against LinkedIn pages."""
    if "linkedin.com" in domain(url):
        raise ResearchError("Direct LinkedIn fetching/scraping is intentionally disabled")
    try:
        response = request_with_retry(
            "GET",
            url,
            attempts=3,
            headers={"User-Agent": "SC-Analytics-Growth-Agent/2.0 (+https://sc-analytics.io)"},
            timeout=20,
            allow_redirects=True,
        )
    except requests.RequestException as exc:
        raise ResearchError(f"Public page fetch failed: {url}: {exc}") from exc
    if response.status_code >= 400:
        raise ResearchError(f"Public page fetch failed {response.status_code}: {url}")
    text = response.text
    text = re.sub(r"<script\b[^>]*>.*?</script>", " ", text, flags=re.I | re.S)
    text = re.sub(r"<style\b[^>]*>.*?</style>", " ", text, flags=re.I | re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:max_chars]
