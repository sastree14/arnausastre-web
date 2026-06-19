"""Writes a new article as an MDX file to content/articles/{slug}.mdx.

The file format is:
  - YAML frontmatter with all metadata
  - English body as main MDX content
  - <!-- ES --> marker
  - Spanish body after the marker

published: false by default — requires manual review before going live.
"""

from __future__ import annotations

from pathlib import Path

import yaml


ARTICLES_DIR_RELATIVE = "content/articles"


class InsertArticleError(Exception):
    pass


def write_article_mdx(repo_root: Path, article: dict, image_path: str | None = None) -> Path:
    articles_dir = repo_root / ARTICLES_DIR_RELATIVE
    articles_dir.mkdir(parents=True, exist_ok=True)

    slug = article["slug"]
    output_path = articles_dir / f"{slug}.mdx"

    if output_path.exists():
        raise InsertArticleError(
            f"Ya existe un artículo con slug '{slug}' en {output_path}. "
            "No se sobreescribe un borrador existente."
        )

    frontmatter: dict = {
        "slug": slug,
        "titleEn": article["titleEn"],
        "titleEs": article["titleEs"],
        "excerptEn": article["excerptEn"],
        "excerptEs": article["excerptEs"],
        "date": article["date"],
        "readingTime": int(article["readingTime"]),
        "industry": article.get("industry", ""),
        "challenge": article.get("challenge", ""),
        "audience": article.get("audience", "CEO"),
        "level": article.get("level", "Strategic"),
        "theme": article.get("theme", ""),
        "published": False,
        "tagsEn": article.get("tagsEn", []),
        "tagsEs": article.get("tagsEs", []),
    }
    if image_path:
        frontmatter["image"] = image_path

    yaml_block = yaml.dump(
        frontmatter,
        allow_unicode=True,
        sort_keys=False,
        default_flow_style=False,
        width=120,
    )

    body_en = article.get("bodyEn", "").strip()
    body_es = article.get("bodyEs", "").strip()

    file_content = f"---\n{yaml_block}---\n\n{body_en}\n\n<!-- ES -->\n\n{body_es}\n"
    output_path.write_text(file_content, encoding="utf-8", newline="\n")
    return output_path
