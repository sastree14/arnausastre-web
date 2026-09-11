from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse
import hashlib

from .assets import get_asset_store
from .brain import load_brain
from .config import load_config
from .llm import get_llm
from .models import ApprovalItem, ContentItem, Evidence, new_id, to_dict
from .research import BraveResearchClient, SearchHit, dedupe_hits, fetch_public_page_text
from .storage import get_store
from .visuals import render_branded_card, render_business_diagram, render_comparison_visual

SUPPORTED_LANGUAGES = ("es", "en", "ca")
CONTENT_FAMILIES = (
    "current_affairs",
    "opinion",
    "educational",
    "contrarian",
    "insight",
    "case",
    "commercial",
)
OUTPUT_DECISIONS = ("IGNORE", "RESEARCH_MORE", "LINKEDIN", "ARTICLE", "LINKEDIN_AND_ARTICLE", "CASE")

STATIC_DISCOVERY_QUERIES = (
    "AI automation business operations companies implementation",
    "AI agents finance operations companies workflow",
    "forecasting inventory supply chain business case",
    "pricing optimization ecommerce retail business",
    "operations research optimization logistics scheduling business",
    "machine learning credit risk fraud business implementation",
    "business intelligence analytics decision making companies",
    "data strategy SME mid market Europe operations",
)


@dataclass
class EditorialSignal:
    signal_id: str
    tenant_id: str
    title: str
    source_url: str
    source_domain: str
    snippet: str
    query: str
    score: float = 0.0
    status: str = "candidate"
    evaluation: dict[str, Any] | None = None


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _domain(url: str) -> str:
    return urlparse(url).netloc.lower().removeprefix("www.")


def _signal_id(url: str) -> str:
    return "signal_" + hashlib.sha256(url.rstrip("/").encode("utf-8")).hexdigest()[:16]


def _weighted_score(scores: dict[str, Any]) -> float:
    weights = {
        "icp_relevance": 0.20,
        "business_consequence": 0.20,
        "angle_originality": 0.15,
        "evidence_quality": 0.15,
        "principles_fit": 0.15,
        "reader_usefulness": 0.15,
    }
    total = 0.0
    for key, weight in weights.items():
        try:
            value = max(0.0, min(10.0, float(scores.get(key, 0) or 0)))
        except (TypeError, ValueError):
            value = 0.0
        total += value * weight
    return round(total, 2)


def _editorial_brain(channel: str = "arnau_linkedin") -> str:
    voice = "voice/arnau_voice.md" if channel == "arnau_linkedin" else "voice/company_voice.md"
    files = [
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
    ]
    return load_brain(files)


def _dynamic_queries(theme_hint: str = "") -> list[str]:
    llm = get_llm()
    brain = load_brain([
        "company/services.md",
        "commercial/icp.md",
        "content/editorial_playbook.md",
    ])
    payload = llm.json(
        "You design search queries for a selective business editorial desk. Return JSON only.",
        f"""Create 6 concise web-search queries to discover CURRENT developments that could matter to SC-Analytics' target clients.
Do not search for generic thought leadership. Prefer company decisions, implementation cases, regulation, operational changes, technical developments with a clear business consequence, and credible evidence.
Cover several SC-Analytics capability areas rather than only generative AI.
Optional weekly theme: {theme_hint or 'none'}

Return {{"queries": ["...", ...]}}.

BRAIN:
{brain}
""",
    )
    result = []
    for query in payload.get("queries", []) if isinstance(payload, dict) else []:
        text = str(query).strip()
        if text and text not in result:
            result.append(text)
    return result[:6]


def discover_signals(*, max_signals: int = 60, theme_hint: str = "") -> list[dict[str, Any]]:
    cfg = load_config()
    tenant_id = cfg["company"]["tenant_id"]
    client = BraveResearchClient()
    store = get_store()
    existing = {row.get("signal_id") for row in store.list("editorial_signals")}

    queries = list(STATIC_DISCOVERY_QUERIES)
    try:
        queries.extend(_dynamic_queries(theme_hint))
    except Exception:
        pass

    hits: list[SearchHit] = []
    for query in queries:
        try:
            hits.extend(client.search(query, count=6))
        except Exception:
            continue
    hits = dedupe_hits(hits)

    rows: list[dict[str, Any]] = []
    for hit in hits:
        if len(rows) >= max_signals:
            break
        sid = _signal_id(hit.url)
        if sid in existing:
            continue
        row = to_dict(EditorialSignal(
            signal_id=sid,
            tenant_id=tenant_id,
            title=hit.title,
            source_url=hit.url,
            source_domain=_domain(hit.url),
            snippet=hit.snippet,
            query=hit.query,
        ))
        row["discovered_at"] = _utc_now()
        store.insert("editorial_signals", row)
        rows.append(row)
    return rows


