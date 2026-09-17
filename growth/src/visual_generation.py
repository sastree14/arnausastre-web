from __future__ import annotations

from typing import Any

from .assets import get_asset_store
from .config import load_config
from .llm import get_llm
from .storage import get_store
from .text_safety import sanitize_publication_text
from .visuals import render_contextual_illustration


def _update_pending_approval(content_id: str, changes: dict[str, Any]) -> None:
    store = get_store()
    for approval in store.filter("approvals", target_id=content_id):
        if approval.get("status") != "pending":
            continue
        payload = dict(approval.get("payload") or {})
        payload.update(changes)
        store.update("approvals", "approval_id", approval["approval_id"], {"payload": payload})


def _derive_concept(item: dict[str, Any], explicit: str) -> str:
    explicit = sanitize_publication_text(explicit).strip()
    if explicit:
        return explicit[:900]
    strategy = dict(item.get("visual_strategy") or {})
    configured = sanitize_publication_text(str(strategy.get("illustration_concept") or "")).strip()
    if configured:
        return configured[:900]
    title = sanitize_publication_text(str(item.get("title") or "")).strip()
    body = sanitize_publication_text(str(item.get("body") or "")).strip()
    try:
        result = get_llm(profile="fast").json(
            "You are an editorial art director for SC-Analytics. Return JSON only.",
            f"""Propose one concrete visual scene for this publication. The scene must work without any text, numbers, logos or UI screenshots and must communicate the business idea visually. Avoid generic robots, glowing brains and stock-photo cliches.

TITLE: {title}
BODY: {body[:3500]}

Return {{"concept":"one concise concrete scene description"}}.""",
        )
        candidate = sanitize_publication_text(str((result or {}).get("concept") or "")).strip()
        if candidate:
            return candidate[:900]
    except Exception:
        pass
    return sanitize_publication_text(f"{title}. {body[:500]}").strip()[:900] or "A precise operational business decision represented through a concrete real-world scene"


def generate_contextual_visual(content_id: str, concept: str = "", theme: str = "") -> dict[str, Any]:
    store = get_store()
    rows = store.filter("content_items", content_id=content_id)
    if not rows:
        raise ValueError(f"Content item not found: {content_id}")
    item = dict(rows[0])
    strategy = dict(item.get("visual_strategy") or {})
    title = sanitize_publication_text(str(strategy.get("visual_headline") or item.get("title") or "SC-Analytics insight")).strip()[:95]
    concept_text = _derive_concept(item, concept)
    selected_theme = "light" if str(theme or strategy.get("theme") or "dark").strip().lower() == "light" else "dark"
    path = render_contextual_illustration(title, concept_text, slug=f"{content_id}-manual-illustration", theme=selected_theme)
    cfg = load_config()
    asset_key = f"{cfg['company']['tenant_id']}/editorial/{item.get('brief_id') or 'manual'}/{path.name}"
    asset_ref = get_asset_store().put(path, asset_key)
    strategy.update({
        "visual_type": "illustration",
        "illustration_concept": concept_text,
        "theme": selected_theme,
        "visual_headline": title,
        "generated_manually": True,
    })
    changes: dict[str, Any] = {
        "visual_path": asset_ref,
        "visual_type": "generated_contextual_illustration",
        "visual_strategy": strategy,
    }
    if item.get("content_type") == "linkedin_post" and str(item.get("publication_mode") or "text_only") == "text_only":
        changes["publication_mode"] = "text_with_visual"
    updated = store.update("content_items", "content_id", content_id, changes) or {**item, **changes}
    _update_pending_approval(content_id, {
        "visual_path": asset_ref,
        "visual_type": "generated_contextual_illustration",
        "visual_strategy": strategy,
        "publication_mode": updated.get("publication_mode"),
    })
    return {
        "content_id": content_id,
        "status": "generated",
        "visual_path": asset_ref,
        "visual_type": "generated_contextual_illustration",
        "concept": concept_text,
        "theme": selected_theme,
    }
