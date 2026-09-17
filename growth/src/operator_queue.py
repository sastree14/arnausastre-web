from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from .commercial_intelligence import run_commercial_signal_scan
from .competitive_intelligence import discover_competitors, refresh_competitor, refresh_monitored_competitors
from .content_engagement import enrich_generated_content
from .deal_desk_ops import generate_deal_budget, generate_deal_proposal
from .editorial_library import build_research_aware_proposals, run_editorial_with_library
from .editorial_ops import rewrite_content
from .editorial_runtime import editorial_from_url
from .gmail_sync import sync_gmail
from .prospecting import research_companies
from .publishing import delete_linkedin_post, publish_content
from .seo_ops import run_seo_audit
from .storage import get_store
from .text_safety import sanitize_content_item, sanitize_generated_content
from .visual_generation import generate_contextual_visual
from .website_publishing import publish_article, unpublish_article

OPERATOR_TYPES = {
    "OPERATOR_EDITORIAL_PROPOSALS", "OPERATOR_EDITORIAL_RUN", "OPERATOR_EDITORIAL_URL",
    "OPERATOR_REWRITE_CONTENT", "OPERATOR_GENERATE_VISUAL", "OPERATOR_PROSPECT", "OPERATOR_COMMERCIAL_SIGNALS",
    "OPERATOR_COMPETITOR_DISCOVER", "OPERATOR_COMPETITOR_REFRESH", "OPERATOR_COMPETITOR_REFRESH_ALL",
    "OPERATOR_PUBLISH_LINKEDIN", "OPERATOR_PUBLISH_ARTICLE", "OPERATOR_UNPUBLISH_LINKEDIN",
    "OPERATOR_UNPUBLISH_ARTICLE", "OPERATOR_DEAL_PROPOSAL", "OPERATOR_DEAL_BUDGET",
    "OPERATOR_GMAIL_SYNC", "OPERATOR_SEO_AUDIT",
}

STALE_RUNNING_MINUTES = 35


