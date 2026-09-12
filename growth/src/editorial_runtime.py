from __future__ import annotations

from typing import Any

from . import editorial as base
from .brain import load_brain
from .config import load_config
from .llm import get_llm
from .models import ApprovalItem, ContentItem, new_id, to_dict
from .storage import get_store

SUPPORTED_LANGUAGES = base.SUPPORTED_LANGUAGES

LINKEDIN_TARGET_MIN_CHARS = 750
LINKEDIN_TARGET_MAX_CHARS = 1800
LINKEDIN_HARD_MAX_CHARS = 2200
ARTICLE_TARGET_MIN_WORDS = 900
ARTICLE_TARGET_MAX_WORDS = 1400
ARTICLE_HARD_MIN_WORDS = 650
ARTICLE_HARD_MAX_WORDS = 1700


def _word_count(text: str) -> int:
    return len([part for part in text.split() if part.strip()])


def content_contract_issues(draft: dict[str, Any], content_type: str) -> list[str]:
    body = str(draft.get("body", "")).strip()
    title = str(draft.get("title", "")).strip()
    issues: list[str] = []
    if not title:
        issues.append("missing title")
    if not body:
        issues.append("missing body")
        return issues

    if content_type == "linkedin_post":
        chars = len(body)
        if chars > LINKEDIN_HARD_MAX_CHARS:
            issues.append(f"LinkedIn body is {chars} characters; hard maximum is {LINKEDIN_HARD_MAX_CHARS}")
        elif chars < 450:
            issues.append(f"LinkedIn body is only {chars} characters; it is too thin for this editorial format")
    elif content_type == "article":
        words = _word_count(body)
        if words < ARTICLE_HARD_MIN_WORDS:
            issues.append(f"Article is {words} words; hard minimum is {ARTICLE_HARD_MIN_WORDS}")
        if words > ARTICLE_HARD_MAX_WORDS:
            issues.append(f"Article is {words} words; hard maximum is {ARTICLE_HARD_MAX_WORDS}")
    return issues


def _editorial_brain(channel: str) -> str:
    voice = "voice/arnau_voice.md" if channel == "arnau_linkedin" else "voice/company_voice.md"
    return load_brain([
        "company/identity.md",
        "company/mission_vision_values.md",
        "company/culture.md",
        "company/positioning.md",
        "company/services.md",
        "company/principles.md",
        "commercial/icp.md",
        voice,
        "voice/arnau_voice_calibration.md",
        "voice/forbidden_language.md",
        "evidence/evidence_policy.md",
        "content/content_strategy.md",
        "content/editorial_playbook.md",
        "content/language_strategy.md",
    ])


def _writer_instructions(language: str, channel: str, content_type: str) -> str:
    names = {"es": "Spanish", "en": "English", "ca": "Catalan"}
    target = names[language]
    if content_type == "article":
        return f"Write a native {target} website article for SC-Analytics. Use natural Markdown headings and explanatory prose."
    if channel == "arnau_linkedin":
        return f"Write a native {target} LinkedIn post in Arnau Sastre's professional founder voice."
    return f"Write a native {target} LinkedIn post in SC-Analytics' company voice."


