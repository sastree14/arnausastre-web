from __future__ import annotations

from datetime import date

from .brief import build_brief
from .content import create_content_from_case
from .models import to_dict
from .prospecting import research_companies
from .storage import get_store
from .strategy import build_weekly_plan

DEFAULT_CONTENT_CASE = "ecommerce-demand-forecasting"


def ensure_weekly_plan(today: date | None = None) -> dict:
    today = today or date.today()
    store = get_store()
    existing = [p for p in store.list("weekly_plans") if p.get("week_start") == (today.isoformat() if today.weekday() == 0 else None)]
    if existing:
        return existing[0]
    plan = build_weekly_plan(today)
    plan_dict = to_dict(plan)
    store.upsert("weekly_plans", plan_dict, key="week_start")
    for task in plan.tasks:
        store.upsert("tasks", task, key="task_id")
    return plan_dict


def run_day(today: date | None = None) -> dict:
    today = today or date.today()
    store = get_store()
    plans = sorted(store.list("weekly_plans"), key=lambda p: p.get("week_start", ""), reverse=True)
    if not plans or today.weekday() == 0:
        ensure_weekly_plan(today)
    due = [
        t for t in store.list("tasks")
        if t.get("scheduled_for") == today.isoformat() and t.get("status") == "pending"
    ]
    results = []
    for task in due:
        task_type = task.get("type")
        try:
            if task_type == "PROSPECT_RESEARCH":
                result = research_companies("lead", limit=10)
            elif task_type == "PARTNER_RESEARCH":
                result = research_companies("partner", limit=10)
            elif task_type == "CONTENT_CREATE":
                result = create_content_from_case(DEFAULT_CONTENT_CASE)
            elif task_type in {"WEEKLY_STRATEGY", "WEEKLY_REVIEW"}:
                result = {"brief": build_brief(today)}
            else:
                result = {"skipped": f"No executor for {task_type}"}
            store.update("tasks", "task_id", task["task_id"], {"status": "completed", "outputs": result})
            results.append({"task_id": task["task_id"], "ok": True, "result": result})
        except Exception as exc:
            store.update("tasks", "task_id", task["task_id"], {"status": "failed", "outputs": {"error": str(exc)}})
            results.append({"task_id": task["task_id"], "ok": False, "error": str(exc)})
    return {"date": today.isoformat(), "executed": len(results), "results": results, "brief": build_brief(today)}
