from __future__ import annotations

import os
import tempfile
from pathlib import Path

import requests

from .assets import get_asset_store
from .models import utc_now
from .storage import get_store


class PublishingError(RuntimeError):
    pass


def _headers() -> dict[str, str]:
    token = os.environ.get("LINKEDIN_ACCESS_TOKEN", "")
    version = os.environ.get("LINKEDIN_API_VERSION", "")
    if not token or not version:
        raise PublishingError("LINKEDIN_ACCESS_TOKEN and LINKEDIN_API_VERSION are required")
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Linkedin-Version": version,
        "X-Restli-Protocol-Version": "2.0.0",
    }


def _author_for_channel(channel: str) -> str:
    if channel == "sc_analytics_linkedin":
        organization_id = os.environ.get("LINKEDIN_ORGANIZATION_ID", "")
        if not organization_id:
            raise PublishingError("LINKEDIN_ORGANIZATION_ID is required")
        return f"urn:li:organization:{organization_id}"
    person_urn = os.environ.get("LINKEDIN_PERSON_URN", "")
    if not person_urn:
        raise PublishingError("LINKEDIN_PERSON_URN is required for personal publishing")
    return person_urn


def upload_image(image_path: Path, owner_urn: str) -> str:
    if image_path.suffix.lower() not in {".png", ".jpg", ".jpeg"}:
        raise PublishingError("LinkedIn image upload requires PNG or JPEG")
    headers = _headers()
    init = requests.post(
        "https://api.linkedin.com/rest/images?action=initializeUpload",
        headers=headers,
        json={"initializeUploadRequest": {"owner": owner_urn}},
        timeout=60,
    )
    if init.status_code >= 400:
        raise PublishingError(f"LinkedIn initializeUpload failed {init.status_code}: {init.text[:500]}")
    value = init.json().get("value", {})
    upload_url = value.get("uploadUrl")
    image_urn = value.get("image")
    if not upload_url or not image_urn:
        raise PublishingError("LinkedIn initializeUpload returned incomplete payload")
    upload_headers = {"Authorization": headers["Authorization"]}
    uploaded = requests.put(upload_url, headers=upload_headers, data=image_path.read_bytes(), timeout=120)
    if uploaded.status_code >= 400:
        raise PublishingError(f"LinkedIn image upload failed {uploaded.status_code}: {uploaded.text[:500]}")
    return image_urn


def _materialize_visual(ref: str) -> Path | None:
    if not ref:
        return None
    suffix = Path(ref).suffix.lower()
    if suffix not in {".png", ".jpg", ".jpeg"}:
        suffix = ".png"
    destination = Path(tempfile.gettempdir()) / f"sc-growth-visual{suffix}"
    return get_asset_store().get(ref, destination)


def publish_content(content_id: str) -> dict:
    """Publish one already-approved content item. Approval itself never performs the external action."""
    store = get_store()
    items = store.filter("content_items", content_id=content_id)
    if not items:
        raise PublishingError(f"Content item not found: {content_id}")
    item = items[0]
    if item.get("status") != "approved":
        raise PublishingError("Content item is not approved")
    if item.get("external_post_id"):
        return {"content_id": content_id, "post_id": item["external_post_id"], "status": "already_published"}

    approvals = [
        a for a in store.filter("approvals", target_id=content_id)
        if a.get("action_type") == "publish_post" and a.get("status") == "approved"
    ]
    if not approvals:
        raise PublishingError("No approved publish action exists for this content item")

    author = _author_for_channel(item.get("channel", ""))
    payload = {
        "author": author,
        "commentary": item.get("body", ""),
        "visibility": "PUBLIC",
        "distribution": {
            "feedDistribution": "MAIN_FEED",
            "targetEntities": [],
            "thirdPartyDistributionChannels": [],
        },
        "lifecycleState": "PUBLISHED",
        "isReshareDisabledByAuthor": False,
    }

    visual_ref = item.get("visual_path") or ""
    visual = _materialize_visual(visual_ref) if visual_ref else None
    if visual:
        image_urn = upload_image(visual, author)
        payload["content"] = {
            "media": {
                "id": image_urn,
                "altText": item.get("title", "SC-Analytics visual")[:200],
            }
        }

    response = requests.post("https://api.linkedin.com/rest/posts", headers=_headers(), json=payload, timeout=60)
    if response.status_code not in {200, 201}:
        raise PublishingError(f"LinkedIn post failed {response.status_code}: {response.text[:500]}")
    post_id = response.headers.get("x-restli-id", "")
    store.update(
        "content_items",
        "content_id",
        content_id,
        {"status": "published", "external_post_id": post_id, "published_at": utc_now()},
    )
    for approval in approvals:
        store.update(
            "approvals",
            "approval_id",
            approval["approval_id"],
            {"status": "executed", "executed_at": utc_now()},
        )
    return {"content_id": content_id, "post_id": post_id, "status": "published"}


def publish_all_approved(limit: int = 5) -> list[dict]:
    store = get_store()
    candidates = [
        row for row in store.list("content_items")
        if row.get("status") == "approved" and not row.get("external_post_id")
    ][:limit]
    results = []
    for item in candidates:
        try:
            results.append(publish_content(item["content_id"]))
        except Exception as exc:
            results.append({"content_id": item.get("content_id"), "status": "failed", "error": str(exc)})
    return results
