"""Entry point for the LinkedIn Pack generator.

Run from the repo root as: python scripts/linkedin_pack/generate_pack.py

Order of operations:
  1. Read the source article (content/articles/{slug}.mdx).
  2. Build a prompt from prompts/linkedin_pack_prompt.md + the article content.
  3. Call Gemini to draft 5 posts (Monday-Friday).
  4. Assemble and validate the full LinkedIn Pack JSON.
  5. Write it to content/linkedin/{campaign_id}.json.
  6. Write a JSON hand-off file for the GitHub Actions workflow.

This script never publishes anything. It only ever produces a JSON file with
status "ready_for_review" and approved: false, for a human to review.

Two generation modes (GENERATION_MODE env var, default "auto"):
  manual — uses ARTICLE_SLUG / ARTICLE_PATH / PUBLISH_WEEK_START as given.
  auto   — queries the 'Articles Index' tab of the Editorial Google Sheet,
           picks the oldest published article without a LinkedIn Pack yet,
           and uses the next Monday as PUBLISH_WEEK_START if none is given.
           If nothing is pending, exits 0 without writing any output file —
           the workflow treats that as "nothing to do", not a failure.

Reads its inputs from environment variables (set by the GitHub Actions
workflow from workflow_dispatch inputs):
  GENERATION_MODE       optional — "auto" (default) or "manual"
  ARTICLE_SLUG          required in mode=manual; ignored in mode=auto
  ARTICLE_PATH          optional — overrides the default content/articles/{slug}.mdx lookup
  PUBLISH_WEEK_START    required in mode=manual; optional in mode=auto (defaults to next Monday)
  LANGUAGE              optional — defaults to "en"
  GEMINI_API_KEY        required
  LINKEDIN_MODE         optional — default publish_mode for the generated pack ("manual" or "api")
  GOOGLE_SHEETS_CREDENTIALS, EDITORIAL_SHEET_ID — required only in mode=auto
"""

from __future__ import annotations

import json
import os
import re
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import requests

REPO_ROOT = Path(__file__).resolve().parents[2]
CONTENT_ENGINE_DIR = REPO_ROOT / "scripts" / "content_engine"

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(CONTENT_ENGINE_DIR))

from article_reader import ArticleReadError, read_article, resolve_article_path
import articles_index
import sheets_client

PROMPT_TEMPLATE_PATH = REPO_ROOT / "prompts" / "linkedin_pack_prompt.md"
LINKEDIN_CONTENT_DIR = REPO_ROOT / "content" / "linkedin"
OUTPUT_JSON_PATH = Path(__file__).resolve().parent / ".linkedin_pack_output.json"

VALID_GENERATION_MODES = ("auto", "manual")

GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_ENDPOINT = (
    f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
)
MAX_OUTPUT_TOKENS = 8192
REQUEST_TIMEOUT_SECONDS = 180

VALID_PUBLISH_MODES = ("manual", "api")

# (day, post_type, brief) — order defines publish_date offset from publish_week_start
DAY_PLAN = [
    ("monday", "industry_context", "Industry context and presentation of the week's theme."),
    ("tuesday", "core_problem", "The main problem, framed around process, data or decision-making."),
    ("wednesday", "practical_case", "A simplified practical case with clearly illustrative numbers."),
    ("thursday", "consultant_hypothesis", "A senior consultant's hypothesis and reasoning to approach the problem."),
    ("friday", "weekly_summary", "Weekly wrap-up, main takeaways, and a link to the full article."),
]


class PackGenerationError(Exception):
    """Raised when the pipeline cannot produce a usable LinkedIn Pack."""


def fail(message: str) -> None:
    print(f"\n[ERROR] {message}\n", file=sys.stderr)
    sys.exit(1)


# ── Inputs ─────────────────────────────────────────────────────────────────────

