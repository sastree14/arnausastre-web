from __future__ import annotations

from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Any

from .brain import load_brain
from .llm import get_llm
from .storage import get_store

INDUSTRY_RULES: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("E-commerce / Retail", ("ecommerce", "e-commerce", "retail", "marketplace", "amazon", "shopify", "sku", "merchandising")),
    ("Supply Chain / Logistics", ("supply chain", "logistics", "warehouse", "transport", "routing", "delivery", "procurement", "inventory")),
    ("Banking / Financial Services", ("bank", "banking", "credit", "fraud", "risk", "loan", "lending", "financial services")),
    ("Manufacturing / Industrial", ("manufacturing", "factory", "production", "industrial", "plant", "oee", "maintenance")),
    ("SaaS / Technology", ("saas", "software", "platform", "subscription", "product analytics", "technology company")),
    ("Healthcare / Pharma", ("healthcare", "hospital", "clinic", "pharma", "patient", "medical")),
    ("Telecom", ("telecom", "telco", "network operator", "churn")),
    ("Energy / Utilities", ("energy", "utility", "utilities", "electricity", "power", "renewable")),
    ("Hospitality / Travel", ("hotel", "hospitality", "travel", "tourism", "airline")),
    ("Professional Services", ("consulting", "professional services", "agency", "legal", "accounting")),
)

SERVICE_RULES: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("Forecasting & Planning", ("forecast", "forecasting", "demand planning", "planning", "time series")),
    ("Optimization / Operations Research", ("optimization", "optimisation", "routing", "scheduling", "linear programming", "operations research", "vrp", "allocation")),
    ("Machine Learning / Predictive", ("machine learning", "predictive", "classification", "risk model", "propensity", "churn", "fraud detection")),
    ("AI Automation & Agents", ("agent", "agents", "automation", "llm", "generative ai", "workflow automation", "copilot")),
    ("Data Engineering", ("data engineering", "pipeline", "etl", "elt", "warehouse", "lakehouse", "data quality", "integration")),
    ("BI & Decision Intelligence", ("business intelligence", "dashboard", "reporting", "kpi", "decision intelligence", "analytics")),
    ("Pricing & Revenue", ("pricing", "price optimization", "revenue management", "margin", "promotion")),
    ("Finance Analytics / FP&A", ("fp&a", "cash flow", "p&l", "finance analytics", "financial model", "budget", "treasury")),
)


def _parse_date(value: Any) -> datetime | None:
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except (TypeError, ValueError):
        return None


def _normalise(value: Any) -> str:
    return " ".join(str(value or "").lower().replace("_", " ").split())


def _classify(text: str, rules: tuple[tuple[str, tuple[str, ...]], ...], fallback: str) -> str:
    haystack = _normalise(text)
    best = (0, fallback)
    for label, terms in rules:
        score = sum(2 if term in haystack else 0 for term in terms)
        if score > best[0]:
            best = (score, label)
    return best[1]


def classify_industry(row: dict[str, Any]) -> str:
    explicit = str(row.get("industry") or "").strip()
    if explicit:
        return explicit
    text = " ".join([
        str(row.get("title") or ""),
        str(row.get("body") or ""),
        str(row.get("challenge") or ""),
        str(row.get("audience") or ""),
    ])
    return _classify(text, INDUSTRY_RULES, "Cross-industry")


def classify_service(row: dict[str, Any]) -> str:
    text = " ".join([
        str(row.get("title") or ""),
        str(row.get("body") or ""),
        str(row.get("challenge") or ""),
        str(row.get("topic") or ""),
        str(row.get("content_family") or ""),
    ])
    return _classify(text, SERVICE_RULES, "Data & AI Strategy")


def _portfolio(rows: list[dict[str, Any]], days: int) -> dict[str, Any]:
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    recent = [row for row in rows if (_parse_date(row.get("created_at")) or datetime.min.replace(tzinfo=timezone.utc)) >= cutoff]
    industries = Counter(classify_industry(row) for row in recent)
    services = Counter(classify_service(row) for row in recent)
    families = Counter(str(row.get("content_family") or "general") for row in recent)
    return {
        "days": days,
        "pieces": len(recent),
        "industries": [{"name": name, "count": count} for name, count in industries.most_common(8)],
        "services": [{"name": name, "count": count} for name, count in services.most_common(8)],
        "families": [{"name": name, "count": count} for name, count in families.most_common(8)],
    }


def _score(value: Any, fallback: float = 5.0) -> float:
    try:
        return round(max(0.0, min(10.0, float(value))), 1)
    except (TypeError, ValueError):
        return fallback


