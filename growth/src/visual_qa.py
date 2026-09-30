from __future__ import annotations

from typing import Any

from .visual_system import allowed_languages, load_visual_system, visual_language


def _boxes_overlap(a: dict[str, Any], b: dict[str, Any]) -> bool:
    ax1, ay1 = float(a.get("x", 0)), float(a.get("y", 0))
    ax2, ay2 = ax1 + float(a.get("width", 0)), ay1 + float(a.get("height", 0))
    bx1, by1 = float(b.get("x", 0)), float(b.get("y", 0))
    bx2, by2 = bx1 + float(b.get("width", 0)), by1 + float(b.get("height", 0))
    return ax1 < bx2 and ax2 > bx1 and ay1 < by2 and ay2 > by1


def _layout_boxes(layout: dict[str, Any]) -> list[dict[str, Any]]:
    boxes = [b for b in (layout.get("boxes") or []) if isinstance(b, dict)]
    if boxes:
        return boxes
    out: list[dict[str, Any]] = []
    for slide in layout.get("slides") or []:
        if isinstance(slide, dict):
            out.extend([b for b in (slide.get("boxes") or []) if isinstance(b, dict)])
    return out


def hard_qa(spec: dict[str, Any], layout: dict[str, Any]) -> dict[str, Any]:
    system = load_visual_system()
    canvas = system.get("canvas") or {"width": 1080, "height": 1350}
    width, height = float(canvas.get("width", 1080)), float(canvas.get("height", 1350))
    fmt = str(spec.get("format") or "")
    language = str(spec.get("visual_language") or "")
    issues: list[str] = []
    warnings: list[str] = []

    if language not in allowed_languages(fmt):
        issues.append("visual_language_not_allowed_for_format")

    style = visual_language(language)
    minimum_margin = max(
        float(system.get("hard_rules", {}).get("minimum_outer_margin", 80)),
        float(style.get("safe_margin", 80)),
    )
    footer_bottom = float((system.get("brand_geometry") or {}).get("footer", {}).get("content_bottom", 1210))

    boxes = _layout_boxes(layout)
    for box in boxes:
        x, y, w, h = [float(box.get(k, 0)) for k in ("x", "y", "width", "height")]
        if x < -0.5 or y < -0.5 or x + w > width + 0.5 or y + h > height + 0.5:
            issues.append("canvas_overflow")
        if box.get("content_box") and (x < minimum_margin - 0.5 or x + w > width - minimum_margin + 0.5):
            issues.append("margin_violation")
        if box.get("content_box") and y + h > footer_bottom + 0.5:
            issues.append("footer_zone_violation")
        font_size = box.get("font_size")
        font_min = box.get("font_min")
        if font_size is not None and font_min is not None and float(font_size) < float(font_min) - 0.1:
            issues.append("font_below_minimum")
        if box.get("overflow"):
            issues.append("text_overflow")

    # Collision checks only within the same explicit collision group. This avoids
    # falsely comparing boxes from different carousel slides.
    groups: dict[str, list[dict[str, Any]]] = {}
    for box in boxes:
        if not box.get("collision_sensitive"):
            continue
        group = str(box.get("collision_group") or f"default-{box.get('slide_index', 0)}")
        groups.setdefault(group, []).append(box)
    for group_boxes in groups.values():
        for i, a in enumerate(group_boxes):
            for b in group_boxes[i + 1 :]:
                if _boxes_overlap(a, b):
                    issues.append("overlap")

    if spec.get("evidence_mode") == "illustrative":
        disclosure = str(spec.get("illustrative_disclosure") or "").strip()
        if not disclosure:
            issues.append("illustrative_disclosure_missing")

    if fmt == "dataviz":
        series_count = int(layout.get("series_count") or 0)
        chart_type = str((spec.get("composition") or {}).get("chart_type") or "")
        if chart_type in {"multi_line", "illustrative_multi_line"} and series_count > 4:
            issues.append("too_many_visible_line_series")
        if spec.get("evidence_mode") == "empirical":
            c = spec.get("content") or {}
            if not (c.get("data") or c.get("series") or c.get("values")):
                issues.append("empirical_dataviz_without_quantitative_data")

    if fmt == "architecture":
        pattern = str(spec.get("semantic_pattern") or "")
        crossings = int(layout.get("connector_crossings") or 0)
        if crossings > 0 and pattern not in {"network", "fragmented_network", "fragmented_manual", "feedback_loop"}:
            issues.append("connector_crossings_in_clean_architecture")

    if fmt == "carousel":
        for slide in layout.get("slides") or []:
            if isinstance(slide, dict) and slide.get("visual_language") != language:
                issues.append("mixed_visual_language")

    unique = sorted(set(issues))
    return {
        "passed": not unique,
        "issues": unique,
        "warnings": sorted(set(warnings)),
        "canvas": {"width": width, "height": height},
        "visual_language": language,
        "format": fmt,
    }
