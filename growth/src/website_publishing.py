from __future__ import annotations

from datetime import datetime, timezone

from .models import utc_now
from .storage import get_store


class WebsitePublishingError(RuntimeError):
    pass


def _scheduled_is_due(item: dict) -> bool:
    value = str(item.get("scheduled_at") or "").strip()
    if not value:
        return True
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt <= datetime.now(timezone.utc)
    except ValueError:
        return False


def publish_article(content_id: str, *, force: bool = False) -> dict:
    store = get_store()
    rows = store.filter("content_items", content_id=content_id)
    if not rows:
        raise WebsitePublishingError(f"Content item not found: {content_id}")
    item = rows[0]
    if item.get("content_type") != "article" or item.get("channel") != "website":
        raise WebsitePublishingError("Website publisher only accepts website articles")
    if item.get("status") == "published":
        return {"content_id": content_id, "status": "already_published", "url": item.get("external_post_url")}
    if item.get("status") not in {"approved", "scheduled"}:
        raise WebsitePublishingError("Article must be approved or scheduled before publication")
    if not force and not _scheduled_is_due(item):
        return {"content_id": content_id, "status": "scheduled", "scheduled_at": item.get("scheduled_at")}

    approvals = [
        row for row in store.filter("approvals", target_id=content_id)
        if row.get("action_type") == "publish_article" and row.get("status") == "approved"
    ]
    if not approvals:
        raise WebsitePublishingError("No approved website publication action exists")

    published_at = utc_now()
    slug = item.get("brief_id") or item.get("content_id")
    public_url = f"/knowledge/{slug}"
    store.update(
        "content_items",
        "content_id",
        content_id,
        {
            "status": "published",
            "published_at": published_at,
            "external_post_url": public_url,
        },
    )
    for approval in approvals:
        store.update(
            "approvals",
            "approval_id",
            approval["approval_id"],
            {"status": "executed", "executed_at": published_at},
        )
    return {"content_id": content_id, "status": "published", "url": public_url, "published_at": published_at}


def publish_due_articles(limit: int = 20) -> list[dict]:
    store = get_store()
    candidates = [
        row for row in store.list("content_items")
        if row.get("content_type") == "article"
        and row.get("channel") == "website"
        and row.get("status") == "scheduled"
        and _scheduled_is_due(row)
    ][:limit]
    results: list[dict] = []
    for item in candidates:
        try:
            results.append(publish_article(item["content_id"]))
        except Exception as exc:
            results.append({"content_id": item.get("content_id"), "status": "failed", "error": str(exc)})
    return results
