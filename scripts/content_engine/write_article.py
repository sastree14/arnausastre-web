"""Drafts a full bilingual article via the Gemini API (gemini-2.5-flash).

Editorial rules, taxonomy and article structure are read from:
  content/editorial/editorial_voice.md
  content/editorial/article_structure.md
  content/editorial/taxonomy.md

Modify those files to change the editorial line — no code changes required.

JSON robustness strategy (three attempts before aborting):
  1. Direct parse after stripping code fences and leading/trailing whitespace.
  2. Regex extraction of the outermost {...} block (handles text before/after JSON).
  3. A second Gemini call whose only task is to return the JSON and nothing else.
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
MAX_REPAIR_TOKENS = 9000
REQUEST_TIMEOUT_SECONDS = 180

EDITORIAL_DIR_RELATIVE = "content/editorial"

# Fields that MUST come from Gemini — no sensible default exists.
HARD_REQUIRED_FIELDS = [
    "slug", "titleEn", "titleEs", "date", "readingTime",
    "tagsEn", "tagsEs", "excerptEn", "excerptEs",
    "bodyEn", "bodyEs",
]

# Fields that are requested from Gemini but can be auto-filled if missing.
SOFT_FIELDS = ["angle", "challenge", "audience", "level"]

# Combined list used for the _has_required_fields check in the extractor.
BASE_REQUIRED_FIELDS = HARD_REQUIRED_FIELDS + SOFT_FIELDS


class ArticleGenerationError(Exception):
    """Raised when the pipeline cannot produce a usable article."""


# ── Editorial document loading ────────────────────────────────────────────────

def load_editorial_docs(editorial_dir: Path) -> dict[str, str]:
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

    def opts(key: str) -> str:
        values = taxonomy.get(key, [])
        return ", ".join(f'"{v}"' for v in values)

    return f"""You are the editorial writer for SC-Analytics, a data and analytics consultancy.
Write ONE new bilingual article (English and Spanish) for the SC-Analytics knowledge library.

The following editorial documents contain your requirements. Read them carefully.

===== EDITORIAL VOICE =====
{editorial_docs['editorial_voice']}

===== ARTICLE STRUCTURE =====
{editorial_docs['article_structure']}

===== ASSIGNED TOPIC =====
- Theme: {topic.theme}
- Industry: {topic.industry}
- Suggested title (adapt freely): {topic.possible_title}
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

===== INTERNAL QUALITY VERIFICATION (do not output this — verify silently before writing) =====

Before writing the JSON, confirm internally that the article satisfies ALL of the following.
Do NOT output this checklist or any verification text. This is a silent internal check only.

- Title makes a specific, non-obvious claim — not a topic description
- Excerpt states the central argument, not what the article is about
- Opening section makes a substantive point immediately — does not restate the title
- Body contains at least one concrete business scenario: company type + size/context + specific situation + consequence chain (event → operational → economic → organizational)
- Body contains at least one genuine trade-off including costs, risks, and limitations of the proposed solution — not just the status quo
- Body contains at least one operational implication for a specific role in a specific situation
- Body contains at least one defensible claim someone could reasonably disagree with
- Closing ends with a specific diagnostic or insight — not a summary
- The following phrases do not appear anywhere: "In today's fast-paced", "companies increasingly recognise", "it is important to note", "what actually works is", "the key is to", "ultimately, the goal is", "with the right approach", "the question is whether your organisation is prepared"
- No meta-labels announce structural elements ("A concrete scenario:", "Recommendation:", "Trade-off:")
- Organizational causality is explained for any problem described as persistent

===== OUTPUT =====

Return ONLY a single valid JSON object. Nothing before it. Nothing after it.
No markdown. No code fence. No commentary. No checklist output.
Your response must start with {{ and end with }}.

Required keys, in this exact order (put bodyEn and bodyEs last):

  slug         kebab-case English string derived from titleEn
  titleEn      string
  titleEs      string — faithful Spanish translation
  date         string YYYY-MM-DD, recent plausible date
  readingTime  integer, minutes, consistent with actual bodyEn length
  tagsEn       array of exactly 3 strings in English
  tagsEs       array of exactly 3 strings in Spanish
  excerptEn    string, 1-2 sentences
  excerptEs    string — faithful Spanish translation
  angle        string, 1 sentence: the specific argumentative angle chosen
  challenge    string — MUST be exactly one of: {opts('Challenge')}
  audience     string — MUST be exactly one of: {opts('Audience')}
  level        string — MUST be exactly one of: {opts('Level')}
  bodyEn       string — paragraphs with **bold** subtitles, no meta-labels
  bodyEs       string — faithful natural Spanish translation, same format

