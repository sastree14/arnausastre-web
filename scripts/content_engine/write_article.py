"""Drafts a full bilingual article via the Anthropic (Claude) API.

Uses plain `requests` against the Messages API instead of the `anthropic` SDK,
to avoid adding a dependency that isn't strictly necessary.
"""

from __future__ import annotations

import json
import os
import re
from pathlib import Path

import requests

from pick_topic import PendingTopic
from web_research import SearchResult

ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"
MODEL = "claude-sonnet-4-6"
MAX_TOKENS = 8000
REQUEST_TIMEOUT_SECONDS = 180

BRAND_TONE_GUIDE = """\
Tono de marca de SC-Analytics (respétalo estrictamente):
- Frases cortas y declarativas, sin adjetivos de relleno.
- Estructura argumentativa por contraposición: "X no es el problema, Y lo es",
  "no se trata de A, se trata de B".
- Títulos en formato "Why most X fail in practice" / "The hidden cost of Y" /
  "Building Z that companies actually use" — adapta ese patrón al tema dado,
  no lo copies literalmente.
- Nunca tono de venta agresivo. Nunca superlativos vacíos
  ("revolucionario", "game-changing", "disruptivo", "innovador" como muletilla).
- Cada sección del cuerpo empieza con un subtítulo corto en **negrita** seguido
  de 1-2 párrafos. Esto es markdown ligero en texto plano, NO MDX, NO HTML.
"""

REQUIRED_FIELDS = [
    "slug", "titleEn", "titleEs", "date", "readingTime",
    "tagsEn", "tagsEs", "excerptEn", "excerptEs", "bodyEn", "bodyEs", "angle",
]


class ArticleGenerationError(Exception):
    """Raised when the Claude API is misconfigured, unreachable, or returns something unusable."""


def get_anthropic_api_key() -> str:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise ArticleGenerationError(
            "Falta el secret ANTHROPIC_API_KEY. Crea una key en https://console.anthropic.com/ "
            "(Settings -> API Keys) y guárdala en GitHub Settings -> Secrets and variables -> "
            "Actions con el nombre ANTHROPIC_API_KEY."
        )
    return api_key


def load_style_reference(lib_articles_path: Path, max_chars: int = 7000) -> str:
    if not lib_articles_path.exists():
        raise ArticleGenerationError(f"No se encontró {lib_articles_path} para calibrar tono y longitud.")
    text = lib_articles_path.read_text(encoding="utf-8")
    return text[:max_chars]


def _slugify(title_en: str) -> str:
    slug = title_en.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


def build_prompt(topic: PendingTopic, industry_context: dict | None, research: list[SearchResult], style_reference: str) -> str:
    research_block = "\n".join(
        f"- [{r.query}] {r.title} — {r.url}\n  {r.snippet}" for r in research
    )
    industry_block = "(sin datos adicionales en la pestaña Industries para esta industria)"
    if industry_context:
        industry_block = "\n".join(f"- {key}: {value}" for key, value in industry_context.items() if value)

    return f"""Eres el redactor editorial de SC-Analytics, una consultora de datos/ML.
Vas a escribir UN artículo de blog nuevo, bilingüe (inglés y español), listo
para insertarse en un array TypeScript.

{BRAND_TONE_GUIDE}

TEMA ASIGNADO (de la pestaña "Topics Bank"):
- Theme: {topic.theme}
- Industry: {topic.industry}
- Possible Title (orientativo, puedes mejorarlo): {topic.possible_title}
- Decision Problem: {topic.decision_problem}
- Business Value: {topic.business_value}
- Analytical Background: {topic.analytical_background}
- CEO Relevance: {topic.ceo_relevance}

CONTEXTO DE LA INDUSTRIA (pestaña "Industries", puede estar incompleto):
{industry_block}

INVESTIGACIÓN WEB RECIENTE (úsala como contexto factual, no la cites textualmente):
{research_block}

REFERENCIA DE ESTILO Y LONGITUD — fragmento real de lib/articles.ts con artículos
ya publicados. Calibra tu longitud y registro EXACTAMENTE contra esto, no asumas
un número de palabras:
---
{style_reference}
---

INSTRUCCIONES DE SALIDA:
Responde ÚNICAMENTE con un objeto JSON (sin texto antes ni después, sin bloque
de código markdown) con EXACTAMENTE estas claves:
  slug          (kebab-case, en inglés, único, derivado del titleEn)
  titleEn       (string)
  titleEs       (string)
  date          (string, formato YYYY-MM-DD, usa una fecha reciente y plausible)
  readingTime   (number, minutos enteros, coherente con la longitud real del bodyEn)
  tagsEn        (array de 3 strings en inglés)
  tagsEs        (array de 3 strings en español, traducción de tagsEn)
  excerptEn     (string, 1-2 frases, igual de estilo que los excerpts de referencia)
  excerptEs     (string, traducción fiel de excerptEn)
  bodyEn        (string largo, varios párrafos con subtítulos **en negrita**,
                 mismo patrón y longitud que los bodyEn de referencia)
  bodyEs        (string largo, traducción fiel y natural de bodyEn, mismo formato)
  angle         (string, 1 frase: el ángulo concreto que elegiste para este artículo,
                 para que el equipo lo registre en el pipeline editorial)

No uses backticks (`) ni la secuencia ${{ dentro de ningún valor string."""


