from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import json
from typing import Any

from jsonschema import Draft202012Validator

from .llm import get_llm
from .models import new_id
from .visual_system import presentation_contract

ROOT = Path(__file__).resolve().parents[1]


def _now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _schema() -> dict[str, Any]:
    return json.loads((ROOT / "schemas" / "presentation_package.schema.json").read_text(encoding="utf-8"))


def _format_instruction(format_key: str) -> str:
    if format_key == "carousel":
        return "Return 4-8 slides. Each slide needs a role from cover/process/comparison/evidence/framework/conclusion and only the fields needed by that role."
    if format_key == "dataviz":
        return "Return title, context, analytical_question, analytical_relationship, takeaway and data/series only when real evidence exists. A conceptual relationship may be illustrated without inventing measured values."
    if format_key == "architecture":
        return "Return title, context, nodes and typed edges. Node: id + short label. Edge: source + target + relationship."
    if format_key == "before_after":
        return "Return title, context, before nodes/edges, after nodes/edges and a transformation_takeaway."
    return "Return structured visual-support content."


def build_presentation_package(
    content_object: dict[str, Any],
    *,
    channel: str,
    format_key: str,
    visual_language: str = "AUTO",
    language: str = "en",
) -> dict[str, Any]:
    contract = presentation_contract(channel, format_key)
    result = get_llm(high_reasoning=True).json(
        "You are the SC-Analytics presentation editor. Convert an approved canonical content object into structured format-ready content. Return JSON only.",
        f"""Prepare content for channel={channel}, format={format_key}, language={language}.

Rules:
- commercial-first and executive-readable;
- preserve thesis and evidence;
- do not invent factual claims or numeric evidence;
- conceptual visuals are allowed when explicitly illustrative;
- do not mix visual languages;
- write for the capacity of the selected format rather than writing prose first and squeezing it later.

FORMAT:
{_format_instruction(format_key)}

CHANNEL × VISUAL CONTRACT:
{contract}

Return JSON:
{{
  "external_copy":"...",
  "hashtags":[],
  "content":{{}}
}}

CANONICAL CONTENT OBJECT:
{content_object}
""",
    )
    if not isinstance(result, dict):
        raise RuntimeError("Presentation writer returned invalid output")
    package = {
        "package_id": new_id("pkg"),
        "content_object_id": str(content_object.get("content_object_id") or ""),
        "channel": channel,
        "format": format_key,
        "visual_language": visual_language,
        "visual_role": str(contract.get("visual_role") or "supporting_evidence"),
        "external_copy_mode": str(contract.get("external_copy") or "medium"),
        "external_copy": str(result.get("external_copy") or "").strip(),
        "hashtags": [str(x) for x in (result.get("hashtags") or [])][:8],
        "content": result.get("content") if isinstance(result.get("content"), dict) else {},
        "created_at": _now(),
    }
    errors = sorted(Draft202012Validator(_schema()).iter_errors(package), key=lambda e: list(e.path))
    if errors:
        raise RuntimeError("Presentation package validation failed: " + "; ".join(e.message for e in errors[:6]))
    return package
