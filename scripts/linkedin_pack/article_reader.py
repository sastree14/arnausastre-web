"""Reads an existing article MDX file and extracts what's needed to brief
the LinkedIn Pack generator.

Expects the file format written by scripts/content_engine/insert_article.py:
  ---
  <yaml frontmatter>
  ---
  <English body>
  <!-- ES -->
  <Spanish body>
"""

from __future__ import annotations

from pathlib import Path

import yaml

SITE_BASE_URL = "https://sc-analytics.io"


class ArticleReadError(Exception):
    pass


def resolve_article_path(repo_root: Path, article_slug: str, article_path: str) -> Path:
    path = repo_root / article_path if article_path else repo_root / "content" / "articles" / f"{article_slug}.mdx"
    if not path.exists():
        raise ArticleReadError(f"No se encontró el artículo en {path}.")
    return path


def read_article(path: Path) -> dict:
    raw = path.read_text(encoding="utf-8")
    if not raw.startswith("---"):
        raise ArticleReadError(f"{path} no tiene frontmatter YAML (debe empezar con '---').")

    parts = raw.split("---", 2)
    if len(parts) < 3:
        raise ArticleReadError(f"{path} tiene un frontmatter YAML mal formado.")

    frontmatter = yaml.safe_load(parts[1]) or {}
    body_en = parts[2].split("<!-- ES -->")[0].strip()

    if not body_en:
        raise ArticleReadError(f"{path} no tiene cuerpo en inglés legible.")

    slug = frontmatter.get("slug") or path.stem
    return {
        "slug": slug,
        "title": frontmatter.get("titleEn", ""),
        "excerpt": frontmatter.get("excerptEn", ""),
        "industry": frontmatter.get("industry", ""),
        "theme": frontmatter.get("theme", ""),
        "tags": frontmatter.get("tagsEn", []),
        "body": body_en,
        "url": f"{SITE_BASE_URL}/knowledge/{slug}",
    }