def _write_variant(brief: dict[str, Any], *, language: str, channel: str, content_type: str) -> dict[str, str]:
    brain = _editorial_brain(channel)
    # Drafting does not need the most expensive reasoning profile. Strategic brief
    # creation and the critic retain high reasoning; prose drafting uses balanced/fast.
    llm = get_llm(profile="balanced" if content_type == "article" else "fast")
    format_rules = (
        f"Target {ARTICLE_TARGET_MIN_WORDS}-{ARTICLE_TARGET_MAX_WORDS} words and never exceed {ARTICLE_HARD_MAX_WORDS}. "
        "Use useful section headings, no SEO padding, no fake quotes, and no hard sales CTA."
        if content_type == "article"
        else f"Target {LINKEDIN_TARGET_MIN_CHARS}-{LINKEDIN_TARGET_MAX_CHARS} characters and never exceed {LINKEDIN_HARD_MAX_CHARS}. "
        "Use natural paragraphs, no hashtag block, no forced CTA, no fake suspense, and no one-sentence-per-line formatting habit."
    )
    raw = llm.json(
        _writer_instructions(language, channel, content_type),
        f"""Write from the CANONICAL BRIEF below. Do not add factual claims beyond its evidence.
Preserve the thesis and nuance; do not mechanically translate from another language.
{format_rules}

Return {{"title": "...", "body": "..."}} only.

CANONICAL BRIEF:
{brief}

BRAIN:
{brain}
""",
    )
    return {"title": str(raw.get("title", "")).strip(), "body": str(raw.get("body", "")).strip()}


def _critic(brief: dict[str, Any], draft: dict[str, Any], *, language: str, channel: str, content_type: str) -> dict[str, Any]:
    critique = base._critic(brief, draft, language=language, channel=channel, content_type=content_type)
    issues = content_contract_issues(draft, content_type)
    critique = dict(critique or {})
    critique["contract_valid"] = not issues
    critique["contract_issues"] = issues
    if issues:
        critique["rewrite_required"] = True
        instructions = list(critique.get("rewrite_instructions") or [])
        instructions.extend(issues)
        critique["rewrite_instructions"] = instructions
    return critique


def _rewrite_variant(
    brief: dict[str, Any],
    draft: dict[str, Any],
    critique: dict[str, Any],
    *,
    language: str,
    channel: str,
    content_type: str,
) -> dict[str, str]:
    brain = _editorial_brain(channel)
    llm = get_llm(profile="balanced")
    contract = (
        f"The final LinkedIn body MUST be <= {LINKEDIN_HARD_MAX_CHARS} characters; target {LINKEDIN_TARGET_MIN_CHARS}-{LINKEDIN_TARGET_MAX_CHARS}."
        if content_type == "linkedin_post"
        else f"The final article MUST be {ARTICLE_HARD_MIN_WORDS}-{ARTICLE_HARD_MAX_WORDS} words; target {ARTICLE_TARGET_MIN_WORDS}-{ARTICLE_TARGET_MAX_WORDS}."
    )
    result = llm.json(
        _writer_instructions(language, channel, content_type),
        f"""Rewrite the draft once using the critic instructions. Preserve evidence and thesis exactly.
{contract}
Do not solve length by turning prose into telegraphic fragments.
Return {{"title": "...", "body": "..."}} only.

BRIEF: {brief}
DRAFT: {draft}
CRITIQUE: {critique}
BRAIN: {brain}
""",
    )
    return {
        "title": str(result.get("title", draft.get("title", ""))).strip(),
        "body": str(result.get("body", draft.get("body", ""))).strip(),
    }


def _variant_channel(content_type: str, channel: str) -> str:
    return channel if content_type == "linkedin_post" else "website"


def _existing_variant(brief_id: str, language: str, channel: str, content_type: str) -> dict[str, Any] | None:
    rows = get_store().filter(
        "content_items",
        brief_id=brief_id,
        language=language,
        channel=_variant_channel(content_type, channel),
        content_type=content_type,
    )
    return rows[0] if rows else None


