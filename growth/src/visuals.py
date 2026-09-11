from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

import cairosvg
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = ROOT.parent
OUTPUT_DIR = ROOT / "generated" / "visuals"
REACT_RENDERER = ROOT / "visuals" / "render.mjs"

BACKGROUND = "#071522"
BORDER = "#28465E"
MUTED = "#9FB0BE"
TEXT = "#F4F6F8"


def choose_visual_type(content_type: str, has_real_metrics: bool, concept: str) -> str:
    if has_real_metrics:
        return "real_metric_visual"
    if any(word in concept.lower() for word in ("process", "flow", "decision", "trade-off", "framework", "horizon")):
        return "business_diagram"
    return "branded_card"


def _font(size: int, bold: bool = False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size=size)
    return ImageFont.load_default()


def _react_render(spec: dict, slug: str, suffix: str) -> Path:
    """Render deterministic React SVG, then rasterize to a LinkedIn-ready PNG."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256((slug + suffix).encode("utf-8")).hexdigest()[:8]
    spec_path = OUTPUT_DIR / f"{slug}-{digest}.json"
    svg_path = OUTPUT_DIR / f"{slug}-{digest}.svg"
    png_path = OUTPUT_DIR / f"{slug}-{digest}.png"
    spec_path.write_text(json.dumps(spec, ensure_ascii=False, indent=2), encoding="utf-8")
    try:
        subprocess.run(
            ["node", str(REACT_RENDERER), str(spec_path), str(svg_path)],
            cwd=REPO_ROOT,
            check=True,
            capture_output=True,
            text=True,
            timeout=60,
        )
        cairosvg.svg2png(url=str(svg_path), write_to=str(png_path), output_width=1200, output_height=1200)
        return png_path
    finally:
        spec_path.unlink(missing_ok=True)
        svg_path.unlink(missing_ok=True)


def _fallback_card(title: str, subtitle: str, slug: str) -> Path:
    """Emergency renderer only; production visuals are React-first."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256((slug + "fallback").encode("utf-8")).hexdigest()[:8]
    path = OUTPUT_DIR / f"{slug}-{digest}.png"
    image = Image.new("RGB", (1200, 1200), BACKGROUND)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((72, 72, 1128, 1128), radius=28, outline=BORDER, width=2)
    draw.text((100, 120), "SC-ANALYTICS", fill=MUTED, font=_font(30))
    draw.text((100, 380), title[:52], fill=TEXT, font=_font(52, True))
    draw.text((100, 520), subtitle[:90], fill=MUTED, font=_font(30))
    draw.text((100, 1040), "Comprender antes de construir.  ·  sc-analytics.io", fill=MUTED, font=_font(22))
    image.save(path, format="PNG", optimize=True)
    return path


def render_branded_card(title: str, subtitle: str, *, slug: str) -> Path:
    spec = {
        "template": "insight",
        "eyebrow": "SC-ANALYTICS",
        "headline": title,
        "subheadline": subtitle,
    }
    try:
        return _react_render(spec, slug, "insight")
    except Exception:
        return _fallback_card(title, subtitle, slug)


def render_business_diagram(title: str, steps: list[str], *, slug: str) -> Path:
    clean_steps = [s.strip() for s in steps if s and s.strip()][:5] or ["Understand", "Model", "Decide"]
    spec = {
        "template": "process_flow",
        "eyebrow": "DECISION SYSTEM",
        "headline": title,
        "steps": clean_steps,
    }
    try:
        return _react_render(spec, slug, "process")
    except Exception:
        return _fallback_card(title, " → ".join(clean_steps), slug)


def render_metric_visual(title: str, metrics: list[dict[str, str]], *, slug: str) -> Path:
    clean = [m for m in metrics if m.get("label") and m.get("value")][:3]
    if not clean:
        return render_branded_card(title, "Evidence from an anonymized project case", slug=slug)
    spec = {
        "template": "metric_case",
        "eyebrow": "REAL PROJECT EVIDENCE",
        "headline": title,
        "metrics": clean,
        "note": "Resultados anonimizados del caso publicado.",
    }
    try:
        return _react_render(spec, slug, "metrics")
    except Exception:
        return _fallback_card(title, " · ".join(f"{m['value']} {m['label']}" for m in clean), slug)


def render_comparison_visual(title: str, left: str, right: str, *, slug: str) -> Path:
    spec = {
        "template": "comparison",
        "eyebrow": "SC-ANALYTICS",
        "title": title,
        "left": {"label": "COMMON QUESTION", "text": left},
        "right": {"label": "BETTER QUESTION", "text": right},
    }
    try:
        return _react_render(spec, slug, "comparison")
    except Exception:
        return _fallback_card(title, f"{left}  →  {right}", slug)
