"""Finds the oldest article that doesn't have a LinkedIn Pack yet.

Primary detection source: content/articles/*.mdx files in the repository.
A file that exists in main is treated as a published candidate — no dependency
on a Published flag in any external system.

Google Sheets (Articles Index / Content Pipeline) is used only as optional
metadata enrichment (publication dates, etc.) for sorting. If Sheets is
unavailable, the module falls back to MDX frontmatter dates and slug ordering.
"""

from __future__ import annotations

import json
from datetime import date, datetime
from pathlib import Path

import yaml

ARTICLES_INDEX_TAB = "Articles Index"

DATE_FORMATS = ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y")


class ArticlesIndexError(Exception):
    pass


def _parse_date(value: str) -> date | None:
    value = (value or "").strip()
    if not value:
        return None
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    return None


def get_covered_slugs(linkedin_dir: Path) -> set[str]:
    """Slugs that already have a LinkedIn Pack, read from existing JSON files in content/linkedin/."""
    covered: set[str] = set()
    if not linkedin_dir.exists():
        return covered

    for path in linkedin_dir.glob("*.json"):
        slug = None
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            slug = (data.get("source_article_slug") or "").strip() or None
        except (json.JSONDecodeError, OSError):
            pass

        if not slug:
            # Fallback: filename pattern is {YYYY-MM-DD}-{slug}.json
            parts = path.stem.split("-", 3)
            if len(parts) == 4:
                slug = parts[3]

        if slug:
            covered.add(slug)

    return covered


def read_articles_dir(articles_dir: Path) -> list[dict]:
    """Reads all MDX article files and extracts slug + frontmatter metadata.

    Returns a list of dicts with keys: slug, title, date, industry, theme.
    Files that cannot be parsed are included with None for optional fields.
    """
    articles = []
    for path in sorted(articles_dir.glob("*.mdx")):
        slug = path.stem
        meta: dict = {
            "slug": slug,
            "title": None,
            "date": None,
            "industry": None,
            "theme": None,
        }
        try:
            content = path.read_text(encoding="utf-8")
            if content.startswith("---"):
                end = content.index("---", 3)
                fm = yaml.safe_load(content[3:end].strip()) or {}
                meta["title"] = fm.get("titleEn") or fm.get("title") or slug
                raw_date = fm.get("date")
                if raw_date:
                    meta["date"] = _parse_date(str(raw_date))
                meta["industry"] = fm.get("industry") or ""
                meta["theme"] = fm.get("theme") or ""
        except Exception:
            pass
        articles.append(meta)
    return articles


def find_pending_from_repo(
    articles_dir: Path,
    linkedin_dir: Path,
    sheets_dates: "dict[str, date] | None" = None,
) -> "dict | None":
    """Returns the oldest pending article found in the repository.

    Detection logic:
    - Every .mdx file in articles_dir is a candidate.
    - Articles already covered by a JSON in linkedin_dir are excluded.
    - Ordering priority: Sheets publication date > MDX frontmatter date > slug (alpha).
    - Returns None if all articles already have a LinkedIn Pack.

    Raises ArticlesIndexError if articles_dir is missing or empty.
    """
    if not articles_dir.exists():
        raise ArticlesIndexError(
            f"El directorio de artículos '{articles_dir}' no existe. "
            "Verifica que content/articles/ existe en el repositorio."
        )

    articles = read_articles_dir(articles_dir)
    if not articles:
        raise ArticlesIndexError(
            f"No se encontraron archivos .mdx en '{articles_dir}'. "
            "El directorio existe pero no contiene artículos."
        )

    covered = get_covered_slugs(linkedin_dir)
    candidates = [a for a in articles if a["slug"] not in covered]
    if not candidates:
        return None

    def sort_key(article: dict) -> tuple:
        slug = article["slug"]
        d = (sheets_dates or {}).get(slug) or article.get("date")
        return (d is None, d or date.max, slug)

    candidates.sort(key=sort_key)
    return candidates[0]


# ── Legacy Sheets-based functions (kept for backward compatibility) ────────────

def read_articles_index(service, sheet_id: str, sheets_client) -> list[dict]:
    """Reads 'Articles Index' tab from Google Sheets."""
    headers = sheets_client.get_tab_headers(service, sheet_id, ARTICLES_INDEX_TAB)
    if not headers:
        raise ArticlesIndexError(
            f"La pestaña '{ARTICLES_INDEX_TAB}' está vacía o no existe en la Google Sheet."
        )
    if "Slug" not in headers:
        raise ArticlesIndexError(f"La pestaña '{ARTICLES_INDEX_TAB}' no tiene la columna 'Slug'.")
    return sheets_client.read_tab_as_dicts(service, sheet_id, ARTICLES_INDEX_TAB, expected_headers=None)


def find_pending_article(rows: list[dict], linkedin_dir: Path) -> "dict | None":
    """Legacy: returns the oldest published article from Sheets rows without a LinkedIn Pack."""
    truthy = {"true", "yes", "sí", "si", "y", "1"}
    covered = get_covered_slugs(linkedin_dir)

    candidates = []
    for row in rows:
        slug = (row.get("Slug") or "").strip()
        published = (row.get("Published") or "").strip().lower()
        if not slug or published not in truthy or slug in covered:
            continue
        candidates.append(row)

    if not candidates:
        return None

    def sort_key(row: dict) -> tuple:
        slug = (row.get("Slug") or "").strip()
        parsed = _parse_date(row.get("Date", ""))
        return (parsed is None, parsed or date.max, slug)

    candidates.sort(key=sort_key)
    return candidates[0]
