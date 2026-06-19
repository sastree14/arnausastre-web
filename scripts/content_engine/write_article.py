"""Drafts a full bilingual article via the Gemini API (gemini-2.5-flash).

Editorial rules, taxonomy and article structure are read from:
  content/editorial/editorial_voice.md
  content/editorial/article_structure.md
  content/editorial/taxonomy.md

Modify those files to change the editorial line — no code changes required.
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
GEMINI_ENDPOINT = (
    f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
)
MAX_OUTPUT_TOKENS = 8000
REQUEST_TIMEOUT_SECONDS = 180

EDITORIAL_DIR_RELATIVE = "content/editorial"

BASE_REQUIRED_FIELDS = [
    "slug", "titleEn", "titleEs", "date", "readingTime",
    "tagsEn", "tagsEs", "excerptEn", "excerptEs",
    "bodyEn", "bodyEs", "angle",
    "challenge", "audience", "level",
]


class ArticleGenerationError(Exception):
    """Raised when the pipeline cannot produce a usable article."""


# ── Editorial document loading ────────────────────────────────────────────────

def load_editorial_docs(editorial_dir: Path) -> dict[str, str]:
    """Read all three editorial documents. Fails early with a clear message if any is missing."""
    docs = {}
    for name in ("editorial_voice", "article_structure", "taxonomy"):
        path = editorial_dir / f"{name}.md"
        if not path.exists():
            raise ArticleGenerationError(
                f"Falta el documento editorial requerido: {path}\n"
                "Los ficheros en content/editorial/ son necesarios para generar artículos.\n"
                "Asegúrate de que el repositorio contiene:\n"
                "  content/editorial/editorial_voice.md\n"
                "  content/editorial/article_structure.md\n"
                "  content/editorial/taxonomy.md"
            )
        docs[name] = path.read_text(encoding="utf-8")
    return docs


def parse_taxonomy(taxonomy_text: str) -> dict[str, list[str]]:
    """Extract category lists from taxonomy.md.

    Reads every ## section header and collects the '- item' lines beneath it.
    Adding a new value to taxonomy.md is all that is needed to extend the system.
    """
    taxonomy: dict[str, list[str]] = {}
    current_section: str | None = None
    for line in taxonomy_text.splitlines():
        stripped = line.strip()
        if stripped.startswith("## "):
            current_section = stripped[3:].strip()
            taxonomy[current_section] = []
        elif stripped.startswith("- ") and current_section is not None:
            taxonomy[current_section].append(stripped[2:].strip())
    return taxonomy


# ── Gemini API ────────────────────────────────────────────────────────────────

def get_gemini_api_key() -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ArticleGenerationError(
            "Falta el secret GEMINI_API_KEY. Crea una key en https://aistudio.google.com/app/apikey "
            "y guárdala en GitHub Settings → Secrets and variables → Actions."
        )
    return api_key


def load_style_reference(content_articles_dir: Path, max_chars: int = 6000) -> str:
    """Return a published article as style/length calibration, or a fallback note."""
    if content_articles_dir.exists():
        mdx_files = sorted(
            content_articles_dir.glob("*.mdx"),
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        )
        if mdx_files:
            sample = mdx_files[0].read_text(encoding="utf-8")
            return f"[Style reference — existing published article]\n\n{sample[:max_chars]}"

    return (
        "[No published articles exist yet. Apply the editorial voice and structure "
        "documents above with particular rigour — they are the only reference available.]"
    )


def _slugify(title_en: str) -> str:
    slug = title_en.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


# ── Prompt construction ───────────────────────────────────────────────────────

def build_prompt(
    topic: PendingTopic,
    industry_context: dict | None,
    research: list[SearchResult],
    style_reference: str,
    editorial_docs: dict[str, str],
    taxonomy: dict[str, list[str]],
) -> str:
    research_block = "\n".join(
        f"- [{r.query}] {r.title} — {r.url}\n  {r.snippet}" for r in research
    )
    industry_block = "(no additional data in the Industries tab for this industry)"
    if industry_context:
        industry_block = "\n".join(
            f"- {k}: {v}" for k, v in industry_context.items() if v
        )

    # Build taxonomy constraint strings from the parsed taxonomy
    def opts(key: str) -> str:
        values = taxonomy.get(key, [])
        return ", ".join(f'"{v}"' for v in values)

    return f"""You are the editorial writer for SC-Analytics, a data and analytics consultancy.
Write ONE new bilingual article (English and Spanish) for the SC-Analytics knowledge library.

Read the following editorial documents carefully. They are not suggestions — they are requirements.

===== EDITORIAL VOICE =====
{editorial_docs['editorial_voice']}

===== ARTICLE STRUCTURE =====
{editorial_docs['article_structure']}

===== ASSIGNED TOPIC =====
- Theme: {topic.theme}
- Industry: {topic.industry}
- Suggested title (adapt freely — apply the title patterns above): {topic.possible_title}
- Decision Problem: {topic.decision_problem}
- Business Value: {topic.business_value}
- Analytical Background: {topic.analytical_background}
- CEO Relevance: {topic.ceo_relevance}

===== INDUSTRY CONTEXT =====
{industry_block}

===== RECENT WEB RESEARCH =====
Use as factual context. Do not quote sources verbatim. Ground specific claims in what the research shows.
{research_block}

===== STYLE AND LENGTH CALIBRATION =====
{style_reference}

===== MANDATORY CHECKLIST — verify before writing the final JSON =====

Before producing the output, confirm the article satisfies ALL of the following.
If any item is not satisfied, rewrite the relevant section.

