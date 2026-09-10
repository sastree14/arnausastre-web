from __future__ import annotations

from datetime import date, timedelta

from .brain import load_brain
from .config import load_config
from .llm import get_llm
from .models import Task, WeeklyPlan, new_id, to_dict
from .storage import get_store


def monday_for(day: date) -> date:
    return day - timedelta(days=day.weekday())


def _recent_state() -> dict:
    store = get_store()
    content = sorted(store.list("content_items"), key=lambda r: r.get("created_at", ""), reverse=True)[:20]
    companies = sorted(store.list("companies"), key=lambda r: float(r.get("score", 0) or 0), reverse=True)[:20]
    metrics = sorted(store.list("metrics"), key=lambda r: r.get("metric_date", ""), reverse=True)[:50]
    approvals = [a for a in store.list("approvals") if a.get("status") == "pending"][:20]
    return {
        "recent_content": [
            {
                "title": c.get("title"),
                "channel": c.get("channel"),
                "objective": c.get("objective"),
                "source_case": c.get("source_case"),
                "status": c.get("status"),
            }
            for c in content
        ],
        "top_company_candidates": [
            {
                "name": c.get("name"),
                "fit_type": c.get("fit_type"),
                "industry": c.get("industry"),
                "score": c.get("score"),
                "status": c.get("status"),
            }
            for c in companies
        ],
        "recent_metrics": metrics,
        "pending_approval_count": len(approvals),
    }


def build_weekly_plan(today: date | None = None) -> WeeklyPlan:
    today = today or date.today()
    week_start = monday_for(today)
    cfg = load_config()
    brain = load_brain([
        "company/identity.md",
        "company/positioning.md",
        "company/services.md",
        "company/principles.md",
        "commercial/icp.md",
        "commercial/channels.md",
        "content/content_strategy.md",
    ])
    state = _recent_state()
    llm = get_llm(high_reasoning=True)
    prompt = f"""Create the weekly growth plan for SC-Analytics for week starting {week_start.isoformat()}.
Use the company Brain and LIVE STATE below. The plan must prioritize qualified commercial conversations,
credible authority and follow-through, not vanity metrics.

Return JSON with keys: primary_goal, commercial_focus, content_focus, targets.
commercial_focus must include channel, industries, target_roles and rationale.
content_focus must include themes, target_audience and objective.
targets must include companies_researched, qualified_companies, outreach_candidates, content_items.

Rules:
- Do not fabricate pipeline facts or metrics not in LIVE STATE.
- Avoid repeating recently published themes unless repetition is strategically justified.
- If there are many pending approvals, reduce new output and prioritize review/follow-through.
- Prefer partnerships when no stronger signal exists, but adapt to live evidence.
- Keep content_items between 1 and {cfg['growth']['max_posts_per_week']}.

CONFIG DEFAULTS:
{cfg['growth']}

LIVE STATE:
{state}

BRAIN:
{brain}
"""
    plan_data = llm.json("You are the senior growth strategist for SC-Analytics.", prompt)

    tasks: list[dict] = []
    schedule = [
        (0, "WEEKLY_STRATEGY", False, {}),
        (1, "PROSPECT_RESEARCH", False, {"mode": "lead"}),
        (2, "CONTENT_CREATE", True, {"channel": "arnau_linkedin"}),
        (3, "PARTNER_RESEARCH", False, {"mode": "partner"}),
        (4, "CONTENT_CREATE", True, {"channel": "sc_analytics_linkedin"}),
        (4, "WEEKLY_REVIEW", False, {}),
    ]
    requested_content = int(plan_data.get("targets", {}).get("content_items", 2) or 2)
    requested_content = max(1, min(requested_content, int(cfg["growth"]["max_posts_per_week"])))
    content_seen = 0
    for offset, task_type, approval, inputs in schedule:
        if task_type == "CONTENT_CREATE":
            content_seen += 1
            if content_seen > requested_content:
                continue
        task = Task(
            task_id=new_id("task"),
            type=task_type,
            scheduled_for=(week_start + timedelta(days=offset)).isoformat(),
            requires_approval=approval,
            inputs=inputs,
        )
        tasks.append(to_dict(task))

    return WeeklyPlan(
        plan_id=new_id("plan"),
        tenant_id=cfg["company"]["tenant_id"],
        week_start=week_start.isoformat(),
        primary_goal=plan_data.get("primary_goal", "Generate qualified commercial conversations"),
        commercial_focus=plan_data.get("commercial_focus", {}),
        content_focus=plan_data.get("content_focus", {}),
        targets=plan_data.get("targets", {}),
        tasks=tasks,
    )
