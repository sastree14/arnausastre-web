from __future__ import annotations

import base64
import html
import math
from pathlib import Path
from typing import Any

import cairosvg

from .visual_system import format_layout, load_visual_system, visual_language

ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = ROOT.parent
DEFAULT_OUTPUT_DIR = ROOT / "generated" / "visuals_v2"


class VisualRenderError(RuntimeError):
    pass


def _esc(value: Any) -> str:
    return html.escape(str(value or ""), quote=True)


def _num(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _font_family(style: dict[str, Any], role: str) -> str:
    system = load_visual_system()
    font_key = str((style.get("typography") or {}).get(role, {}).get("font") or "ui_sans")
    font = (system.get("fonts") or {}).get(font_key) or {}
    family = str(font.get("family") or "Inter")
    fallback = str(font.get("fallback") or "Arial, Helvetica, sans-serif")
    return f"'{family}', {fallback}"


def _wrap(text: str, width: float, font_size: float, max_lines: int) -> tuple[list[str], bool]:
    words = str(text or "").strip().split()
    if not words:
        return [], False
    chars = max(8, int(width / max(1.0, font_size * 0.56)))
    lines: list[str] = []
    line = ""
    consumed = 0
    for word in words:
        candidate = f"{line} {word}".strip()
        if line and len(candidate) > chars:
            lines.append(line)
            consumed += len(line.split())
            line = word
            if len(lines) >= max_lines:
                break
        else:
            line = candidate
    if len(lines) < max_lines and line:
        lines.append(line)
        consumed += len(line.split())
    overflow = consumed < len(words)
    if overflow and lines:
        lines[-1] = lines[-1].rstrip(" .,:;") + "…"
    return lines[:max_lines], overflow


def _text_block(
    *,
    text: str,
    x: float,
    y: float,
    width: float,
    font_size: float,
    min_font: float,
    max_lines: int,
    color: str,
    family: str,
    weight: int = 400,
    line_height: float = 1.2,
    anchor: str = "start",
    kind: str = "text",
) -> tuple[str, dict[str, Any]]:
    size = float(font_size)
    lines, overflow = _wrap(text, width, size, max_lines)
    while overflow and size - 1 >= min_font:
        size -= 1
        lines, overflow = _wrap(text, width, size, max_lines)
    dy = size * line_height
    spans = [f'<tspan x="{x:.1f}" dy="{0 if i == 0 else dy:.1f}">{_esc(line)}</tspan>' for i, line in enumerate(lines)]
    svg = (
        f'<text x="{x:.1f}" y="{y:.1f}" fill="{color}" font-family="{family}" '
        f'font-size="{size:.1f}" font-weight="{weight}" text-anchor="{anchor}">' + "".join(spans) + "</text>"
    )
    height = max(size, len(lines) * dy)
    box = {
        "kind": kind,
        "x": x if anchor == "start" else x - width / 2,
        "y": y - size,
        "width": width,
        "height": height,
        "font_size": size,
        "font_min": min_font,
        "overflow": overflow,
        "content_box": True,
        "collision_sensitive": kind in {"title", "context", "takeaway"},
    }
    return svg, box


def _logo_data(language: str) -> str | None:
    path = REPO_ROOT / "public" / "brand" / ("logo-white.png" if language in {"A", "C"} else "logo-horizontal-transparent.png")
    if not path.exists():
        return None
    return "data:image/png;base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def _header_footer(language: str, style: dict[str, Any], *, page_label: str = "SC-ANALYTICS") -> tuple[str, list[dict[str, Any]]]:
    system = load_visual_system()
    brand = system.get("brand_geometry") or {}
    logo_cfg = brand.get("logo") or {}
    footer_cfg = brand.get("footer") or {}
    palette = style.get("palette") or {}
    text = str(palette.get("text") or "#0D1B2A")
    divider = str(palette.get("divider") or palette.get("structure") or "#496C8A")
    logo = _logo_data(language)
    parts: list[str] = []
    boxes: list[dict[str, Any]] = []
    if logo:
        x, y, w = _num(logo_cfg.get("left"), 80), _num(logo_cfg.get("top"), 34), _num(logo_cfg.get("preferred_width"), 150)
        h = 84
        parts.append(f'<image href="{logo}" x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="xMinYMin meet"/>')
        boxes.append({"kind": "logo", "x": x, "y": y, "width": w, "height": h, "content_box": False})
    if language in {"B", "C", "D"}:
        parts.append(f'<line x1="80" y1="184" x2="1000" y2="184" stroke="{divider}" stroke-width="1.5"/>')
    rule_y = _num(footer_cfg.get("rule_y"), 1256)
    label_y = _num(footer_cfg.get("label_y"), 1297)
    parts.append(f'<line x1="80" y1="{rule_y}" x2="1000" y2="{rule_y}" stroke="{divider}" stroke-width="1.5"/>')
    parts.append(f'<text x="80" y="{label_y}" fill="{text}" opacity="0.78" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="600">{_esc(page_label)}</text>')
    parts.append(f'<text x="1000" y="{label_y}" fill="{text}" opacity="0.62" font-family="Inter, Arial, sans-serif" font-size="12" text-anchor="end">sc-analytics.io</text>')
    return "".join(parts), boxes


def _base_svg(language: str, body: str, *, page_label: str = "SC-ANALYTICS") -> tuple[str, list[dict[str, Any]]]:
    style = visual_language(language)
    palette = style.get("palette") or {}
    background = str(palette.get("background") or "#FFFFFF")
    identity, boxes = _header_footer(language, style, page_label=page_label)
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1080" height="1350" viewBox="0 0 1080 1350">'
        f'<rect width="1080" height="1350" fill="{background}"/>' + identity + body + "</svg>"
    )
    return svg, boxes


