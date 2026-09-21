from __future__ import annotations

import base64
import hashlib
import json
import os
import subprocess
from io import BytesIO
from pathlib import Path

import cairosvg
import requests
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = ROOT.parent
OUTPUT_DIR = ROOT / "generated" / "visuals"
REACT_RENDERER = ROOT / "visuals" / "render.mjs"

DARK_BACKGROUND = "#071522"
LIGHT_BACKGROUND = "#F8FAFC"
BORDER = "#28465E"
MUTED = "#9FB0BE"
TEXT = "#F4F6F8"
DARK_TEXT = "#0F172A"


def choose_visual_type(content_type: str, has_real_metrics: bool, concept: str) -> str:
    if has_real_metrics:
        return "real_metric_visual"
    lowered = concept.lower()
    if any(word in lowered for word in ("process", "flow", "decision", "trade-off", "framework", "horizon")):
        return "business_diagram"
    if any(word in lowered for word in ("why", "question", "instead", "myth", "wrong", "cost")):
        return "statement"
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
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256((slug + suffix + json.dumps(spec, sort_keys=True, ensure_ascii=False)).encode("utf-8")).hexdigest()[:8]
    spec_path = OUTPUT_DIR / f"{slug}-{digest}.json"
    svg_path = OUTPUT_DIR / f"{slug}-{digest}.svg"
    png_path = OUTPUT_DIR / f"{slug}-{digest}.png"
    spec_path.write_text(json.dumps(spec, ensure_ascii=False, indent=2), encoding="utf-8")
    try:
        subprocess.run(["node", str(REACT_RENDERER), str(spec_path), str(svg_path)], cwd=REPO_ROOT, check=True, capture_output=True, text=True, timeout=60)
        cairosvg.svg2png(url=str(svg_path), write_to=str(png_path), output_width=1200, output_height=1200)
        return png_path
    finally:
        spec_path.unlink(missing_ok=True)
        svg_path.unlink(missing_ok=True)


def _fallback_card(title: str, subtitle: str, slug: str, theme: str = "dark") -> Path:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256((slug + "fallback" + theme).encode("utf-8")).hexdigest()[:8]
    path = OUTPUT_DIR / f"{slug}-{digest}.png"
    light = theme == "light"
    background, text, muted = (LIGHT_BACKGROUND, DARK_TEXT, "#475569") if light else (DARK_BACKGROUND, TEXT, MUTED)
    image = Image.new("RGB", (1200, 1200), background)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((72, 72, 1128, 1128), radius=28, outline="#CBD5E1" if light else BORDER, width=2)
    draw.text((92, 100), "SC-ANALYTICS", fill=text, font=_font(34, True))
    draw.text((92, 380), title[:70], fill=text, font=_font(54, True))
    draw.text((92, 610), subtitle[:125], fill=muted, font=_font(30))
    draw.text((92, 1040), "Comprender antes de construir. · sc-analytics.io", fill=muted, font=_font(22))
    image.save(path, format="PNG", optimize=True)
    return path


def _wrap_words(text: str, max_chars: int, max_lines: int) -> list[str]:
    words = str(text or "").strip().split()
    lines: list[str] = []
    line = ""
    for word in words:
        candidate = f"{line} {word}".strip()
        if line and len(candidate) > max_chars:
            lines.append(line)
            line = word
            if len(lines) >= max_lines - 1:
                break
        else:
            line = candidate
    if line and len(lines) < max_lines:
        lines.append(line)
    if words and lines:
        rendered = " ".join(lines)
        original = " ".join(words)
        if len(rendered) < len(original) and not lines[-1].endswith("…"):
            lines[-1] = lines[-1].rstrip(" .") + "…"
    return lines


def _paste_brand_logo(canvas: Image.Image, theme: str) -> None:
    light = theme == "light"
    logo_path = REPO_ROOT / "public" / "brand" / ("logo-horizontal-transparent.png" if light else "logo-white.png")
    if not logo_path.exists():
        return
    logo = Image.open(logo_path).convert("RGBA")
    target_w = 310
    target_h = max(1, round(logo.height * target_w / max(1, logo.width)))
    logo = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)
    canvas.paste(logo, (86, 72), logo)


