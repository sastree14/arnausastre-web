from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from .editorial_ops import rewrite_content
from .editorial_planner import build_content_proposals
from .editorial_runtime import editorial_from_url, run_editorial_cycle
from .prospecting import research_companies
from .publishing import publish_content
from .storage import get_store
from .website_publishing import publish_article

OPERATOR_TYPES = {
    "OPERATOR_EDITORIAL_PROPOSALS",
    "OPERATOR_EDITORIAL_RUN",
    "OPERATOR_EDITORIAL_URL",
    "OPERATOR_REWRITE_CONTENT",
    "OPERATOR_PROSPECT",
    "OPERATOR_PUBLISH_LINKEDIN",
    "OPERATOR_PUBLISH_ARTICLE",
}


def _due(value: str | None) -> bool:
    if not value:
        return True
    try:
        dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt <= datetime.now(timezone.utc)
    except ValueError:
        return True


def _bool(value: Any) -> bool:
    return str(value or "").strip().lower() in {"1", "true", "yes", "on"}


def _execute(task: dict[str, Any]) -> Any:
    task_type = str(task.get("type") or "")
    inputs = dict(task.get("inputs") or {})
    if task_type == "OPERATOR_EDITORIAL_PROPOSALS":
        return build_content_proposals(
            focus=str(inputs.get("focus") or "").strip(),
            avoid=str(inputs.get("avoid") or "").strip(),
            count=int(inputs.get("count", 3) or 3),
            history_days=int(inputs.get("history_days", 60) or 60),
        )
    if task_type == "OPERATOR_EDITORIAL_RUN":
        return run_editorial_cycle(
            max_signals=int(inputs.get("max_signals", 30) or 30),
            max_briefs=int(inputs.get("max_briefs", 1) or 1),
            theme_hint=str(inputs.get("theme_hint") or ""),
            strict_theme=_bool(inputs.get("strict_theme")),
            force_new=_bool(inputs.get("force_new")),
        )
    if task_type == "OPERATOR_EDITORIAL_URL":
        url = str(inputs.get("url") or "").strip()
        if not url:
            raise ValueError("Missing URL")
        return editorial_from_url(
            url,
            title=str(inputs.get("title") or ""),
            snippet=str(inputs.get("snippet") or ""),
            generate=True,
        )
    if task_type == "OPERATOR_REWRITE_CONTENT":
        return rewrite_content(str(inputs.get("content_id") or ""))
    if task_type == "OPERATOR_PROSPECT":
        return research_companies(str(inputs.get("mode") or "lead"), int(inputs.get("limit", 10) or 10))
    if task_type == "OPERATOR_PUBLISH_LINKEDIN":
        return publish_content(str(inputs.get("content_id") or ""))
    if task_type == "OPERATOR_PUBLISH_ARTICLE":
        return publish_article(str(inputs.get("content_id") or ""), force=True)
    raise ValueError(f"Unsupported operator task: {task_type}")


def run_operator_queue(limit: int = 10) -> list[dict[str, Any]]:
    store = get_store()
    pending = [
        row for row in store.list("tasks")
        if row.get("type") in OPERATOR_TYPES
        and row.get("status") in {"pending", "queued"}
        and _due(row.get("scheduled_for"))
    ][:limit]
    results: list[dict[str, Any]] = []
    for task in pending:
        task_id = task["task_id"]
        store.update("tasks", "task_id", task_id, {"status": "running"})
        try:
            output = _execute(task)
            store.update("tasks", "task_id", task_id, {"status": "completed", "outputs": output})
            results.append({"task_id": task_id, "status": "completed", "output": output})
        except Exception as exc:
            output = {"error": str(exc)}
            store.update("tasks", "task_id", task_id, {"status": "failed", "outputs": output})
            results.append({"task_id": task_id, "status": "failed", "error": str(exc)})
    return results
