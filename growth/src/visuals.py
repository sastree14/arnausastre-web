from __future__ import annotations

import hashlib
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "generated" / "visuals"

BACKGROUND = "#0D1B2A"
BORDER = "#496C8A"
MUTED = "#A9BCD0"
TEXT = "#F5F7FA"
SUBTEXT = "#C7D3DF"


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


def _wrap(text: str, width: int) -> list[str]:
    return textwrap.wrap(text.strip(), width=width, break_long_words=False, break_on_hyphens=False) or [""]


def render_branded_card(title: str, subtitle: str, *, slug: str) -> Path:
    """Render a 1200x1200 PNG suitable for direct LinkedIn upload."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256(slug.encode("utf-8")).hexdigest()[:8]
    path = OUTPUT_DIR / f"{slug}-{digest}.png"

    image = Image.new("RGB", (1200, 1200), BACKGROUND)
    draw = ImageDraw.Draw(image)
    draw.rectangle((80, 80, 1120, 1120), outline=BORDER, width=2)

    brand_font = _font(34)
    title_font = _font(68, bold=True)
    subtitle_font = _font(34)
    footer_font = _font(27)

    draw.text((100, 145), "SC-ANALYTICS", fill=MUTED, font=brand_font)

    y = 390
    for line in _wrap(title, 26)[:4]:
        draw.text((100, y), line, fill=TEXT, font=title_font)
        y += 82

    y += 25
    for line in _wrap(subtitle, 52)[:4]:
        draw.text((100, y), line, fill=SUBTEXT, font=subtitle_font)
        y += 48

    draw.line((100, 900, 1100, 900), fill=BORDER, width=2)
    draw.text((100, 970), "Comprender antes de construir.", fill=TEXT, font=footer_font)
    draw.text((100, 1020), "sc-analytics.io", fill=MUTED, font=footer_font)

    image.save(path, format="PNG", optimize=True)
    return path


def render_business_diagram(title: str, steps: list[str], *, slug: str) -> Path:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256((slug + "diagram").encode("utf-8")).hexdigest()[:8]
    path = OUTPUT_DIR / f"{slug}-{digest}.png"
    image = Image.new("RGB", (1200, 1200), BACKGROUND)
    draw = ImageDraw.Draw(image)
    draw.rectangle((80, 80, 1120, 1120), outline=BORDER, width=2)
    draw.text((100, 145), "SC-ANALYTICS", fill=MUTED, font=_font(34))
    draw.text((100, 250), title[:60], fill=TEXT, font=_font(52, bold=True))

    clean_steps = [s.strip() for s in steps if s and s.strip()][:5]
    if not clean_steps:
        clean_steps = ["Understand", "Model", "Decide"]
    start_y = 420
    gap = 125
    box_h = 82
    for i, step in enumerate(clean_steps):
        y = start_y + i * gap
        draw.rounded_rectangle((125, y, 1075, y + box_h), radius=18, outline=BORDER, width=2)
        draw.text((165, y + 20), step[:75], fill=TEXT, font=_font(30, bold=i == len(clean_steps) - 1))
        if i < len(clean_steps) - 1:
            x = 600
            draw.line((x, y + box_h, x, y + gap), fill=MUTED, width=3)
            draw.polygon([(x - 8, y + gap - 10), (x + 8, y + gap - 10), (x, y + gap)], fill=MUTED)

    draw.text((100, 1050), "Comprender antes de construir.  ·  sc-analytics.io", fill=MUTED, font=_font(24))
    image.save(path, format="PNG", optimize=True)
    return path


def render_metric_visual(title: str, metrics: list[dict[str, str]], *, slug: str) -> Path:
    """Render approved case metrics without inventing chart geometry or baselines."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256((slug + "metrics").encode("utf-8")).hexdigest()[:8]
    path = OUTPUT_DIR / f"{slug}-{digest}.png"
    image = Image.new("RGB", (1200, 1200), BACKGROUND)
    draw = ImageDraw.Draw(image)
    draw.rectangle((80, 80, 1120, 1120), outline=BORDER, width=2)
    draw.text((100, 145), "SC-ANALYTICS", fill=MUTED, font=_font(34))

    y = 255
    for line in _wrap(title, 34)[:2]:
        draw.text((100, y), line, fill=TEXT, font=_font(48, bold=True))
        y += 62

    clean = [m for m in metrics if m.get("label") and m.get("value")][:3]
    if not clean:
        return render_branded_card(title, "Evidence from an anonymized project case", slug=slug)

    y = 450
    for metric in clean:
        draw.rounded_rectangle((100, y, 1100, y + 155), radius=22, outline=BORDER, width=2)
        draw.text((135, y + 26), metric["value"][:22], fill=TEXT, font=_font(56, bold=True))
        label_lines = _wrap(metric["label"], 42)[:2]
        ly = y + 95
        for line in label_lines:
            draw.text((420, ly - 32), line, fill=SUBTEXT, font=_font(28))
            ly += 34
        y += 190

    draw.text((100, 1040), "Resultados anonimizados del caso publicado  ·  sc-analytics.io", fill=MUTED, font=_font(23))
    image.save(path, format="PNG", optimize=True)
    return path
