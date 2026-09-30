from __future__ import annotations

from typing import Any

from .visual_system import chart_candidates, format_contract


CAROUSEL = {
    "cover":["editorial_statement","split_summary","statement_with_micro_visual"],
    "process":["horizontal_process","vertical_process","grouped_process"],
    "comparison":["two_card_comparison","comparison_table","comparison_matrix"],
    "evidence":["metric_cards","evidence_table","mini_dataviz"],
    "framework":["two_layer_framework","framework_grid","decision_chain"],
    "conclusion":["takeaway_panel","closing_steps","principle_plus_summary"],
}


def _architecture_variants(content: dict[str, Any]) -> list[str]:
    nodes = content.get("nodes") or []
    n = len(nodes) if isinstance(nodes, list) else 0
    avg = 0.0
    if n:
        avg = sum(len(str(x.get("label") or x.get("title") or "")) for x in nodes if isinstance(x, dict)) / n
    if n <= 5 and avg <= 28:
        return ["horizontal_flow","vertical_flow","layered_flow"]
    if n <= 8:
        return ["vertical_flow","grid_flow","layered_flow"]
    return ["layered_flow","grid_flow","vertical_flow"]


def _before_after_variants() -> list[str]:
    return ["side_by_side_transformation","split_panel_transformation","stacked_transformation"]


def generate_candidates(package: dict[str, Any], *, max_candidates: int = 3) -> list[dict[str, Any]]:
    fmt = str(package.get("format") or "")
    content = package.get("content") or {}
    max_candidates = max(1, min(3, int(max_candidates)))
    if fmt == "dataviz":
        relationship = str(content.get("analytical_relationship") or content.get("relationship") or "comparison")
        variants = chart_candidates(relationship) or ["bar","dot_plot","line"]
        return [{"variant_key":v,"chart_type":v,"orientation":"auto","density":"medium","options":{}} for v in variants[:max_candidates]]
    if fmt == "architecture":
        return [{"variant_key":v,"orientation":("horizontal" if v=="horizontal_flow" else "vertical" if v=="vertical_flow" else "grid" if v=="grid_flow" else "auto"),"chart_type":None,"density":"medium","options":{}} for v in _architecture_variants(content)[:max_candidates]]
    if fmt == "before_after":
        return [{"variant_key":v,"orientation":"auto","chart_type":None,"density":"medium","options":{}} for v in _before_after_variants()[:max_candidates]]
    if fmt == "carousel":
        slides = content.get("slides") or []
        roles = [str(x.get("role") or "") for x in slides if isinstance(x, dict)]
        role = next((r for r in roles if r in CAROUSEL and r not in {"cover","conclusion"}), "evidence")
        variants = CAROUSEL.get(role) or ["metric_cards","evidence_table","mini_dataviz"]
        return [{"variant_key":v,"orientation":"auto","chart_type":None,"density":"medium","options":{"primary_role":role}} for v in variants[:max_candidates]]
    raise ValueError(f"Unsupported visual format: {fmt}")
