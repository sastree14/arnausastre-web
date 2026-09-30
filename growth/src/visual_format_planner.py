from __future__ import annotations

from typing import Any

from .llm import get_llm
from .visual_system import format_candidates


def _base_score(format_key: str, content_object: dict[str, Any]) -> float:
    family = str(content_object.get("content_family") or "")
    semantics = ((content_object.get("output_hints") or {}).get("visual_semantics") or {})
    score = 0.66
    if format_key == "dataviz" and semantics.get("quantitative_evidence"):
        score += 0.20
    if format_key == "architecture" and semantics.get("architecture_available"):
        score += 0.20
    if format_key == "before_after" and semantics.get("before_after"):
        score += 0.20
    if format_key == "carousel" and family in {"compare","decision_guide","framework_playbook","case_project_proof","point_of_view_contrarian"}:
        score += 0.14
    if format_key == "architecture" and family in {"system_architecture","diagnose","failure_modes_mistakes"}:
        score += 0.14
    if format_key == "dataviz" and family in {"evidence_measurement","explain_understand","current_development_implication"}:
        score += 0.12
    if format_key == "before_after" and family == "transformation":
        score += 0.16
    return min(1.0, score)


def eligible_visual_formats(content_object: dict[str, Any], channel: str) -> list[str]:
    family = str(content_object.get("content_family") or "")
    configured = format_candidates(family) or ["carousel","dataviz","architecture","before_after"]
    if channel == "marketplace_project":
        preferred = ["architecture","dataviz","before_after","carousel"]
        return [x for x in preferred if x in configured] or configured
    return configured


def recommend_visual_formats(content_object: dict[str, Any], *, channel: str, max_options: int = 3) -> list[dict[str, Any]]:
    valid = eligible_visual_formats(content_object, channel)
    baseline = {f: _base_score(f, content_object) for f in valid}
    try:
        result = get_llm(high_reasoning=True).json(
            "You are the SC-Analytics visual format planner. Rank only supplied valid formats. Return JSON only.",
            f"""Choose the most useful visual format for this approved content on channel={channel}.
Valid formats only: {valid}

A dataviz may represent real quantitative evidence OR an explicitly illustrative conceptual relationship such as overfitting, maturity, trade-offs or diminishing returns. Never invent empirical metrics.

Return:
{{"ranking":[{{"format":"...","semantic_fit":0.0,"reason":"..."}}]}}

CONTENT OBJECT:
{content_object}
""",
        )
        rows = result.get("ranking") if isinstance(result, dict) else []
    except Exception:
        rows = []
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    for row in rows if isinstance(rows, list) else []:
        if not isinstance(row, dict):
            continue
        fmt = str(row.get("format") or "")
        if fmt not in valid or fmt in seen:
            continue
        ai = max(0.0, min(1.0, float(row.get("semantic_fit") or 0)))
        out.append({"format":fmt,"score":round(0.55*ai+0.45*baseline[fmt],5),"reason":str(row.get("reason") or "")})
        seen.add(fmt)
    for fmt in valid:
        if fmt not in seen:
            out.append({"format":fmt,"score":round(baseline[fmt],5),"reason":"Deterministic editorial fit."})
    out.sort(key=lambda r: (-float(r["score"]), valid.index(str(r["format"]))))
    return out[:max(1,min(3,int(max_options)))]
