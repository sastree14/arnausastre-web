from __future__ import annotations

from typing import Any

from . import editorial_runtime as runtime
from .models import ApprovalItem, new_id, to_dict
from .storage import get_store

VISUAL_REQUIRED_MODES = {"text_with_visual", "visual_first", "image_only"}


def _primary_variant(item: dict[str, Any], brief: dict[str, Any]) -> bool:
    if item.get("content_type") == "article":
        return True
    return str(item.get("language") or "") == str(brief.get("primary_linkedin_language") or "es")


def _ready_for_approval(item: dict[str, Any], brief: dict[str, Any]) -> tuple[bool, list[str]]:
    critique = dict(item.get("critique") or {})
    issues: list[str] = []
    if critique.get("contract_valid") is False:
        issues.append("contract_invalid")
    if critique.get("rewrite_required") is True:
        issues.append("rewrite_required")
    if float(item.get("quality_score", 0) or 0) < 7.5:
        issues.append("quality_below_threshold")
    needs_visual = bool((brief.get("visual") or {}).get("needed"))
    mode = str(item.get("publication_mode") or "text_only")
    if item.get("content_type") == "linkedin_post" and mode in VISUAL_REQUIRED_MODES:
        needs_visual = True
    if needs_visual and not item.get("visual_path"):
        issues.append("visual_required")
    if not _primary_variant(item, brief):
        issues.append("not_primary_variant")
    return not issues, issues


def _create_approval(item: dict[str, Any], brief: dict[str, Any]) -> str:
    store = get_store()
    approval_type = "publish_post" if item.get("content_type") == "linkedin_post" else "publish_article"
    approval = ApprovalItem(
        approval_id=new_id("approval"),
        tenant_id=item["tenant_id"],
        action_type=approval_type,
        target_id=item["content_id"],
        summary=("Approve LinkedIn post" if approval_type == "publish_post" else "Approve website article") + f": {item.get('title', '')}",
        payload={
            "content_id": item["content_id"],
            "brief_id": brief.get("brief_id"),
            "language": item.get("language"),
            "family": brief.get("family"),
            "title": item.get("title"),
            "body": item.get("body"),
            "visual_type": item.get("visual_type", "none"),
            "visual_path": item.get("visual_path", ""),
            "quality_score": item.get("quality_score", 0),
            "critique": item.get("critique") or {},
            "source_urls": (brief.get("research") or {}).get("source_urls", []),
            "evidence_ids": item.get("evidence_ids") or [],
            "execution_mode": "official_api_when_configured" if approval_type == "publish_post" else "website_publish_after_approval",
        },
    )
    store.insert("approvals", to_dict(approval))
    return approval.approval_id


def rewrite_content(content_id: str) -> dict[str, Any]:
    store = get_store()
    rows = store.filter("content_items", content_id=content_id)
    if not rows:
        raise ValueError(f"Content item not found: {content_id}")
    item = dict(rows[0])
    brief_id = str(item.get("brief_id") or "")
    briefs = store.filter("editorial_briefs", brief_id=brief_id) if brief_id else []
    if not briefs:
        raise ValueError("Editorial brief not found for content item")
    brief = dict(briefs[0])

    language = str(item.get("language") or "es")
    channel = str(item.get("channel") or "website")
    content_type = str(item.get("content_type") or "")
    critique = dict(item.get("critique") or {})
    draft = {"title": item.get("title", ""), "body": item.get("body", "")}

    rewritten = runtime._rewrite_variant(
        brief,
        draft,
        critique,
        language=language,
        channel=channel,
        content_type=content_type,
    )
    next_critique = runtime._critic(
        brief,
        rewritten,
        language=language,
        channel=channel,
        content_type=content_type,
    )
    quality = float(next_critique.get("quality_score", 0) or 0)
    contract_issues = runtime.content_contract_issues(rewritten, content_type)
    next_critique = dict(next_critique or {})
    next_critique["contract_valid"] = not contract_issues
    next_critique["contract_issues"] = contract_issues
    if contract_issues:
        next_critique["rewrite_required"] = True
        quality = min(quality, 7.4)

    status = "draft" if content_type == "article" or _primary_variant(item, brief) else "alternate"
    if next_critique.get("rewrite_required") or contract_issues or quality < 7.5:
        status = "needs_review"

    for approval in store.filter("approvals", target_id=content_id):
        if approval.get("status") in {"pending", "approved"}:
            payload = dict(approval.get("payload") or {})
            payload["invalidated_reason"] = "content_rewritten"
            store.update(
                "approvals",
                "approval_id",
                approval["approval_id"],
                {"status": "rejected", "payload": payload, "decided_at": runtime.base._utc_now()},
            )

    updated = store.update(
        "content_items",
        "content_id",
        content_id,
        {
            "title": rewritten["title"],
            "body": rewritten["body"],
            "quality_score": quality,
            "critique": next_critique,
            "status": status,
        },
    ) or {**item, **rewritten, "quality_score": quality, "critique": next_critique, "status": status}

    ready, readiness_issues = _ready_for_approval(updated, brief)
    approval_id = _create_approval(updated, brief) if ready else ""
    return {
        "content_id": content_id,
        "status": updated.get("status"),
        "quality_score": quality,
        "rewrite_required": bool(next_critique.get("rewrite_required")),
        "readiness_issues": readiness_issues,
        "approval_id": approval_id,
    }
