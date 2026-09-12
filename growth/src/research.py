from __future__ import annotations

import html
import os
import re
import time
from dataclasses import dataclass
from urllib.parse import urlparse

import requests


class ResearchError(RuntimeError):
    pass


_TRANSIENT_HTTP = {408, 425, 429, 500, 502, 503, 504}


@dataclass
class SearchHit:
    title: str
    url: str
    snippet: str
    query: str


def _request_with_retries(method: str, url: str, *, timeout: int | tuple[int, int], **kwargs) -> requests.Response:
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            response = requests.request(method, url, timeout=timeout, **kwargs)
        except requests.RequestException as exc:
            last_error = exc
            if attempt == 2:
                raise ResearchError(f"Research request failed after retries: {exc}") from exc
            time.sleep(2 ** attempt)
            continue

        if response.status_code < 400:
            return response
        if response.status_code not in _TRANSIENT_HTTP or attempt == 2:
            return response

        retry_after = response.headers.get("Retry-After", "")
        try:
            wait = min(10.0, max(1.0, float(retry_after))) if retry_after else float(2 ** attempt)
        except ValueError:
            wait = float(2 ** attempt)
        time.sleep(wait)

    raise ResearchError(f"Research request failed: {last_error}")


class BraveResearchClient:
    endpoint = "https://api.search.brave.com/res/v1/web/search"

    def __init__(self):
        self.api_key = os.environ.get("BRAVE_API_KEY", "")
        if not self.api_key:
            raise ResearchError("BRAVE_API_KEY is required")

    def search(self, query: str, count: int = 10) -> list[SearchHit]:
        response = _request_with_retries(
            "GET",
            self.endpoint,
            headers={"Accept": "application/json", "X-Subscription-Token": self.api_key},
            params={"q": query, "count": count},
            timeout=(10, 30),
        )
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
    response = _request_with_retries(
        "GET",
        url,
        headers={"User-Agent": "SC-Analytics-Growth-Agent/2.0 (+https://sc-analytics.io)"},
        timeout=(10, 20),
        allow_redirects=True,
    )
    if response.status_code >= 400:
        raise ResearchError(f"Public page fetch failed {response.status_code}: {url}")
    text = response.text
    text = re.sub(r"<script\b[^>]*>.*?</script>", " ", text, flags=re.I | re.S)
    text = re.sub(r"<style\b[^>]*>.*?</style>", " ", text, flags=re.I | re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:max_chars]
