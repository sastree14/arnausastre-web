from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import json
from typing import Any

from jsonschema import Draft202012Validator

from .llm import get_llm
from .models import new_id
from .visual_candidates import generate_candidates
from .visual_system import assert_language_allowed, auto_visual_language, load_visual_system

ROOT = Path(__file__).resolve().parents[1]


def _now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _schema() -> dict[str, Any]:
    return json.loads((ROOT / "schemas" / "visual_spec.schema.json").read_text(encoding="utf-8"))


def _has_quantitative_data(package: dict[str, Any]) -> bool:
    content = package.get("content") or {}
    if not isinstance(content, dict):
        return False
    for key in ("data", "series", "values"):
        value = content.get(key)
        if isinstance(value, list) and value:
            return True
        if isinstance(value, dict) and value:
            return True
    return False


def _source_refs(content_object: dict[str, Any]) -> list[str]:
    evidence = content_object.get("evidence") or {}
    refs: list[str] = []
    if not isinstance(evidence, dict):
        return refs
    for claim in evidence.get("claims") or []:
        if not isinstance(claim, dict) or not claim.get("verified"):
            continue
        ref = claim.get("source_ref") or claim.get("source_url")
        if ref:
            refs.append(str(ref))
    for source in evidence.get("project_sources") or []:
        if not isinstance(source, dict):
            continue
        repo = str(source.get("repository") or "").strip()
        project_id = str(source.get("project_id") or "").strip()
        source_path = str(source.get("path") or "").strip()
        if repo and project_id:
            ref = f"{repo}:{project_id}"
            if source_path:
                ref += f":{source_path}"
            refs.append(ref)
    refs.extend(str(x) for x in (evidence.get("public_sources") or []) if x)
    refs.extend(str(x) for x in (evidence.get("internal_sources") or []) if x)
    return list(dict.fromkeys(refs))


def _infer_intent(content_object: dict[str, Any], package: dict[str, Any]) -> dict[str, Any]:
    try:
        result = get_llm(high_reasoning=True).json(
            "You are the SC-Analytics visual planner. Analyse meaning, not decoration. Return JSON only.",
            f"""Analyse this approved content and determine the semantic visual intent.

Return:
{{
  "relationship":"trend|multi_series_trend|comparison|ranking|distribution|correlation|composition|change|target_vs_actual|uncertainty|anomaly|conceptual_curve|process|architecture|transformation",
  "semantic_pattern":"machine_key",
  "evidence_mode":"empirical|illustrative|mixed",
  "quantitative_data_available":true,
  "planner_reason":"..."
}}

Architecture semantic patterns should prefer:
linear_flow, pipeline, layered_system, hierarchy, hub_spoke, network, cycle, feedback_loop.

Before/After should prefer:
before_after, fragmented_network_to_pipeline, manual_to_automated, messy_to_controlled.

Illustrative conceptual graphics ARE allowed: overfitting curves, bias/variance, diminishing returns, maturity curves and conceptual trade-offs. Never fabricate measured-looking evidence.

CANONICAL:
{content_object}

PACKAGE:
{package}
""",
        )
        if not isinstance(result, dict):
            result = {}
        fmt = str(package.get("format") or "")
        has_quant = _has_quantitative_data(package)
        hinted_quant = bool((((content_object.get("output_hints") or {}).get("visual_semantics") or {}).get("quantitative_evidence")))
        if fmt == "dataviz" and not has_quant and not hinted_quant:
            result["evidence_mode"] = "illustrative"
            if str(result.get("relationship") or "") not in {
                "conceptual_curve", "process", "architecture", "transformation"
            }:
                result["relationship"] = "conceptual_curve"
            result.setdefault("semantic_pattern", "conceptual_curve")
            result["quantitative_data_available"] = False
        return result
    except Exception:
        fmt = str(package.get("format") or "")
        has_quant = _has_quantitative_data(package)
        hinted_quant = bool((((content_object.get("output_hints") or {}).get("visual_semantics") or {}).get("quantitative_evidence")))
        illustrative = fmt == "dataviz" and not has_quant and not hinted_quant
        return {
            "relationship": "architecture" if fmt == "architecture" else "transformation" if fmt == "before_after" else "conceptual_curve" if illustrative else "comparison",
            "semantic_pattern": "pipeline" if fmt == "architecture" else "before_after" if fmt == "before_after" else "conceptual_curve" if illustrative else "comparison",
            "evidence_mode": "illustrative" if illustrative else "empirical",
            "quantitative_data_available": has_quant,
            "planner_reason": "Deterministic fallback constrained by available evidence.",
        }


def _default_style_score(style: str, family: str, fmt: str) -> float:
    default = auto_visual_language(family, fmt)
    if style == default:
        return 1.0
    adjacent = {
        "A":{"B":0.72,"C":0.78,"D":0.62},
        "B":{"A":0.70,"C":0.72,"D":0.82},
        "C":{"A":0.80,"B":0.68,"D":0.74},
        "D":{"A":0.58,"B":0.84,"C":0.72},
    }
    return adjacent.get(default, {}).get(style, 0.6)


