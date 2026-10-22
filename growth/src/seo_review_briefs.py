"""Review-only guardrails for SEO indexing and editorial improvement decisions.

Never calls Google or a language model, publishes content, invents search volume,
or fabricates competitor evidence. Can be applied deterministically to historic
Search Console rows and approved existing commercial pages.
"""
from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Any


def verified_index_state(targets: list[dict[str, Any]], today: date) -> dict[str, Any]:
    """Extract Google's last URL Inspection report from associated target rows.

    PASS is the *observed inspection verdict*, not a guarantee of current
    indexation. Stale (>45 days), failed, and absent reports stay distinct.
    """
    reports = []
    for target in targets:
        metrics = target.get("metrics") or {}
        if not isinstance(metrics, dict):
            continue
        report = metrics.get("google_index_inspection")
        if not isinstance(report, dict):
            continue
        checked = str(report.get("checked_at") or "")[:10]
        try:
            age = (today - date.fromisoformat(checked)).days
        except ValueError:
            continue
        if age < 0 or age > 45:
            continue
        reports.append((checked, report))
    if not reports:
        return {"status": "unverified", "verdict": None, "checked_at": None}
    checked, report = max(reports, key=lambda item: item[0])
    verdict = str(report.get("verdict") or "UNKNOWN").upper()
    status = "reported_indexed" if verdict == "PASS" else (
        "reported_not_indexed" if verdict == "FAIL" else "inconclusive"
    )
    return {
        "status": status,
        "verdict": verdict,
        "checked_at": checked,
        "coverage_state": str(report.get("coverageState") or "")[:160],
        "google_canonical": str(report.get("googleCanonical") or "")[:400] or None,
        "inspection_result_link": str(report.get("inspectionResultLink") or "")[:650] or None,
    }


def review_brief(
    action: str,
    page: dict[str, Any],
    index: dict[str, Any],
    ranked_queries: list[tuple[str, float]],
) -> dict[str, Any]:
    """Specific proposed actions, NOT a synthetic full-page rewrite."""
    scope = "metadata_only" if action == "review_title_snippet" else (
        "public_copy_without_layout_change" if action in {
            "review_content_relevance", "review_search_intent"
        } else "technical_or_research_only"
    )
    fields = {
        "review_title_snippet": ["title", "meta_description"],
        "review_content_relevance": ["intro", "sections", "internal_links"],
        "review_search_intent": ["title", "intro", "sections"],
        "technical_sitemap_fix": ["sitemap", "canonical"],
        "review_google_indexing": ["index_inspection", "canonical", "sitemap"],
        "review_google_canonical": ["index_inspection", "canonical", "redirects"],
        "refresh_search_console": ["search_console", "integration_sync"],
        "verify_google_indexing": ["index_inspection", "sitemap"],
        "wait_for_crawl": ["index_inspection"],
        "validate_keyword_demand": ["search_console", "search_intent"],
    }.get(action, ["search_intent"])
    examples = [
        {"query": query[:140], "impressions_on_this_page": round(n, 1)}
        for query, n in ranked_queries[:5] if n > 0
    ]
    proof = [
        str(link["href"])[:260] for link in (page.get("internal_links") or [])
        if isinstance(link, dict)
        and str(link.get("href") or "").startswith("/projects/")
    ][:4]
    return {
        "status": "awaiting_editor_review",
        "publication_allowed": False,
        "change_scope": scope,
        "fields_to_review": fields,
        "current_title": str(page.get("title") or "")[:180],
        "current_h1": str(page.get("h1") or "")[:180],
        "current_primary_keyword": str(page.get("primary_keyword") or "")[:160],
        "real_portfolio_links": proof,
        "observed_search_queries": examples,
        "google_index_status": index,
        "editorial_checks": [
            "Compare the query's actual SERP intent before any rewrite",
            "Retain original verified case outcomes; never invent ROI or clients",
            "Check that the proposed wording appears in genuinely useful copy",
            "Preserve visual components and require a human approval before publish",
        ],
        "candidate_text": None,
        "synthetic_search_volume": None,
    }


def keyword_discovery(
    unmatched_rows: list[dict[str, Any]],
    min_impressions: float = 3.0,
    max_results: int = 12,
) -> list[dict[str, Any]]:
    """Surface possible demand from *observed* GSC queries only.

    These rows are NOT credited to a service landing when Google actually sent
    the impression to Home/Knowledge/another page. No new pages are created.
    """
    from .seo_intelligence import BUSINESS_TERMS, classify_query, _safe_num
    grouped: dict[str, dict[str, Any]] = {}
    for row in unmatched_rows:
        query = str(row.get("query") or "").strip()
        if classify_query(query) != "nonbrand" or not BUSINESS_TERMS.search(query):
            continue
        n = _safe_num(row.get("impressions"))
        if n <= 0:
            continue
        key = " ".join(query.lower().split())
        data = grouped.setdefault(key, {
            "query": query[:160], "observed_impressions": 0,
            "observed_clicks": 0, "observed_pages": set(),
        })
        data["observed_impressions"] += n
        data["observed_clicks"] += _safe_num(row.get("clicks"))
        page = str(row.get("page") or "")
        if page.startswith("https://www.sc-analytics.io/"):
            data["observed_pages"].add(page[:420])
    ranked = sorted(
        [x for x in grouped.values() if x["observed_impressions"] >= min_impressions],
        key=lambda x: (-x["observed_impressions"], x["query"].casefold()),
    )[:max_results]
    return [
        {
            **{k: v for k, v in row.items() if k != "observed_pages"},
            "observed_pages": sorted(row["observed_pages"])[:5],
            "search_market_volume": None,
            "commercial_intent_verified": False,
            "action": "research_keyword_for_existing_service",
            "new_page_authorized": False,
        }
        for row in ranked
    ]
