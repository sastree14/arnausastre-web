from __future__ import annotations

import json
from typing import Any

from .llm import get_llm
from .storage import get_store


def _one(table: str, **filters: Any) -> dict[str, Any]:
    rows = get_store().filter(table, **filters)
    return rows[0] if rows else {}


def _context(opportunity_id: str) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any], dict[str, Any]]:
    opportunity = _one("crm_opportunities", opportunity_id=opportunity_id)
    if not opportunity:
        raise ValueError("Opportunity not found")
    workspace = _one("crm_deal_workspaces", opportunity_id=opportunity_id)
    company = _one("companies", company_id=opportunity.get("company_id")) if opportunity.get("company_id") else {}
    person = _one("people", person_id=opportunity.get("primary_person_id")) if opportunity.get("primary_person_id") else {}
    return opportunity, workspace, company, person


def _save_workspace(opportunity_id: str, workspace: dict[str, Any], section: str, payload: dict[str, Any]) -> None:
    changes = {section: payload, "status": section}
    get_store().update("crm_deal_workspaces", "opportunity_id", opportunity_id, changes)


def generate_deal_proposal(opportunity_id: str) -> dict[str, Any]:
    opportunity, workspace, company, person = _context(opportunity_id)
    evidence = {
        "company": {k: company.get(k) for k in ("name", "industry", "country", "recommended_service", "recommended_offer", "notes")},
        "contact": {k: person.get(k) for k in ("name", "role", "notes")},
        "opportunity": {k: opportunity.get(k) for k in ("name", "stage", "value", "currency", "metadata")},
        "qualification": workspace.get("qualification") or {},
        "discovery": workspace.get("discovery") or {},
        "existing_proposal": workspace.get("proposal") or {},
    }
    prompt = """Create an editable B2B consulting proposal draft for SC-Analytics using ONLY the supplied evidence. Do not invent client facts, quantified outcomes, deadlines, systems or requirements. If a detail is unknown, keep it explicit as an assumption or open item. Return JSON with: objective, executive_summary, scope, deliverables, approach, exclusions, timeline, acceptance_criteria, assumptions, open_items, proposal_notes. Values may be strings; deliverables/open_items may be arrays."""
    proposal = get_llm(profile="balanced").json(prompt, json.dumps(evidence, ensure_ascii=False))
    if not isinstance(proposal, dict):
        raise ValueError("Proposal generator returned invalid data")
    proposal["generated_by"] = "ai_from_deal_evidence"
    _save_workspace(opportunity_id, workspace, "proposal", proposal)
    get_store().update("crm_opportunities", "opportunity_id", opportunity_id, {"stage": "proposal", "probability": max(60, float(opportunity.get("probability") or 0))})
    return {"opportunity_id": opportunity_id, "proposal": proposal}


def generate_deal_budget(opportunity_id: str) -> dict[str, Any]:
    opportunity, workspace, company, _person = _context(opportunity_id)
    evidence = {
        "industry": company.get("industry") or "",
        "recommended_service": company.get("recommended_service") or "",
        "recommended_offer": company.get("recommended_offer") or "",
        "qualification": workspace.get("qualification") or {},
        "discovery": workspace.get("discovery") or {},
        "proposal": workspace.get("proposal") or {},
        "existing_budget": workspace.get("budget") or {},
        "currency": opportunity.get("currency") or "EUR",
    }
    prompt = """Act as an internal pricing assistant for a small data/AI consultancy. Produce a pragmatic INTERNAL HEURISTIC, not a market benchmark. Use the supplied scope only. Return JSON with numeric estimated_hours_low, estimated_hours_recommended, estimated_hours_high, numeric suggested_price_low, suggested_price_recommended, suggested_price_high, plus pricing_model, contingency_pct, rationale, assumptions, risk_factors. Keep ranges internally coherent. State uncertainty in rationale and assumptions. Do not claim external market data or competitor pricing."""
    recommendation = get_llm(profile="balanced").json(prompt, json.dumps(evidence, ensure_ascii=False))
    if not isinstance(recommendation, dict):
        raise ValueError("Budget generator returned invalid data")
    current = dict(workspace.get("budget") or {})
    current["ai_recommendation"] = recommendation
    current["recommendation_kind"] = "internal_heuristic"
    _save_workspace(opportunity_id, workspace, "budget", current)
    return {"opportunity_id": opportunity_id, "budget_recommendation": recommendation, "kind": "internal_heuristic"}
