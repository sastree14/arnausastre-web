"""Drafts a full bilingual article via the Gemini API (gemini-2.5-flash).

Uses plain `requests` against the generateContent REST endpoint instead of
the `google-genai` SDK, to avoid adding a dependency that isn't strictly necessary.
"""

from __future__ import annotations

import json
import os
import re
from pathlib import Path

import requests

from pick_topic import PendingTopic
from web_research import SearchResult

GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
MAX_OUTPUT_TOKENS = 8000
REQUEST_TIMEOUT_SECONDS = 180

EDITORIAL_STYLE_GUIDE = """\
EDITORIAL VOICE — SC-Analytics (follow strictly):

Writing philosophy:
- Calm, analytical, precise and honest. Never promotional.
- The goal is to help readers understand a problem and possible approaches.
  Not to impress them with technology.
- Technology appears only when it contributes to business outcomes.

Sentence structure:
- Short, declarative sentences. No filler adjectives or adverbs.
- Argumentative structure by contrast: "X is not the problem, Y is" /
  "It is not about A, it is about B".
- Avoid: "revolutionary", "game-changing", "disruptive", "cutting-edge",
  "innovative" as empty labels, AI-generated phrasing, startup buzzwords.

Article structure:
- Each body section starts with a short **bold** subtitle followed by 1-2 paragraphs.
- This is lightweight markdown in plain text — NO MDX, NO HTML.
- No introductory paragraph that merely restates the title.
  The first section must make a substantive point immediately.

Titles follow patterns like:
- "Why most X fail in practice"
- "The hidden cost of Y"
- "What Z actually requires"
- "How companies approach X — and why it matters"
Adapt the pattern to the topic. Do not copy literally.

Excerpts: 1-2 sentences. Direct and specific. No vague generalities.
"""

AUDIENCE_GUIDE = """\
Audience classification (pick the most relevant one):
- CEO: strategic framing, business impact, risk and opportunity
- Operations: process improvement, efficiency, practical implementation
- Finance: cost, ROI, risk quantification, financial modelling
- Analytics: technical depth, methodology, data requirements
"""

CHALLENGE_CATEGORIES = [
    "Forecasting", "Inventory Management", "Resource Allocation",
    "Pricing", "Route Planning", "Automation", "Fraud Detection", "Decision Making",
]

REQUIRED_FIELDS = [
    "slug", "titleEn", "titleEs", "date", "readingTime",
    "tagsEn", "tagsEs", "excerptEn", "excerptEs",
    "bodyEn", "bodyEs", "angle",
    "challenge", "audience", "level",
]


class ArticleGenerationError(Exception):
    """Raised when the Gemini API is misconfigured, unreachable, or returns something unusable."""


def get_gemini_api_key() -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ArticleGenerationError(
            "Falta el secret GEMINI_API_KEY. Crea una key en https://aistudio.google.com/app/apikey "
            "y guárdala en GitHub Settings -> Secrets and variables -> Actions con el nombre GEMINI_API_KEY."
        )
    return api_key


def load_style_reference(content_articles_dir: Path, max_chars: int = 6000) -> str:
    """Load an existing published article as style/length calibration reference.

    Falls back to the built-in guide if no MDX files exist yet.
    """
    if content_articles_dir.exists():
        mdx_files = sorted(
            content_articles_dir.glob("*.mdx"),
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        )
        if mdx_files:
            sample = mdx_files[0].read_text(encoding="utf-8")
            return f"[Style reference from existing article]\n---\n{sample[:max_chars]}"

    return f"[No published articles yet — apply the editorial guide below rigorously]\n{EDITORIAL_STYLE_GUIDE}"


def _slugify(title_en: str) -> str:
    slug = title_en.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


