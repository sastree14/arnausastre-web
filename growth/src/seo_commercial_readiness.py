"""Commercial SEO readiness and authority opportunities (analysis only).

A deterministic decision checklist, not a ranking oracle. Never fabricates
SERP positions, keyword demand, prospective partner consent, or conversions.
All outbound contact, content edits and page publication require approval.
"""
from __future__ import annotations

from datetime import date
from typing import Any

from .seo_review_briefs import verified_index_state


def _has_text(value: Any, minimum: int = 1) -> bool:
    return isinstance(value, str) and len(value.strip()) >= minimum


def _project_links(page: dict[str, Any]) -> list[str]:
    links = page.get("internal_links") or []
    if not isinstance(links, list):
        return []
    return sorted({
        link.get("href")
        for link in links
        if isinstance(link, dict)
        and isinstance(link.get("href"), str)
        and link["href"].startswith("/projects/")
        and not link["href"].startswith("//")
    })[:6]


def commercial_readiness(
    page: dict[str, Any],
    targets: list[dict[str, Any]],
    *,
    today: date,
    observed_service_impressions: float = 0,
    observed_service_clicks: float = 0,
    observed_service_position: float | None = None,
) -> dict[str, Any]:
    """Return ordered, evidence-backed research tasks for one existing service.

    The score measures only onsite *readiness*. It NEVER means SEO rank,
    indexed status, commercial demand, competitiveness, or lead likelihood.
    """
    title_ok = _has_text(page.get("title"), 20)
    h1_ok = _has_text(page.get("h1"), 18)
    intro_ok = _has_text(page.get("intro"), 100)
    sections = page.get("sections") if isinstance(page.get("sections"), list) else []
    sections_ok = len(sections) >= 2
    cta_ok = _has_text(page.get("cta_title"), 8) and _has_text(page.get("cta_body"), 20)
    projects = _project_links(page)
    proof_ok = bool(projects)
    known = {
        "descriptive_title": title_ok,
        "specific_h1": h1_ok,
        "useful_intro": intro_ok,
        "substantive_sections": sections_ok,
        "clear_cta": cta_ok,
        "existing_project_reference": proof_ok,
    }
    score = sum(known.values())
    index = verified_index_state(targets, today)
    observed = max(0.0, float(observed_service_impressions or 0))
    clicks = max(0.0, float(observed_service_clicks or 0))
    # Google index confirmation is independent of page metadata/URL discovery.
    tasks = []
    if not all(known.values()):
        tasks.append({
            "kind": "onsite_quality",
            "status": "needs_editorial_review",
            "reason": "Missing or too brief onsite signals: " +
                      ", ".join(key for key, ok in known.items() if not ok),
            "action": "Review existing copy and verified case evidence, without changing layout.",
        })
    if index["status"] != "reported_indexed":
        tasks.append({
            "kind": "indexation",
            "status": "requires_google_evidence",
            "reason": f"Latest Google URL Inspection: {index['status']}.",
            "action": "Check Google's actual canonical, coverage and crawl evidence.",
        })
    if observed < 20:
        tasks.append({
            "kind": "keyword_demand",
            "status": "insufficient_observations",
            "reason": f"{observed:g} attributed non-branded GSC impressions on this exact URL.",
            "action": "Confirm local SERP intent and demand with verifiable sources before rewriting.",
        })
    elif observed_service_position is not None and 7 <= observed_service_position <= 35 and clicks / observed < 0.04:
        tasks.append({
            "kind": "snippet",
            "status": "review_candidate",
            "reason": "Observed impressions and position indicate a potential snippet review; causality unknown.",
            "action": "Compare actual search results and consider title/meta changes after approval.",
        })
    tasks.append({
        "kind": "serp_competition",
        "status": "unverified",
        "reason": "No verified country/device-specific Google SERP snapshot or competitor ranks.",
        "action": "Record search location, date, target query and competitor URLs before making claims.",
    })
    tasks.append({
        "kind": "earned_authority",
        "status": "editorial_research_required",
        "reason": "A project link on our own site is not an external referring domain.",
        "action": ("Qualify relevant partners, directories, industry publications or "
                   "original studies; verify independent editorial relevance and "
                   "record the resulting URL before counting any backlink."),
    })
    tasks.append({
        "kind": "commercial_attribution",
        "status": "pending_confirmed_leads",
        "reason": "Search Console clicks are not forms, booked meetings or signed clients.",
        "action": "Review the existing CMI funnel: landing -> qualified inquiry -> actual booking -> won client.",
    })
    return {
        "status": "analysis_only",
        "publishable": False,
        "onsite_readiness_checks_passed": score,
        "onsite_readiness_checks_total": len(known),
        "onsite_checklist": known,
        "linked_existing_case_paths": projects,
        "target_keywords": sorted({
            str(row.get("keyword") or "")[:160] for row in targets if row.get("keyword")
        })[:8],
        "observed_gsc_impressions_this_url": observed,
        "observed_gsc_clicks_this_url": clicks,
        "google_indexation_observed": index["status"],
        "verified_market_search_volume": None,
        "verified_serp_rankings": None,
        "verified_external_referring_domains": None,
        "verified_new_customers_from_seo": None,
        "tasks": tasks,
        "approval_required_for": [
            "changing_public_content", "creating_landing", "sending_outreach",
            "claiming_client_results", "adding_paid_tools",
        ],
    }
