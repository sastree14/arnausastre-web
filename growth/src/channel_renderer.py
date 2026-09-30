from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import json
from typing import Any

from jsonschema import Draft202012Validator

from .brain import load_brain
from .channel_contracts import (
    channel_contract_prompt,
    default_channel,
    draft_contract_issues,
    get_channel_contract,
)
from .llm import get_llm
from .models import new_id


SUPPORTED_OUTPUT_TYPES = (
    "linkedin_post",
    "linkedin_article",
    "website_article",
    "website_project",
    "marketplace_project",
)


class ChannelRenderError(RuntimeError):
    pass


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _canonical_schema() -> dict[str, Any]:
    path = Path(__file__).resolve().parents[1] / "schemas" / "canonical_content_object.schema.json"
    return json.loads(path.read_text(encoding="utf-8"))


def _validate_content_object(content_object: dict[str, Any]) -> None:
    validator = Draft202012Validator(_canonical_schema())
    errors = sorted(validator.iter_errors(content_object), key=lambda e: list(e.path))
    if errors:
        detail = "; ".join(error.message for error in errors[:8])
        raise ChannelRenderError(f"Invalid Canonical Content Object: {detail}")


def _technical_proof_ref(content_object: dict[str, Any]) -> str:
    sources = ((content_object.get("evidence") or {}).get("project_sources") or [])
    if not sources:
        return ""
    source = sources[0] if isinstance(sources[0], dict) else {}
    repo = str(source.get("repository") or "")
    path = str(source.get("path") or "")
    return f"{repo}:{path}" if repo and path else repo or path


def render_channel_output(
    content_object: dict[str, Any],
    *,
    output_type: str,
    language: str = "en",
    channel: str = "",
) -> dict[str, Any]:
    if output_type not in SUPPORTED_OUTPUT_TYPES:
        raise ChannelRenderError(f"Unsupported output type: {output_type}")
    _validate_content_object(content_object)
    contract = get_channel_contract(output_type)
    if contract.get("requires_project_source") and not ((content_object.get("evidence") or {}).get("project_sources") or []):
        raise ChannelRenderError(f"{output_type} requires a verified project source")

    resolved_channel = channel or default_channel(output_type)
    voice = "voice/arnau_voice.md" if resolved_channel == "arnau_linkedin" else "voice/company_voice.md"
    brain = load_brain([
        "company/identity.md",
        "company/positioning.md",
        "company/services.md",
        "company/principles.md",
        "commercial/icp.md",
        voice,
        "voice/forbidden_language.md",
        "evidence/evidence_policy.md",
        "content/content_strategy.md",
        "content/editorial_architecture.md",
        "content/canonical_content_model.md",
        "content/portfolio_integration.md",
        "content/channel_contracts.md",
        "content/language_strategy.md",
    ])
    names = {"es": "Spanish", "en": "English", "ca": "Catalan"}
    target_language = names.get(language, language)
    proof_ref = _technical_proof_ref(content_object)

    llm = get_llm(high_reasoning=output_type in {"linkedin_article", "website_article", "website_project"})
    raw = llm.json(
        f"You are the SC-Analytics {output_type} renderer. Write native {target_language} copy and return JSON only.",
        f"""Render the Canonical Content Object into the requested channel.

Do not change the thesis, evidence, project provenance or uncertainty.
The output is commercially intentional: make the buyer problem and business consequence clear, demonstrate judgement and proof, and end with the most natural next step.
Do not use technical complexity as the headline unless the canonical idea specifically requires it.
Do not invent client language or results.

CHANNEL CONTRACT:
{channel_contract_prompt(output_type)}

For project-led outputs:
- website_project is the business/technical case-study layer;
- marketplace_project is concise capability proof;
- the technical proof remains in Portfolio_SC_Analytics;
- technical proof reference available to the renderer: {proof_ref or 'none'}.

Return:
{{
  "title": "...",
  "body": "...",
  "cta": "...",
  "technical_proof_ref": "{proof_ref}"
}}

CANONICAL CONTENT OBJECT:
{content_object}

BRAIN:
{brain}
""",
    )
    if not isinstance(raw, dict):
        raise ChannelRenderError("Renderer did not return JSON")

    draft = {
        "title": str(raw.get("title") or "").strip(),
        "body": str(raw.get("body") or "").strip(),
        "cta": str(raw.get("cta") or "").strip(),
        "technical_proof_ref": proof_ref,
    }
    issues = draft_contract_issues(draft, output_type)
    if issues:
        retry = get_llm(high_reasoning=True).json(
            f"You are the SC-Analytics {output_type} renderer. Return JSON only.",
            f"""Rewrite the draft so it satisfies the channel contract exactly without adding unsupported facts.

CONTRACT:
{channel_contract_prompt(output_type)}

ISSUES:
{issues}

CANONICAL OBJECT:
{content_object}

DRAFT:
{draft}

Return {{"title":"...","body":"...","cta":"...","technical_proof_ref":"{proof_ref}"}}.
""",
        )
        if isinstance(retry, dict):
            draft = {
                "title": str(retry.get("title") or draft["title"]).strip(),
                "body": str(retry.get("body") or draft["body"]).strip(),
                "cta": str(retry.get("cta") or draft["cta"]).strip(),
                "technical_proof_ref": proof_ref,
            }
        issues = draft_contract_issues(draft, output_type)

    return {
        "channel_output_id": new_id("output"),
        "content_object_id": str(content_object.get("content_object_id") or ""),
        "output_type": output_type,
        "channel": resolved_channel,
        "language": language,
        "title": draft["title"],
        "body": draft["body"],
        "cta": draft["cta"],
        "technical_proof_ref": proof_ref,
        "contract_version": 1,
        "contract_valid": not issues,
        "contract_issues": issues,
        "status": "draft" if not issues else "needs_review",
        "created_at": _utc_now(),
    }
