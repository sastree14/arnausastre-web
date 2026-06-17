"""Surgical insertion of a new Article into lib/articles.ts, plus the one-time
layout change in app/insights/[slug]/page.tsx needed to render its header image.

Both edits are idempotent: re-running the pipeline never duplicates the
`image` field in the interface, and never duplicates the page.tsx layout change.
"""

from __future__ import annotations

import re
from pathlib import Path

HEADER_IMAGE_MARKER = "CONTENT_ENGINE: header image"


class InsertArticleError(Exception):
    pass


def _ts_string(value: str) -> str:
    escaped = value.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n")
    return f"'{escaped}'"


def _ts_template_literal(value: str) -> str:
    escaped = value.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
    return f"`{escaped}`"


def _ts_string_array(values: list[str]) -> str:
    return "[" + ", ".join(_ts_string(v) for v in values) + "]"


def build_article_block(article: dict, image_path: str) -> str:
    return (
        "  {\n"
        f"    slug: {_ts_string(article['slug'])},\n"
        f"    image: {_ts_string(image_path)},\n"
        f"    titleEn: {_ts_string(article['titleEn'])},\n"
        f"    titleEs: {_ts_string(article['titleEs'])},\n"
        f"    date: {_ts_string(article['date'])},\n"
        f"    readingTime: {int(article['readingTime'])},\n"
        f"    tagsEn: {_ts_string_array(article['tagsEn'])},\n"
        f"    tagsEs: {_ts_string_array(article['tagsEs'])},\n"
        f"    excerptEn: {_ts_string(article['excerptEn'])},\n"
        f"    excerptEs: {_ts_string(article['excerptEs'])},\n"
        f"    bodyEn: {_ts_template_literal(article['bodyEn'])},\n"
        "\n"
        f"    bodyEs: {_ts_template_literal(article['bodyEs'])},\n"
        "  },\n"
    )


def ensure_image_field_in_interface(content: str) -> str:
    if re.search(r"export interface Article\s*\{[^}]*\bimage\s*:\s*string\b", content):
        return content  # already has it — nothing to do

    pattern = re.compile(r"(export interface Article \{\n\s*slug: string\n)")
    new_content, count = pattern.subn(r"\1  image: string\n", content, count=1)
    if count != 1:
        raise InsertArticleError(
            "No se pudo encontrar 'export interface Article { slug: string' en lib/articles.ts "
            "para añadir el campo `image`. La interfaz puede haber cambiado de forma inesperada."
        )
    return new_content


def insert_article_into_file(lib_articles_path: Path, article: dict, image_path: str) -> None:
    content = lib_articles_path.read_text(encoding="utf-8")

    if f"slug: '{article['slug']}'" in content or f'slug: "{article["slug"]}"' in content:
        raise InsertArticleError(
            f"Ya existe un artículo con slug '{article['slug']}' en lib/articles.ts — no se inserta duplicado."
        )

    content = ensure_image_field_in_interface(content)

    anchor = re.compile(r"\n\]\n\nexport function getArticleBySlug")
    if not anchor.search(content):
        raise InsertArticleError(
            "No se encontró el patrón de cierre del array `articles` en lib/articles.ts "
            "(se esperaba '\\n]\\n\\nexport function getArticleBySlug'). El archivo puede haber cambiado de formato."
        )

    block = build_article_block(article, image_path)
    content = anchor.sub(f"\n\n{block}]\n\nexport function getArticleBySlug", content, count=1)

    lib_articles_path.write_text(content, encoding="utf-8", newline="\n")


HEADER_IMAGE_BLOCK = """\
        {/* %s */}
        <div className="grid items-center gap-12 pb-8 border-b border-slate-200 lg:grid-cols-2">
          <div>
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1
              className="text-4xl leading-tight md:text-5xl text-slate-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {title}
            </h1>

            <div className="mt-5 flex items-center gap-6">
              <p className="text-sm text-slate-500">{article.date}</p>
              <p className="text-sm text-slate-500">{article.readingTime} {tc.minRead}</p>
            </div>
          </div>

          {article.image && (
            <div className="hidden lg:block overflow-hidden rounded-2xl">
              <Image
                src={article.image}
                alt={title}
                width={1200}
                height={800}
                className="w-full h-auto"
                priority
              />
            </div>
          )}
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-6 py-20">
        <div className="prose-like">
""" % HEADER_IMAGE_MARKER

ORIGINAL_HEADER_BLOCK = """\
      <article className="mx-auto max-w-4xl px-6 py-20">
        <Link
          href="/insights"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition mb-10"
        >
          {tc.backToInsights}
        </Link>

        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1
          className="text-4xl leading-tight md:text-5xl text-slate-900"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {title}
        </h1>

        <div className="mt-5 flex items-center gap-6 border-b border-slate-200 pb-8">
          <p className="text-sm text-slate-500">{article.date}</p>
          <p className="text-sm text-slate-500">{article.readingTime} {tc.minRead}</p>
        </div>

        <div className="mt-10 prose-like">
"""

NEW_OPENING_WRAPPER = """\
      <div className="mx-auto max-w-6xl px-6 pt-20">
        <Link
          href="/insights"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition mb-10"
        >
          {tc.backToInsights}
        </Link>

""" + HEADER_IMAGE_BLOCK


def ensure_header_image_render(page_tsx_path: Path) -> None:
    content = page_tsx_path.read_text(encoding="utf-8")

    if HEADER_IMAGE_MARKER in content:
        return  # already patched in a previous run

    if ORIGINAL_HEADER_BLOCK not in content:
        raise InsertArticleError(
            f"No se encontró el bloque de cabecera esperado en {page_tsx_path}. "
            "El layout puede haber cambiado desde que se escribió este script — "
            "actualiza ORIGINAL_HEADER_BLOCK en insert_article.py para que coincida."
        )

    content = content.replace(ORIGINAL_HEADER_BLOCK, NEW_OPENING_WRAPPER, 1)

    if "import Image from 'next/image'" not in content:
        content = content.replace(
            "import Link from 'next/link'\n",
            "import Link from 'next/link'\nimport Image from 'next/image'\n",
            1,
        )

    page_tsx_path.write_text(content, encoding="utf-8", newline="\n")
