from __future__ import annotations

import hashlib
import html
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "generated" / "visuals"


def choose_visual_type(content_type: str, has_real_metrics: bool, concept: str) -> str:
    if has_real_metrics:
        return "real_data_chart"
    if any(word in concept.lower() for word in ("process", "flow", "decision", "trade-off", "framework", "horizon")):
        return "business_diagram"
    return "branded_card"


def render_branded_card(title: str, subtitle: str, *, slug: str) -> Path:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    safe_title = html.escape(title)
    safe_subtitle = html.escape(subtitle)
    digest = hashlib.sha256(slug.encode("utf-8")).hexdigest()[:8]
    path = OUTPUT_DIR / f"{slug}-{digest}.svg"
    markup = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
<rect width="1200" height="1200" fill="#0D1B2A"/>
<rect x="80" y="80" width="1040" height="1040" fill="none" stroke="#496C8A" stroke-width="2"/>
<text x="100" y="180" fill="#A9BCD0" font-family="Arial, sans-serif" font-size="34" letter-spacing="2">SC-ANALYTICS</text>
<text x="100" y="500" fill="#F5F7FA" font-family="Arial, sans-serif" font-size="72" font-weight="700">{safe_title}</text>
<text x="100" y="590" fill="#C7D3DF" font-family="Arial, sans-serif" font-size="36">{safe_subtitle}</text>
<line x1="100" y1="900" x2="1100" y2="900" stroke="#496C8A" stroke-width="2"/>
<text x="100" y="1000" fill="#F5F7FA" font-family="Arial, sans-serif" font-size="28">Comprender antes de construir.</text>
</svg>'''
    path.write_text(markup, encoding="utf-8")
    return path