[ ] The title makes a specific, non-obvious claim — not a topic description
[ ] The excerpt states the article's central argument, not what the article is about
[ ] The opening section makes a substantive point immediately — does not restate the title
[ ] The body contains at least one concrete business scenario with: company type + realistic size/context + specific situation + what was at stake or what happened
[ ] The body contains at least one genuine trade-off: doing X produces Y, and Y creates a specific operational or organisational problem
[ ] The body contains at least one operational implication: what this means for a specific person (CFO, operations manager, planning team) in a specific situation
[ ] The body contains at least one recommendation specific enough that someone could act on it and verify whether it worked
[ ] The closing ends with a specific insight or diagnostic — not a summary or a platitude
[ ] None of these phrases appear anywhere in the article:
    "In today's fast-paced", "companies increasingly recognise", "it is important to note",
    "what actually works is", "the key is to", "ultimately, the goal is",
    "consistently outperform", "the question is whether your organisation is prepared",
    "investing in X is valuable but", "with the right approach"
[ ] No section merely states that something is difficult or important without explaining specifically how or why

===== OUTPUT INSTRUCTIONS =====
Respond ONLY with a valid JSON object. No text before or after. No markdown code block.

Required keys:

  slug          kebab-case, English, unique, derived from titleEn
  titleEn       string — follow the title patterns in article_structure.md
  titleEs       string — faithful Spanish translation
  date          string, YYYY-MM-DD, a recent plausible date
  readingTime   integer, minutes, consistent with actual bodyEn length
  tagsEn        array of exactly 3 strings in English
  tagsEs        array of exactly 3 strings in Spanish (translations of tagsEn)
  excerptEn     string, 1-2 sentences — follow the excerpt rules above
  excerptEs     string, faithful Spanish translation of excerptEn
  bodyEn        string — multiple paragraphs, **bold** subtitles, follows structure above
  bodyEs        string — faithful and natural Spanish translation of bodyEn, same format
  angle         string, 1 sentence: the specific argumentative angle chosen for this article
  challenge     string — MUST be exactly one of: {opts('Challenge')}
  audience      string — MUST be exactly one of: {opts('Audience')}
  level         string — MUST be exactly one of: {opts('Level')}

Do not use backticks (`) or the sequence ${{ inside any string value."""


# ── Gemini call ───────────────────────────────────────────────────────────────

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
        raise ArticleGenerationError(
            f"La API de Gemini no respondió. Detalle: {exc}"
        ) from exc

    if response.status_code in (401, 403):
        raise ArticleGenerationError(
            f"La API de Gemini rechazó la API key ({response.status_code}). Verifica GEMINI_API_KEY."
        )
    if response.status_code == 429:
        raise ArticleGenerationError(
            "La API de Gemini devolvió 429 (rate limit / cuota agotada)."
        )
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


# ── Response parsing and validation ──────────────────────────────────────────

def _strip_code_fences(text: str) -> str:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```[a-zA-Z]*\n", "", stripped)
        stripped = re.sub(r"\n```$", "", stripped)
    return stripped.strip()


def parse_article_json(raw_text: str, taxonomy: dict[str, list[str]]) -> dict:
    cleaned = _strip_code_fences(raw_text)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise ArticleGenerationError(
            "Gemini no devolvió un JSON válido para el artículo. "
            f"Primeros 300 caracteres de la respuesta: {cleaned[:300]!r}"
        ) from exc

    missing = [f for f in BASE_REQUIRED_FIELDS if f not in data or data[f] in (None, "")]
    if missing:
        raise ArticleGenerationError(
            f"El JSON generado por Gemini no incluye los campos requeridos: {missing}"
        )

    if not isinstance(data["tagsEn"], list) or not isinstance(data["tagsEs"], list):
        raise ArticleGenerationError("tagsEn/tagsEs deben ser arrays de strings.")

    # Validate taxonomy fields against content/editorial/taxonomy.md
    for field, section in (("challenge", "Challenge"), ("audience", "Audience"), ("level", "Level")):
        valid = taxonomy.get(section, [])
        if valid and data.get(field) not in valid:
            raise ArticleGenerationError(
                f"El campo '{field}' generado ('{data.get(field)}') no es válido según taxonomy.md. "
                f"Valores permitidos: {valid}"
            )

    if not data.get("slug"):
        data["slug"] = _slugify(data["titleEn"])

    return data


# ── Public API ────────────────────────────────────────────────────────────────

def generate_article(
    topic: PendingTopic,
    industry_context: dict | None,
    research: list[SearchResult],
    content_articles_dir: Path,
    editorial_dir: Path,
) -> dict:
    """Generate a bilingual article using Gemini, guided by the editorial documents.

    Args:
        topic: The topic selected from the Topics Bank.
        industry_context: Optional row from the Industries sheet.
        research: Web research results from Brave Search.
        content_articles_dir: Path to content/articles/ (used for style calibration).
        editorial_dir: Path to content/editorial/ (contains the .md editorial docs).

    Returns:
        A dict with all article fields, ready to be written as an MDX file.
    """
    api_key = get_gemini_api_key()
    editorial_docs = load_editorial_docs(editorial_dir)
    taxonomy = parse_taxonomy(editorial_docs["taxonomy"])
    style_reference = load_style_reference(content_articles_dir)
    prompt = build_prompt(topic, industry_context, research, style_reference, editorial_docs, taxonomy)
    raw_response = call_gemini(prompt, api_key)
    article = parse_article_json(raw_response, taxonomy)
    # Inject topic-level fields that the article inherits directly
    article["industry"] = topic.industry
    article["theme"] = topic.theme
    return article