def build_content_proposals(*, focus: str = "", avoid: str = "", count: int = 3, history_days: int = 60) -> dict[str, Any]:
    store = get_store()
    content = sorted(store.list("content_items"), key=lambda row: str(row.get("created_at") or ""), reverse=True)
    cutoff = datetime.now(timezone.utc) - timedelta(days=max(7, min(history_days, 180)))
    history = [row for row in content if (_parse_date(row.get("created_at")) or datetime.min.replace(tzinfo=timezone.utc)) >= cutoff][:60]

    compact_history = [
        {
            "title": row.get("title"),
            "industry": classify_industry(row),
            "service": classify_service(row),
            "family": row.get("content_family"),
            "channel": row.get("channel"),
            "status": row.get("status"),
            "cta_type": row.get("cta_type"),
        }
        for row in history
    ]
    portfolio_30 = _portfolio(content, 30)
    portfolio_60 = _portfolio(content, 60)

    brain = load_brain([
        "company/services.md",
        "company/positioning.md",
        "commercial/icp.md",
        "content/content_strategy.md",
        "content/editorial_playbook.md",
    ])
    llm = get_llm(profile="balanced")
    target_count = max(1, min(int(count or 3), 6))
    result = llm.json(
        "You are the SC-Analytics content portfolio strategist. Plan ideas before any article or LinkedIn post is written. Return JSON only.",
        f"""Create exactly {target_count} genuinely different editorial proposals.

USER FOCUS: {focus or 'Open: choose the best underused opportunities'}
USER EXCLUSIONS: {avoid or 'None'}

The proposals must help generate commercial conversations without sounding like advertising. Start from a real business problem, show a defensible point of view, and make the next step natural (website, contact, service page or Calendly when appropriate).

Portfolio rules:
- Avoid semantic repetition with RECENT HISTORY, not only identical titles.
- Deliberately rotate INDUSTRY and SC-Analytics SERVICE when possible.
- Respect USER FOCUS strongly and USER EXCLUSIONS literally.
- Do not propose generic AI trend commentary.
- Do not invent client results, statistics or evidence.
- A proposal is an editorial direction, not finished copy.

For every proposal return:
- title
- hook: one concise opening angle
- industry
- service
- business_problem
- thesis
- recommended_format: linkedin_post | article | linkedin_and_article
- primary_language: es | en | ca
- cta: a natural commercial next step
- scores: repetition_risk, commercial_potential, cta_fit, evidenceability (0-10)
- rationale: one concise sentence explaining why this deserves to exist now

Scoring meaning:
- repetition_risk: 0 is fresh, 10 is highly repetitive (LOWER is better)
- commercial_potential: likelihood of attracting a qualified business conversation
- cta_fit: how naturally the topic can lead to a useful next step
- evidenceability: how realistically the final piece can be supported by credible evidence

RECENT PORTFOLIO 30 DAYS:
{portfolio_30}

RECENT PORTFOLIO 60 DAYS:
{portfolio_60}

RECENT HISTORY:
{compact_history}

BRAIN:
{brain}

Return {{"proposals": [...]}} only.
""",
    )

    proposals: list[dict[str, Any]] = []
    raw_items = result.get("proposals", []) if isinstance(result, dict) else []
    for index, item in enumerate(raw_items if isinstance(raw_items, list) else []):
        if not isinstance(item, dict):
            continue
        scores = item.get("scores") if isinstance(item.get("scores"), dict) else {}
        repetition = _score(scores.get("repetition_risk"), 5.0)
        commercial = _score(scores.get("commercial_potential"), 5.0)
        cta_fit = _score(scores.get("cta_fit"), 5.0)
        evidenceability = _score(scores.get("evidenceability"), 5.0)
        opportunity = round(commercial * 0.35 + cta_fit * 0.25 + evidenceability * 0.20 + (10.0 - repetition) * 0.20, 1)
        title = str(item.get("title") or f"Editorial proposal {index + 1}").strip()
        industry = str(item.get("industry") or "Cross-industry").strip()
        service = str(item.get("service") or "Data & AI Strategy").strip()
        problem = str(item.get("business_problem") or "").strip()
        thesis = str(item.get("thesis") or "").strip()
        avoid_note = avoid.strip()
        generation_hint = (
            f"Selected editorial proposal. Industry: {industry}. Service: {service}. "
            f"Title direction: {title}. Business problem: {problem}. Thesis: {thesis}. "
            f"Required focus: {focus.strip() or 'use this proposal exactly'}. "
            f"Avoid: {avoid_note or 'no additional exclusions'}."
        )
        proposals.append({
            "proposal_id": f"proposal_{index + 1}",
            "title": title,
            "hook": str(item.get("hook") or "").strip(),
            "industry": industry,
            "service": service,
            "business_problem": problem,
            "thesis": thesis,
            "recommended_format": str(item.get("recommended_format") or "linkedin_post"),
            "primary_language": str(item.get("primary_language") or "es"),
            "cta": str(item.get("cta") or "").strip(),
            "rationale": str(item.get("rationale") or "").strip(),
            "scores": {
                "repetition_risk": repetition,
                "commercial_potential": commercial,
                "cta_fit": cta_fit,
                "evidenceability": evidenceability,
                "opportunity": opportunity,
            },
            "generation_hint": generation_hint,
        })

    proposals.sort(key=lambda item: float((item.get("scores") or {}).get("opportunity", 0) or 0), reverse=True)
    return {
        "focus": focus,
        "avoid": avoid,
        "history_days": history_days,
        "portfolio_30d": portfolio_30,
        "portfolio_60d": portfolio_60,
        "proposals": proposals[:target_count],
    }