def _parse_time(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return parsed.replace(tzinfo=timezone.utc) if parsed.tzinfo is None else parsed.astimezone(timezone.utc)
    except ValueError:
        return None


def _due(value: str | None) -> bool:
    parsed = _parse_time(value)
    return parsed is None or parsed <= datetime.now(timezone.utc)


def _bool(value: Any) -> bool:
    return str(value or "").strip().lower() in {"1", "true", "yes", "on"}


def _execute(task: dict[str, Any]) -> Any:
    task_type = str(task.get("type") or "")
    inputs = dict(task.get("inputs") or {})
    if task_type == "OPERATOR_EDITORIAL_PROPOSALS":
        return build_research_aware_proposals(focus=str(inputs.get("focus") or "").strip(), avoid=str(inputs.get("avoid") or "").strip(), count=int(inputs.get("count", 3) or 3), history_days=int(inputs.get("history_days", 60) or 60))
    if task_type == "OPERATOR_EDITORIAL_RUN":
        return run_editorial_with_library(
            research_brief_id=str(inputs.get("research_brief_id") or "").strip(),
            max_signals=int(inputs.get("max_signals", 30) or 30),
            max_briefs=int(inputs.get("max_briefs", 1) or 1),
            theme_hint=str(inputs.get("theme_hint") or ""),
            avoid=str(inputs.get("avoid") or ""),
            strict_theme=_bool(inputs.get("strict_theme")),
            force_new=_bool(inputs.get("force_new")),
            recommended_format=str(inputs.get("recommended_format") or "").strip(),
        )
    if task_type == "OPERATOR_EDITORIAL_URL":
        url = str(inputs.get("url") or "").strip()
        if not url:
            raise ValueError("Missing URL")
        return editorial_from_url(url, title=str(inputs.get("title") or ""), snippet=str(inputs.get("snippet") or ""), generate=True)
    if task_type == "OPERATOR_REWRITE_CONTENT":
        return rewrite_content(str(inputs.get("content_id") or ""))
    if task_type == "OPERATOR_GENERATE_VISUAL":
        return generate_contextual_visual(
            str(inputs.get("content_id") or ""),
            concept=str(inputs.get("concept") or ""),
            theme=str(inputs.get("theme") or ""),
        )
    if task_type == "OPERATOR_PROSPECT":
        return research_companies(str(inputs.get("mode") or "lead"), int(inputs.get("limit", 10) or 10))
    if task_type == "OPERATOR_COMMERCIAL_SIGNALS":
        return run_commercial_signal_scan(int(inputs.get("limit", 12) or 12))
    if task_type == "OPERATOR_COMPETITOR_DISCOVER":
        return discover_competitors(limit=int(inputs.get("limit", 8) or 8), focus=str(inputs.get("focus") or "").strip())
    if task_type == "OPERATOR_COMPETITOR_REFRESH":
        competitor_id = str(inputs.get("competitor_id") or "").strip()
        if not competitor_id:
            raise ValueError("Missing competitor_id")
        return refresh_competitor(competitor_id, int(inputs.get("max_events", 8) or 8))
    if task_type == "OPERATOR_COMPETITOR_REFRESH_ALL":
        return refresh_monitored_competitors(int(inputs.get("limit", 20) or 20))
    if task_type == "OPERATOR_DEAL_PROPOSAL":
        return generate_deal_proposal(str(inputs.get("opportunity_id") or ""))
    if task_type == "OPERATOR_DEAL_BUDGET":
        return generate_deal_budget(str(inputs.get("opportunity_id") or ""))
    if task_type == "OPERATOR_GMAIL_SYNC":
        return sync_gmail(int(inputs.get("limit", 50) or 50), int(inputs.get("newer_than_days", 14) or 14))
    if task_type == "OPERATOR_SEO_AUDIT":
        return run_seo_audit(int(inputs.get("limit", 6) or 6))
    if task_type == "OPERATOR_UNPUBLISH_LINKEDIN":
        return delete_linkedin_post(str(inputs.get("content_id") or ""))
    if task_type == "OPERATOR_UNPUBLISH_ARTICLE":
        return unpublish_article(str(inputs.get("content_id") or ""))
    if task_type == "OPERATOR_PUBLISH_LINKEDIN":
        content_id = str(inputs.get("content_id") or "")
        sanitize_content_item(content_id)
        return publish_content(content_id)
    if task_type == "OPERATOR_PUBLISH_ARTICLE":
        content_id = str(inputs.get("content_id") or "")
        sanitize_content_item(content_id)
        return publish_article(content_id, force=True)
    raise ValueError(f"Unsupported operator task: {task_type}")


def _run_one(store: Any, task: dict[str, Any]) -> dict[str, Any]:
    task_id = str(task.get("task_id") or "")
    if task.get("type") not in OPERATOR_TYPES:
        return {"task_id": task_id, "status": "skipped", "reason": "unsupported"}
    if task.get("status") not in {"pending", "queued"}:
        return {"task_id": task_id, "status": "skipped", "reason": f"status:{task.get('status')}"}
    if not _due(task.get("scheduled_for")):
        return {"task_id": task_id, "status": "skipped", "reason": "not_due"}
    store.update("tasks", "task_id", task_id, {"status": "running"})
    try:
        output = _execute(task)
        task_type = str(task.get("type") or "")
        inputs = dict(task.get("inputs") or {})
        sanitized = sanitize_generated_content(task_type, inputs, output)
        enriched = enrich_generated_content(task_type, inputs, output)
        if isinstance(output, dict):
            if sanitized:
                output = {**output, "sanitized_content_ids": sanitized}
            if enriched:
                output = {**output, "engagement_enriched_content_ids": enriched}
        store.update("tasks", "task_id", task_id, {"status": "completed", "outputs": output})
        return {"task_id": task_id, "status": "completed", "output": output}
    except Exception as exc:
        output = {"error": str(exc)}
        store.update("tasks", "task_id", task_id, {"status": "failed", "outputs": output})
        return {"task_id": task_id, "status": "failed", "error": str(exc)}


def _recover_stale_running(store: Any, row: dict[str, Any], now: datetime) -> dict[str, Any] | None:
    if row.get("status") != "running":
        return row
    created = _parse_time(row.get("created_at"))
    if created is None or created > now - timedelta(minutes=STALE_RUNNING_MINUTES):
        return None
    outputs = dict(row.get("outputs") or {})
    outputs["recovery"] = {
        "reason": "stale_running_timeout",
        "previous_status": "running",
        "recovered_at": now.isoformat().replace("+00:00", "Z"),
        "stale_after_minutes": STALE_RUNNING_MINUTES,
    }
    store.update("tasks", "task_id", str(row.get("task_id") or ""), {"status": "queued", "outputs": outputs})
    return {**row, "status": "queued", "outputs": outputs}


def run_operator_queue(task_id: str | None = None, *, recovery: bool = False, limit: int = 10, recovery_minutes: int = 10080) -> list[dict[str, Any]]:
    store = get_store()
    if task_id:
        rows = store.filter("tasks", task_id=task_id)
        if not rows:
            return [{"task_id": task_id, "status": "failed", "error": "Task not found"}]
        return [_run_one(store, rows[0])]
    if not recovery:
        raise ValueError("run_operator_queue requires task_id unless recovery=True")

    # Reliability sweep: recover due tasks created during the last seven days by
    # default. Runs that have remained `running` longer than the GitHub job timeout
    # are first returned to `queued`, so a killed runner cannot strand CRM work.
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(minutes=max(1, recovery_minutes))
    pending: list[dict[str, Any]] = []
    for raw in store.list("tasks"):
        if raw.get("type") not in OPERATOR_TYPES or not _due(raw.get("scheduled_for")):
            continue
        row = _recover_stale_running(store, raw, now)
        if row is None or row.get("status") not in {"pending", "queued"}:
            continue
        created = _parse_time(row.get("created_at")) or _parse_time(row.get("scheduled_for"))
        if created is None or created < cutoff:
            continue
        pending.append(row)
    pending.sort(key=lambda row: str(row.get("created_at") or row.get("scheduled_for") or ""))
    return [_run_one(store, task) for task in pending[:limit]]
