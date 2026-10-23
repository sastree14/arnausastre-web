"""Evidence-gated SEO portfolio strategy for SC-Analytics.

Focus on four commercial themes first. Widen editorial keyword research only
after *observed, attributed, recent* non-branded GSC signals improve. These
rules never activate keyword targets, add pages, publish copy, or claim demand
in the wider market. The thresholds are operating heuristics, not Google rules.
"""
from __future__ import annotations

from datetime import date
from typing import Any

# Exact existing service destinations. Broad SEO health monitoring continues
# across ALL published pages, even while research stays focused here.
FOCUS_PILLARS: dict[str, frozenset[str]] = {
    "demand_forecasting": frozenset({
        "/services/prediccion-demanda", "/services/previsio-demanda",
        "/services/demand-forecasting", "/services/demand-planning",
    }),
    "logistics_inventory": frozenset({
        "/services/logistics-optimization", "/services/route-optimization",
        "/services/optimizacion-inventario", "/services/inventory-optimization",
        "/services/supply-chain-analytics",
    }),
    "mathematical_optimization": frozenset({
        "/services/optimizacion-operaciones",
        "/services/optimitzacio-empresarial",
        "/services/operations-research",
    }),
    "data_analytics_ai": frozenset({
        "/services/consultoria-datos", "/services/consultoria-dades",
        "/services/analitica-datos-empresas",
        "/services/automatizacion-ia-empresas",
        "/services/ai-automation",
    }),
}
FOCUS_PATHS = frozenset().union(*FOCUS_PILLARS.values())
# Explicit operational guardrails (not claims about search-engine behavior).
MIN_RECENT_IMPRESSIONS = 100
MIN_RECENT_CLICKS = 5
MIN_ABSOLUTE_IMPRESSION_GAIN = 30
MIN_PILLAR_IMPRESSIONS = 30
MIN_PILLAR_CLICKS = 1
MIN_GROWING_PILLARS = 2
MIN_INDEXED_PILLARS = 2
MAX_GSC_LAG_DAYS = 7
CRITICAL_ACTIONS = frozenset({
    "technical_sitemap_fix", "review_google_canonical",
    "review_google_indexing", "review_inconclusive_inspection",
})


def _nonnegative(value: Any) -> float:
    try:
        number = float(value)
    except (ValueError, TypeError):
        return 0.
    return number if 0 <= number < 1e9 else 0.


def pillar_for_path(path: str) -> str | None:
    for name, paths in FOCUS_PILLARS.items():
        if path in paths:
            return name
    return None


def assess_growth_stage(
    recommendations: list[dict[str, Any]], *,
    imported_date: str | None,
    today: date,
) -> dict[str, Any]:
    """Gate research expansion on comparable GSC windows for existing URLs.

    A recommendation's evidence comes from real query+URL reports. Do not
    infer search-market volume, or infer indexed URLs from sitemap presence.
    """
    try:
        lag = (today - date.fromisoformat(str(imported_date)[:10])).days
        fresh = 0 <= lag <= MAX_GSC_LAG_DAYS
    except (ValueError, TypeError):
        lag = None
        fresh = False

    pillars: dict[str, dict[str, Any]] = {
        name: {"impressions_28d": 0., "impressions_previous_28d": 0.,
               "clicks_28d": 0., "indexed_urls": 0}
        for name in FOCUS_PILLARS
    }
    for proposal in recommendations:
        name = pillar_for_path(str(proposal.get("target_path") or ""))
        if not name:
            continue
        evidence = (proposal.get("payload") or {}).get("evidence") or {}
        entry = pillars[name]
        entry["impressions_28d"] += _nonnegative(evidence.get("nonbrand_impressions_28d"))
        entry["impressions_previous_28d"] += _nonnegative(
            evidence.get("nonbrand_impressions_previous_28d")
        )
        entry["clicks_28d"] += _nonnegative(evidence.get("nonbrand_clicks_28d"))
        if evidence.get("google_indexation") == "reported_indexed":
            entry["indexed_urls"] += 1

    now_impressions = sum(x["impressions_28d"] for x in pillars.values())
    previous_impressions = sum(x["impressions_previous_28d"] for x in pillars.values())
    clicks = sum(x["clicks_28d"] for x in pillars.values())
    growing_pillars = sum(
        x["impressions_28d"] >= MIN_PILLAR_IMPRESSIONS
        and x["clicks_28d"] >= MIN_PILLAR_CLICKS
        and x["impressions_28d"] > x["impressions_previous_28d"]
        for x in pillars.values()
    )
    indexed_pillars = sum(x["indexed_urls"] > 0 for x in pillars.values())
    gain = now_impressions - previous_impressions
    growth_ok = (
        gain >= MIN_ABSOLUTE_IMPRESSION_GAIN
        and (previous_impressions == 0 or
             now_impressions >= previous_impressions * 1.2)
    )
    expansion = (
        fresh and now_impressions >= MIN_RECENT_IMPRESSIONS
        and clicks >= MIN_RECENT_CLICKS
        and growth_ok
        and growing_pillars >= MIN_GROWING_PILLARS
        and indexed_pillars >= MIN_INDEXED_PILLARS
    )
    return {
        "stage": "expansion_research" if expansion else "focused_foundation",
        "expanded_keyword_research_enabled": bool(expansion),
        "gsc_last_date": imported_date,
        "gsc_lag_days": lag,
        "gsc_fresh": fresh,
        "focus_pillars": pillars,
        "focus_impressions_28d": round(now_impressions, 1),
        "focus_impressions_previous_28d": round(previous_impressions, 1),
        "focus_clicks_28d": round(clicks, 1),
        "growing_pillars": growing_pillars,
        "indexed_pillars": indexed_pillars,
        "gate_requirements": {
            "max_gsc_lag_days": MAX_GSC_LAG_DAYS,
            "min_focus_impressions_28d": MIN_RECENT_IMPRESSIONS,
            "min_focus_clicks_28d": MIN_RECENT_CLICKS,
            "min_impression_gain": MIN_ABSOLUTE_IMPRESSION_GAIN,
            "min_relative_growth_if_baseline_nonzero": 1.2,
            "min_pillars_with_growth_and_demand": MIN_GROWING_PILLARS,
            "min_pillars_with_indexed_urls": MIN_INDEXED_PILLARS,
        },
        "caveats": [
            "GSC query/page rows can be privacy-filtered and do not equal all search traffic.",
            "The gate uses observed on-site GSC performance, not market keyword volume.",
            "Indexation is counted only from fresh Google URL Inspection reports.",
            "Expansion enables research proposals only, never automatic publication.",
        ],
    }


