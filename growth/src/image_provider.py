from __future__ import annotations

import base64
import os
from pathlib import Path

import requests

from .brain import load_brain

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "generated" / "visuals"


class ImageGenerationError(RuntimeError):
    pass


def generate_editorial_image(concept: str, slug: str) -> Path:
    """Generate a square editorial visual. Text/logo are intentionally excluded from the model output.

    Branding and any exact typography should be composited programmatically after generation.
    """
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        raise ImageGenerationError("OPENAI_API_KEY is required")
    brand_context = load_brain(["company/identity.md", "content/content_strategy.md"])
    prompt = f"""Create a premium editorial symbol / emblem for a Data & AI consultancy publication.
Concept: {concept}
Brand context: {brand_context}
The result must look like designed editorial identity, not like a conventional AI-generated image.
Use ONE clear industry/problem symbol, refined holographic linework, translucent layers, precise vector-like geometry and generous negative space.
Do not create people, offices, stock-photo scenes, cinematic environments, generic 3D renders, robots, glowing brains, fake dashboards or sci-fi clutter.
No written words, letters, numbers, logos or watermarks. Branding and exact typography will be composited programmatically afterwards."""
    response = requests.post(
        "https://api.openai.com/v1/images/generations",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": os.environ.get("OPENAI_IMAGE_MODEL", "gpt-image-2"),
            "prompt": prompt,
            "size": "1024x1024",
            "quality": "medium",
            "n": 1,
        },
        timeout=240,
    )
    if response.status_code >= 400:
        raise ImageGenerationError(f"OpenAI image error {response.status_code}: {response.text[:500]}")
    payload = response.json()
    item = (payload.get("data") or [{}])[0]
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUTPUT_DIR / f"{slug}.png"
    if item.get("b64_json"):
        out.write_bytes(base64.b64decode(item["b64_json"]))
        return out
    if item.get("url"):
        image = requests.get(item["url"], timeout=120)
        image.raise_for_status()
        out.write_bytes(image.content)
        return out
    raise ImageGenerationError("Image API returned neither b64_json nor url")