def _rank(
    content_object: dict[str, Any],
    package: dict[str, Any],
    candidates: list[dict[str, Any]],
    *,
    visual_language: str,
    intent: dict[str, Any],
) -> list[dict[str, Any]]:
    weights = load_visual_system().get("candidate_scoring") or {}
    family = str(content_object.get("content_family") or "")
    style_fit = _default_style_score(visual_language, family, str(package.get("format") or ""))
    try:
        ai = get_llm(high_reasoning=True).json(
            "You are the SC-Analytics composition planner. Rank only supplied valid candidates. Return JSON only.",
            f"""Rank the valid candidates. Do not invent another composition.
All candidates use visual language {visual_language}.

Return:
{{"ranking":[{{"variant_key":"...","semantic_fit":0.0,"clarity":0.0,"visual_balance":0.0,"information_density":0.0,"novelty":0.0,"reason":"..."}}]}}

INTENT:
{intent}

PACKAGE:
{package}

CANDIDATES:
{candidates}
""",
        )
    except Exception:
        ai = {}
    by_key = {}
    if isinstance(ai, dict):
        for row in ai.get("ranking") or []:
            if isinstance(row, dict) and row.get("variant_key"):
                by_key[str(row["variant_key"])] = row

    scored = []
    for candidate in candidates:
        row = by_key.get(str(candidate["variant_key"]), {})
        semantic = float(row.get("semantic_fit") or 0.82)
        clarity = float(row.get("clarity") or 0.82)
        balance = float(row.get("visual_balance") or 0.80)
        density = float(row.get("information_density") or 0.80)
        novelty = float(row.get("novelty") or 0.65)
        score = (
            semantic * float(weights.get("semantic_fit",0.35))
            + clarity * float(weights.get("clarity",0.25))
            + balance * float(weights.get("visual_balance",0.15))
            + style_fit * float(weights.get("brand_fit",0.10))
            + density * float(weights.get("information_density",0.10))
            + novelty * float(weights.get("novelty",0.05))
        )
        scored.append({**candidate,"score":round(score,5),"reason":str(row.get("reason") or intent.get("planner_reason") or "")})
    return sorted(scored,key=lambda x:x["score"],reverse=True)


def plan_visual_candidates(
    content_object: dict[str, Any],
    package: dict[str, Any],
    *,
    candidate_count: int = 3,
) -> list[dict[str, Any]]:
    fmt = str(package.get("format") or "")
    requested = str(package.get("visual_language") or "AUTO").upper()
    family = str(content_object.get("content_family") or "")
    language = auto_visual_language(family,fmt) if requested == "AUTO" else requested
    assert_language_allowed(fmt,language)

    intent = _infer_intent(content_object,package)
    evidence_mode = str(intent.get("evidence_mode") or "empirical")
    relationship = str(intent.get("relationship") or "comparison")
    semantic_pattern = str(intent.get("semantic_pattern") or relationship)
    structured = dict(package.get("content") or {})
    if fmt == "dataviz":
        structured.setdefault("analytical_relationship", relationship)

    candidates = generate_candidates({**package,"content":structured},max_candidates=candidate_count)
    ranked = _rank(content_object,{**package,"content":structured},candidates,visual_language=language,intent=intent)

    specs: list[dict[str, Any]] = []
    for row in ranked[:max(1,min(3,int(candidate_count)))]:
        disclosure = None
        if evidence_mode == "illustrative":
            disclosure = "Illustrative example — conceptual relationship, not measured evidence."
        spec = {
            "visual_spec_id": new_id("vspec"),
            "format": fmt,
            "visual_language": language,
            "semantic_pattern": semantic_pattern,
            "evidence_mode": evidence_mode,
            "visual_role": str(package.get("visual_role") or ""),
            "channel": str(package.get("channel") or ""),
            "content": structured,
            "composition": {
                "variant_key": str(row.get("variant_key") or ""),
                "orientation": str(row.get("orientation") or "auto"),
                "chart_type": row.get("chart_type"),
                "connector_type": None,
                "density": str(row.get("density") or "medium"),
                "annotations": [],
                "options": row.get("options") if isinstance(row.get("options"),dict) else {},
            },
            "source_refs": _source_refs(content_object),
            "illustrative_disclosure": disclosure,
            "planner_reason": str(row.get("reason") or intent.get("planner_reason") or ""),
            "planner_score": float(row.get("score") or 0),
            "created_at": _now(),
        }
        errors = sorted(Draft202012Validator(_schema()).iter_errors(spec),key=lambda e:list(e.path))
        if errors:
            raise RuntimeError("Visual spec validation failed: "+"; ".join(e.message for e in errors[:6]))
        specs.append(spec)
    return specs