def prioritize_growth_review(
    recommendations: list[dict[str, Any]],
    growth: dict[str, Any],
) -> list[dict[str, Any]]:
    """Transparent portfolio priorities. Critical technical problems stay first."""
    prepared = []
    for proposal in recommendations:
        row = {**proposal, "payload": dict(proposal.get("payload") or {})}
        evidence = row["payload"].get("evidence") or {}
        path = str(row.get("target_path") or "")
        focus = path in FOCUS_PATHS
        impressions = _nonnegative(evidence.get("nonbrand_impressions_28d"))
        position = evidence.get("weighted_position")
        value = min(10., _nonnegative(row.get("priority")))
        demand = min(10., impressions / 10.) if growth["gsc_fresh"] else 0.
        try:
            ranking = float(position)
        except (ValueError, TypeError):
            ranking = None
        position_gap = (
            10. if impressions >= 30 and ranking is not None and 8 <= ranking <= 30
            else 6. if impressions >= 30 and ranking is not None and ranking > 30
            else 0.
        )
        project_proof = bool((row["payload"].get("workplan") or {})
                             .get("real_portfolio_links"))
        evidence_score = 10. if project_proof else 0.
        relevance = 10. if focus else 5.
        score = round(
            .35 * value + .25 * demand + .20 * position_gap +
            .10 * evidence_score + .10 * relevance, 2
        )
        row["payload"]["growth_strategy"] = {
            "stage": growth["stage"],
            "evidence_as_of": growth["gsc_last_date"],
            "gsc_fresh": growth["gsc_fresh"],
            "focus_impressions_28d": growth["focus_impressions_28d"],
            "focus_impressions_previous_28d": growth["focus_impressions_previous_28d"],
            "focus_clicks_28d": growth["focus_clicks_28d"],
            "indexed_pillars": growth["indexed_pillars"],
            "growing_pillars": growth["growing_pillars"],
            "focus_pillar": pillar_for_path(path),
            "priority_model": "commercial_value_35_demand_25_rank_gap_20_proof_10_fit_10",
            "score_0_to_10": score,
            "components": {
                "commercial_priority": value,
                "observed_demand": round(demand, 2),
                "observed_rank_opportunity": position_gap,
                "case_evidence": evidence_score,
                "focus_fit": relevance,
            },
            "measurement_status": "observed" if impressions >= 30 and growth["gsc_fresh"]
                                  else "insufficient",
            "review_only": True,
        }
        # Preserve original persisted priority semantics for the CMI; use
        # the portfolio score only to order the weekly review queue.
        prepared.append((row, score))
    prepared.sort(key=lambda item: (
        0 if str(item[0]["payload"].get("action")) in CRITICAL_ACTIONS else 1,
        0 if item[0]["target_path"] in FOCUS_PATHS else 1,
        -item[1], item[0]["target_path"],
    ))
    return [row for row, _ in prepared]