Do not use backticks or the sequence ${{ inside any string value."""


# ── JSON extraction (three-stage robustness layer) ────────────────────────────

def _strip_code_fences(text: str) -> str:
    """Remove markdown code fences if present."""
    s = text.strip()
    if s.startswith("```"):
        s = re.sub(r"^```[a-zA-Z]*\s*\n?", "", s)
        s = re.sub(r"\n?```\s*$", "", s)
    return s.strip()


def _try_parse(text: str) -> dict | None:
    """Attempt json.loads; return None on failure."""
    try:
        return json.loads(text)
    except (json.JSONDecodeError, ValueError):
        return None


def _extract_all_json_objects(text: str) -> list[str]:
    """Find ALL top-level {...} JSON objects in text using a character-level brace counter.

    Returns them in order of appearance. This handles:
    - text or commentary before or after the JSON
    - Gemini emitting a checklist/verification object BEFORE the article object
    - nested objects, strings containing braces, escaped characters
    """
    objects = []
    i = 0
    while i < len(text):
        start = text.find("{", i)
        if start == -1:
            break
        depth = 0
        in_string = False
        escape_next = False
        end = None
        for j, ch in enumerate(text[start:], start):
            if escape_next:
                escape_next = False
                continue
            if ch == "\\" and in_string:
                escape_next = True
                continue
            if ch == '"':
                in_string = not in_string
                continue
            if in_string:
                continue
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    end = j
                    break
        if end is not None:
            objects.append(text[start : end + 1])
            i = end + 1
        else:
            break
    return objects


def _has_required_fields(data: dict) -> bool:
    """Quick check: does this dict contain the hard-required content fields?
    Soft fields (angle, challenge, audience, level) are filled in by _apply_soft_defaults()
    if Gemini omits them, so they are not checked here.
    """
    return all(f in data and data[f] not in (None, "") for f in HARD_REQUIRED_FIELDS)


def _repair_call(raw_text: str, api_key: str) -> str:
    """Ask Gemini to reconstruct the complete JSON from a malformed response.

    Passes the full raw_text (no truncation) and names every required field
    explicitly so Gemini doesn't omit tail fields like angle/challenge/audience/level.
    """
    required_fields = ", ".join(BASE_REQUIRED_FIELDS)
    repair_prompt = (
        "The following text should contain a JSON object for an article, "
        "but it may have extra content, formatting issues, or be partially malformed.\n\n"
        f"The JSON MUST contain ALL of these fields: {required_fields}\n\n"
        "Return ONLY the complete, valid JSON object. "
        "No markdown. No explanation. No code fence. No commentary. "
        "Your response must start with { and end with }. "
        "Do not omit any fields. Do not change any values.\n\n"
        "Text:\n"
        + raw_text  # no truncation — tail fields may be at the end
    )
    try:
        response = requests.post(
            GEMINI_ENDPOINT,
            headers={
                "x-goog-api-key": api_key,
                "content-type": "application/json",
            },
            json={
                "contents": [{"parts": [{"text": repair_prompt}]}],
                "generationConfig": {
                    "maxOutputTokens": MAX_REPAIR_TOKENS,
                    "responseMimeType": "application/json",
                },
            },
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException as exc:
        raise ArticleGenerationError(
            f"La llamada de reparación a Gemini falló. Detalle: {exc}"
        ) from exc

    if response.status_code != 200:
        raise ArticleGenerationError(
            f"La llamada de reparación devolvió HTTP {response.status_code}."
        )

    payload = response.json()
    candidates = payload.get("candidates", [])
    if not candidates:
        raise ArticleGenerationError("La llamada de reparación no devolvió candidates.")

    parts = candidates[0].get("content", {}).get("parts", [])
    return "\n".join(part.get("text", "") for part in parts if "text" in part)


def _best_json_from_text(text: str) -> dict | None:
    """Try to extract a valid article JSON from text.

    Tries ALL JSON objects found in the text (not just the first), returning the
    first one that contains all required article fields. This handles the case
    where Gemini emits a checklist/verification object before the article object.
    """
    cleaned = _strip_code_fences(text)
    # Try direct parse first (fastest path)
    result = _try_parse(cleaned)
    if result is not None and _has_required_fields(result):
        return result

    # Try all JSON objects in the text
    for candidate_text in _extract_all_json_objects(cleaned) + _extract_all_json_objects(text):
        result = _try_parse(candidate_text)
        if result is not None and _has_required_fields(result):
            return result

    # Last chance: any parseable JSON (validation will catch missing fields later)
    for candidate_text in _extract_all_json_objects(cleaned) + _extract_all_json_objects(text):
        result = _try_parse(candidate_text)
        if result is not None:
            return result

    return None


def extract_json_with_fallbacks(raw_text: str, api_key: str) -> dict:
    """Three-stage extraction chain. Aborts with a clear error if all stages fail.

    Stage 1: strip code fences + try all JSON objects in the response
    Stage 2: repair call to Gemini + try all JSON objects in the repaired response
    Stage 3: abort with diagnostic showing both responses
    """
    # Stage 1
    result = _best_json_from_text(raw_text)
    if result is not None:
        if not _has_required_fields(result):
            print("[WARN] Stage 1: found JSON but missing required fields. Trying repair...")
        else:
            return result

    if result is None:
        print("[WARN] Stage 1 (parse + extraction) failed. Attempting repair call to Gemini...")

    # Stage 2
    repaired_text = _repair_call(raw_text, api_key)
    result = _best_json_from_text(repaired_text)
    if result is not None:
        if _has_required_fields(result):
            print("[INFO] Stage 2 (repair call) succeeded.")
            return result
        print("[WARN] Stage 2: repair call returned JSON but still missing required fields.")
        # Return it anyway — validate_article will give the specific error
        return result

    raise ArticleGenerationError(
        "Gemini no pudo producir JSON válido tras dos intentos de extracción.\n"
        f"Respuesta original (primeros 500 chars):\n{raw_text[:500]!r}\n"
        f"Respuesta de reparación (primeros 500 chars):\n{repaired_text[:500]!r}"
    )


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


# ── Validation & defaults ─────────────────────────────────────────────────────

def _best_challenge_match(text: str, challenges: list[str]) -> str:
    """Keyword-match topic text against challenge categories; fall back to last item."""
    lower = text.lower()
    keywords: dict[str, list[str]] = {
        "Forecasting": ["forecast", "predict", "demand", "planning"],
        "Inventory Management": ["inventory", "stock", "sku", "replenish"],
        "Resource Allocation": ["resource", "allocat", "budget", "capacity"],
        "Pricing": ["pric", "margin", "revenue"],
        "Route Planning": ["route", "fleet", "logistics", "delivery"],
        "Automation": ["automat", "workflow", "manual process"],
        "Fraud Detection": ["fraud", "risk", "anomal", "detect"],
        "Decision Making": ["decision", "report", "insight", "analytic", "executive"],
    }
    for challenge in challenges:
        for kw in keywords.get(challenge, []):
            if kw in lower:
                return challenge
    return challenges[-1] if challenges else "Decision Making"


def _apply_soft_defaults(data: dict, taxonomy: dict[str, list[str]], topic: "PendingTopic") -> dict:
    """Fill in soft fields that Gemini omitted, using topic context as a signal.

    Logs a warning for each field that is auto-filled so the issue is visible
    in the workflow output without crashing the pipeline.
    """
    challenges = taxonomy.get("Challenge", ["Decision Making"])
    audiences = taxonomy.get("Audience", ["CEO"])
    levels = taxonomy.get("Level", ["Strategic"])

    if not data.get("angle"):
        data["angle"] = f"Practical implications of {topic.theme.lower()} in {topic.industry.lower()} operations."
        print(f"[WARN] 'angle' missing — auto-filled: {data['angle']!r}")

    if not data.get("challenge") or data["challenge"] not in challenges:
        search_text = f"{topic.theme} {topic.decision_problem} {topic.business_value}"
        data["challenge"] = _best_challenge_match(search_text, challenges)
        print(f"[WARN] 'challenge' missing or invalid — auto-filled: {data['challenge']!r}")

    if not data.get("audience") or data["audience"] not in audiences:
        data["audience"] = "CEO"
        print(f"[WARN] 'audience' missing or invalid — auto-filled: {data['audience']!r}")

    if not data.get("level") or data["level"] not in levels:
        data["level"] = "Strategic"
        print(f"[WARN] 'level' missing or invalid — auto-filled: {data['level']!r}")

    return data


def validate_article(data: dict, taxonomy: dict[str, list[str]], topic: "PendingTopic") -> dict:
    """Validate hard-required fields; auto-fill soft fields if missing."""
    # Hard fields — no defaults possible, must abort if missing
    missing = [f for f in HARD_REQUIRED_FIELDS if f not in data or data[f] in (None, "")]
    if missing:
        raise ArticleGenerationError(
            f"El JSON generado por Gemini no incluye campos de contenido obligatorios: {missing}\n"
            "Estos campos no pueden rellenarse automáticamente."
        )

    if not isinstance(data.get("tagsEn"), list) or not isinstance(data.get("tagsEs"), list):
        raise ArticleGenerationError("tagsEn/tagsEs deben ser arrays de strings.")

    # Soft fields — auto-fill from topic context if missing or invalid
    data = _apply_soft_defaults(data, taxonomy, topic)

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
    """Generate a bilingual article using Gemini, guided by the editorial documents."""
    api_key = get_gemini_api_key()
    editorial_docs = load_editorial_docs(editorial_dir)
    taxonomy = parse_taxonomy(editorial_docs["taxonomy"])
    style_reference = load_style_reference(content_articles_dir)
    prompt = build_prompt(topic, industry_context, research, style_reference, editorial_docs, taxonomy)
    raw_response = call_gemini(prompt, api_key)
    data = extract_json_with_fallbacks(raw_response, api_key)
    article = validate_article(data, taxonomy, topic)
    article["industry"] = topic.industry
    article["theme"] = topic.theme
    return article