def build_prompt(
    topic: PendingTopic,
    industry_context: dict | None,
    research: list[SearchResult],
    style_reference: str,
) -> str:
    research_block = "\n".join(
        f"- [{r.query}] {r.title} — {r.url}\n  {r.snippet}" for r in research
    )
    industry_block = "(sin datos adicionales en la pestaña Industries para esta industria)"
    if industry_context:
        industry_block = "\n".join(
            f"- {key}: {value}" for key, value in industry_context.items() if value
        )

    challenge_options = ", ".join(f'"{c}"' for c in CHALLENGE_CATEGORIES)

    return f"""You are the editorial writer for SC-Analytics, a data and analytics consultancy.
Write ONE new bilingual article (English and Spanish) for the SC-Analytics knowledge library.

{EDITORIAL_STYLE_GUIDE}

{AUDIENCE_GUIDE}

ASSIGNED TOPIC (from Topics Bank):
- Theme: {topic.theme}
- Industry: {topic.industry}
- Suggested title (adapt freely): {topic.possible_title}
- Decision Problem: {topic.decision_problem}
- Business Value: {topic.business_value}
- Analytical Background: {topic.analytical_background}
- CEO Relevance: {topic.ceo_relevance}

INDUSTRY CONTEXT (may be incomplete):
{industry_block}

RECENT WEB RESEARCH (use as factual context — do not quote verbatim):
{research_block}

STYLE AND LENGTH CALIBRATION:
{style_reference}

OUTPUT INSTRUCTIONS:
Respond ONLY with a JSON object (no text before or after, no markdown code block) with EXACTLY these keys:

  slug          (kebab-case, English, unique, derived from titleEn)
  titleEn       (string — follow the title patterns above)
  titleEs       (string — faithful Spanish translation of titleEn)
  date          (string, YYYY-MM-DD, a recent plausible date)
  readingTime   (integer, minutes, consistent with actual bodyEn length)
  tagsEn        (array of exactly 3 strings in English)
  tagsEs        (array of exactly 3 strings in Spanish, translations of tagsEn)
  excerptEn     (string, 1-2 sentences, direct and specific — no vague generalities)
  excerptEs     (string, faithful Spanish translation of excerptEn)
  bodyEn        (string, multiple paragraphs with **bold** subtitles, same style as reference)
  bodyEs        (string, faithful and natural Spanish translation of bodyEn, same format)
  angle         (string, 1 sentence: the specific angle chosen for this article)
  challenge     (string, MUST be exactly one of: {challenge_options})
  audience      (string, MUST be exactly one of: "CEO", "Operations", "Finance", "Analytics")
  level         (string, MUST be exactly one of: "Strategic", "Operational", "Technical")

Do not use backticks (`) or the sequence ${{ inside any string value."""


def _strip_code_fences(text: str) -> str:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```[a-zA-Z]*\n", "", stripped)
        stripped = re.sub(r"\n```$", "", stripped)
    return stripped.strip()


def call_gemini(prompt: str, api_key: str) -> str:
    try:
        response = requests.post(
            GEMINI_ENDPOINT,
            headers={
                "x-goog-api-key": api_key,
                "content-type": "application/json",
            },
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "maxOutputTokens": MAX_OUTPUT_TOKENS,
                    "responseMimeType": "application/json",
                },
            },
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException as exc:
        raise ArticleGenerationError(f"La API de Gemini no respondió. Detalle: {exc}") from exc

    if response.status_code in (401, 403):
        raise ArticleGenerationError(
            f"La API de Gemini rechazó la API key ({response.status_code}). Verifica GEMINI_API_KEY."
        )
    if response.status_code == 429:
        raise ArticleGenerationError("La API de Gemini devolvió 429 (rate limit / cuota agotada).")
    if response.status_code != 200:
        raise ArticleGenerationError(
            f"La API de Gemini devolvió un error: HTTP {response.status_code} — {response.text[:500]}"
        )

    payload = response.json()
    candidates = payload.get("candidates", [])
    if not candidates:
        block_reason = payload.get("promptFeedback", {}).get("blockReason")
        raise ArticleGenerationError(
            f"La API de Gemini no devolvió ningún candidate (blockReason={block_reason!r})."
        )

    parts = candidates[0].get("content", {}).get("parts", [])
    text_blocks = [part.get("text", "") for part in parts if "text" in part]
    if not text_blocks:
        raise ArticleGenerationError("La respuesta de Gemini no contenía texto utilizable.")
    return "\n".join(text_blocks)


def parse_article_json(raw_text: str) -> dict:
    cleaned = _strip_code_fences(raw_text)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise ArticleGenerationError(
            "Gemini no devolvió un JSON válido para el artículo. "
            f"Primeros 300 caracteres de la respuesta: {cleaned[:300]!r}"
        ) from exc

    missing = [field for field in REQUIRED_FIELDS if field not in data or data[field] in (None, "")]
    if missing:
        raise ArticleGenerationError(f"El JSON del artículo generado por Gemini no incluye: {missing}")

    if not isinstance(data["tagsEn"], list) or not isinstance(data["tagsEs"], list):
        raise ArticleGenerationError("tagsEn/tagsEs deben ser arrays de strings en el JSON generado.")

    valid_challenges = set(CHALLENGE_CATEGORIES)
    if data.get("challenge") not in valid_challenges:
        raise ArticleGenerationError(
            f"El campo 'challenge' generado ('{data.get('challenge')}') no es una categoría válida. "
            f"Debe ser uno de: {sorted(valid_challenges)}"
        )

    if not data.get("slug"):
        data["slug"] = _slugify(data["titleEn"])

    return data


def generate_article(
    topic: PendingTopic,
    industry_context: dict | None,
    research: list[SearchResult],
    content_articles_dir: Path,
) -> dict:
    api_key = get_gemini_api_key()
    style_reference = load_style_reference(content_articles_dir)
    prompt = build_prompt(topic, industry_context, research, style_reference)
    raw_response = call_gemini(prompt, api_key)
    article = parse_article_json(raw_response)
    # Inject topic-level metadata that the article inherits directly
    article["industry"] = topic.industry
    article["theme"] = topic.theme
    return article
