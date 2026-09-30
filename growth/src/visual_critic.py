from __future__ import annotations

from pathlib import Path
from typing import Any

from .llm import get_llm


def _bounded(value: Any, default: float = 0.75) -> float:
    try:
        return max(0.0, min(1.0, float(value)))
    except (TypeError, ValueError):
        return default


def critique_render(spec: dict[str, Any], png_path: str | Path, qa_report: dict[str, Any]) -> dict[str, Any]:
    """Non-authoritative visual critique.

    Hard QA always wins. This critic exists to rank valid outputs on hierarchy,
    balance, density and executive readability after the deterministic renderer
    has already enforced the brand system.
    """
    if not qa_report.get("passed"):
        return {
            "available": False,
            "score": 0.0,
            "reason": "Hard QA failed; visual critic cannot override deterministic rejection.",
            "issues": list(qa_report.get("issues") or []),
        }
    try:
        result = get_llm(high_reasoning=True).vision_json(
            "You are the SC-Analytics visual critic. You may critique composition but you may not override hard brand rules or invent factual problems. Return JSON only.",
            f"""Evaluate this rendered SC-Analytics editorial visual at feed size.

FORMAT: {spec.get('format')}
VISUAL LANGUAGE: {spec.get('visual_language')}
SEMANTIC PATTERN: {spec.get('semantic_pattern')}
EVIDENCE MODE: {spec.get('evidence_mode')}

Return:
{{
  "executive_readability": 0.0,
  "hierarchy": 0.0,
  "visual_balance": 0.0,
  "density": 0.0,
  "semantic_clarity": 0.0,
  "issues": ["short issue"],
  "reason": "one concise explanation"
}}

Score 1.0 only when the visual is unusually strong. Penalise cramped copy, weak hierarchy, excessive whitespace, ambiguous visual emphasis and charts/diagrams that do not make the argument easier to understand.""",
            png_path,
        )
        if not isinstance(result, dict):
            raise RuntimeError("Vision critic returned non-object")
        scores = {
            "executive_readability": _bounded(result.get("executive_readability")),
            "hierarchy": _bounded(result.get("hierarchy")),
            "visual_balance": _bounded(result.get("visual_balance")),
            "density": _bounded(result.get("density")),
            "semantic_clarity": _bounded(result.get("semantic_clarity")),
        }
        score = round(
            scores["executive_readability"] * 0.28
            + scores["hierarchy"] * 0.22
            + scores["visual_balance"] * 0.18
            + scores["density"] * 0.12
            + scores["semantic_clarity"] * 0.20,
            5,
        )
        return {
            "available": True,
            "score": score,
            "scores": scores,
            "issues": [str(x) for x in (result.get("issues") or [])][:8],
            "reason": str(result.get("reason") or "").strip(),
        }
    except Exception as exc:
        return {
            "available": False,
            "score": 0.75,
            "reason": f"Vision critic unavailable; deterministic QA remains authoritative. {exc}",
            "issues": [],
        }
