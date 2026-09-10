from __future__ import annotations

from datetime import date, timedelta

from .brain import load_brain
from .config import load_config
from .llm import get_llm
from .models import new_id, utc_now
from .storage import get_store


def review_week(today: date | None = None) -> dict:
    today = today or date.today()
    cfg = load_config()
    tenant_id = cfg["company"]["tenant_id"]
    start = today - timedelta(days=today.weekday())
    store = get_store()

    metrics = [m for m in store.list("metrics") if str(m.get("metric_date", "")) >= start.isoformat()]
    interactions = [i for i in store.list("interactions") if str(i.get("occurred_at", ""))[:10] >= start.isoformat()]
    content = [c for c in store.list("content_items") if str(c.get("created_at", ""))[:10] >= start.isoformat()]
    companies = [c for c in store.list("companies") if str(c.get("created_at", ""))[:10] >= start.isoformat()]
    approvals = [a for a in store.list("approvals") if str(a.get("created_at", ""))[:10] >= start.isoformat()]

    evidence = {
        "metrics": metrics,
        "interaction_count": len(interactions),
        "interactions": interactions[:30],
        "content": [
            {"title": c.get("title"), "channel": c.get("channel"), "status": c.get("status"), "source_case": c.get("source_case")}
            for c in content
        ],
        "new_company_candidates": len(companies),
        "qualified_companies": len([c for c in companies if float(c.get("score", 0) or 0) >= 7.5]),
        "approvals": {status: len([a for a in approvals if a.get("status") == status]) for status in ("pending", "approved", "rejected", "executed")},
    }

    brain = load_brain(["commercial/channels.md", "content/content_strategy.md", "company/principles.md"])
    review = get_llm(high_reasoning=True).json(
        "You are the SC-Analytics growth review analyst. Be empirical and do not invent performance.",
        f"""Review this week's growth execution. Return JSON with:
summary, what_worked (array), what_did_not_work (array), signals (array), next_week_recommendations (array), data_gaps (array).
If metrics are insufficient, state that explicitly rather than implying performance. Prioritize commercial conversations and qualified opportunities over likes or impressions.

WEEK: {start.isoformat()}
EVIDENCE: {evidence}
BRAIN: {brain}
""",
    )
    row = {
        "review_id": new_id("review"),
        "tenant_id": tenant_id,
        "week_start": start.isoformat(),
        "review": review,
        "evidence_snapshot": evidence,
        "created_at": utc_now(),
    }
    store.upsert("weekly_reviews", row, key="tenant_id,week_start")
    return row