def _write_svg_png(svg: str, *, output_dir: Path, slug: str) -> tuple[Path, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    svg_path = output_dir / f"{slug}.svg"
    png_path = output_dir / f"{slug}.png"
    svg_path.write_text(svg, encoding="utf-8")
    try:
        cairosvg.svg2png(bytestring=svg.encode("utf-8"), write_to=str(png_path), output_width=1080, output_height=1350)
    except Exception as exc:
        raise VisualRenderError(f"SVG→PNG failed: {exc}") from exc
    return svg_path, png_path


def _title_context(spec: dict[str, Any], layout_cfg: dict[str, Any], *, content: dict[str, Any], title_y_key: str = "title_top", context_y_key: str = "context_top") -> tuple[str, list[dict[str, Any]]]:
    language = str(spec["visual_language"])
    style = visual_language(language)
    palette = style.get("palette") or {}
    typ = style.get("typography") or {}
    title_cfg = typ.get("title") or {}
    sub_cfg = typ.get("subtitle") or {}
    title = str(content.get("title") or content.get("headline") or "")
    context = str(content.get("context") or content.get("subtitle") or content.get("description") or "")
    title_y = _num(layout_cfg.get(title_y_key), 280)
    context_y = _num(layout_cfg.get(context_y_key), title_y + 190)
    parts: list[str] = []
    boxes: list[dict[str, Any]] = []
    t_svg, t_box = _text_block(
        text=title,
        x=80,
        y=title_y + _num(title_cfg.get("preferred"), 48),
        width=920,
        font_size=_num(title_cfg.get("preferred"), 48),
        min_font=_num(title_cfg.get("min"), 40),
        max_lines=int(title_cfg.get("max_lines") or 3),
        color=str(palette.get("text") or "#102033"),
        family=_font_family(style, "title"),
        weight=700,
        line_height=_num(title_cfg.get("line_height"), 1.08),
        kind="title",
    )
    parts.append(t_svg)
    boxes.append(t_box)
    if context:
        c_svg, c_box = _text_block(
            text=context,
            x=80,
            y=context_y + _num(sub_cfg.get("preferred"), 24),
            width=920,
            font_size=_num(sub_cfg.get("preferred"), 24),
            min_font=_num(sub_cfg.get("min"), 18),
            max_lines=3,
            color=str(palette.get("muted") or palette.get("text_soft") or "#586574"),
            family=_font_family(style, "subtitle"),
            weight=400,
            line_height=_num(sub_cfg.get("line_height"), 1.25),
            kind="context",
        )
        parts.append(c_svg)
        boxes.append(c_box)
    return "".join(parts), boxes


def _normalized_series(content: dict[str, Any], semantic_pattern: str, evidence_mode: str) -> tuple[list[str], list[dict[str, Any]]]:
    labels: list[str] = []
    series: list[dict[str, Any]] = []
    raw_series = content.get("series")
    if isinstance(raw_series, list):
        for i, item in enumerate(raw_series):
            if not isinstance(item, dict):
                continue
            vals = item.get("values")
            if isinstance(vals, list) and vals:
                values = [_num(v) for v in vals]
                series.append({"name": str(item.get("name") or f"Series {i+1}"), "values": values})
                if not labels and isinstance(item.get("labels"), list):
                    labels = [str(x) for x in item["labels"]]
    raw_data = content.get("data")
    if not series and isinstance(raw_data, list) and raw_data and all(isinstance(x, dict) for x in raw_data):
        numeric_keys = [str(k) for k, v in raw_data[0].items() if isinstance(v, (int, float))]
        label_key = next((k for k in raw_data[0] if k not in numeric_keys), None)
        labels = [str(row.get(label_key) or idx + 1) for idx, row in enumerate(raw_data)] if label_key else [str(i + 1) for i in range(len(raw_data))]
        for key in numeric_keys[:4]:
            series.append({"name": key, "values": [_num(row.get(key)) for row in raw_data]})
    if series:
        if not labels:
            labels = [str(i + 1) for i in range(max(len(s["values"]) for s in series))]
        return labels, series[:4]

    if evidence_mode == "illustrative":
        key = (semantic_pattern + " " + str(content.get("title") or "") + " " + str(content.get("analytical_question") or "")).lower()
        labels = ["Low", "2", "3", "4", "5", "High"]
        if "overfit" in key:
            return labels, [
                {"name": "Training error", "values": [0.92, 0.74, 0.58, 0.44, 0.33, 0.25]},
                {"name": "Validation error", "values": [0.95, 0.76, 0.62, 0.58, 0.64, 0.76]},
            ]
        if "bias" in key or "variance" in key:
            return labels, [
                {"name": "Bias", "values": [0.90, 0.72, 0.54, 0.39, 0.28, 0.20]},
                {"name": "Variance", "values": [0.18, 0.25, 0.37, 0.52, 0.70, 0.88]},
            ]
        if "diminish" in key or "maturity" in key:
            return labels, [{"name": "Value", "values": [0.12, 0.38, 0.61, 0.76, 0.84, 0.89]}]
        return labels, [{"name": "Illustrative relationship", "values": [0.18, 0.34, 0.58, 0.82, 0.68, 0.42]}]
    return [], []


def _chart_palette(style: dict[str, Any]) -> list[str]:
    p = style.get("palette") or {}
    return [
        str(p.get("accent") or "#6B6EF9"),
        str(p.get("chart_blue") or p.get("structure") or p.get("blue") or "#496C8A"),
        str(p.get("positive") or p.get("structure_alt") or "#4F8A67"),
        str(p.get("negative") or p.get("accent_alt") or "#B45C5C"),
    ]


def _scale(values: list[float], low: float, high: float) -> list[float]:
    if not values:
        return []
    mn, mx = min(values), max(values)
    if abs(mx - mn) < 1e-9:
        return [(low + high) / 2 for _ in values]
    return [low + (v - mn) / (mx - mn) * (high - low) for v in values]


def _render_chart(chart_type: str, rect: dict[str, Any], labels: list[str], series: list[dict[str, Any]], style: dict[str, Any], evidence_mode: str) -> str:
    x, y, w, h = (_num(rect.get("x")), _num(rect.get("y")), _num(rect.get("width")), _num(rect.get("height")))
    p = style.get("palette") or {}
    text = str(p.get("text") or "#102033")
    muted = str(p.get("muted") or "#7D8793")
    divider = str(p.get("divider") or p.get("structure") or "#D8DDE3")
    surface = str(p.get("surface") or p.get("surface_alt") or "transparent")
    colors = _chart_palette(style)
    parts = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{_num((style.get("radii") or {}).get("standard"),2)}" fill="{surface}" fill-opacity="0.42" stroke="{divider}" stroke-width="1.5"/>']
    px, py, pw, ph = x + 70, y + 45, w - 105, h - 100
    parts += [
        f'<line x1="{px}" y1="{py+ph}" x2="{px+pw}" y2="{py+ph}" stroke="{divider}" stroke-width="1.5"/>',
        f'<line x1="{px}" y1="{py}" x2="{px}" y2="{py+ph}" stroke="{divider}" stroke-width="1.5"/>'
    ]
    if not series:
        parts.append(f'<text x="{x+w/2}" y="{y+h/2}" text-anchor="middle" fill="{muted}" font-family="Inter, Arial, sans-serif" font-size="18">No quantitative series available</text>')
        return "".join(parts)

    n = max(len(s["values"]) for s in series)
    xs = [px + pw * (i / max(1, n - 1)) for i in range(n)]
    flat = [v for s in series for v in s["values"]]
    mapped: list[list[float]] = []
    cursor = 0
    all_scaled = _scale(flat, py + ph, py)
    for s in series:
        size = len(s["values"])
        mapped.append(all_scaled[cursor:cursor+size])
        cursor += size

    ct = chart_type or "line"
    if ct in {"line","multi_line","annotated_line","illustrative_line","illustrative_multi_line","line_band","scenario_fan","area","stacked_area"}:
        for si, s in enumerate(series):
            vals = mapped[si]
            pts = [(xs[i], vals[i]) for i in range(min(len(xs), len(vals)))]
            if ct in {"area","stacked_area"} and pts:
                d = f'M {pts[0][0]:.1f} {py+ph:.1f} ' + ' '.join(f'L {a:.1f} {b:.1f}' for a,b in pts) + f' L {pts[-1][0]:.1f} {py+ph:.1f} Z'
                parts.append(f'<path d="{d}" fill="{colors[si%len(colors)]}" fill-opacity="0.13"/>')
            d = ' '.join((f'M {a:.1f} {b:.1f}' if i == 0 else f'L {a:.1f} {b:.1f}') for i, (a,b) in enumerate(pts))
            parts.append(f'<path d="{d}" fill="none" stroke="{colors[si%len(colors)]}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>')
            for a,b in pts:
                parts.append(f'<circle cx="{a:.1f}" cy="{b:.1f}" r="4" fill="{colors[si%len(colors)]}"/>')
    elif ct in {"bar","sorted_bar","grouped_bar","paired_bar","highlighted_bar","delta_bar","bullet","lollipop","dot_plot"}:
        groups = max(1, n)
        group_w = pw / groups
        for i in range(groups):
            for si, s in enumerate(series):
                if i >= len(s["values"]):
                    continue
                val_y = mapped[si][i]
                if ct in {"dot_plot","lollipop"}:
                    cy = py + 22 + i * (ph / max(1, groups))
                    value_x = px + ((s["values"][i] - min(flat)) / (max(flat) - min(flat) or 1)) * pw
                    if ct == "lollipop":
                        parts.append(f'<line x1="{px}" y1="{cy}" x2="{value_x}" y2="{cy}" stroke="{divider}" stroke-width="2"/>')
                    parts.append(f'<circle cx="{value_x}" cy="{cy}" r="6" fill="{colors[si%len(colors)]}"/>')
                else:
                    bw = max(8, (group_w * 0.68) / max(1, len(series)))
                    bx = px + i * group_w + group_w * 0.16 + si * bw
                    bh = (py + ph) - val_y
                    parts.append(f'<rect x="{bx:.1f}" y="{val_y:.1f}" width="{bw*0.85:.1f}" height="{max(1,bh):.1f}" rx="2" fill="{colors[si%len(colors)]}"/>')
    elif ct in {"scatter","scatter_trend"}:
        vals = series[0]["values"]
        for i, _ in enumerate(vals):
            cx = px + (i / max(1, len(vals)-1)) * pw
            cy = mapped[0][i]
            parts.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="6" fill="{colors[0]}" fill-opacity="0.82"/>')
        if ct == "scatter_trend" and len(vals) > 1:
            parts.append(f'<line x1="{px}" y1="{mapped[0][0]:.1f}" x2="{px+pw}" y2="{mapped[0][-1]:.1f}" stroke="{colors[1]}" stroke-width="2" stroke-dasharray="8 7"/>')
    elif ct == "heatmap":
        rows, cols = max(1, len(series)), max(1, n)
        cell_w, cell_h = pw / cols, ph / rows
        mn, mx = min(flat), max(flat)
        for r, s in enumerate(series):
            for c, v in enumerate(s["values"]):
                opacity = .18 + .72 * ((v - mn) / (mx - mn or 1))
                parts.append(f'<rect x="{px+c*cell_w:.1f}" y="{py+r*cell_h:.1f}" width="{cell_w-2:.1f}" height="{cell_h-2:.1f}" fill="{colors[r%len(colors)]}" fill-opacity="{opacity:.3f}"/>')
    elif ct == "donut":
        vals = series[0]["values"]
        total = sum(abs(v) for v in vals) or 1
        cx, cy, r = x+w/2, y+h/2, min(w,h)*0.27
        circumference = 2*math.pi*r
        offset = 0.0
        for i, v in enumerate(vals[:5]):
            frac = abs(v)/total
            dash = frac*circumference
            parts.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{colors[i%len(colors)]}" stroke-width="34" stroke-dasharray="{dash:.2f} {circumference-dash:.2f}" stroke-dashoffset="{-offset:.2f}" transform="rotate(-90 {cx} {cy})"/>')
            offset += dash
    elif ct in {"slope","dumbbell","interval_plot"}:
        vals = series[0]["values"]
        vals2 = series[1]["values"] if len(series) > 1 else vals[1:] + vals[-1:]
        mn, mx = min(flat), max(flat)
        for i, (a,b) in enumerate(zip(vals, vals2)):
            cy = py + 24 + i * (ph / max(1, len(vals)))
            xa = px + (a-mn)/(mx-mn or 1)*pw
            xb = px + (b-mn)/(mx-mn or 1)*pw
            parts.append(f'<line x1="{xa:.1f}" y1="{cy:.1f}" x2="{xb:.1f}" y2="{cy:.1f}" stroke="{divider}" stroke-width="3"/>')
            parts.append(f'<circle cx="{xa:.1f}" cy="{cy:.1f}" r="6" fill="{colors[0]}"/><circle cx="{xb:.1f}" cy="{cy:.1f}" r="6" fill="{colors[1]}"/>')
    elif ct in {"histogram","boxplot","violin","small_multiples"}:
        groups = max(1, len(series))
        gy = ph/groups
        for si, s in enumerate(series):
            vals = s["values"]
            if not vals:
                continue
            if ct == "histogram":
                local = _scale(vals, 0, gy*0.78)
                bw = pw/max(1,len(vals))*0.72
                for i, bh in enumerate(local):
                    parts.append(f'<rect x="{px+i*(pw/max(1,len(vals)))+4:.1f}" y="{py+(si+1)*gy-bh:.1f}" width="{bw:.1f}" height="{bh:.1f}" fill="{colors[si%len(colors)]}"/>')
            elif ct in {"boxplot","violin"}:
                sv = sorted(vals)
                q1 = sv[max(0,int(.25*(len(sv)-1)))]
                med = sv[max(0,int(.5*(len(sv)-1)))]
                q3 = sv[max(0,int(.75*(len(sv)-1)))]
                mn, mx = min(flat), max(flat)
                sx = lambda v: px + (v-mn)/(mx-mn or 1)*pw
                cy = py+si*gy+gy/2
                parts.append(f'<line x1="{sx(min(vals)):.1f}" y1="{cy}" x2="{sx(max(vals)):.1f}" y2="{cy}" stroke="{divider}" stroke-width="2"/>')
                parts.append(f'<rect x="{sx(q1):.1f}" y="{cy-15}" width="{max(2,sx(q3)-sx(q1)):.1f}" height="30" fill="none" stroke="{colors[si%len(colors)]}" stroke-width="3"/>')
                parts.append(f'<line x1="{sx(med):.1f}" y1="{cy-17}" x2="{sx(med):.1f}" y2="{cy+17}" stroke="{colors[si%len(colors)]}" stroke-width="3"/>')
            else:
                vals_y = _scale(vals, py+(si+1)*gy-15, py+si*gy+15)
                pts = [(px+i/max(1,len(vals)-1)*pw, vals_y[i]) for i in range(len(vals))]
                d = ' '.join((f'M {a:.1f} {b:.1f}' if i == 0 else f'L {a:.1f} {b:.1f}') for i,(a,b) in enumerate(pts))
                parts.append(f'<path d="{d}" fill="none" stroke="{colors[si%len(colors)]}" stroke-width="3"/>')
    else:
        return _render_chart("bar", rect, labels, series, style, evidence_mode)

    if labels and ct not in {"dot_plot","lollipop","slope","dumbbell","interval_plot","boxplot","violin"}:
        step = max(1, math.ceil(len(labels)/6))
        for i, label in enumerate(labels):
            if i % step:
                continue
            lx = px + (i/max(1,len(labels)-1))*pw
            parts.append(f'<text x="{lx:.1f}" y="{py+ph+28:.1f}" text-anchor="middle" fill="{muted}" font-family="Inter, Arial, sans-serif" font-size="12">{_esc(label)[:14]}</text>')
    for i, s in enumerate(series[:4]):
        lx = px + i*(pw/max(1,min(4,len(series))))
        parts.append(f'<circle cx="{lx+5:.1f}" cy="{y+22:.1f}" r="5" fill="{colors[i%len(colors)]}"/><text x="{lx+17:.1f}" y="{y+27:.1f}" fill="{text}" font-family="Inter, Arial, sans-serif" font-size="12">{_esc(s["name"])[:22]}</text>')
    if evidence_mode == "illustrative":
        parts.append(f'<text x="{x+w-12}" y="{y+h-12}" text-anchor="end" fill="{muted}" font-family="Inter, Arial, sans-serif" font-size="11">ILLUSTRATIVE</text>')
    return "".join(parts)


def _safe_dataviz_rect(language: str, layout_cfg: dict[str, Any]) -> dict[str, Any]:
    rect = dict(layout_cfg.get("chart") or {"x":80,"y":600,"width":920,"height":430})
    context_top = _num(layout_cfg.get("context_top"), 430)
    # A/B Gold Standards have a long editorial/context block. Keep a minimum
    # separation even when vector-export anchors overlap in the raw audit.
    minimum_y = context_top + (112 if language in {"A","B"} else 90)
    if _num(rect.get("y")) < minimum_y:
        rect["y"] = minimum_y
    max_bottom = 1028
    if _num(rect.get("y")) + _num(rect.get("height")) > max_bottom:
        rect["height"] = max(240, max_bottom - _num(rect.get("y")))
    return rect


def _render_dataviz(spec: dict[str, Any]) -> tuple[str, dict[str, Any]]:
    language = str(spec["visual_language"])
    style = visual_language(language)
    layout_cfg = format_layout("dataviz", language)
    content = dict(spec.get("content") or {})
    palette = style.get("palette") or {}
    typ = style.get("typography") or {}
    parts: list[str] = []
    boxes: list[dict[str, Any]] = []
    tc, b = _title_context(spec, layout_cfg, content=content)
    parts.append(tc)
    boxes.extend(b)
    rect = _safe_dataviz_rect(language, layout_cfg)
    labels, series = _normalized_series(content, str(spec.get("semantic_pattern") or ""), str(spec.get("evidence_mode") or "empirical"))
    chart_type = str((spec.get("composition") or {}).get("chart_type") or "line")
    parts.append(_render_chart(chart_type, rect, labels, series, style, str(spec.get("evidence_mode") or "empirical")))
    boxes.append({"kind":"chart","x":_num(rect.get("x")),"y":_num(rect.get("y")),"width":_num(rect.get("width")),"height":_num(rect.get("height")),"content_box":True,"collision_sensitive":False})
    takeaway = str(content.get("takeaway") or content.get("practical_takeaway") or content.get("interpretation") or "")
    trect = dict(layout_cfg.get("takeaway") or {"x":80,"y":1045,"width":920,"height":140})
    surface = str(palette.get("surface_takeaway") or palette.get("surface_alt") or palette.get("surface") or "transparent")
    divider = str(palette.get("divider") or palette.get("structure") or "#D8DDE3")
    parts.append(f'<rect x="{_num(trect.get("x"))}" y="{_num(trect.get("y"))}" width="{_num(trect.get("width"))}" height="{_num(trect.get("height"))}" rx="{_num((style.get("radii") or {}).get("standard"),2)}" fill="{surface}" fill-opacity="0.76" stroke="{divider}" stroke-width="1.5"/>')
    if takeaway:
        bodycfg = typ.get("body") or {}
        ts, tb = _text_block(
            text=takeaway,
            x=_num(trect.get("x"))+24,
            y=_num(trect.get("y"))+45,
            width=_num(trect.get("width"))-48,
            font_size=_num(bodycfg.get("preferred"),18),
            min_font=_num(bodycfg.get("min"),15),
            max_lines=3,
            color=str(palette.get("text") or "#102033"),
            family=_font_family(style,"body"),
            weight=600,
            line_height=_num(bodycfg.get("line_height"),1.3),
            kind="takeaway",
        )
        parts.append(ts)
        boxes.append(tb)
    svg, identity_boxes = _base_svg(language, "".join(parts), page_label="SC-ANALYTICS · DATAVIZ")
    return svg, {"boxes":identity_boxes+boxes,"series_count":len(series),"visual_language":language,"format":"dataviz","chart_type":chart_type}


def _edge_path(ax: float, ay: float, bx: float, by: float, relationship: str, color: str, fragmented: bool = False) -> str:
    if relationship in {"feedback","fragmented_manual"} or fragmented:
        dx = max(40, abs(bx-ax)*0.45)
        c1x = ax+dx if bx >= ax else ax-dx
        c2x = bx-dx if bx >= ax else bx+dx
        return f'<path d="M {ax:.1f} {ay:.1f} C {c1x:.1f} {ay:.1f}, {c2x:.1f} {by:.1f}, {bx:.1f} {by:.1f}" fill="none" stroke="{color}" stroke-width="2.2" marker-end="url(#arrow)"/>'
    if abs(by-ay)>30 and abs(bx-ax)>30:
        mx = (ax+bx)/2
        return f'<path d="M {ax:.1f} {ay:.1f} L {mx:.1f} {ay:.1f} L {mx:.1f} {by:.1f} L {bx:.1f} {by:.1f}" fill="none" stroke="{color}" stroke-width="2.2" marker-end="url(#arrow)"/>'
    return f'<line x1="{ax:.1f}" y1="{ay:.1f}" x2="{bx:.1f}" y2="{by:.1f}" stroke="{color}" stroke-width="2.2" marker-end="url(#arrow)"/>'


def _diagram_nodes(content: dict[str, Any], variant: str, region: dict[str,float], style: dict[str, Any], semantic_pattern: str) -> tuple[str,list[dict[str,Any]],dict[str,tuple[float,float,float,float]],int]:
    nodes = [x for x in (content.get("nodes") or []) if isinstance(x,dict)]
    edges = [x for x in (content.get("edges") or []) if isinstance(x,dict)]
    if not nodes:
        nodes = [{"id":"n1","label":"Input"},{"id":"n2","label":"Decision logic"},{"id":"n3","label":"Action"}]
        edges = [{"source":"n1","target":"n2","relationship":"sequential"},{"source":"n2","target":"n3","relationship":"sequential"}]
    x,y,w,h = region["x"],region["y"],region["width"],region["height"]
    orientation = "horizontal" if variant=="horizontal_flow" else "vertical" if variant=="vertical_flow" else "grid" if variant=="grid_flow" else "layered"
    n = len(nodes)
    positions: dict[str,tuple[float,float,float,float]] = {}
    boxes: list[dict[str,Any]] = []
    parts: list[str] = []
    palette = style.get("palette") or {}
    surface = str(palette.get("surface") or palette.get("surface_alt") or "#13283C")
    text = str(palette.get("text") or "#EAF0F6")
    border = str(palette.get("structure") or palette.get("divider") or "#496C8A")
    if orientation == "horizontal":
        gap = 24
        nw = (w-gap*(n-1))/n
        nh = min(150,h*0.42)
        yy = y+(h-nh)/2
        for i,node in enumerate(nodes):
            positions[str(node.get("id") or i)] = (x+i*(nw+gap),yy,nw,nh)
    elif orientation == "vertical":
        gap = 18
        nh = (h-gap*(n-1))/n
        nw = min(w*0.72,680)
        xx = x+(w-nw)/2
        for i,node in enumerate(nodes):
            positions[str(node.get("id") or i)] = (xx,y+i*(nh+gap),nw,nh)
    else:
        cols = 2 if n <= 6 else 3
        rows = math.ceil(n/cols)
        gapx, gapy = 28, 22
        nw = (w-gapx*(cols-1))/cols
        nh = (h-gapy*(rows-1))/rows
        for i,node in enumerate(nodes):
            r, c = i//cols, i%cols
            positions[str(node.get("id") or i)] = (x+c*(nw+gapx),y+r*(nh+gapy),nw,nh)
    parts.append(f'<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="{border}"/></marker></defs>')
    crossings = 0
    for edge in edges:
        s,t = str(edge.get("source") or ""),str(edge.get("target") or "")
        if s not in positions or t not in positions:
            continue
        sx,sy,sw,sh = positions[s]
        tx,ty,tw,th = positions[t]
        ax, ay = (sx+sw if tx>=sx else sx), sy+sh/2
        bx, by = (tx if tx>=sx else tx+tw), ty+th/2
        rel = str(edge.get("relationship") or "sequential")
        fragmented = semantic_pattern in {"fragmented_network","fragmented_manual","fragmented_network_to_pipeline"} and rel not in {"sequential","dependency"}
        parts.append(_edge_path(ax,ay,bx,by,rel,border,fragmented))
    bodycfg = (style.get("typography") or {}).get("body") or {}
    for i,node in enumerate(nodes):
        key = str(node.get("id") or i)
        nx,ny,nw,nh = positions[key]
        radius = _num((style.get("radii") or {}).get("standard"),4)
        parts.append(f'<rect x="{nx:.1f}" y="{ny:.1f}" width="{nw:.1f}" height="{nh:.1f}" rx="{radius}" fill="{surface}" fill-opacity="0.72" stroke="{border}" stroke-width="2"/>')
        label = str(node.get("label") or node.get("title") or key)
        ts,tb = _text_block(
            text=label,
            x=nx+nw/2,
            y=ny+nh/2,
            width=max(40,nw-28),
            font_size=min(_num(bodycfg.get("preferred"),20),24),
            min_font=_num(bodycfg.get("min"),16),
            max_lines=3,
            color=text,
            family=_font_family(style,"body"),
            weight=600,
            line_height=1.18,
            anchor="middle",
            kind="node",
        )
        parts.append(ts)
        tb.update({"x":nx,"y":ny,"width":nw,"height":nh,"collision_sensitive":False})
        boxes.append(tb)
    return "".join(parts),boxes,positions,crossings


def _render_architecture(spec: dict[str, Any]) -> tuple[str,dict[str,Any]]:
    language = str(spec["visual_language"])
    style = visual_language(language)
    cfg = format_layout("architecture",language)
    content = dict(spec.get("content") or {})
    parts: list[str] = []
    boxes: list[dict[str,Any]] = []
    tc,b = _title_context(spec,cfg,content=content)
    parts.append(tc)
    boxes.extend(b)
    top = _num(cfg.get("diagram_top"),560)
    region = {"x":80.0,"y":top,"width":920.0,"height":max(260,1180-top)}
    variant = str((spec.get("composition") or {}).get("variant_key") or "layered_flow")
    d,db,_,crossings = _diagram_nodes(content,variant,region,style,str(spec.get("semantic_pattern") or ""))
    parts.append(d)
    boxes.extend(db)
    svg,identity = _base_svg(language,"".join(parts),page_label="SC-ANALYTICS · ARCHITECTURE")
    return svg,{"boxes":identity+boxes,"connector_crossings":crossings,"visual_language":language,"format":"architecture"}


def _render_before_after(spec: dict[str, Any]) -> tuple[str,dict[str,Any]]:
    language = str(spec["visual_language"])
    style = visual_language(language)
    cfg = format_layout("before_after",language)
    content = dict(spec.get("content") or {})
    parts: list[str] = []
    boxes: list[dict[str,Any]] = []
    tc,b = _title_context(spec,cfg,content=content)
    parts.append(tc)
    boxes.extend(b)
    top = _num(cfg.get("comparison_top"),590)
    gap = 36
    panel_w = (920-gap)/2
    p = style.get("palette") or {}
    text = str(p.get("text") or "#102033")
    muted = str(p.get("muted") or "#7D8793")
    divider = str(p.get("divider") or p.get("structure") or "#496C8A")
    label_family = _font_family(style,"label")
    parts.append(f'<text x="80" y="{top-18}" fill="{muted}" font-family="{label_family}" font-size="14" font-weight="700">BEFORE</text>')
    parts.append(f'<text x="{80+panel_w+gap}" y="{top-18}" fill="{muted}" font-family="{label_family}" font-size="14" font-weight="700">AFTER</text>')
    before = dict(content.get("before") or {})
    after = dict(content.get("after") or {})
    if not before.get("nodes"):
        before["nodes"] = [{"id":"b1","label":"Spreadsheet"},{"id":"b2","label":"Manual checks"},{"id":"b3","label":"Reconciliation"},{"id":"b4","label":"Static report"},{"id":"b5","label":"Late reaction"}]
        before["edges"] = [{"source":"b1","target":"b2","relationship":"reciprocal"},{"source":"b2","target":"b3","relationship":"reciprocal"},{"source":"b3","target":"b4","relationship":"reciprocal"},{"source":"b4","target":"b5","relationship":"reciprocal"},{"source":"b1","target":"b4","relationship":"fragmented_manual"}]
    if not after.get("nodes"):
        after["nodes"] = [{"id":"a1","label":"Connected data"},{"id":"a2","label":"Decision logic"},{"id":"a3","label":"Automated workflow"},{"id":"a4","label":"Exception review"},{"id":"a5","label":"Decision + feedback"}]
        after["edges"] = [{"source":"a1","target":"a2","relationship":"sequential"},{"source":"a2","target":"a3","relationship":"sequential"},{"source":"a3","target":"a4","relationship":"sequential"},{"source":"a4","target":"a5","relationship":"sequential"}]
    region1 = {"x":80.0,"y":top,"width":panel_w,"height":450.0}
    region2 = {"x":80+panel_w+gap,"y":top,"width":panel_w,"height":450.0}
    d1,b1,_,c1 = _diagram_nodes(before,"vertical_flow",region1,style,"fragmented_network")
    d2,b2,_,c2 = _diagram_nodes(after,"vertical_flow",region2,style,"pipeline")
    parts.extend([d1,d2])
    boxes.extend(b1+b2)
    parts.append(f'<line x1="{80+panel_w+gap/2}" y1="{top}" x2="{80+panel_w+gap/2}" y2="{top+450}" stroke="{divider}" stroke-width="1.5"/>')
    takeaway = str(content.get("transformation_takeaway") or content.get("takeaway") or "")
    if takeaway:
        bodycfg = (style.get("typography") or {}).get("body") or {}
        ts,tb = _text_block(
            text=takeaway,
            x=80,
            y=top+535,
            width=920,
            font_size=_num(bodycfg.get("preferred"),20),
            min_font=_num(bodycfg.get("min"),16),
            max_lines=3,
            color=text,
            family=_font_family(style,"body"),
            weight=600,
            line_height=1.25,
            kind="takeaway",
        )
        parts.append(ts)
        boxes.append(tb)
    svg,identity = _base_svg(language,"".join(parts),page_label="SC-ANALYTICS · BEFORE / AFTER")
    return svg,{"boxes":identity+boxes,"connector_crossings":c1+c2,"visual_language":language,"format":"before_after"}


def _slide_body(slide: dict[str,Any], role: str, style: dict[str,Any], language: str, cfg: dict[str,Any], variant: str) -> tuple[str,list[dict[str,Any]]]:
    p = style.get("palette") or {}
    typ = style.get("typography") or {}
    parts: list[str] = []
    boxes: list[dict[str,Any]] = []
    content_top = _num(cfg.get("content_top"),560)
    title = str(slide.get("title") or slide.get("headline") or "")
    subtitle = str(slide.get("subtitle") or slide.get("context") or "")
    local = {"title_top":_num(cfg.get("title_top"),280),"context_top":content_top-95}
    t,b = _title_context({"visual_language":language},local,content={"title":title,"context":subtitle})
    parts.append(t)
    boxes.extend(b)
    surface = str(p.get("surface") or p.get("surface_alt") or "#13283C")
    border = str(p.get("divider") or p.get("structure") or "#496C8A")
    text = str(p.get("text") or "#102033")
    bodycfg = typ.get("body") or {}
    region = {"x":80.0,"y":content_top,"width":920.0,"height":max(260.0,1180.0-content_top)}

    if role in {"process","framework"}:
        items = slide.get("steps") or slide.get("items") or slide.get("points") or []
        if not isinstance(items,list):
            items = []
        items = [x if isinstance(x,dict) else {"label":str(x)} for x in items][:6] or [{"label":"Understand"},{"label":"Decide"},{"label":"Act"}]
        cols = min(3,len(items))
        rows = math.ceil(len(items)/cols)
        gap = 20
        cw = (region["width"]-gap*(cols-1))/cols
        ch = (region["height"]-gap*(rows-1))/rows
        for i,item in enumerate(items):
            c,r = i%cols,i//cols
            x,y = region["x"]+c*(cw+gap),region["y"]+r*(ch+gap)
            parts.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{cw:.1f}" height="{ch:.1f}" rx="{_num((style.get("radii") or {}).get("standard"),4)}" fill="{surface}" fill-opacity="0.70" stroke="{border}" stroke-width="1.8"/>')
            ts,tb = _text_block(
                text=str(item.get("label") or item.get("title") or item.get("text") or ""),
                x=x+18,
                y=y+50,
                width=cw-36,
                font_size=_num(bodycfg.get("preferred"),20),
                min_font=_num(bodycfg.get("min"),16),
                max_lines=4,
                color=text,
                family=_font_family(style,"body"),
                weight=600,
                line_height=1.2,
                kind="body",
            )
            parts.append(ts)
            tb.update({"x":x,"y":y,"width":cw,"height":ch,"collision_sensitive":False})
            boxes.append(tb)
    elif role in {"comparison","evidence"}:
        left = slide.get("left") or slide.get("option_a") or slide.get("model_a") or {}
        right = slide.get("right") or slide.get("option_b") or slide.get("model_b") or {}
        if variant in {"comparison_table","evidence_table"}:
            rows = slide.get("metrics") or slide.get("rows") or []
            if not isinstance(rows,list):
                rows = []
            y = region["y"]
            rh = min(78,region["height"]/max(2,len(rows)+1))
            parts.append(f'<rect x="80" y="{y}" width="920" height="{rh}" fill="{surface}" fill-opacity="0.75"/>')
            for i,row in enumerate(rows[:6]):
                yy = y+(i+1)*rh
                parts.append(f'<line x1="80" y1="{yy}" x2="1000" y2="{yy}" stroke="{border}" stroke-width="1.2"/>')
                label = str(row.get("label") if isinstance(row,dict) else row)
                parts.append(f'<text x="100" y="{yy+rh*.58}" fill="{text}" font-family="Inter, Arial, sans-serif" font-size="17">{_esc(label)}</text>')
        else:
            gap = 28
            cw = (920-gap)/2
            for idx,obj in enumerate([left,right]):
                x,y,h = 80+idx*(cw+gap),region["y"],region["height"]*.72
                parts.append(f'<rect x="{x}" y="{y}" width="{cw}" height="{h}" rx="{_num((style.get("radii") or {}).get("standard"),4)}" fill="{surface}" fill-opacity="0.72" stroke="{border}" stroke-width="1.8"/>')
                heading = str(obj.get("label") or obj.get("title") or ("A" if idx==0 else "B")) if isinstance(obj,dict) else str(obj)
                ts,tb = _text_block(
                    text=heading,
                    x=x+20,
                    y=y+52,
                    width=cw-40,
                    font_size=_num(bodycfg.get("preferred"),20)+2,
                    min_font=_num(bodycfg.get("min"),16),
                    max_lines=3,
                    color=text,
                    family=_font_family(style,"body"),
                    weight=700,
                    line_height=1.2,
                    kind="body",
                )
                parts.append(ts)
                tb.update({"x":x,"y":y,"width":cw,"height":h,"collision_sensitive":False})
                boxes.append(tb)
    elif role == "conclusion":
        takeaways = slide.get("takeaways") or slide.get("points") or []
        if isinstance(takeaways,str):
            takeaways = [takeaways]
        y = region["y"]
        for item in takeaways[:3]:
            txt = str(item.get("text") if isinstance(item,dict) else item)
            parts.append(f'<circle cx="96" cy="{y+35}" r="7" fill="{str(p.get("accent") or border)}"/>')
            ts,tb = _text_block(
                text=txt,
                x=122,
                y=y+48,
                width=850,
                font_size=_num(bodycfg.get("preferred"),20),
                min_font=_num(bodycfg.get("min"),16),
                max_lines=3,
                color=text,
                family=_font_family(style,"body"),
                weight=500,
                line_height=1.3,
                kind="body",
            )
            parts.append(ts)
            boxes.append(tb)
            y += 145
    else:
        statement = str(slide.get("statement") or slide.get("takeaway") or slide.get("body") or subtitle)
        if statement:
            ts,tb = _text_block(
                text=statement,
                x=80,
                y=region["y"]+80,
                width=920,
                font_size=max(_num(bodycfg.get("preferred"),20),28),
                min_font=_num(bodycfg.get("min"),16),
                max_lines=6,
                color=text,
                family=_font_family(style,"body"),
                weight=500,
                line_height=1.25,
                kind="body",
            )
            parts.append(ts)
            boxes.append(tb)
    return "".join(parts),boxes


def _render_carousel(spec: dict[str,Any]) -> list[tuple[str,dict[str,Any],str]]:
    language = str(spec["visual_language"])
    style = visual_language(language)
    cfg = format_layout("carousel",language)
    content = dict(spec.get("content") or {})
    slides = content.get("slides") or []
    if not isinstance(slides,list) or not slides:
        slides = [
            {"role":"cover","title":content.get("title") or "SC-Analytics insight","subtitle":content.get("context") or ""},
            {"role":"conclusion","title":content.get("takeaway") or "What this means","takeaways":[content.get("takeaway") or "Better decisions require better systems."]},
        ]
    variant = str((spec.get("composition") or {}).get("variant_key") or "editorial_statement")
    rendered: list[tuple[str,dict[str,Any],str]] = []
    for i,slide in enumerate(slides[:8],start=1):
        if not isinstance(slide,dict):
            slide = {"role":"body","title":str(slide)}
        role = str(slide.get("role") or ("cover" if i==1 else "conclusion" if i==len(slides) else "evidence"))
        body,boxes = _slide_body(slide,role,style,language,cfg,variant)
        for box in boxes:
            box["slide_index"] = i
        svg,identity = _base_svg(language,body,page_label=f"SC-ANALYTICS · {i:02d}/{len(slides):02d}")
        rendered.append((svg,{"boxes":identity+boxes,"visual_language":language,"format":"carousel","role":role},role))
    return rendered


def render_visual_spec(spec: dict[str,Any], *, output_dir: Path | None = None, slug: str | None = None) -> dict[str,Any]:
    fmt = str(spec.get("format") or "")
    language = str(spec.get("visual_language") or "").upper()
    if not fmt or not language:
        raise VisualRenderError("visual spec requires format and visual_language")
    output_dir = output_dir or DEFAULT_OUTPUT_DIR
    slug = slug or str(spec.get("visual_spec_id") or "visual")
    assets: list[dict[str,Any]] = []

    if fmt == "carousel":
        rendered = _render_carousel(spec)
        slides = []
        for i,(svg,layout,role) in enumerate(rendered,start=1):
            svg_path,png_path = _write_svg_png(svg,output_dir=output_dir,slug=f"{slug}-{i:02d}")
            assets.append({"index":i,"role":role,"svg_path":str(svg_path),"png_path":str(png_path)})
            slides.append(layout)
        layout = {"slides":slides,"boxes":[b for s in slides for b in s.get("boxes",[])],"visual_language":language,"format":"carousel"}
        return {"assets":assets,"layout":layout}

    if fmt == "dataviz":
        svg,layout = _render_dataviz(spec)
    elif fmt == "architecture":
        svg,layout = _render_architecture(spec)
    elif fmt == "before_after":
        svg,layout = _render_before_after(spec)
    else:
        raise VisualRenderError(f"Unsupported format: {fmt}")

    svg_path,png_path = _write_svg_png(svg,output_dir=output_dir,slug=slug)
    assets.append({"index":1,"svg_path":str(svg_path),"png_path":str(png_path)})
    return {"assets":assets,"layout":layout}