def read_inputs() -> dict:
    generation_mode = os.environ.get("GENERATION_MODE", "auto").strip().lower() or "auto"
    if generation_mode not in VALID_GENERATION_MODES:
        raise PackGenerationError(
            f"GENERATION_MODE '{generation_mode}' no es válido. Debe ser uno de: {VALID_GENERATION_MODES}."
        )

    article_slug = os.environ.get("ARTICLE_SLUG", "").strip()
    if generation_mode == "manual" and not article_slug:
        raise PackGenerationError("Falta ARTICLE_SLUG (obligatorio en mode=manual).")

    publish_week_start_raw = os.environ.get("PUBLISH_WEEK_START", "").strip()
    publish_week_start = None
    if publish_week_start_raw:
        try:
            publish_week_start = date.fromisoformat(publish_week_start_raw)
        except ValueError as exc:
            raise PackGenerationError(
                f"PUBLISH_WEEK_START='{publish_week_start_raw}' no es una fecha YYYY-MM-DD válida."
            ) from exc
        if publish_week_start.weekday() != 0:
            print(
                f"[WARN] PUBLISH_WEEK_START ({publish_week_start.isoformat()}) no es un lunes. "
                "Se usará igualmente como día 0 de la semana (lunes=día 0 .. viernes=día 4)."
            )
    elif generation_mode == "manual":
        raise PackGenerationError("Falta PUBLISH_WEEK_START (obligatorio en mode=manual, formato YYYY-MM-DD).")

    return {
        "generation_mode": generation_mode,
        "article_slug": article_slug,
        "article_path": os.environ.get("ARTICLE_PATH", "").strip(),
        "publish_week_start": publish_week_start,
        "language": os.environ.get("LANGUAGE", "en").strip() or "en",
        "publish_mode": os.environ.get("LINKEDIN_MODE", "manual").strip() or "manual",
    }


def next_monday(from_date: date) -> date:
    """The current week's Monday if from_date already is one, otherwise the upcoming Monday."""
    offset = (7 - from_date.weekday()) % 7
    return from_date + timedelta(days=offset)


def resolve_pending_article_slug() -> str:
    """Queries 'Articles Index' and returns the slug of the oldest published article
    without a LinkedIn Pack yet. Exits 0 (not an error) if there is none pending.
    """
    try:
        service = sheets_client.get_sheets_service()
        sheet_id = sheets_client.get_sheet_id()
    except sheets_client.SheetsConfigError as exc:
        raise PackGenerationError(str(exc)) from exc

    try:
        rows = articles_index.read_articles_index(service, sheet_id, sheets_client)
    except (sheets_client.SheetsConfigError, articles_index.ArticlesIndexError) as exc:
        raise PackGenerationError(str(exc)) from exc

    print(f"[INFO] '{articles_index.ARTICLES_INDEX_TAB}': {len(rows)} fila(s) leídas.")

    pending = articles_index.find_pending_article(rows, LINKEDIN_CONTENT_DIR)
    if pending is None:
        print("No pending published articles without LinkedIn Pack.")
        sys.exit(0)

    slug = (pending.get("Slug") or "").strip()
    print(f"[INFO] Artículo seleccionado automáticamente: slug='{slug}' (Date={pending.get('Date', '')!r})")
    return slug


def get_gemini_api_key() -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise PackGenerationError(
            "Falta el secret GEMINI_API_KEY. Crea una key en https://aistudio.google.com/app/apikey "
            "y guárdala en GitHub Settings → Secrets and variables → Actions."
        )
    return api_key


# ── Prompt construction ───────────────────────────────────────────────────────

def load_prompt_template() -> str:
    if not PROMPT_TEMPLATE_PATH.exists():
        raise PackGenerationError(
            f"Falta el documento de prompt requerido: {PROMPT_TEMPLATE_PATH}"
        )
    return PROMPT_TEMPLATE_PATH.read_text(encoding="utf-8")


def build_prompt(article: dict, language: str, prompt_template: str) -> str:
    days_block = "\n".join(
        f"{i + 1}. {day} ({post_type}): {brief}"
        for i, (day, post_type, brief) in enumerate(DAY_PLAN)
    )

    return f"""You are writing the weekly LinkedIn Pack for SC-Analytics, based on the article below.

===== RULES AND TONE =====
{prompt_template}

===== SOURCE ARTICLE =====
Title: {article['title']}
Industry: {article['industry']}
Theme: {article['theme']}
URL: {article['url']}
Excerpt: {article['excerpt']}

Body:
{article['body']}

===== TARGET LANGUAGE =====
Write all post text in: {language}

===== POSTS TO GENERATE, IN THIS EXACT ORDER =====
{days_block}

===== OUTPUT =====
Return ONLY a single valid JSON array of exactly 5 objects, one per post above,
in the same order. Nothing before it. Nothing after it. No markdown. No code fence.
Your response must start with [ and end with ].

Each object must have exactly these keys:
  title      string — short, post-specific title (not the article title)
  text       string — the full post body, ready to copy-paste into LinkedIn
  hashtags   array of 3 to 5 strings, each starting with "#"

Do not include the day name or post type inside "text" as a label.
Do not invent statistics, client names or outcomes that are not grounded in the article."""


# ── JSON extraction ───────────────────────────────────────────────────────────

def _strip_code_fences(text: str) -> str:
    s = text.strip()
    if s.startswith("```"):
        s = re.sub(r"^```[a-zA-Z]*\s*\n?", "", s)
        s = re.sub(r"\n?```\s*$", "", s)
    return s.strip()


