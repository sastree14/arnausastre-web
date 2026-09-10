from __future__ import annotations

import os
from pathlib import Path

import requests

from .storage import get_store
from .models import utc_now


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


def publish_content(content_id: str) -> dict:
    """Publish one already-approved content item. Never called by the approval action itself."""
    store = get_store()
    items = store.filter("content_items", content_id=content_id)
    if not items:
        raise PublishingError(f"Content item not found: {content_id}")
    item = items[0]
    if item.get("status") != "approved":
        raise PublishingError("Content item is not approved")

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

    visual_path = item.get("visual_path") or ""
    if visual_path:
        path = Path(visual_path)
        if path.exists() and path.suffix.lower() in {".png", ".jpg", ".jpeg"}:
            image_urn = upload_image(path, author)
            payload["content"] = {"media": {"id": image_urn, "altText": item.get("title", "SC-Analytics visual")}}

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
        store.update("approvals", "approval_id", approval["approval_id"], {"status": "executed", "executed_at": utc_now()})
    return {"content_id": content_id, "post_id": post_id, "status": "published"}
