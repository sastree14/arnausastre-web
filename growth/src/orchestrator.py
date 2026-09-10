from __future__ import annotations

from datetime import date, timedelta
from pathlib import Path

from .brief import build_brief
from .content import create_content_from_case
from .llm import get_llm
from .models import to_dict
from .prospecting import research_companies
from .storage import get_store
from .strategy import build_weekly_plan

REPO_ROOT = Path(__file__).resolve().parents[2]
PROJECTS_DIR = REPO_ROOT / "content" / "projects"


def _week_start(today: date) -> str:
    return (today - timedelta(days=today.weekday())).isoformat()


def ensure_weekly_plan(today: date | None = None) -> dict:
    today = today or date.today()
    store = get_store()
    start = _week_start(today)
    existing = [p for p in store.list("weekly_plans") if p.get("week_start") == start]
    if existing:
        return existing[0]
    plan = build_weekly_plan(today)
    plan_dict = to_dict(plan)
    store.upsert("weekly_plans", plan_dict, key="tenant_id,week_start")
    for task in plan.tasks:
        task["tenant_id"] = plan.tenant_id
        store.upsert("tasks", task, key="task_id")
    return plan_dict


def _select_case(plan: dict) -> str:
    slugs = [p.name for p in PROJECTS_DIR.iterdir() if p.is_dir() and (p / "project.txt").exists()]
    if not slugs:
        raise RuntimeError("No published case source directories are available")
    llm = get_llm()
    choice = llm.json(
        "Choose the most commercially aligned real case for this week's content. Return JSON only.",
        f"""Available case slugs: {slugs}
Weekly content focus: {plan.get('content_focus', {})}
Weekly commercial focus: {plan.get('commercial_focus', {})}
Return an object with key `case_slug` using exactly one available slug. Prefer alignment with the audience and commercial focus; do not choose randomly.""",
    )
    slug = str(choice.get("case_slug", ""))
    return slug if slug in slugs else slugs[0]


def run_day(today: date | None = None) -> dict:
    today = today or date.today()
    store = get_store()
    plan = ensure_weekly_plan(today)
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
                case_slug = _select_case(plan)
                result = create_content_from_case(case_slug)
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
