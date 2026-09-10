from __future__ import annotations

from datetime import date, timedelta

from .brain import load_brain
from .config import load_config
from .llm import get_llm
from .models import Task, WeeklyPlan, new_id, to_dict


def monday_for(day: date) -> date:
    return day - timedelta(days=day.weekday())


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
    ])
    llm = get_llm(high_reasoning=True)
    prompt = f"""Create the weekly growth plan for SC-Analytics for week starting {week_start.isoformat()}.
Use the company Brain below. The plan must prioritize qualified commercial conversations, not vanity metrics.
Return JSON with keys: primary_goal, commercial_focus, content_focus, targets.
commercial_focus must include channel, industries, target_roles and rationale.
content_focus must include themes, target_audience and objective.
targets must include companies_researched, qualified_companies, outreach_candidates, content_items.
Do not fabricate current pipeline facts; when no live metrics are supplied, choose sensible baseline targets from the configuration.

CONFIG DEFAULTS:
{cfg['growth']}

BRAIN:
{brain}
"""
    plan_data = llm.json("You are the senior growth strategist for SC-Analytics.", prompt)

    tasks = []
    schedule = [
        (0, "WEEKLY_STRATEGY", False),
        (1, "PROSPECT_RESEARCH", False),
        (2, "CONTENT_CREATE", True),
        (3, "PARTNER_RESEARCH", False),
        (4, "WEEKLY_REVIEW", False),
    ]
    for offset, task_type, approval in schedule:
        tasks.append(to_dict(Task(
            task_id=new_id("task"),
            type=task_type,
            scheduled_for=(week_start + timedelta(days=offset)).isoformat(),
            requires_approval=approval,
        )))

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
