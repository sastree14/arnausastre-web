from __future__ import annotations

from datetime import datetime, timezone

from .models import utc_now
from .storage import get_store


class WebsitePublishingError(RuntimeError):
    pass


SUPPORTED_WEB_LANGUAGES = {"es", "ca", "en"}


def _scheduled_is_due(item: dict) -> bool:
    value = str(item.get("scheduled_at") or "").strip()
    if not value:
        return True
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
        dt = dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt
        return dt <= datetime.now(timezone.utc)
    except ValueError:
        return False


def _article_family(item: dict) -> list[dict]:
    store = get_store()
    brief_id = str(item.get("brief_id") or "").strip()
    if not brief_id:
        return [item]
    rows = [
        row for row in store.filter("content_items", brief_id=brief_id)
        if row.get("content_type") == "article" and row.get("channel") == "website"
    ]
    return rows or [item]


def _family_contract(family: list[dict]) -> None:
    # Single-row historical articles predate the trilingual workflow and remain
    # publishable. Any generated family must be complete in ES/CA/EN.
    if len(family) <= 1:
        return
    languages = {str(row.get("language") or "").strip() for row in family}
    missing = sorted(SUPPORTED_WEB_LANGUAGES - languages)
    if missing:
        raise WebsitePublishingError(
            "Website article family is incomplete. Missing language variants: " + ", ".join(missing)
        )
    invalid = []
    for row in family:
        critique = dict(row.get("critique") or {})
        issues = list(critique.get("contract_issues") or [])
        if row.get("status") == "needs_review" or critique.get("contract_valid") is False or issues:
            invalid.append(str(row.get("language") or row.get("content_id") or "unknown"))
    if invalid:
        raise WebsitePublishingError(
            "Website article family needs review before publishing: " + ", ".join(sorted(invalid))
        )


def _shared_language_neutral_visual(family: list[dict]) -> dict | None:
    for row in family:
        strategy = dict(row.get("visual_strategy") or {})
        if row.get("visual_path") and strategy.get("language_neutral") is True:
            return {
                "visual_path": row.get("visual_path"),
                "visual_type": row.get("visual_type"),
                "visual_strategy": strategy,
                "visual_design_id": row.get("visual_design_id"),
            }
    return None


def publish_article(content_id: str, *, force: bool = False) -> dict:
    store = get_store()
    rows = store.filter("content_items", content_id=content_id)
    if not rows:
        raise WebsitePublishingError(f"Content item not found: {content_id}")
    item = rows[0]
    if item.get("content_type") != "article" or item.get("channel") != "website":
        raise WebsitePublishingError("Website publisher only accepts website articles")

    family = _article_family(item)
    _family_contract(family)

    if all(row.get("status") == "published" and row.get("published_at") for row in family):
        return {
            "content_id": content_id,
            "status": "already_published",
            "url": item.get("external_post_url"),
            "family_size": len(family),
        }

    if item.get("status") not in {"approved", "scheduled", "published"}:
        raise WebsitePublishingError("Selected article must be approved or scheduled before family publication")
    if not force and not _scheduled_is_due(item):
        return {"content_id": content_id, "status": "scheduled", "scheduled_at": item.get("scheduled_at")}

    approvals = [
        row for row in store.filter("approvals", target_id=content_id)
        if row.get("action_type") == "publish_article" and row.get("status") == "approved"
    ]
    if item.get("status") != "published" and not approvals:
        raise WebsitePublishingError("No approved website publication action exists")

    published_at = utc_now()
    slug = item.get("brief_id") or item.get("content_id")
    shared_visual = _shared_language_neutral_visual(family)
    published_variants = []

    for variant in family:
        language = str(variant.get("language") or "en").strip()
        url = f"/knowledge/{slug}/{language}" if len(family) > 1 and language in SUPPORTED_WEB_LANGUAGES else f"/knowledge/{slug}"
        changes = {
            "status": "published",
            "published_at": published_at,
            "scheduled_at": None,
            "external_post_url": url,
        }
        if shared_visual and not variant.get("visual_path"):
            changes.update(shared_visual)
        store.update("content_items", "content_id", variant["content_id"], changes)

        # The approval decision is made at family level. Sibling translation
        # approvals are closed together once all three pass the content contract.
        for approval in store.filter("approvals", target_id=variant["content_id"]):
            if approval.get("action_type") == "publish_article" and approval.get("status") in {"pending", "approved"}:
                store.update(
                    "approvals",
                    "approval_id",
                    approval["approval_id"],
                    {"status": "executed", "decided_at": approval.get("decided_at") or published_at, "executed_at": published_at},
                )
        published_variants.append({"content_id": variant["content_id"], "language": language, "url": url})

    return {
        "content_id": content_id,
        "status": "published",
        "url": next((row["url"] for row in published_variants if row["content_id"] == content_id), f"/knowledge/{slug}"),
        "published_at": published_at,
        "family_size": len(published_variants),
        "variants": published_variants,
    }


def unpublish_article(content_id: str) -> dict:
    store = get_store()
    rows = store.filter("content_items", content_id=content_id)
    if not rows:
        raise WebsitePublishingError(f"Content item not found: {content_id}")
    item = rows[0]
    if item.get("content_type") != "article" or item.get("channel") != "website":
        raise WebsitePublishingError("Website unpublisher only accepts website articles")
    family = _article_family(item)
    for variant in family:
        store.update(
            "content_items",
            "content_id",
            variant["content_id"],
            {"status": "unpublished", "published_at": None, "external_post_url": None, "scheduled_at": None},
        )
    return {"content_id": content_id, "status": "unpublished", "public_removed": True, "family_size": len(family)}


def publish_due_articles(limit: int = 20) -> list[dict]:
    store = get_store()
    candidates = [
        row for row in store.list("content_items")
        if row.get("content_type") == "article"
        and row.get("channel") == "website"
        and row.get("status") == "scheduled"
        and _scheduled_is_due(row)
    ][:limit]
    results = []
    processed_families: set[str] = set()
    for item in candidates:
        family_key = str(item.get("brief_id") or item.get("content_id"))
        if family_key in processed_families:
            continue
        processed_families.add(family_key)
        try:
            results.append(publish_article(item["content_id"]))
        except Exception as exc:
            results.append({"content_id": item.get("content_id"), "status": "failed", "error": str(exc)})
    return results
