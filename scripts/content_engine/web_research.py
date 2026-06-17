"""Brave Search API client used to ground article drafts in recent, real sources."""

from __future__ import annotations

import os
from dataclasses import dataclass

import requests

BRAVE_ENDPOINT = "https://api.search.brave.com/res/v1/web/search"
REQUEST_TIMEOUT_SECONDS = 15


class WebResearchError(Exception):
    """Raised when Brave Search is misconfigured or fails to respond usefully."""


@dataclass
class SearchResult:
    title: str
    url: str
    snippet: str
    query: str


def get_brave_api_key() -> str:
    api_key = os.environ.get("BRAVE_API_KEY")
    if not api_key:
        raise WebResearchError(
            "Falta el secret BRAVE_API_KEY. Crea una cuenta en https://brave.com/search/api/, "
            "genera una API key, y guárdala en GitHub Settings -> Secrets and variables -> Actions "
            "con el nombre BRAVE_API_KEY."
        )
    return api_key


def search(query: str, api_key: str, count: int = 5) -> list[SearchResult]:
    try:
        response = requests.get(
            BRAVE_ENDPOINT,
            headers={"Accept": "application/json", "X-Subscription-Token": api_key},
            params={"q": query, "count": count},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException as exc:
        raise WebResearchError(f"Brave Search no respondió para la query '{query}'. Detalle: {exc}") from exc

    if response.status_code == 401:
        raise WebResearchError(
            "Brave Search rechazó la API key (401). Verifica que BRAVE_API_KEY es correcta y está activa."
        )
    if response.status_code == 429:
        raise WebResearchError(
            "Brave Search devolvió 429 (límite de uso superado). Revisa el plan/cuota en el dashboard de Brave."
        )
    if response.status_code != 200:
        raise WebResearchError(
            f"Brave Search devolvió un error inesperado para '{query}': "
            f"HTTP {response.status_code} — {response.text[:300]}"
        )

    try:
        payload = response.json()
    except ValueError as exc:
        raise WebResearchError(f"Brave Search devolvió una respuesta no-JSON para '{query}'.") from exc

    web_results = payload.get("web", {}).get("results", [])
    return [
        SearchResult(
            title=item.get("title", "").strip(),
            url=item.get("url", "").strip(),
            snippet=item.get("description", "").strip(),
            query=query,
        )
        for item in web_results
        if item.get("url")
    ]


def build_queries(industry: str, decision_problem: str) -> list[str]:
    base = decision_problem.strip() or industry.strip()
    return [
        f"{industry} {base} data analytics case study",
        f"{industry} demand forecasting OR optimization use case",
        f"machine learning {industry} business decision making",
        f"{industry} {base} 2025 2026 trends",
        f"{industry} analytics ROI benchmark",
    ]


def research_topic(industry: str, decision_problem: str, api_key: str, min_results: int = 3, max_results: int = 5) -> list[SearchResult]:
    """Runs several queries and returns a deduplicated pool of 3-5 results, most relevant first."""
    queries = build_queries(industry, decision_problem)
    collected: list[SearchResult] = []
    seen_urls: set[str] = set()

    for query in queries:
        if len(collected) >= max_results:
            break
        for result in search(query, api_key, count=5):
            if result.url in seen_urls:
                continue
            seen_urls.add(result.url)
            collected.append(result)
            if len(collected) >= max_results:
                break

    if len(collected) < min_results:
        raise WebResearchError(
            f"Brave Search solo devolvió {len(collected)} resultado(s) útiles para "
            f"industry='{industry}', decision_problem='{decision_problem}' (mínimo requerido: {min_results}). "
            "Prueba a ajustar el Decision Problem en Topics Bank o revisa la cuota de la API key."
        )

    return collected[:max_results]