def _try_parse(text: str) -> list | dict | None:
    try:
        return json.loads(text)
    except (json.JSONDecodeError, ValueError):
        return None


def _extract_array(text: str) -> str | None:
    start = text.find("[")
    end = text.rfind("]")
    if start == -1 or end == -1 or end <= start:
        return None
    return text[start : end + 1]


def _repair_call(raw_text: str, api_key: str) -> str:
    repair_prompt = (
        "The following text should contain a JSON array of exactly 5 post objects "
        "(each with keys: title, text, hashtags), but it may have extra content, "
        "formatting issues, or be malformed.\n\n"
        "Return ONLY the complete, valid JSON array. No markdown. No explanation. "
        "No code fence. Your response must start with [ and end with ]. "
        "Do not change any values, only fix the formatting.\n\n"
        "Text:\n" + raw_text
    )
    response = requests.post(
        GEMINI_ENDPOINT,
        headers={"x-goog-api-key": api_key, "content-type": "application/json"},
        json={
            "contents": [{"parts": [{"text": repair_prompt}]}],
            "generationConfig": {
                "maxOutputTokens": MAX_OUTPUT_TOKENS,
                "responseMimeType": "application/json",
            },
        },
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    if response.status_code != 200:
        raise PackGenerationError(f"La llamada de reparación devolvió HTTP {response.status_code}.")
    payload = response.json()
    candidates = payload.get("candidates", [])
    if not candidates:
        raise PackGenerationError("La llamada de reparación no devolvió candidates.")
    parts = candidates[0].get("content", {}).get("parts", [])
    return "\n".join(part.get("text", "") for part in parts if "text" in part)


def extract_posts(raw_text: str, api_key: str) -> list[dict]:
    cleaned = _strip_code_fences(raw_text)
    result = _try_parse(cleaned)
    if not isinstance(result, list):
        extracted = _extract_array(cleaned) or _extract_array(raw_text)
        result = _try_parse(extracted) if extracted else None

    if not isinstance(result, list) or len(result) != 5:
        print("[WARN] Stage 1 (parse + extraction) falló o no devolvió 5 posts. Intentando reparación...")
        repaired_text = _repair_call(raw_text, api_key)
        cleaned = _strip_code_fences(repaired_text)
        result = _try_parse(cleaned)
        if not isinstance(result, list):
            extracted = _extract_array(cleaned) or _extract_array(repaired_text)
            result = _try_parse(extracted) if extracted else None

    if not isinstance(result, list) or len(result) != 5:
        raise PackGenerationError(
            "Gemini no devolvió un array JSON de exactamente 5 posts tras reparación.\n"
            f"Respuesta original (primeros 500 chars):\n{raw_text[:500]!r}"
        )
    return result


# ── Gemini call ───────────────────────────────────────────────────────────────

def call_gemini(prompt: str, api_key: str) -> str:
    try:
        response = requests.post(
            GEMINI_ENDPOINT,
            headers={"x-goog-api-key": api_key, "content-type": "application/json"},
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
        raise PackGenerationError(f"La API de Gemini no respondió. Detalle: {exc}") from exc

    if response.status_code in (401, 403):
        raise PackGenerationError(
            f"La API de Gemini rechazó la API key ({response.status_code}). Verifica GEMINI_API_KEY."
        )
    if response.status_code == 429:
        raise PackGenerationError("La API de Gemini devolvió 429 (rate limit / cuota agotada).")
    if response.status_code != 200:
        raise PackGenerationError(
            f"La API de Gemini devolvió un error: HTTP {response.status_code} — {response.text[:500]}"
        )

    payload = response.json()
    candidates = payload.get("candidates", [])
    if not candidates:
        block_reason = payload.get("promptFeedback", {}).get("blockReason")
        raise PackGenerationError(
            f"La API de Gemini no devolvió ningún candidate (blockReason={block_reason!r})."
        )
    parts = candidates[0].get("content", {}).get("parts", [])
    text_blocks = [part.get("text", "") for part in parts if "text" in part]
    if not text_blocks:
        raise PackGenerationError("La respuesta de Gemini no contenía texto utilizable.")
    return "\n".join(text_blocks)


# ── Validation & assembly ──────────────────────────────────────────────────────

def validate_raw_post(post: dict, day: str) -> dict:
    if not isinstance(post, dict):
        raise PackGenerationError(f"El post de '{day}' no es un objeto JSON.")
    for field in ("title", "text", "hashtags"):
        if field not in post or post[field] in (None, ""):
            raise PackGenerationError(f"El post de '{day}' no incluye el campo obligatorio '{field}'.")
    if not isinstance(post["hashtags"], list) or not all(isinstance(h, str) for h in post["hashtags"]):
        raise PackGenerationError(f"El post de '{day}' tiene 'hashtags' que no es una lista de strings.")
    if not (1 <= len(post["hashtags"]) <= 5):
        raise PackGenerationError(f"El post de '{day}' tiene {len(post['hashtags'])} hashtags (esperado 1-5).")
    return post


def assemble_pack(
    article: dict,
    raw_posts: list[dict],
    publish_week_start: date,
    language: str,
    publish_mode: str,
) -> dict:
    if publish_mode not in VALID_PUBLISH_MODES:
        raise PackGenerationError(
            f"publish_mode '{publish_mode}' no es válido. Debe ser uno de: {VALID_PUBLISH_MODES}."
        )

    posts = []
    for i, ((day, post_type, _brief), raw_post) in enumerate(zip(DAY_PLAN, raw_posts)):
        raw_post = validate_raw_post(raw_post, day)
        publish_date = publish_week_start + timedelta(days=i)
        posts.append(
            {
                "day": day,
                "publish_date": publish_date.isoformat(),
                "post_type": post_type,
                "title": raw_post["title"],
                "text": raw_post["text"],
                "image_required": False,
                "image_prompt": "",
                "image_path": "",
                "hashtags": raw_post["hashtags"],
                "published": False,
                "published_at": None,
                "linkedin_post_url": None,
            }
        )

    campaign_id = f"{publish_week_start.isoformat()}-{article['slug']}"

    return {
        "campaign_id": campaign_id,
        "source_article_slug": article["slug"],
        "source_article_url": article["url"],
        "industry": article["industry"],
        "theme": article["theme"],
        "language": language,
        "status": "ready_for_review",
        "approved": False,
        "publish_mode": publish_mode,
        "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "posts": posts,
    }


def write_pack_json(pack: dict) -> Path:
    LINKEDIN_CONTENT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = LINKEDIN_CONTENT_DIR / f"{pack['campaign_id']}.json"
    if output_path.exists():
        raise PackGenerationError(
            f"Ya existe un LinkedIn Pack para '{pack['campaign_id']}' en {output_path}. "
            "No se sobreescribe un pack existente."
        )
    output_path.write_text(json.dumps(pack, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return output_path


def main() -> None:
    print("=== LinkedIn Pack generator ===")

    try:
        inputs = read_inputs()
        api_key = get_gemini_api_key()

        if inputs["generation_mode"] == "auto":
            inputs["article_slug"] = resolve_pending_article_slug()

        if inputs["publish_week_start"] is None:
            inputs["publish_week_start"] = next_monday(date.today())
            print(f"[INFO] PUBLISH_WEEK_START no especificado — usando {inputs['publish_week_start'].isoformat()}.")

        article_path = resolve_article_path(REPO_ROOT, inputs["article_slug"], inputs["article_path"])
        article = read_article(article_path)
        print(f"[INFO] Artículo fuente: '{article['title']}' ({article_path.relative_to(REPO_ROOT)})")

        prompt_template = load_prompt_template()
        prompt = build_prompt(article, inputs["language"], prompt_template)

        raw_response = call_gemini(prompt, api_key)
        raw_posts = extract_posts(raw_response, api_key)

        pack = assemble_pack(
            article, raw_posts, inputs["publish_week_start"], inputs["language"], inputs["publish_mode"]
        )
        output_path = write_pack_json(pack)
        print(f"[INFO] LinkedIn Pack escrito en: {output_path.relative_to(REPO_ROOT)}")
    except (PackGenerationError, ArticleReadError) as exc:
        fail(str(exc))
        return

    summary = {
        "campaign_id": pack["campaign_id"],
        "source_article_slug": pack["source_article_slug"],
        "source_article_url": pack["source_article_url"],
        "industry": pack["industry"],
        "theme": pack["theme"],
        "language": pack["language"],
        "publish_mode": pack["publish_mode"],
        "json_path": str(output_path.relative_to(REPO_ROOT)).replace("\\", "/"),
        "posts": [{"day": p["day"], "publish_date": p["publish_date"], "title": p["title"]} for p in pack["posts"]],
    }
    OUTPUT_JSON_PATH.write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")

    print("\n=== RESUMEN ===")
    print(f"Campaign: {pack['campaign_id']}")
    for p in pack["posts"]:
        print(f"  - {p['day']} ({p['publish_date']}): {p['title']}")
    print("================\n")


if __name__ == "__main__":
    main()
