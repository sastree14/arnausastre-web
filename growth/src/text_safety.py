from __future__ import annotations

import re
from typing import Any

from .storage import get_store

ARROW_GLYPHS = "→←↑↓↔↕⇒⇐⇑⇓↗↘↙↖➜➝➡⬅➤➔"


def sanitize_publication_text(value: str) -> str:
    text = str(value or "")
    for glyph in ARROW_GLYPHS:
        text = text.replace(glyph, " ")
    text = text.replace("->", " - ").replace("<-", " - ")
    lines = [re.sub(r"[ \t]+", " ", line).rstrip() for line in text.splitlines()]
    return "\n".join(lines).strip()


def sanitize_content_item(content_id: str) -> bool:
    content_id = str(content_id or "").strip()
    if not content_id:
        return False
    store = get_store()
    rows = store.filter("content_items", content_id=content_id)
    if not rows:
        return False
    item = rows[0]
    changes: dict[str, Any] = {}
    for key in ("title", "body"):
        before = str(item.get(key) or "")
        after = sanitize_publication_text(before)
        if after != before:
            changes[key] = after
    if changes:
        store.update("content_items", "content_id", content_id, changes)
        return True
    return False


def sanitize_generated_content(task_type: str, inputs: dict[str, Any], output: Any) -> list[str]:
    ids: set[str] = set()
    if task_type == "OPERATOR_REWRITE_CONTENT":
        ids.add(str(inputs.get("content_id") or ""))
    if task_type == "OPERATOR_EDITORIAL_URL" and isinstance(output, dict):
        for row in output.get("variants", []) or []:
            if isinstance(row, dict):
                ids.add(str(row.get("content_id") or ""))
    if task_type == "OPERATOR_EDITORIAL_RUN" and isinstance(output, dict):
        brief_ids = {str(value) for value in (output.get("brief_ids", []) or []) if value}
        if brief_ids:
            for row in get_store().list("content_items"):
                if str(row.get("brief_id") or "") in brief_ids:
                    ids.add(str(row.get("content_id") or ""))
    sanitized: list[str] = []
    for content_id in sorted(value for value in ids if value):
        if sanitize_content_item(content_id):
            sanitized.append(content_id)
    return sanitized