def _ensure_approval(item: dict[str, Any], brief: dict[str, Any], *, primary: bool, contract_valid: bool) -> str:
    if not primary or not contract_valid or float(item.get("quality_score", 0) or 0) < 7.5:
        return ""
    store = get_store()
    approval_type = "publish_post" if item.get("content_type") == "linkedin_post" else "publish_article"
    existing = [
        row for row in store.filter("approvals", target_id=item["content_id"])
        if row.get("action_type") == approval_type and row.get("status") in {"pending", "approved", "executed"}
    ]
    if existing:
        return str(existing[0].get("approval_id") or "")

    approval = ApprovalItem(
        approval_id=new_id("approval"),
        tenant_id=item["tenant_id"],
        action_type=approval_type,
        target_id=item["content_id"],
        summary=("Approve LinkedIn post" if approval_type == "publish_post" else "Approve website article") + f": {item.get('title', '')}",
        payload={
            "content_id": item["content_id"],
            "brief_id": brief["brief_id"],
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


def _persist_variant(brief: dict[str, Any], *, language: str, channel: str, content_type: str, primary: bool) -> dict[str, Any]:
    existing = _existing_variant(brief["brief_id"], language, channel, content_type)
    if existing:
        critique = existing.get("critique") or {}
        approval_id = _ensure_approval(existing, brief, primary=primary, contract_valid=bool(critique.get("contract_valid", True)))
        result = dict(existing)
        if approval_id:
            result["approval_id"] = approval_id
        result["resumed"] = True
        return result

    draft = _write_variant(brief, language=language, channel=channel, content_type=content_type)
    critique = _critic(brief, draft, language=language, channel=channel, content_type=content_type)
    quality = float(critique.get("quality_score", 0) or 0)
    if critique.get("rewrite_required") or quality < 8.0:
        draft = _rewrite_variant(brief, draft, critique, language=language, channel=channel, content_type=content_type)
        critique = _critic(brief, draft, language=language, channel=channel, content_type=content_type)
        quality = float(critique.get("quality_score", 0) or 0)

    contract_issues = content_contract_issues(draft, content_type)
    contract_valid = not contract_issues
    critique = dict(critique or {})
    critique["contract_valid"] = contract_valid
    critique["contract_issues"] = contract_issues
    if not contract_valid:
        # An LLM score can never override a deterministic publishing contract.
        quality = min(quality, 7.4)

    cfg = load_config()
    visual_type, visual_path = ("none", "")
    if content_type == "linkedin_post":
        visual_type, visual_path = base._render_visual(brief, draft, f"{brief['brief_id']}-{language}-{channel}")

    status = "draft" if primary or content_type == "article" else "alternate"
    if primary and not contract_valid:
        status = "needs_review"

    item = ContentItem(
        content_id=new_id("content"),
        tenant_id=cfg["company"]["tenant_id"],
        channel=_variant_channel(content_type, channel),
        content_type=content_type,
        title=draft["title"],
        body=draft["body"],
        objective="authority",
        target_audience=list(brief.get("target_audience") or []),
        evidence_ids=list(brief.get("evidence_ids") or []),
        status=status,
        visual_type=visual_type,
        visual_path=visual_path,
        source_case="",
        brief_id=brief["brief_id"],
        language=language,
        content_family=brief.get("family", "insight"),
        quality_score=quality,
        critique=critique,
        source_url=(brief.get("research") or {}).get("source_urls", [""])[0] if (brief.get("research") or {}).get("source_urls") else "",
    )
    payload = to_dict(item)
    get_store().insert("content_items", payload)
    approval_id = _ensure_approval(payload, brief, primary=primary, contract_valid=contract_valid)
    if approval_id:
        payload["approval_id"] = approval_id
    return payload


def generate_variants(brief: dict[str, Any]) -> list[dict[str, Any]]:
    decision = str(brief.get("output_decision", "IGNORE"))
    primary_language = str(brief.get("primary_linkedin_language", "es"))
    if primary_language not in SUPPORTED_LANGUAGES:
        primary_language = "es"
    variants: list[dict[str, Any]] = []

    if decision in ("LINKEDIN", "LINKEDIN_AND_ARTICLE"):
        for language in SUPPORTED_LANGUAGES:
            variants.append(_persist_variant(
                brief,
                language=language,
                channel="arnau_linkedin",
                content_type="linkedin_post",
                primary=language == primary_language,
            ))

    if decision in ("ARTICLE", "LINKEDIN_AND_ARTICLE"):
        for language in SUPPORTED_LANGUAGES:
            variants.append(_persist_variant(
                brief,
                language=language,
                channel="website",
                content_type="article",
                primary=True,
            ))

    get_store().update("editorial_briefs", "brief_id", brief["brief_id"], {"status": "generated"})
    return variants


def _get_or_create_brief(signal: dict[str, Any]) -> dict[str, Any] | None:
    existing = get_store().filter("editorial_briefs", signal_id=signal["signal_id"])
    if existing:
        return existing[0]
    return base.create_content_brief(signal)


def _resume_draft_briefs(limit: int) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    if limit <= 0:
        return [], []
    pending = [row for row in get_store().list("editorial_briefs") if row.get("status") == "draft"][:limit]
    variants: list[dict[str, Any]] = []
    for brief in pending:
        variants.extend(generate_variants(brief))
    return pending, variants


def run_editorial_cycle(*, max_signals: int = 50, max_briefs: int = 3, theme_hint: str = "") -> dict[str, Any]:
    resumed_briefs, variants = _resume_draft_briefs(max_briefs)
    remaining = max(0, max_briefs - len(resumed_briefs))

    discovered: list[dict[str, Any]] = []
    evaluated: list[dict[str, Any]] = []
    strong: list[dict[str, Any]] = []
    created_briefs: list[dict[str, Any]] = []
    if remaining > 0:
        discovered = base.discover_signals(max_signals=max_signals, theme_hint=theme_hint)
        evaluated = base.evaluate_signals(discovered)
        strong = [row for row in evaluated if float(row.get("score", 0) or 0) >= 8.0 and row.get("status") == "evaluated"]
        if len(strong) < remaining:
            strong.extend([
                row for row in evaluated
                if 6.5 <= float(row.get("score", 0) or 0) < 8.0 and row.get("status") == "evaluated"
            ])
        strong = strong[:remaining]

        for signal in strong:
            brief = _get_or_create_brief(signal)
            if not brief:
                continue
            created_briefs.append(brief)
            variants.extend(generate_variants(brief))

    all_briefs = resumed_briefs + created_briefs
    return {
        "resumed_briefs": len(resumed_briefs),
        "discovered": len(discovered),
        "evaluated": len(evaluated),
        "selected_for_research": len(strong),
        "briefs_created": len(created_briefs),
        "briefs_processed": len(all_briefs),
        "variants_processed": len(variants),
        "variants_resumed": sum(1 for row in variants if row.get("resumed")),
        "brief_ids": [row["brief_id"] for row in all_briefs],
    }


def editorial_from_url(url: str, *, title: str = "", snippet: str = "", generate: bool = True) -> dict[str, Any]:
    cfg = load_config()
    store = get_store()
    signal_id = base._signal_id(url)
    existing_signal = store.filter("editorial_signals", signal_id=signal_id)
    existing_brief = store.filter("editorial_briefs", signal_id=signal_id)
    if existing_brief:
        brief = existing_brief[0]
        variants = generate_variants(brief) if generate else []
        return {"signal": existing_signal[0] if existing_signal else None, "brief": brief, "variants": variants, "resumed": True}

    signal = existing_signal[0] if existing_signal else {
        "signal_id": signal_id,
        "tenant_id": cfg["company"]["tenant_id"],
        "title": title or url,
        "source_url": url,
        "source_domain": base._domain(url),
        "snippet": snippet,
        "query": "manual editorial source",
        "score": 0.0,
        "status": "candidate",
        "evaluation": {},
        "discovered_at": base._utc_now(),
    }
    if not existing_signal:
        store.insert("editorial_signals", signal)
    evaluated = base.evaluate_signals([signal])
    if not evaluated:
        return {"signal": signal, "brief": None, "variants": []}
    chosen = evaluated[0]
    brief = _get_or_create_brief(chosen)
    variants = generate_variants(brief) if brief and generate else []
    return {"signal": chosen, "brief": brief, "variants": variants}
