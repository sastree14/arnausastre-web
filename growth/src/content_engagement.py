from __future__ import annotations

import re
from typing import Any

from .assets import get_asset_store
from .config import load_config
from .llm import get_llm
from .storage import get_store
from .text_safety import sanitize_publication_text
from .visuals import (
    render_branded_card,
    render_business_diagram,
    render_comparison_visual,
    render_contextual_illustration,
    render_metric_visual,
    render_statement_visual,
)


def _clean_hashtags(values: Any) -> list[str]:
    output: list[str] = []
    for raw in values if isinstance(values, list) else []:
        value = re.sub(r"[^A-Za-z0-9À-ÿ_]", "", str(raw).lstrip("#")).strip()
        if len(value) < 2:
            continue
        tag = f"#{value}"
        if tag.lower() not in {x.lower() for x in output}:
            output.append(tag)
    return output[:5]


def _metric(text: str) -> dict[str, str] | None:
    match = re.search(r"(?:[-+]?\d+(?:[.,]\d+)?\s?%|[$€]\s?\d+(?:[.,]\d+)?(?:\s?[KMB])?|\d+(?:[.,]\d+)?x)", text, re.I)
    if not match:
        return None
    start = max(0, match.start() - 75)
    end = min(len(text), match.end() + 105)
    label = re.sub(re.escape(match.group(0)), "", text[start:end], flags=re.I).strip(" .,:;-")
    return {"value": match.group(0).strip(), "label": sanitize_publication_text(label)[:95] or "Business impact"}


def _update_pending_approval(content_id: str, changes: dict[str, Any]) -> None:
    store = get_store()
    for approval in store.filter("approvals", target_id=content_id):
        if approval.get("status") != "pending":
            continue
        payload = dict(approval.get("payload") or {})
        payload.update(changes)
        store.update("approvals", "approval_id", approval["approval_id"], {"payload": payload})


def _render_visual(item: dict[str, Any], brief: dict[str, Any], strategy: dict[str, Any]) -> tuple[str, str] | None:
    visual = dict(brief.get("visual") or {})
    if not visual.get("needed") and not item.get("visual_path"):
        return None
    headline = sanitize_publication_text(str(strategy.get("visual_headline") or item.get("title") or "SC-Analytics insight"))[:95]
    supporting = sanitize_publication_text(str(strategy.get("visual_support") or brief.get("practical_takeaway") or ""))[:150]
    kind = str(strategy.get("visual_type") or visual.get("type") or "statement")
    theme = str(strategy.get("theme") or "dark")
    slug = f"{item.get('content_id', 'content')}-engagement"
    text = f"{item.get('title', '')} {item.get('body', '')}"
    metric = _metric(text)
    if kind == "metric" and metric:
        path = render_metric_visual(headline, [metric], slug=slug, theme=theme)
        visual_type = "react_metric_hook"
    elif kind == "comparison" and (visual.get("left") or visual.get("right")):
        path = render_comparison_visual(headline, str(visual.get("left") or "Common framing"), str(visual.get("right") or "Better framing"), slug=slug, theme=theme)
        visual_type = "react_comparison_hook"
    elif kind == "process" and visual.get("steps"):
        path = render_business_diagram(headline, [str(x) for x in visual.get("steps", [])], slug=slug, theme=theme)
        visual_type = "react_process_hook"
    elif kind == "illustration":
        concept = sanitize_publication_text(str(strategy.get("illustration_concept") or visual.get("concept") or supporting or headline))[:900]
        try:
            path = render_contextual_illustration(headline, concept, slug=slug, theme=theme)
            visual_type = "generated_contextual_illustration"
        except Exception:
            # Illustration is enhancement, never a publishing blocker. A branded
            # deterministic statement remains available if the image API is down.
            path = render_statement_visual(headline, supporting, slug=slug, theme=theme)
            visual_type = "react_statement_hook"
    elif kind in {"statement", "contrarian", "question"}:
        path = render_statement_visual(headline, supporting, slug=slug, theme=theme)
        visual_type = "react_statement_hook"
    else:
        path = render_branded_card(headline, supporting, slug=slug, theme=theme)
        visual_type = "react_insight_hook"
    cfg = load_config()
    asset_key = f"{cfg['company']['tenant_id']}/editorial/{item.get('brief_id') or 'manual'}/{path.name}"
    return visual_type, get_asset_store().put(path, asset_key)


