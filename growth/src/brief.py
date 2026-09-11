from __future__ import annotations

from datetime import date

from .approvals import list_pending
from .storage import get_store


def build_brief(today: date | None = None) -> str:
    today = today or date.today()
    store = get_store()
    plans = sorted(store.list("weekly_plans"), key=lambda r: r.get("week_start", ""), reverse=True)
    current = plans[0] if plans else None
    companies = [c for c in store.list("companies") if c.get("status") == "candidate"]
    pending = list_pending()
    due_tasks = [
        t for t in store.list("tasks")
        if t.get("scheduled_for") == today.isoformat() and t.get("status") == "pending"
    ]

    lines = [f"SC-ANALYTICS GROWTH BRIEF — {today.isoformat()}", ""]
    if current:
        lines += [f"Weekly goal: {current.get('primary_goal', '')}", ""]
    else:
        lines += ["Weekly goal: no active plan yet — run plan-week.", ""]
    lines.append(f"Due tasks: {len(due_tasks)}")
    for task in due_tasks:
        lines.append(f"- {task.get('type')} [{task.get('task_id')}]")
    lines.append("")
    lines.append(f"Company candidates in state: {len(companies)}")
    lines.append(f"Pending approvals: {len(pending)}")
    for approval in pending[:10]:
        lines.append(f"- {approval.get('approval_id')}: {approval.get('summary')}")
    return "\n".join(lines)
