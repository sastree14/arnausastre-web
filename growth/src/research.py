from __future__ import annotations

import html
import os
import re
from dataclasses import dataclass
from urllib.parse import urlparse

import requests

from .http_retry import request_with_retry


class ResearchError(RuntimeError):
    pass


@dataclass
class SearchHit:
    title: str
    url: str
    snippet: str
    query: str


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
