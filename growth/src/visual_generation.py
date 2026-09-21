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
        return f"Core editorial motif requested by the user: {explicit[:780]}"
    strategy = dict(item.get("visual_strategy") or {})
    configured = sanitize_publication_text(str(strategy.get("illustration_concept") or "")).strip()
    if configured:
        return configured[:900]
    title = sanitize_publication_text(str(item.get("title") or "")).strip()
    body = sanitize_publication_text(str(item.get("body") or "")).strip()
    try:
        result = get_llm(profile="fast").json(
            "You are an editorial art director for SC-Analytics. Return JSON only.",
            f"""Choose a symbolic editorial motif for this publication. Do NOT design a literal scene or stock-style illustration.

TITLE: {title}
BODY: {body[:3500]}

The visual should feel like premium editorial identity: one instantly legible symbol connected to the industry or business problem, with optional abstract analytical geometry around it.

Examples of the level of abstraction:
- pharma / healthcare → Bowl of Hygieia, capsule, medical cross or molecule;
- hospitality / workforce → menu, order ticket, tray or service bell;
- logistics → route nodes, parcel, warehouse grid or directional path;
- manufacturing → gear, production line schematic or factory geometry;
- finance → ledger, cash-flow curve, coin geometry or risk grid;
- retail / ecommerce → tag, package, cart or demand curve;
- forecasting → signal wave, horizon bands or probability fan;
- optimisation → network, route, constrained nodes or allocation grid.

Return JSON with:
- domain: short industry/domain label
- problem: short business problem label
- symbol: ONE primary non-proprietary symbol or motif
- supporting_motif: optional simple geometric/analytical motif

Avoid people, offices, robots, brains, generic futuristic scenes, dashboards and photorealistic storytelling.""",
        )
        if isinstance(result, dict):
            domain = sanitize_publication_text(str(result.get("domain") or "")).strip()
            problem = sanitize_publication_text(str(result.get("problem") or "")).strip()
            symbol = sanitize_publication_text(str(result.get("symbol") or "")).strip()
            supporting = sanitize_publication_text(str(result.get("supporting_motif") or "")).strip()
            parts = [
                f"Domain: {domain}" if domain else "",
                f"Business problem: {problem}" if problem else "",
                f"Primary symbol: {symbol}" if symbol else "",
                f"Supporting motif: {supporting}" if supporting else "",
            ]
            candidate = ". ".join(part for part in parts if part)
            if candidate:
                return candidate[:900]
    except Exception:
        pass
    return sanitize_publication_text(f"Primary symbol derived from: {title}. Business context: {body[:420]}").strip()[:900] or "A precise editorial symbol representing a business decision"


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
