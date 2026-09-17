from __future__ import annotations

from collections import Counter
import re
from typing import Any

from .editorial_planner import build_content_proposals, run_guided_editorial_cycle
from .editorial_runtime import generate_variants
from .storage import get_store

_STOPWORDS = {
    "para", "como", "sobre", "desde", "esta", "este", "estos", "estas", "entre", "cuando", "donde", "porque",
    "with", "from", "into", "this", "that", "your", "business", "company", "companies", "data", "analytics",
    "datos", "empresa", "empresas", "negocio", "contenido", "linkedin", "articulo", "article", "post", "sc-analytics",
    "machine", "learning", "intelligence", "artificial", "sistema", "sistemas", "modelo", "modelos", "proceso", "procesos",
}


def _tokens(value: Any) -> set[str]:
    return {
        token for token in re.findall(r"[a-z0-9áéíóúüñ+-]{4,}", str(value or "").lower())
        if token not in _STOPWORDS
    }


def _recent_repetition_terms(rows: list[dict[str, Any]], limit: int = 4) -> list[str]:
    recent = rows[:30]
    if len(recent) < 4:
        return []
    frequency: Counter[str] = Counter()
    for row in recent:
        frequency.update(_tokens(f"{row.get('title', '')} {row.get('topic', '')} {row.get('challenge', '')}"))
    threshold = max(3, round(len(recent) * 0.25))
    return [token for token, count in frequency.most_common() if count >= threshold][:limit]


def _research_briefs(limit: int = 12) -> list[dict[str, Any]]:
    rows = [
        row for row in get_store().list("editorial_briefs")
        if str(row.get("status") or "") not in {"ignored", "rejected", "failed"}
    ]
    rows.sort(key=lambda row: str(row.get("created_at") or ""), reverse=True)
    return rows[:limit]


def _brief_summary(brief: dict[str, Any]) -> str:
    urls = list((brief.get("research") or {}).get("source_urls") or [])
    return (
        f"brief_id={brief.get('brief_id')}; title={brief.get('canonical_title')}; "
        f"problem={brief.get('business_problem')}; thesis={brief.get('thesis')}; "
        f"decision={brief.get('output_decision')}; evidence_sources={len(urls)}"
    )


def _match_brief(proposal: dict[str, Any], briefs: list[dict[str, Any]]) -> dict[str, Any] | None:
    proposal_tokens = _tokens(
        f"{proposal.get('title', '')} {proposal.get('hook', '')} {proposal.get('business_problem', '')} {proposal.get('thesis', '')}"
    )
    if not proposal_tokens:
        return None
    best: tuple[float, int, dict[str, Any]] | None = None
    for brief in briefs:
        brief_tokens = _tokens(
            f"{brief.get('canonical_title', '')} {brief.get('business_problem', '')} {brief.get('thesis', '')}"
        )
        overlap = len(proposal_tokens & brief_tokens)
        union = len(proposal_tokens | brief_tokens) or 1
        score = overlap / union
        candidate = (score, overlap, brief)
        if best is None or (score, overlap) > (best[0], best[1]):
            best = candidate
    if not best or (best[1] < 2 and best[0] < 0.16):
        return None
    return best[2]


def build_research_aware_proposals(*, focus: str = "", avoid: str = "", count: int = 3, history_days: int = 60) -> dict[str, Any]:
    store = get_store()
    content = sorted(store.list("content_items"), key=lambda row: str(row.get("created_at") or ""), reverse=True)
    cooldown = _recent_repetition_terms(content)
    briefs = _research_briefs()

    research_context = "\n".join(f"- {_brief_summary(brief)}" for brief in briefs[:8])
    augmented_focus = focus.strip()
    if research_context:
        library_instruction = (
            "Use the researched editorial library below as preferred evidence-backed starting points when they are relevant. "
            "Do not force a brief if it would create repetition.\n" + research_context
        )
        augmented_focus = f"{augmented_focus}\n\n{library_instruction}".strip()

    cooldown_instruction = ""
    if cooldown:
        cooldown_instruction = "Portfolio cooldown: do not center another proposal on these recently overused themes: " + ", ".join(cooldown)
    augmented_avoid = "\n".join(part for part in [avoid.strip(), cooldown_instruction] if part)

    result = build_content_proposals(
        focus=augmented_focus,
        avoid=augmented_avoid,
        count=count,
        history_days=history_days,
    )
    proposals = list(result.get("proposals") or [])
    linked = 0
    for proposal in proposals:
        matched = _match_brief(proposal, briefs)
        if matched:
            proposal["research_brief_id"] = str(matched.get("brief_id") or "")
            proposal["research_source_urls"] = list((matched.get("research") or {}).get("source_urls") or [])
            proposal["research_reused"] = True
            linked += 1
        proposal["generation_hint"] = (
            f"Selected editorial proposal. Industry: {proposal.get('industry', '')}. Service: {proposal.get('service', '')}. "
            f"Title direction: {proposal.get('title', '')}. Business problem: {proposal.get('business_problem', '')}. "
            f"Thesis: {proposal.get('thesis', '')}. Required focus: {focus.strip() or 'use this proposal exactly'}. "
            f"Avoid: {avoid.strip() or 'no additional exclusions'}."
        )

    result["focus"] = focus
    result["avoid"] = avoid
    result["research_library"] = {
        "briefs_available": len(briefs),
        "proposals_linked_to_research": linked,
        "brief_ids_considered": [str(row.get("brief_id") or "") for row in briefs[:8]],
    }
    result["portfolio_cooldown_terms"] = cooldown
    return result


def run_editorial_with_library(
    *,
    research_brief_id: str = "",
    max_signals: int = 30,
    max_briefs: int = 1,
    theme_hint: str = "",
    avoid: str = "",
    strict_theme: bool = False,
    force_new: bool = False,
) -> dict[str, Any]:
    brief_id = research_brief_id.strip()
    if brief_id:
        rows = get_store().filter("editorial_briefs", brief_id=brief_id)
        if rows:
            brief = dict(rows[0])
            variants = generate_variants(brief)
            return {
                "brief_ids": [brief_id],
                "variants": variants,
                "reused_research": True,
                "research_brief_id": brief_id,
                "source_urls": list((brief.get("research") or {}).get("source_urls") or []),
                "signals_discovered": 0,
                "signals_evaluated": 0,
            }
    result = run_guided_editorial_cycle(
        max_signals=max_signals,
        max_briefs=max_briefs,
        theme_hint=theme_hint,
        avoid=avoid,
        strict_theme=strict_theme,
        force_new=force_new,
    )
    if isinstance(result, dict):
        result["reused_research"] = False
    return result