def evaluate_signals(signals: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not signals:
        return []
    store = get_store()
    brain = _editorial_brain()
    llm = get_llm()
    compact = [
        {
            "signal_id": s.get("signal_id"),
            "title": s.get("title"),
            "source": s.get("source_domain"),
            "snippet": s.get("snippet"),
            "query": s.get("query"),
        }
        for s in signals
    ]
    result = llm.json(
        "You are the SC-Analytics editorial gatekeeper. Be selective. Returning no publishable topics is acceptable.",
        f"""Evaluate each candidate signal. Do not write posts yet.
For every signal return:
- signal_id
- scores: icp_relevance, business_consequence, angle_originality, evidence_quality, principles_fit, reader_usefulness, commercial_adjacency (0-10 each)
- family: one of {list(CONTENT_FAMILIES)}
- decision: one of IGNORE, RESEARCH_MORE, LINKEDIN, ARTICLE, LINKEDIN_AND_ARTICLE, CASE
- business_problem
- possible_thesis
- why_sc_analytics_should_care
- recommended_linkedin_language: es, en or ca
- reason: short explanation

Important:
- Trendiness is not a reason to publish.
- Penalise topics that merely announce a new AI product without a business consequence.
- Penalise weak source evidence.
- Reward angles where SC-Analytics can discuss a decision, trade-off, limitation, process or measurable business consequence.
- Prefer IGNORE over generic content.

BRAIN:
{brain}

SIGNALS:
{compact}
""",
    )
    items = result.get("items", result) if isinstance(result, dict) else result
    if not isinstance(items, list):
        return []

    by_id = {str(s.get("signal_id")): s for s in signals}
    evaluated: list[dict[str, Any]] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        sid = str(item.get("signal_id", ""))
        if sid not in by_id:
            continue
        scores = item.get("scores") if isinstance(item.get("scores"), dict) else {}
        score = _weighted_score(scores)
        decision = str(item.get("decision", "IGNORE")).upper()
        if decision not in OUTPUT_DECISIONS:
            decision = "IGNORE"
        family = str(item.get("family", "insight"))
        if family not in CONTENT_FAMILIES:
            family = "insight"
        evaluation = {
            **item,
            "scores": scores,
            "weighted_score": score,
            "decision": decision,
            "family": family,
        }
        status = "ignored" if decision == "IGNORE" or score < 6.5 else "evaluated"
        store.update("editorial_signals", "signal_id", sid, {
            "score": score,
            "status": status,
            "evaluation": evaluation,
        })
        evaluated.append({**by_id[sid], "score": score, "status": status, "evaluation": evaluation})
    return sorted(evaluated, key=lambda row: float(row.get("score", 0) or 0), reverse=True)


def _research_signal(signal: dict[str, Any]) -> dict[str, Any]:
    client = BraveResearchClient()
    source_url = str(signal.get("source_url", ""))
    documents: list[dict[str, str]] = []

    def add_document(url: str, title: str = "") -> None:
        if not url or any(d["url"] == url for d in documents) or len(documents) >= 4:
            return
        try:
            text = fetch_public_page_text(url, max_chars=9000)
        except Exception:
            return
        if len(text) < 300:
            return
        documents.append({"url": url, "title": title, "text": text})

    add_document(source_url, str(signal.get("title", "")))
    query = f"{signal.get('title', '')} business impact implementation"
    try:
        related = client.search(query, count=6)
    except Exception:
        related = []
    for hit in related:
        if _domain(hit.url) == "linkedin.com":
            continue
        add_document(hit.url, hit.title)
    return {"documents": documents, "source_urls": [d["url"] for d in documents]}


def create_content_brief(signal: dict[str, Any]) -> dict[str, Any] | None:
    evaluation = signal.get("evaluation") or {}
    decision = str(evaluation.get("decision", "IGNORE")).upper()
    score = float(signal.get("score", evaluation.get("weighted_score", 0)) or 0)
    if decision == "IGNORE" or score < 6.5:
        return None

    research = _research_signal(signal)
    documents = research["documents"]
    if not documents:
        get_store().update("editorial_signals", "signal_id", signal["signal_id"], {"status": "research_failed"})
        return None

    brain = _editorial_brain()
    llm = get_llm(high_reasoning=True)
    result = llm.json(
        "You are the senior editorial strategist for SC-Analytics. Build a factual content brief, not final marketing copy.",
        f"""Turn the researched signal into a canonical editorial brief.
The brief must reflect SC-Analytics' business-first philosophy and evidence policy.

Return exactly these fields:
- canonical_title
- family: one of {list(CONTENT_FAMILIES)}
- thesis
- business_problem
- target_audience: array
- why_now
- reasoning: 2-5 concise points
- practical_takeaway
- output_decision: IGNORE, LINKEDIN, ARTICLE or LINKEDIN_AND_ARTICLE
- primary_linkedin_language: es, en or ca
- article_value: short explanation
- evidence: array of {{claim, url}} using ONLY URLs from SOURCE_URLS
- visual: {{needed: boolean, type: none|insight|comparison|process_flow, concept: string, left: string, right: string, steps: array}}
- risks_or_limits: array

Rules:
- If research does not support a defensible thesis, output_decision must be IGNORE.
- Never infer a client result or SC-Analytics experience from public reporting.
- Separate source facts from SC-Analytics opinion.
- Do not turn every AI announcement into a post.
- Do not make the thesis more certain than the evidence.

INITIAL EVALUATION:
{evaluation}

SOURCE_URLS:
{research['source_urls']}

RESEARCH DOCUMENTS:
{documents}

BRAIN:
{brain}
""",
    )
    output_decision = str(result.get("output_decision", "IGNORE")).upper()
    if output_decision not in ("IGNORE", "LINKEDIN", "ARTICLE", "LINKEDIN_AND_ARTICLE"):
        output_decision = "IGNORE"
    if output_decision == "IGNORE":
        get_store().update("editorial_signals", "signal_id", signal["signal_id"], {
            "status": "ignored_after_research",
            "evaluation": {**evaluation, "research_decision": "IGNORE"},
        })
        return None

    allowed_urls = set(research["source_urls"])
    clean_evidence = []
    for evidence in result.get("evidence", []) if isinstance(result.get("evidence"), list) else []:
        if not isinstance(evidence, dict):
            continue
        url = str(evidence.get("url", ""))
        claim = str(evidence.get("claim", "")).strip()
        if url in allowed_urls and claim:
            clean_evidence.append({"claim": claim, "url": url})

    cfg = load_config()
    brief_id = new_id("brief")
    family = str(result.get("family", evaluation.get("family", "insight")))
    if family not in CONTENT_FAMILIES:
        family = "insight"
    primary_language = str(result.get("primary_linkedin_language", evaluation.get("recommended_linkedin_language", "es")))
    if primary_language not in SUPPORTED_LANGUAGES:
        primary_language = cfg["company"].get("default_language", "es")

    brief = {
        "brief_id": brief_id,
        "tenant_id": cfg["company"]["tenant_id"],
        "signal_id": signal["signal_id"],
        "family": family,
        "canonical_title": str(result.get("canonical_title", signal.get("title", ""))),
        "thesis": str(result.get("thesis", "")),
        "business_problem": str(result.get("business_problem", "")),
        "target_audience": list(result.get("target_audience") or []),
        "why_now": str(result.get("why_now", "")),
        "reasoning": list(result.get("reasoning") or []),
        "practical_takeaway": str(result.get("practical_takeaway", "")),
        "output_decision": output_decision,
        "primary_linkedin_language": primary_language,
        "article_value": str(result.get("article_value", "")),
        "visual": result.get("visual") if isinstance(result.get("visual"), dict) else {"needed": False, "type": "none"},
        "scores": evaluation.get("scores", {}),
        "weighted_score": score,
        "evidence": clean_evidence,
        "research": {"source_urls": research["source_urls"]},
        "risks_or_limits": list(result.get("risks_or_limits") or []),
        "status": "draft",
        "created_at": _utc_now(),
    }
    store = get_store()
    store.insert("editorial_briefs", brief)
    store.update("editorial_signals", "signal_id", signal["signal_id"], {"status": "briefed"})

    evidence_ids: list[str] = []
    for row in clean_evidence:
        evidence = Evidence(
            evidence_id=new_id("evidence"),
            type="PUBLIC_SOURCE",
            claim=row["claim"],
            source=_domain(row["url"]),
            approved_for_public_use=True,
            confidential=False,
            anonymized=False,
            url=row["url"],
            notes=f"Editorial brief {brief_id}; claim requires human review before publication.",
        )
        payload = to_dict(evidence)
        payload["tenant_id"] = cfg["company"]["tenant_id"]
        store.insert("evidence", payload)
        evidence_ids.append(evidence.evidence_id)
    brief["evidence_ids"] = evidence_ids
    store.update("editorial_briefs", "brief_id", brief_id, {"evidence_ids": evidence_ids})
    return brief


def _writer_instructions(language: str, channel: str, content_type: str) -> str:
    language_names = {"es": "Spanish", "en": "English", "ca": "Catalan"}
    target = language_names[language]
    if content_type == "article":
        return f"Write a native {target} website article for SC-Analytics. Use natural Markdown headings and prose."
    if channel == "arnau_linkedin":
        return f"Write a native {target} LinkedIn post in Arnau Sastre's professional founder voice."
    return f"Write a native {target} LinkedIn post in SC-Analytics' company voice."


def _write_variant(brief: dict[str, Any], *, language: str, channel: str, content_type: str) -> dict[str, Any]:
    brain = _editorial_brain(channel)
    llm = get_llm(high_reasoning=content_type == "article")
    format_rules = (
        "900-1600 words, useful section headings, no SEO padding, no fake quotes, and no hard sales CTA."
        if content_type == "article"
        else "Usually 900-1800 characters. Natural paragraphs, no hashtag block, no forced CTA, no fake suspense, and no one-sentence-per-line formatting habit."
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
    brain = _editorial_brain(channel)
    llm = get_llm(high_reasoning=True)
    result = llm.json(
        "You are a strict SC-Analytics editorial critic. Your job is to reject generic AI-sounding content.",
        f"""Critique the draft against the brief and brand.
Return:
- quality_score: 0-10
- voice_score: 0-10
- evidence_score: 0-10
- usefulness_score: 0-10
- generic_ai_risk: 0-10 where 10 is very generic/synthetic
- issues: array
- rewrite_required: boolean
- rewrite_instructions: array

Reject or request rewrite if it:
- sounds like generic LinkedIn/AI copy;
- could be posted by any consultancy;
- changes evidence or certainty;
- leads with technology rather than the business problem;
- overuses slogans, hooks, one-line paragraphs or marketing language;
- does not sound natural in {language};
- does not sound credible from Arnau/SC-Analytics.

CONTENT TYPE: {content_type}
CHANNEL: {channel}
LANGUAGE: {language}
BRIEF: {brief}
DRAFT: {draft}
BRAIN: {brain}
""",
    )
    return result if isinstance(result, dict) else {}


def _rewrite_variant(brief: dict[str, Any], draft: dict[str, Any], critique: dict[str, Any], *, language: str, channel: str, content_type: str) -> dict[str, Any]:
    brain = _editorial_brain(channel)
    llm = get_llm(high_reasoning=True)
    result = llm.json(
        _writer_instructions(language, channel, content_type),
        f"""Rewrite the draft once using the critic instructions. Preserve evidence and thesis exactly.
Return {{"title": "...", "body": "..."}} only.

BRIEF: {brief}
DRAFT: {draft}
CRITIQUE: {critique}
BRAIN: {brain}
""",
    )
    return {"title": str(result.get("title", draft.get("title", ""))).strip(), "body": str(result.get("body", draft.get("body", ""))).strip()}


def _render_visual(brief: dict[str, Any], variant: dict[str, Any], slug: str) -> tuple[str, str]:
    visual = brief.get("visual") or {}
    if not visual.get("needed") or str(visual.get("type", "none")) == "none":
        return "none", ""
    visual_type = str(visual.get("type", "insight"))
    title = str(variant.get("title") or brief.get("canonical_title") or "SC-Analytics insight")[:80]
    if visual_type == "comparison":
        path = render_comparison_visual(title, str(visual.get("left", "")), str(visual.get("right", "")), slug=slug)
    elif visual_type == "process_flow":
        path = render_business_diagram(title, [str(x) for x in visual.get("steps", [])], slug=slug)
    else:
        path = render_branded_card(title, str(visual.get("concept", brief.get("practical_takeaway", "")))[:130], slug=slug)
    cfg = load_config()
    asset_key = f"{cfg['company']['tenant_id']}/editorial/{brief['brief_id']}/{path.name}"
    ref = get_asset_store().put(path, asset_key)
    return f"react_{visual_type}", ref


def _persist_variant(brief: dict[str, Any], *, language: str, channel: str, content_type: str, primary: bool) -> dict[str, Any]:
    draft = _write_variant(brief, language=language, channel=channel, content_type=content_type)
    critique = _critic(brief, draft, language=language, channel=channel, content_type=content_type)
    quality = float(critique.get("quality_score", 0) or 0)
    if critique.get("rewrite_required") or quality < 8.0:
        draft = _rewrite_variant(brief, draft, critique, language=language, channel=channel, content_type=content_type)
        critique = _critic(brief, draft, language=language, channel=channel, content_type=content_type)
        quality = float(critique.get("quality_score", 0) or 0)

    cfg = load_config()
    content_id = new_id("content")
    visual_type, visual_path = ("none", "")
    if content_type == "linkedin_post":
        visual_type, visual_path = _render_visual(brief, draft, f"{brief['brief_id']}-{language}-{channel}")

    item = ContentItem(
        content_id=content_id,
        tenant_id=cfg["company"]["tenant_id"],
        channel=channel if content_type == "linkedin_post" else "website",
        content_type=content_type,
        title=draft["title"],
        body=draft["body"],
        objective="authority",
        target_audience=list(brief.get("target_audience") or []),
        evidence_ids=list(brief.get("evidence_ids") or []),
        status="draft" if primary or content_type == "article" else "alternate",
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

    if primary and quality >= 7.5:
        approval_type = "publish_post" if content_type == "linkedin_post" else "publish_article"
        approval = ApprovalItem(
            approval_id=new_id("approval"),
            tenant_id=cfg["company"]["tenant_id"],
            action_type=approval_type,
            target_id=content_id,
            summary=("Approve LinkedIn post" if content_type == "linkedin_post" else "Approve website article") + f": {item.title}",
            payload={
                "content_id": content_id,
                "brief_id": brief["brief_id"],
                "language": language,
                "family": brief.get("family"),
                "title": item.title,
                "body": item.body,
                "visual_type": visual_type,
                "visual_path": visual_path,
                "quality_score": quality,
                "critique": critique,
                "source_urls": (brief.get("research") or {}).get("source_urls", []),
                "evidence_ids": item.evidence_ids,
                "execution_mode": "official_api_when_configured" if content_type == "linkedin_post" else "website_publish_after_approval",
            },
        )
        get_store().insert("approvals", to_dict(approval))
        payload["approval_id"] = approval.approval_id
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


def run_editorial_cycle(*, max_signals: int = 50, max_briefs: int = 3, theme_hint: str = "") -> dict[str, Any]:
    discovered = discover_signals(max_signals=max_signals, theme_hint=theme_hint)
    evaluated = evaluate_signals(discovered)
    strong = [row for row in evaluated if float(row.get("score", 0) or 0) >= 8.0 and row.get("status") == "evaluated"]
    if len(strong) < max_briefs:
        strong.extend([
            row for row in evaluated
            if 6.5 <= float(row.get("score", 0) or 0) < 8.0 and row.get("status") == "evaluated"
        ])
    strong = strong[:max_briefs]

    briefs: list[dict[str, Any]] = []
    variants: list[dict[str, Any]] = []
    for signal in strong:
        brief = create_content_brief(signal)
        if not brief:
            continue
        briefs.append(brief)
        variants.extend(generate_variants(brief))

    return {
        "discovered": len(discovered),
        "evaluated": len(evaluated),
        "selected_for_research": len(strong),
        "briefs_created": len(briefs),
        "variants_created": len(variants),
        "brief_ids": [b["brief_id"] for b in briefs],
    }


def editorial_from_url(url: str, *, title: str = "", snippet: str = "", generate: bool = True) -> dict[str, Any]:
    cfg = load_config()
    store = get_store()
    signal = {
        "signal_id": _signal_id(url),
        "tenant_id": cfg["company"]["tenant_id"],
        "title": title or url,
        "source_url": url,
        "source_domain": _domain(url),
        "snippet": snippet,
        "query": "manual editorial source",
        "score": 0.0,
        "status": "candidate",
        "evaluation": {},
        "discovered_at": _utc_now(),
    }
    existing = store.filter("editorial_signals", signal_id=signal["signal_id"])
    if not existing:
        store.insert("editorial_signals", signal)
    evaluated = evaluate_signals([signal])
    if not evaluated:
        return {"signal": signal, "brief": None, "variants": []}
    chosen = evaluated[0]
    brief = create_content_brief(chosen)
    variants = generate_variants(brief) if brief and generate else []
    return {"signal": chosen, "brief": brief, "variants": variants}
