"""Evidence-based SEO opportunity engine for SC-Analytics.

Free tier: consumes Search Console rows already imported in Supabase.
Always creates review proposals; it NEVER modifies published SEO pages,
claims URL indexation, guarantees rankings, or builds automatic backlinks.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from hashlib import sha256
import json
import os
import re
from urllib.parse import urlparse
from typing import Any

from .seo_review_briefs import verified_index_state, review_brief, keyword_discovery

TENANT = "sc-analytics"
SITE = "https://www.sc-analytics.io"
BRAND = re.compile(r"\bsc[\s-]?analyt(?:ics|ix|is)\b|\bscanalytics\b|\bsastre\b", re.I)
AMBIGUOUS = re.compile(r"\bsc\b|\bscdata\b|\bscca\b|\bscio\b", re.I)
BUSINESS_TERMS = re.compile(
    r"(consult|optimi[sz]|predic|pron[oó]st|forecast|planning|automat|machine.learning|"
    r"business.intelligence|inventory|inventario|data.engineer|demand|demanda|"
    r"supply.chain|inteligencia.artificial|intel·lig[eè]ncia.artificial|"
    r"pricing|route|rutas|operaciones|operations|agentes|agents|anal[ií]tica|analyt)",
    re.I,
)
GENERIC_WORDFORMS = {"consultoria", "consultoría", "data", "datos", "dades", "servicios",
                     "services", "para", "empresas", "empresa", "for", "and", "the",
                     "de", "la", "en", "con", "of", "a", "ai", "ia"}


def classify_query(query: str) -> str:
    query = str(query or "").strip()
    if not query:
        return "unavailable"
    if BRAND.search(query):
        return "branded"
    if AMBIGUOUS.search(query):
        return "ambiguous"
    return "nonbrand"


def _safe_num(value: Any) -> float:
    try:
        number = float(value or 0)
        return number if number >= 0 and number < 1e12 else 0
    except (ValueError, TypeError):
        return 0


def _tokens(value: str) -> set[str]:
    text = re.sub(r"[^a-z0-9áéíóúàèòçñ]+", " ", str(value).lower())
    return {term for term in text.split() if len(term) > 2 and term not in GENERIC_WORDFORMS}


def _page_key(url_or_path: str) -> str:
    raw = str(url_or_path or "")
    try:
        parsed = urlparse(raw)
    except ValueError:
        return ""
    if parsed.scheme and parsed.hostname not in ("www.sc-analytics.io", "sc-analytics.io"):
        return ""
    path = parsed.path or raw.split("?")[0]
    return path.rstrip("/") or "/"


def _choose_target(query: str, targets: list[dict[str, Any]]) -> str | None:
    """Conservative, deterministic matching; no invented keyword-volume data."""
    words = _tokens(query)
    if len(words) == 0:
        return None
    options: list[tuple[float, str]] = []
    for item in targets:
        target = str(item.get("target_path") or "")
        kw = str(item.get("keyword") or "")
        goal = _tokens(kw)
        if not target.startswith("/services/") or not goal:
            continue
        common = len(words & goal)
        if common == 0:
            continue
        ratio = common / max(len(words), len(goal), 1)
        if query.strip().lower() == kw.strip().lower():
            ratio += 2
        options.append((ratio, target))
    if not options:
        return None
    options.sort(key=lambda it: (-it[0], it[1]))
    return options[0][1] if options[0][0] >= 0.48 else None


def analyze(
    rows: list[dict[str, Any]],
    targets: list[dict[str, Any]],
    pages: list[dict[str, Any]],
    competitor_events: list[dict[str, Any]] | None = None,
    competitor_pages: list[dict[str, Any]] | None = None,
    today: date | None = None,
    sitemap_service_paths: set[str] | None = None,
) -> dict[str, Any]:
    """Pure deterministic analyzer: decisions based exclusively on observable data."""
    today = today or datetime.now(timezone.utc).date()
    published = {
        "/services/" + str(item.get("slug")): item
        for item in pages if item.get("status") == "published" and item.get("slug")
    }
    active_targets = [
        item for item in targets
        if item.get("status") == "active" and str(item.get("target_path", "")).startswith("/services/")
    ]
    newest = max((str(r.get("metric_date") or "")[:10] for r in rows if r.get("metric_date")), default="")
    try:
        cutoff = date.fromisoformat(newest)
    except ValueError:
        cutoff = today
    # Search Console can take several days to finalize; use last imported day.
    window_start = cutoff - timedelta(days=27)
    prev_start = cutoff - timedelta(days=55)
    stats: dict[str, dict[str, Any]] = defaultdict(
        lambda: {"impressions": 0.0, "clicks": 0.0, "weighted_position": 0.0,
                 "prev_impressions": 0.0, "queries": defaultdict(float),
                 "observed_paths": set()}
    )
    observed = 0
    unmatched_queries: list[dict[str, Any]] = []
    for r in rows:
        query = str(r.get("query") or "").strip()
        kind = classify_query(query)
        if kind != "nonbrand":
            continue
        try:
            event_day = date.fromisoformat(str(r.get("metric_date"))[:10])
        except ValueError:
            continue
        if event_day < prev_start or event_day > cutoff:
            continue
        impressions = _safe_num(r.get("impressions"))
        if impressions <= 0:
            continue
        clicks = _safe_num(r.get("clicks"))
        destination = _page_key(r.get("page") or "")
        # Only attribute rank and CTR to the page that GSC ACTUALLY reported.
        # A homepage article query must not be credited to an unrelated
        # /services URL merely because its wording resembles a keyword.
        if destination not in published:
            if event_day >= window_start:
                unmatched_queries.append(r)
            continue
        item = stats[destination]
        if event_day >= window_start:
            item["impressions"] += impressions
            item["clicks"] += clicks
            item["weighted_position"] += impressions * _safe_num(r.get("position"))
            item["queries"][query] += impressions
            item["observed_paths"].add(_page_key(r.get("page") or ""))
        else:
            item["prev_impressions"] += impressions
        observed += 1
    competitor_events = competitor_events or []
    verified_events = [
        {"title": str(e.get("title") or "")[:150],
         "source_url": str(e.get("source_url") or "")[:500],
         "observed_at": str(e.get("observed_at") or "")[:25]}
        for e in competitor_events
        if str(e.get("source_url") or "").startswith("https://")
    ][:12]
    recommendations = []
    for path in sorted({str(k["target_path"]) for k in active_targets}):
        page = published.get(path)
        if not page:
            continue
        evidence = stats[path]
        seen = round(evidence["impressions"], 1)
        previous = round(evidence["prev_impressions"], 1)
        clicks = round(evidence["clicks"], 1)
        position = round(evidence["weighted_position"] / seen, 1) if seen else None
        ctr = round(clicks / seen, 4) if seen else None
        page_targets = [x for x in active_targets if x["target_path"] == path]
        index = verified_index_state(page_targets, today)
        priority = max((_safe_num(x.get("priority")) for x in page_targets), default=1.0)
        date_published = str(page.get("published_at") or "")[:10]
        try:
            age_days = (today - date.fromisoformat(date_published)).days
        except ValueError:
            age_days = None
        # Existence in sitemap means discoverable, NOT Google-indexed.
        in_sitemap = sitemap_service_paths is None or path in sitemap_service_paths
        if not in_sitemap:
            action = "technical_sitemap_fix"
            rationale = "Published service is absent from current sitemap; inspect visibility."
        elif index["status"] == "reported_not_indexed":
            action = "review_google_indexing"
            rationale = "Google URL Inspection recently reported an unindexed service; check canonical, indexing policy and page value."
        elif seen >= 20 and position and 7 <= position <= 35 and ctr is not None and ctr < 0.04:
            action = "review_title_snippet"
            rationale = "Actual non-brand impressions with weak observed CTR; review SERP title, page intent and competing results."
        elif seen >= 12 and position and position > 35:
            action = "review_content_relevance"
            rationale = "Non-brand impressions but poor observed position; compare search intent and existing evidence."
        elif age_days is not None and age_days < 28:
            action = "wait_for_crawl"
            rationale = "Landing recently published. Validate actual URL inspection before assuming it is indexed or rewriting content."
        elif index["status"] == "unverified" and seen < 5:
            action = "verify_google_indexing"
            rationale = "No recent Google URL Inspection report and too little GSC evidence to assume indexing."
        elif seen < 5:
            action = "validate_keyword_demand"
            rationale = "Insufficient identifiable non-brand Search Console observations; validate demand before editing or creating pages."
        else:
            action = "review_search_intent"
            rationale = "Review observed queries and competitor evidence before a content change."
        confidence = "observed" if seen >= 20 else "limited" if seen >= 5 else "insufficient"
        score = round(min(10, priority * 0.38 + min(seen, 120) / 32 +
                         (2.5 if action == "technical_sitemap_fix" else 0)), 2)
        ranked_queries = sorted(evidence["queries"].items(), key=lambda item: (-item[1], item[0]))[:6]
        key = sha256((path + "|" + action).encode()).hexdigest()[:16]
        recommendations.append({
            "recommendation_id": "seo_engine_" + key,
            "tenant_id": TENANT,
            "keyword_id": page_targets[0].get("keyword_id") if page_targets else None,
            "target_path": path,
            "title": f"{action.replace('_', ' ').capitalize()}: {path.rsplit('/', 1)[-1]}",
            "rationale": rationale,
            "priority": score,
            "status": "proposed",
            "payload": {
                "kind": "seo_opportunity",
                "action": action,
                "publishable": False,
                "evidence": {
                    "source": "GSC imported query/page rows",
                    "last_imported_date": newest or None,
                    "window_start": window_start.isoformat(),
                    "window_end": cutoff.isoformat(),
                    "nonbrand_impressions_28d": seen,
                    "nonbrand_clicks_28d": clicks,
                    "nonbrand_impressions_previous_28d": previous,
                    "weighted_position": position,
                    "ctr": ctr,
                    "classification": confidence,
                    "query_examples": [{"query": q, "impressions": round(i, 1)} for q, i in ranked_queries],
                    "age_days": age_days,
                    "present_in_sitemap": in_sitemap,
                    "google_indexation": "not_verified" if index["status"] == "unverified" else index["status"],
                    "google_inspection": index,
                },
                "research": {
                    "tracked_competitor_events": verified_events[:4],
                    "public_competitor_page_observations": [x for x in (competitor_pages or []) if x.get("status")=="observed"][:4],
                    "serp_rankings_verified": False,
                    "backlink_opportunities_verified": False,
                },
                "review_required": True,
                "workplan": review_brief(action,page,index,ranked_queries),
            },
        })
    recommendations.sort(key=lambda r: (-r["priority"], r["target_path"]))
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": "supabase_search_console_import",
        "gsc_last_date": newest or None,
        "observed_rows": observed,
        "unique_commercial_pages": len(published),
        "active_keywords": len(active_targets),
        "recommendations": recommendations,
        "unmapped_keyword_opportunities": keyword_discovery(unmatched_queries),
        "unmapped_gsc_rows": len(unmatched_queries),
        "constraints": [
            "No automatic page publication",
            "No inferred indexing status or rank guarantees",
            "No purchased or fabricated backlinks",
            "Only observed Search Console impressions, not search-market volume",
        ],
    }


def _api_rows(table: str, *, extra: dict[str, str] | None = None,
              size: int = 500, max_pages: int = 15) -> list[dict[str, Any]]:
    import requests
    url = (os.getenv("SUPABASE_URL") or "").rstrip("/")
    key = (os.getenv("SUPABASE_SECRET_KEY") or "").strip()
    if not url.startswith("https://") or not key:
        raise RuntimeError("Missing Supabase server credentials; refusing to run")
    headers = {"apikey": key, "Accept": "application/json"}
    if key.startswith("eyJ"):
        headers["Authorization"] = f"Bearer {key}"
    result = []
    for i in range(max_pages):
        params = {"tenant_id": "eq." + TENANT, "limit": str(size), "offset": str(i * size)}
        if extra:
            params.update(extra)
        response = requests.get(f"{url}/rest/v1/{table}", params=params,
                                headers=headers, timeout=30)
        response.raise_for_status()
        page = response.json()
        if not isinstance(page, list):
            raise RuntimeError("Invalid backend page")
        result.extend(page)
        if len(page) < size:
            return result
    # Do not score partial data as though it were complete.
    raise RuntimeError(f"SEO source {table} exceeded {max_pages * size} rows: increase cap")


def run_organic_engine(*, write: bool = False, max_write: int = 23,
                       date_today: date | None = None) -> dict[str, Any]:
    """Main entrypoint for CI; storage mutations opt-in only."""
    import requests
    today = date_today or datetime.now(timezone.utc).date()
    rows = _api_rows("search_console_daily", extra={
        "metric_date": "gte." + (today - timedelta(days=95)).isoformat(),
        "order": "metric_date.desc",
    })
    targets = _api_rows("seo_keyword_targets", extra={"status": "eq.active"}, size=100)
    pages = _api_rows("seo_pages", extra={"status": "eq.published"}, size=100)
    events = _api_rows("competitor_events", extra={
        "observed_at": "gte." + (today - timedelta(days=90)).isoformat(),
        "order": "observed_at.desc",
    }, size=100, max_pages=12)
    # Public sitemap is indexability evidence only, NOT Google index status.
    sitemap_paths = None
    try:
        from xml.etree import ElementTree
        xml_response = requests.get(SITE + "/sitemap.xml", timeout=30)
        xml_response.raise_for_status()
        sitemap_paths = {_page_key(el.text or "") for el in
                         ElementTree.fromstring(xml_response.content).iter()
                         if el.tag.endswith("loc")}
    except (requests.RequestException, ValueError):
        pass  # If fetch fails, do not claim a service is absent.
    from .seo_competitor_research import research_competitor_pages
    competitor_pages = research_competitor_pages()
    result = analyze(rows, targets, pages, events, competitor_pages,
                     today=today, sitemap_service_paths=sitemap_paths)
    result["competitor_research"] = competitor_pages
    # Reserve a small part of the weekly review queue for newly *observed*
    # Search Console queries whose impressions belong to a non-service page.
    # This is research, not permission to create more landing pages.
    candidate_recommendations = []
    for candidate in result["unmapped_keyword_opportunities"][:4]:
        query = candidate["query"]
        pages_seen = candidate.get("observed_pages") or []
        target = _page_key(pages_seen[0]) if pages_seen else "/"
        if not target.startswith("/") or target.startswith("//"):
            target = "/"
        candidate_recommendations.append({
            "recommendation_id": "seo_query_" + sha256(query.casefold().encode()).hexdigest()[:16],
            "tenant_id": TENANT,
            "keyword_id": None,
            "target_path": target,
            "title": "Investigate observed keyword: " + query[:115],
            "rationale": (
                "Google Search Console reported this query on an existing page. "
                "Validate intent and real competition before changing an existing service."
            ),
            "priority": round(min(8, 3 + candidate["observed_impressions"] / 12), 2),
            "status": "proposed",
            "payload": {
                "kind": "seo_opportunity",
                "action": "research_keyword_candidate",
                "publishable": False,
                "review_required": True,
                "evidence": candidate,
                "research": {
                    "keyword_volume_verified": False,
                    "serp_rankings_verified": False,
                    "backlink_opportunities_verified": False,
                },
            },
        })
    result["keyword_recommendations"] = candidate_recommendations
    if write:
        from .storage import get_store
        store = get_store()
        written = []
        # Bounded queue. Do not overwrite rejected/applied rows.
        existing = {str(e.get("recommendation_id")): e for e in store.list("seo_recommendations")}
        # Eight landing diagnostics + up to four newly observed query reviews.
        budget = max(0, min(int(max_write), 23))
        prioritized = result["recommendations"][:max(0, budget - min(4, len(candidate_recommendations)))]
        prioritized += candidate_recommendations[:min(4, budget)]
        for item in prioritized:
            previous = existing.get(item["recommendation_id"])
            if previous and previous.get("status") != "proposed":
                continue
            if previous:
                item["created_at"] = previous.get("created_at")
            else:
                item["created_at"] = result["generated_at"]
            item["updated_at"] = result["generated_at"]
            store.upsert("seo_recommendations", item, key="recommendation_id")
            written.append(item["recommendation_id"])
        result["written"] = written
    else:
        result["written"] = []
    return result