def render_contextual_illustration(title: str, concept: str, *, slug: str, theme: str = "dark") -> Path:
    """Generate a contextual image only when editorial strategy explicitly asks for it.

    The model is asked for an image without typography or branding. SC-Analytics' real
    logo and headline are then composed deterministically so brand identity never
    depends on generated text or logos.
    """
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is required for contextual illustration")
    model = os.environ.get("OPENAI_IMAGE_MODEL", "gpt-image-2").strip() or "gpt-image-2"
    quality = os.environ.get("OPENAI_IMAGE_QUALITY", "low").strip().lower()
    if quality not in {"low", "medium", "high", "auto"}:
        quality = "low"
    subject = (concept or title).strip()[:900]
    prompt = (
        "Create a premium editorial SYMBOL / EMBLEM for a Data & AI consultancy publication, not a conventional AI-generated scene. "
        "The composition must center on ONE instantly legible, non-proprietary symbol connected to the industry or business problem. "
        "Use refined holographic linework, translucent glass-like layers, etched geometry, precise vector-like contours and very restrained luminous accents. "
        "Think high-end annual report key visual, technical editorial identity or Swiss-style business design — minimal, calm and intentional. "
        "Do not create people, faces, offices, cinematic environments, generic 3D objects, robots, glowing brains, sci-fi scenes, fake dashboards, stock-photo compositions or decorative AI clutter. "
        "No text, letters, numbers, logos, watermarks or brand marks inside the generated artwork. "
        "Keep the symbol isolated with generous negative space and a simple background compatible with later SC-Analytics typography. "
        f"Theme: {theme}. Editorial direction: {subject}"
    )
    response = requests.post(
        "https://api.openai.com/v1/images/generations",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={"model": model, "prompt": prompt, "size": "1024x1024", "quality": quality},
        timeout=210,
    )
    if response.status_code >= 400:
        raise RuntimeError(f"OpenAI image generation failed {response.status_code}: {response.text[:400]}")
    data = response.json().get("data") or []
    encoded = str((data[0] if data else {}).get("b64_json") or "")
    if not encoded:
        raise RuntimeError("OpenAI image generation returned no image")
    generated = Image.open(BytesIO(base64.b64decode(encoded))).convert("RGB")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256((slug + title + subject + theme + model + quality).encode("utf-8")).hexdigest()[:8]
    path = OUTPUT_DIR / f"{slug}-illustration-{digest}.png"
    light = theme == "light"
    background = LIGHT_BACKGROUND if light else DARK_BACKGROUND
    text = DARK_TEXT if light else TEXT
    muted = "#475569" if light else MUTED
    line = "#CBD5E1" if light else BORDER
    canvas = Image.new("RGB", (1200, 1200), background)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((54, 54, 1146, 1146), radius=34, outline=line, width=2)
    _paste_brand_logo(canvas, theme)

    headline_lines = _wrap_words(title, max_chars=31, max_lines=3)
    headline_font = _font(56 if len(headline_lines) <= 2 else 48, True)
    y = 220
    for line_text in headline_lines:
        draw.text((86, y), line_text, fill=text, font=headline_font)
        y += 68 if len(headline_lines) <= 2 else 58

    # Treat generated artwork as an editorial emblem, not a full-bleed AI scene.
    # Typography remains deterministic and brand-controlled.
    symbol_box = (650, 390, 1114, 854)
    symbol_w, symbol_h = symbol_box[2] - symbol_box[0], symbol_box[3] - symbol_box[1]
    fitted = ImageOps.fit(generated, (symbol_w, symbol_h), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    mask = Image.new("L", (symbol_w, symbol_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, symbol_w, symbol_h), radius=42, fill=255)
    canvas.paste(fitted, (symbol_box[0], symbol_box[1]), mask)
    draw.rounded_rectangle(symbol_box, radius=42, outline=line, width=2)

    draw.text((86, 510), "EDITORIAL SYMBOL", fill=muted, font=_font(20, True))
    draw.line((86, 558, 520, 558), fill=line, width=2)
    draw.text((86, 590), "Industry / problem", fill=text, font=_font(30, True))
    draw.text((86, 642), "expressed as one clear", fill=muted, font=_font(26))
    draw.text((86, 682), "visual signal.", fill=muted, font=_font(26))
    draw.line((86, 850, 520, 850), fill=line, width=2)
    draw.text((86, 1075), "Comprender antes de construir. · sc-analytics.io", fill=muted, font=_font(22))
    canvas.save(path, format="PNG", optimize=True)
    return path


def render_branded_card(title: str, subtitle: str, *, slug: str, theme: str = "dark") -> Path:
    spec = {"template": "insight", "theme": theme, "eyebrow": "SC-ANALYTICS", "headline": title, "subheadline": subtitle}
    try:
        return _react_render(spec, slug, "insight")
    except Exception:
        return _fallback_card(title, subtitle, slug, theme)


def render_statement_visual(title: str, subtitle: str, *, slug: str, theme: str = "dark") -> Path:
    spec = {"template": "statement", "theme": theme, "eyebrow": "SC-ANALYTICS", "headline": title, "subheadline": subtitle}
    try:
        return _react_render(spec, slug, "statement")
    except Exception:
        return _fallback_card(title, subtitle, slug, theme)


def render_business_diagram(title: str, steps: list[str], *, slug: str, theme: str = "dark") -> Path:
    clean_steps = [s.strip() for s in steps if s and s.strip()][:5] or ["Understand", "Model", "Decide"]
    spec = {"template": "process_flow", "theme": theme, "eyebrow": "DECISION SYSTEM", "headline": title, "steps": clean_steps}
    try:
        return _react_render(spec, slug, "process")
    except Exception:
        return _fallback_card(title, " • ".join(clean_steps), slug, theme)


def render_metric_visual(title: str, metrics: list[dict[str, str]], *, slug: str, theme: str = "dark") -> Path:
    clean = [m for m in metrics if m.get("label") and m.get("value")][:3]
    if not clean:
        return render_branded_card(title, "Evidence from the underlying source", slug=slug, theme=theme)
    spec = {"template": "metric_case", "theme": theme, "eyebrow": "BUSINESS SIGNAL", "headline": title, "metrics": clean, "note": "Contexto y evidencia en el texto de la publicación."}
    try:
        return _react_render(spec, slug, "metrics")
    except Exception:
        return _fallback_card(title, " · ".join(f"{m['value']} {m['label']}" for m in clean), slug, theme)


def render_comparison_visual(title: str, left: str, right: str, *, slug: str, theme: str = "light") -> Path:
    spec = {"template": "comparison", "theme": theme, "eyebrow": "SC-ANALYTICS", "title": title, "left": {"label": "COMMON FRAMING", "text": left}, "right": {"label": "BETTER QUESTION", "text": right}}
    try:
        return _react_render(spec, slug, "comparison")
    except Exception:
        return _fallback_card(title, f"{left} / {right}", slug, theme)