def _strip_code_fences(text: str) -> str:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```[a-zA-Z]*\n", "", stripped)
        stripped = re.sub(r"\n```$", "", stripped)
    return stripped.strip()


def call_claude(prompt: str, api_key: str) -> str:
    try:
        response = requests.post(
            ANTHROPIC_ENDPOINT,
            headers={
                "x-api-key": api_key,
                "anthropic-version": ANTHROPIC_VERSION,
                "content-type": "application/json",
            },
            json={
                "model": MODEL,
                "max_tokens": MAX_TOKENS,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException as exc:
        raise ArticleGenerationError(f"La API de Anthropic no respondió. Detalle: {exc}") from exc

    if response.status_code == 401:
        raise ArticleGenerationError("La API de Anthropic rechazó la API key (401). Verifica ANTHROPIC_API_KEY.")
    if response.status_code == 429:
        raise ArticleGenerationError("La API de Anthropic devolvió 429 (rate limit / cuota agotada).")
    if response.status_code != 200:
        raise ArticleGenerationError(
            f"La API de Anthropic devolvió un error: HTTP {response.status_code} — {response.text[:500]}"
        )

    payload = response.json()
    blocks = payload.get("content", [])
    text_blocks = [block.get("text", "") for block in blocks if block.get("type") == "text"]
    if not text_blocks:
        raise ArticleGenerationError("La respuesta de Anthropic no contenía texto utilizable.")
    return "\n".join(text_blocks)


def parse_article_json(raw_text: str) -> dict:
    cleaned = _strip_code_fences(raw_text)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise ArticleGenerationError(
            "Claude no devolvió un JSON válido para el artículo. "
            f"Primeros 300 caracteres de la respuesta: {cleaned[:300]!r}"
        ) from exc

    missing = [field for field in REQUIRED_FIELDS if field not in data or data[field] in (None, "")]
    if missing:
        raise ArticleGenerationError(f"El JSON del artículo generado por Claude no incluye: {missing}")

    if not isinstance(data["tagsEn"], list) or not isinstance(data["tagsEs"], list):
        raise ArticleGenerationError("tagsEn/tagsEs deben ser arrays de strings en el JSON generado.")

    if not data.get("slug"):
        data["slug"] = _slugify(data["titleEn"])

    return data


def generate_article(topic: PendingTopic, industry_context: dict | None, research: list[SearchResult], lib_articles_path: Path) -> dict:
    api_key = get_anthropic_api_key()
    style_reference = load_style_reference(lib_articles_path)
    prompt = build_prompt(topic, industry_context, research, style_reference)
    raw_response = call_claude(prompt, api_key)
    return parse_article_json(raw_response)