def enrich_content_item(content_id: str) -> dict[str, Any] | None:
    store = get_store()
    rows = store.filter("content_items", content_id=content_id)
    if not rows:
        return None
    item = dict(rows[0])
    if item.get("content_type") != "linkedin_post":
        return item
    brief_rows = store.filter("editorial_briefs", brief_id=item.get("brief_id")) if item.get("brief_id") else []
    brief = dict(brief_rows[0]) if brief_rows else {}
    language = str(item.get("language") or "es")
    body = str(item.get("body") or "")
    existing_strategy = dict(item.get("visual_strategy") or {})
    try:
        result = get_llm(profile="fast").json(
            "You are a B2B LinkedIn editor for SC-Analytics. Produce natural engagement assets, not clickbait. Return JSON only.",
            f"""Create supporting assets for this already-written LinkedIn post.
LANGUAGE: {language}
TITLE: {item.get('title', '')}
BODY: {body}
BRIEF: {brief}

Return {{
  "engagement_question":"one natural open question that invites practitioners to reply in the comments with a real opinion or experience; no fake suspense",
  "follow_line":"one short, natural sentence inviting readers who value this kind of applied Data/AI/business thinking to follow SC-Analytics; no sales pitch and no begging",
  "hashtags":["3 to 5 relevant hashtags without #"],
  "visual_headline":"short stop-scroll headline, ideally <= 70 characters",
  "visual_support":"optional short supporting sentence <= 110 characters",
  "visual_type":"metric|statement|comparison|process|question|illustration",
  "illustration_concept":"only when visual_type is illustration: concise concrete scene/concept, no typography",
  "theme":"dark|light",
  "hook_type":"metric|contrarian|question|insight|comparison|process|illustration"
}}.
Rules:
- The visual headline may be bolder than the post title but must remain accurate and professional.
- Contrarian means a defensible tension or trade-off, never offensive sensationalism.
- If the content includes a meaningful real metric, prefer metric.
- Prefer comparison or process when the brief already contains those structures.
- Use illustration sparingly: only when a concrete object, operational scene or simple visual metaphor materially improves stopping power and no meaningful real metric/comparison/process is available.
- Questions must be genuinely answerable by the target audience and should create a reason to comment, disagree, add a case or share experience.
- The follow_line must explicitly mention SC-Analytics and invite following the page softly. Vary the wording; never use engagement bait, guilt, urgency or a hard sell.
- Hashtags must be specific enough to aid discovery; avoid generic spam like #success or #motivation.
- Never invent a metric, client result or fact.
""",
        )
    except Exception:
        result = {}
    question = sanitize_publication_text(str(result.get("engagement_question") or existing_strategy.get("engagement_question") or "")).strip()
    follow_line = sanitize_publication_text(str(result.get("follow_line") or existing_strategy.get("follow_line") or "")).strip()
    hashtags = _clean_hashtags(result.get("hashtags") or item.get("hashtags") or [])
    strategy = {
        **existing_strategy,
        "engagement_question": question,
        "follow_line": follow_line,
        "engagement_goal": "comments_and_sc_analytics_follow_growth",
        "visual_headline": sanitize_publication_text(str(result.get("visual_headline") or item.get("title") or ""))[:100],
        "visual_support": sanitize_publication_text(str(result.get("visual_support") or ""))[:150],
        "visual_type": str(result.get("visual_type") or existing_strategy.get("visual_type") or "statement"),
        "illustration_concept": sanitize_publication_text(str(result.get("illustration_concept") or existing_strategy.get("illustration_concept") or ""))[:900],
        "theme": "light" if str(result.get("theme") or existing_strategy.get("theme")) == "light" else "dark",
    }
    candidate_body = body.rstrip()
    additions: list[str] = []
    if question and question not in candidate_body:
        additions.append(question)
    if follow_line and follow_line not in candidate_body:
        additions.append(follow_line)
    # Reserve room for the hashtag line that is appended by the LinkedIn publisher.
    for addition in additions:
        proposed = f"{candidate_body}\n\n{addition}".strip()
        if len(proposed) <= 2050:
            candidate_body = proposed
    changes: dict[str, Any] = {
        "body": candidate_body,
        "hashtags": hashtags,
        "visual_strategy": strategy,
        "hook_type": str(result.get("hook_type") or item.get("hook_type") or "insight"),
        "cta_type": "conversation_and_follow" if question and follow_line else "conversation" if question else "follow" if follow_line else (item.get("cta_type") or "none"),
    }
    rendered = _render_visual({**item, **changes}, brief, strategy)
    if rendered:
        changes["visual_type"], changes["visual_path"] = rendered
    updated = store.update("content_items", "content_id", content_id, changes) or {**item, **changes}
    _update_pending_approval(content_id, {"body": candidate_body, "hashtags": hashtags, "visual_strategy": strategy, "visual_type": changes.get("visual_type", item.get("visual_type")), "visual_path": changes.get("visual_path", item.get("visual_path"))})
    return dict(updated)


def enrich_generated_content(task_type: str, inputs: dict[str, Any], output: Any) -> list[str]:
    ids: set[str] = set()
    store = get_store()
    if task_type == "OPERATOR_REWRITE_CONTENT":
        ids.add(str(inputs.get("content_id") or ""))
    elif task_type == "OPERATOR_EDITORIAL_URL" and isinstance(output, dict):
        for row in output.get("variants", []) or []:
            if isinstance(row, dict) and row.get("content_id"):
                ids.add(str(row["content_id"]))
    elif task_type == "OPERATOR_EDITORIAL_RUN" and isinstance(output, dict):
        brief_ids = {str(value) for value in (output.get("brief_ids", []) or []) if value}
        for row in store.list("content_items"):
            if str(row.get("brief_id") or "") in brief_ids:
                ids.add(str(row.get("content_id") or ""))
    enriched: list[str] = []
    for content_id in sorted(x for x in ids if x):
        row = enrich_content_item(content_id)
        if row and row.get("content_type") == "linkedin_post":
            enriched.append(content_id)
    return enriched
