"""Entry point for the content-research-draft pipeline.

Run from the repo root as: python scripts/content_engine/run_pipeline.py

Order of operations:
  1. Read Topics Bank.
  2. Read Content Pipeline, compute pending topics.
  3. Pick one pending topic at random (seed logged).
  4. Research it via Brave Search.
  5. Draft the bilingual article via Gemini (guided by content/editorial/ docs).
  6. Generate its deterministic SVG header image.
  7. Write the article as an MDX file to content/articles/{slug}.mdx.
  8. Append a row to Content Pipeline (writes by column name, sheet-order-agnostic).
  9. Write a JSON hand-off file for the GitHub Actions workflow.

Any failure stops the script immediately — no partial article is ever left half-written.
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
from insert_article import InsertArticleError, write_article_mdx
from web_research import WebResearchError, get_brave_api_key, research_topic
from write_article import ArticleGenerationError

REPO_ROOT = Path(__file__).resolve().parents[2]
ARTICLES_MDX_DIR = REPO_ROOT / "content" / "articles"
EDITORIAL_DIR = REPO_ROOT / "content" / "editorial"
PUBLIC_DIR = REPO_ROOT / "public"
OUTPUT_JSON_PATH = REPO_ROOT / "scripts" / "content_engine" / ".pipeline_output.json"

TOPICS_BANK_TAB = "Topics Bank"
CONTENT_PIPELINE_TAB = "Content Pipeline"
INDUSTRIES_TAB = "Industries"

TOPICS_BANK_HEADERS = [
    "Theme", "Possible Title", "Industry", "Decision Problem", "Business Value",
    "Analytical Background", "CEO Relevance", "Difficulty", "Notes",
]


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


def build_pipeline_row_dict(
    article: dict,
    topic: pick_topic.PendingTopic,
    sources: list[str],
    next_id: int,
) -> dict[str, str]:
    """Returns a dict keyed by column name.

    append_row_by_headers() maps these to the sheet's actual column positions,
    so the order here doesn't matter and extra columns in the sheet are handled
    gracefully. Add new fields here and they will be written automatically if
    the corresponding column exists in the sheet.
    """
    return {
        "ID": str(next_id),
        "Status": "Draft",
        "Content Type": "Article",
        "Title": article["titleEn"],
        "Slug": article["slug"],
        "Industry": topic.industry,
        "Theme": topic.theme,
        "Challenge": article.get("challenge", ""),
        "Audience": article.get("audience", "CEO"),
        "Level": article.get("level", "Strategic"),
        "Angle": article["angle"],
        "Sources Needed": ", ".join(sources),
        "Language": "EN/ES",
        "MDX File Name": f"{article['slug']}.mdx",
        "Branch": "editorial",
        "Published": "No",
        "Publication Date": "",
        "GitHub Status": "Draft — pending review on editorial branch",
        "Notes": "",
    }


def main() -> None:
    print("=== Content research & draft pipeline ===")

    try:
        service = sheets_client.get_sheets_service()
        sheet_id = sheets_client.get_sheet_id()
    except sheets_client.SheetsConfigError as exc:
        fail(str(exc))
        return

    try:
        topics_bank_rows = sheets_client.read_tab_as_dicts(
            service, sheet_id, TOPICS_BANK_TAB, TOPICS_BANK_HEADERS
        )
        # No strict header validation for Content Pipeline — the sheet may have
        # columns this code doesn't know about, and that's fine.
        content_pipeline_rows = sheets_client.read_tab_as_dicts(
            service, sheet_id, CONTENT_PIPELINE_TAB, expected_headers=None
        )
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
        article = write_article.generate_article(
            topic, industry_context, research_results, ARTICLES_MDX_DIR, EDITORIAL_DIR
        )
    except ArticleGenerationError as exc:
        fail(str(exc))
        return

    print(f"[INFO] Artículo generado: '{article['titleEn']}' (slug={article['slug']})")

    image_path = f"/knowledge/{article['slug']}.svg"
    try:
        write_header_svg(article["slug"], PUBLIC_DIR)
    except Exception as exc:
        fail(f"Fallo al generar la imagen SVG: {exc}")
        return

    try:
        mdx_path = write_article_mdx(REPO_ROOT, article, image_path)
        print(f"[INFO] Artículo escrito en: {mdx_path.relative_to(REPO_ROOT)}")
    except InsertArticleError as exc:
        fail(str(exc))
        return

    next_id = next_pipeline_id(content_pipeline_rows)
    sources = [r.url for r in research_results]
    row_dict = build_pipeline_row_dict(article, topic, sources, next_id)

    try:
        row_number = sheets_client.append_row_by_headers(
            service, sheet_id, CONTENT_PIPELINE_TAB, row_dict
        )
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
        "challenge": article.get("challenge", ""),
        "audience": article.get("audience", ""),
        "theme": topic.theme,
        "sources": sources,
        "pipeline_row_number": row_number,
        "pipeline_id": next_id,
        "topic_seed": seed,
    }
    OUTPUT_JSON_PATH.write_text(
        json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    print("\n=== RESUMEN ===")
    print(f"Tema: {topic.theme} | Industria: {topic.industry}")
    print(f"Reto: {article.get('challenge')} | Audiencia: {article.get('audience')}")
    print(f"Ángulo: {article['angle']}")
    print(f"Título EN: {article['titleEn']}")
    print(f"Título ES: {article['titleEs']}")
    print("Fuentes:")
    for result in research_results:
        print(f"  - {result.title} ({result.url})")
    print("================\n")


if __name__ == "__main__":
    main()
