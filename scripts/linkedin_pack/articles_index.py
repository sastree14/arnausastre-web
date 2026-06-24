"""Finds the oldest published article that doesn't have a LinkedIn Pack yet.

Reads the 'Articles Index' tab from the same Editorial Google Sheet used by
the content pipeline, via scripts/content_engine/sheets_client.py (same auth,
same secrets — GOOGLE_SHEETS_CREDENTIALS, EDITORIAL_SHEET_ID). No Sheets logic
is duplicated here, only the small amount of LinkedIn-specific selection logic
that has no home elsewhere.
"""

from __future__ import annotations

import json
from datetime import date, datetime
from pathlib import Path

ARTICLES_INDEX_TAB = "Articles Index"

TRUTHY_PUBLISHED_VALUES = {"true", "yes", "sí", "si", "y", "1"}

DATE_FORMATS = ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y")


class ArticlesIndexError(Exception):
    pass


def _is_published(value: str) -> bool:
    return (value or "").strip().lower() in TRUTHY_PUBLISHED_VALUES


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


def read_articles_index(service, sheet_id: str, sheets_client) -> list[dict]:
    """Reads 'Articles Index', validating that the columns this feature depends on exist."""
    headers = sheets_client.get_tab_headers(service, sheet_id, ARTICLES_INDEX_TAB)
    if not headers:
        raise ArticlesIndexError(
            f"La pestaña '{ARTICLES_INDEX_TAB}' está vacía o no existe en la Google Sheet."
        )
    if "Slug" not in headers:
        raise ArticlesIndexError(f"La pestaña '{ARTICLES_INDEX_TAB}' no tiene la columna 'Slug'.")
    if "Published" not in headers:
        raise ArticlesIndexError(f"La pestaña '{ARTICLES_INDEX_TAB}' no tiene la columna 'Published'.")

    return sheets_client.read_tab_as_dicts(service, sheet_id, ARTICLES_INDEX_TAB, expected_headers=None)


def find_pending_article(rows: list[dict], linkedin_dir: Path) -> dict | None:
    """Returns the oldest published article (by Date, empty/unparseable last, tie-break by Slug)
    that doesn't have a LinkedIn Pack yet — or None if there isn't one.
    """
    covered = get_covered_slugs(linkedin_dir)

    candidates = []
    for row in rows:
        slug = (row.get("Slug") or "").strip()
        if not slug or not _is_published(row.get("Published", "")) or slug in covered:
            continue
        candidates.append(row)

    if not candidates:
        return None

    def sort_key(row: dict):
        slug = (row.get("Slug") or "").strip()
        parsed = _parse_date(row.get("Date", ""))
        return (parsed is None, parsed or date.max, slug)

    candidates.sort(key=sort_key)
    return candidates[0]
