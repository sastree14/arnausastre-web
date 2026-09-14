from __future__ import annotations

import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import requests

from .assets import get_asset_store
from .integrations import get_linkedin_access
from .models import utc_now
from .storage import get_store


class PublishingError(RuntimeError):
    pass


PUBLICATION_MODES = {"text_only", "text_with_visual", "visual_first", "image_only"}
VISUAL_REQUIRED_MODES = {"text_with_visual", "visual_first", "image_only"}


def _linkedin_access() -> tuple[str, str]:
    """Use OAuth connection from Supabase; retain static env vars only as a legacy fallback."""
    static_token = os.environ.get("LINKEDIN_ACCESS_TOKEN", "").strip()
    static_person = os.environ.get("LINKEDIN_PERSON_URN", "").strip()
    if static_token and static_person:
        return static_token, static_person
    try:
        return get_linkedin_access()
    except Exception as exc:
        raise PublishingError(str(exc)) from exc


def _headers(token: str | None = None) -> dict[str, str]:
    access_token = token or _linkedin_access()[0]
    version = os.environ.get("LINKEDIN_API_VERSION", "202608").strip()
    return {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Linkedin-Version": version,
        "X-Restli-Protocol-Version": "2.0.0",
    }


def _author_for_channel(channel: str, person_urn: str) -> str:
    if channel == "sc_analytics_linkedin":
        organization_id = os.environ.get("LINKEDIN_ORGANIZATION_ID", "").strip()
        if not organization_id:
            raise PublishingError("Company-page publishing is not configured; repost from the personal post manually")
        return f"urn:li:organization:{organization_id}"
    return person_urn


def upload_image(image_path: Path, owner_urn: str, token: str) -> str:
    if image_path.suffix.lower() not in {".png", ".jpg", ".jpeg"}:
        raise PublishingError("LinkedIn image upload requires PNG or JPEG")
    headers = _headers(token)
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
    uploaded = requests.put(upload_url, headers={"Authorization": f"Bearer {token}"}, data=image_path.read_bytes(), timeout=120)
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


def _scheduled_is_due(item: dict) -> bool:
    scheduled = str(item.get("scheduled_at") or "").strip()
    if not scheduled:
        return True
    try:
        value = datetime.fromisoformat(scheduled.replace("Z", "+00:00"))
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value <= datetime.now(timezone.utc)
    except ValueError:
        return False


def _publication_mode(item: dict) -> str:
    mode = str(item.get("publication_mode") or "text_only").strip()
    return mode if mode in PUBLICATION_MODES else "text_only"


def _short_commentary(body: str, max_chars: int = 320) -> str:
    clean_parts = [part.strip() for part in body.split("\n\n") if part.strip()]
    clean = clean_parts[0] if clean_parts else body.strip()
    clean = " ".join(clean.split())
    if len(clean) <= max_chars:
        return clean
    shortened = clean[: max_chars - 1].rsplit(" ", 1)[0].strip()
    return f"{shortened}…" if shortened else clean[: max_chars - 1] + "…"


def _commentary_for_mode(item: dict) -> str:
    mode = _publication_mode(item)
    body = str(item.get("body") or "").strip()
    if mode == "visual_first":
        return _short_commentary(body)
    if mode == "image_only":
        # LinkedIn Posts API still requires commentary for image-led posts.
        return os.environ.get("LINKEDIN_IMAGE_ONLY_COMMENTARY", "SC-Analytics").strip() or "SC-Analytics"
    return body


def _visual_ref_for_mode(item: dict) -> str:
    if _publication_mode(item) == "text_only":
        return ""
    return str(item.get("visual_path") or "").strip()


def _validate_publication_contract(item: dict) -> tuple[str, str]:
    if item.get("content_type") != "linkedin_post" or "linkedin" not in str(item.get("channel") or ""):
        raise PublishingError("LinkedIn publisher only accepts LinkedIn content items")
    mode = _publication_mode(item)
    visual_ref = _visual_ref_for_mode(item)
    if mode in VISUAL_REQUIRED_MODES and not visual_ref:
        raise PublishingError(f"Publication mode '{mode}' requires an attached visual")
    if mode == "text_only" and visual_ref:
        visual_ref = ""
    return mode, visual_ref


def _linkedin_post_url(post_id: str) -> str:
    """Build LinkedIn's feed identity URL from the post URN returned in x-restli-id."""
    post_id = str(post_id or "").strip()
    if not post_id:
        return ""
    return f"https://www.linkedin.com/feed/update/{post_id}/"


def publish_content(content_id: str) -> dict:
    """Publish one already-approved LinkedIn content item through LinkedIn's official API."""
    store = get_store()
    items = store.filter("content_items", content_id=content_id)
    if not items:
        raise PublishingError(f"Content item not found: {content_id}")
    item = items[0]
    if item.get("status") != "approved":
        raise PublishingError("Content item is not approved")
    if not _scheduled_is_due(item):
        return {"content_id": content_id, "status": "scheduled", "scheduled_at": item.get("scheduled_at")}
    if item.get("external_post_id"):
        return {"content_id": content_id, "post_id": item["external_post_id"], "status": "already_published"}

    approvals = [a for a in store.filter("approvals", target_id=content_id) if a.get("action_type") == "publish_post" and a.get("status") == "approved"]
    if not approvals:
        raise PublishingError("No approved publish action exists for this content item")

    mode, visual_ref = _validate_publication_contract(item)
    token, person_urn = _linkedin_access()
    author = _author_for_channel(item.get("channel", ""), person_urn)
    payload = {
        "author": author,
        "commentary": _commentary_for_mode(item),
        "visibility": "PUBLIC",
        "distribution": {"feedDistribution": "MAIN_FEED", "targetEntities": [], "thirdPartyDistributionChannels": []},
        "lifecycleState": "PUBLISHED",
        "isReshareDisabledByAuthor": False,
    }

    visual = _materialize_visual(visual_ref) if visual_ref else None
    if visual:
        image_urn = upload_image(visual, author, token)
        payload["content"] = {"media": {"id": image_urn, "altText": item.get("title", "SC-Analytics visual")[:200]}}

    response = requests.post("https://api.linkedin.com/rest/posts", headers=_headers(token), json=payload, timeout=60)
    if response.status_code not in {200, 201}:
        raise PublishingError(f"LinkedIn post failed {response.status_code}: {response.text[:500]}")
    post_id = response.headers.get("x-restli-id", "")
    post_url = _linkedin_post_url(post_id)
    published_at = utc_now()
    store.update(
        "content_items",
        "content_id",
        content_id,
        {
            "status": "published",
            "external_post_id": post_id,
            "external_post_url": post_url,
            "published_at": published_at,
        },
    )
    for approval in approvals:
        store.update("approvals", "approval_id", approval["approval_id"], {"status": "executed", "executed_at": published_at})
    return {
        "content_id": content_id,
        "post_id": post_id,
        "post_url": post_url,
        "status": "published",
        "publication_mode": mode,
    }


def publish_all_approved(limit: int = 5) -> list[dict]:
    store = get_store()
    candidates = [
        row for row in store.list("content_items")
        if row.get("content_type") == "linkedin_post"
        and "linkedin" in str(row.get("channel") or "")
        and row.get("status") == "approved"
        and not row.get("external_post_id")
        and _scheduled_is_due(row)
    ][:limit]
    results = []
    for item in candidates:
        try:
            results.append(publish_content(item["content_id"]))
        except Exception as exc:
            results.append({"content_id": item.get("content_id"), "status": "failed", "error": str(exc)})
    return results
