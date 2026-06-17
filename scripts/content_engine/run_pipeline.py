"""Entry point for the content-research-draft pipeline.

Run from the repo root as: python scripts/content_engine/run_pipeline.py

Order of operations (mirrors the workflow spec):
  1. Read Topics Bank.
  2. Read Content Pipeline, compute pending topics.
  3. Pick one pending topic at random (seed logged).
  4. Research it via Brave Search.
  5. Draft the bilingual article via Claude.
  6. Generate its deterministic SVG header image.
  7. Insert the article into lib/articles.ts (+ patch the article page layout once).
  8. Append a row to Content Pipeline.
  9. Write a JSON hand-off file for the GitHub Actions workflow (PR title/body, etc).

Any failure stops the script immediately with a human-readable message — no
partial article is ever left half-inserted.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import pick_topic
import sheets_client
import write_article
from generate_header_svg import write_header_svg
from insert_article import ensure_header_image_render, insert_article_into_file
from web_research import WebResearchError, get_brave_api_key, research_topic
from write_article import ArticleGenerationError

REPO_ROOT = Path(__file__).resolve().parents[2]
LIB_ARTICLES_PATH = REPO_ROOT / "lib" / "articles.ts"
PAGE_TSX_PATH = REPO_ROOT / "app" / "insights" / "[slug]" / "page.tsx"
PUBLIC_DIR = REPO_ROOT / "public"
OUTPUT_JSON_PATH = REPO_ROOT / "scripts" / "content_engine" / ".pipeline_output.json"

TOPICS_BANK_TAB = "Topics Bank"
CONTENT_PIPELINE_TAB = "Content Pipeline"
INDUSTRIES_TAB = "Industries"

TOPICS_BANK_HEADERS = [
    "Theme", "Possible Title", "Industry", "Decision Problem", "Business Value",
    "Analytical Background", "CEO Relevance", "Difficulty", "Notes",
]
CONTENT_PIPELINE_HEADERS = [
    "ID", "Status", "Content Type", "Title", "Slug", "Industry", "Theme", "Audience",
    "Objective", "Angle", "Sources Needed", "Language", "Priority", "Draft Doc URL",
    "MDX File Name", "LinkedIn Version", "Publication Date", "GitHub Status", "Notes",
]
GITHUB_STATUS_COLUMN_INDEX = CONTENT_PIPELINE_HEADERS.index("GitHub Status")


def fail(message: str) -> None:
    print(f"\n[ERROR] {message}\n", file=sys.stderr)
    sys.exit(1)


def succeed_with_nothing_to_do(message: str) -> None:
    print(f"\n[OK] {message}\n")
    sys.exit(0)


def find_industry_context(industry_rows: list[dict], industry_name: str) -> dict | None:
    for row in industry_rows:
        if row.get("Industry", "").strip().lower() == industry_name.strip().lower():
            return row
    return None


def next_pipeline_id(content_pipeline_rows: list[dict]) -> int:
    max_id = 0
    for row in content_pipeline_rows:
        raw_id = (row.get("ID") or "").strip()
        if raw_id.isdigit():
            max_id = max(max_id, int(raw_id))
    return max_id + 1


def build_pipeline_row(article: dict, topic: pick_topic.PendingTopic, sources: list[str], next_id: int) -> list[str]:
    row_by_header = {
        "ID": str(next_id),
        "Status": "Generated",
        "Content Type": "Article",
        "Title": article["titleEn"],
        "Slug": article["slug"],
        "Industry": topic.industry,
        "Theme": topic.theme,
        "Audience": "Business decision-makers",
        "Objective": "",
        "Angle": article["angle"],
        "Sources Needed": ", ".join(sources),
        "Language": "EN/ES",
        "Priority": "",
        "Draft Doc URL": "",
        "MDX File Name": "",
        "LinkedIn Version": "",
        "Publication Date": "",
        "GitHub Status": "Generated — PR pending",
        "Notes": "",
    }
    return [row_by_header[header] for header in CONTENT_PIPELINE_HEADERS]


def main() -> None:
    print("=== Content research & draft pipeline ===")

    try:
        service = sheets_client.get_sheets_service()
        sheet_id = sheets_client.get_sheet_id()
    except sheets_client.SheetsConfigError as exc:
        fail(str(exc))
        return

    try:
        topics_bank_rows = sheets_client.read_tab_as_dicts(service, sheet_id, TOPICS_BANK_TAB, TOPICS_BANK_HEADERS)
        content_pipeline_rows = sheets_client.read_tab_as_dicts(service, sheet_id, CONTENT_PIPELINE_TAB, CONTENT_PIPELINE_HEADERS)
        industry_rows = sheets_client.read_tab_as_dicts(service, sheet_id, INDUSTRIES_TAB)
    except sheets_client.SheetsConfigError as exc:
        fail(str(exc))
        return

    try:
        pending = pick_topic.get_pending_topics(topics_bank_rows, content_pipeline_rows)
    except pick_topic.NoTopicsBankError as exc:
        fail(str(exc))
        return
    except pick_topic.NoPendingTopicsError as exc:
        succeed_with_nothing_to_do(str(exc))
        return

    topic, seed = pick_topic.choose_topic(pending)
    print(f"[INFO] {len(pending)} tema(s) pendiente(s). Semilla usada: {seed}")
    print(f"[INFO] Tema elegido: '{topic.theme}' / industria '{topic.industry}'")

    industry_context = find_industry_context(industry_rows, topic.industry)

    try:
        brave_key = get_brave_api_key()
        research_results = research_topic(topic.industry, topic.decision_problem, brave_key)
    except WebResearchError as exc:
        fail(str(exc))
        return

    print(f"[INFO] {len(research_results)} fuente(s) encontradas:")
    for result in research_results:
        print(f"  - {result.title} — {result.url}")

    try:
        article = write_article.generate_article(topic, industry_context, research_results, LIB_ARTICLES_PATH)
    except ArticleGenerationError as exc:
        fail(str(exc))
        return

    print(f"[INFO] Artículo generado: '{article['titleEn']}' (slug={article['slug']})")

    image_path = f"/insights/{article['slug']}.svg"
    try:
        write_header_svg(article["slug"], PUBLIC_DIR)
        insert_article_into_file(LIB_ARTICLES_PATH, article, image_path)
        ensure_header_image_render(PAGE_TSX_PATH)
    except Exception as exc:  # noqa: BLE001 - surface any insertion failure with full context
        fail(f"Fallo al insertar el artículo en el código: {exc}")
        return

    next_id = next_pipeline_id(content_pipeline_rows)
    sources = [r.url for r in research_results]
    row_values = build_pipeline_row(article, topic, sources, next_id)

    try:
        row_number = sheets_client.append_row(service, sheet_id, CONTENT_PIPELINE_TAB, row_values)
    except sheets_client.SheetsConfigError as exc:
        fail(str(exc))
        return

    print(f"[INFO] Fila añadida a '{CONTENT_PIPELINE_TAB}' (fila {row_number}, ID {next_id})")

    summary = {
        "title_en": article["titleEn"],
        "title_es": article["titleEs"],
        "slug": article["slug"],
        "excerpt_en": article["excerptEn"],
        "excerpt_es": article["excerptEs"],
        "angle": article["angle"],
        "industry": topic.industry,
        "theme": topic.theme,
        "sources": sources,
        "pipeline_row_number": row_number,
        "pipeline_id": next_id,
        "topic_seed": seed,
    }
    OUTPUT_JSON_PATH.write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")

    print("\n=== RESUMEN ===")
    print(f"Tema: {topic.theme} | Industria: {topic.industry}")
    print(f"Ángulo: {article['angle']}")
    print(f"Título: {article['titleEn']} / {article['titleEs']}")
    print("Investigación:")
    for result in research_results:
        print(f"  - {result.title} ({result.url})")
    print("================\n")


if __name__ == "__main__":
    main()
