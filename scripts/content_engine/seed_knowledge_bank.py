from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from growth.src.config import load_config
from growth.src.storage import get_store

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_BANK = ROOT / "content" / "article-bank"


def load_articles(bank_dir: Path) -> list[dict[str, Any]]:
    files = sorted(path for path in bank_dir.glob("*.json") if path.name != "manifest.json")
    articles = []
    for path in files:
        row = json.loads(path.read_text(encoding="utf-8"))
        if row.get("spec_id") and row.get("variants"):
            row["_path"] = str(path)
            articles.append(row)
    return sorted(articles, key=lambda row: int(row.get("sequence") or 0))


def validate_bank(articles: list[dict[str, Any]], expected: int = 200) -> None:
    if len(articles) != expected:
        raise RuntimeError(f"Expected {expected} article families, found {len(articles)}")
    sequences = [int(row["sequence"]) for row in articles]
    if sequences != list(range(1, expected + 1)):
        raise RuntimeError("Article bank sequence must be contiguous from 1 to 200")
    for article in articles:
        variants = article.get("variants") or {}
        missing = [lang for lang in ("es", "en", "ca") if lang not in variants]
        if missing:
            raise RuntimeError(f"{article['spec_id']} missing variants: {', '.join(missing)}")
        if not article.get("scheduled_at"):
            raise RuntimeError(f"{article['spec_id']} has no scheduled_at")


def content_id(spec_id: str, language: str) -> str:
    return f"knowledge_{spec_id.lower().replace('-', '_')}_{language}"


def approval_id(spec_id: str, language: str) -> str:
    return f"approval_knowledge_{spec_id.lower().replace('-', '_')}_{language}"


def article_meta(article: dict[str, Any], variant: dict[str, Any], slug_by_spec: dict[str, str]) -> dict[str, Any]:
    related = [slug_by_spec[spec] for spec in article.get("related_specs") or [] if spec in slug_by_spec]
    return {
        "excerpt": variant.get("excerpt", ""),
        "quick": variant.get("quick", []),
        "section_titles": variant.get("section_titles", []),
        "business_title": variant.get("business_title", ""),
        "business_steps": variant.get("business_steps", []),
        "knowledge_area": article.get("knowledge_area", "analytics"),
        "related_case": article.get("related_case", ""),
        "related_article": f"/knowledge/{related[0]}" if related else "",
        "related_articles": [f"/knowledge/{slug}" for slug in related],
        "seo_title": variant.get("seo_title", ""),
        "seo_description": variant.get("seo_description", ""),
        "seo_keywords": variant.get("seo_keywords", []),
        "tags": variant.get("tags", []),
        "spec_id": article.get("spec_id"),
        "sequence": article.get("sequence"),
        "cluster": article.get("cluster"),
        "editorial_pillar": article.get("editorial_pillar"),
        "content_family": article.get("content_family"),
        "angle": article.get("angle"),
        "primary_keyword": article.get("primary_keyword"),
        "search_intent": article.get("search_intent"),
        "freshness": article.get("freshness"),
    }


def seed(*, bank_dir: Path, mode: str, expected: int, limit: int = 0) -> dict[str, Any]:
    articles = load_articles(bank_dir)
    validate_bank(articles, expected=expected)
    if limit > 0:
        articles = articles[:limit]

    cfg = load_config()
    tenant_id = cfg["company"]["tenant_id"]
    store = get_store()
    slug_by_spec = {row["spec_id"]: row["slug"] for row in load_articles(bank_dir)}
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

    seeded_items = 0
    seeded_approvals = 0

    for article in articles:
        brief_id = str(article["slug"])
        schedule_at = str(article["scheduled_at"]) if mode == "scheduled" else None
        status = "scheduled" if mode == "scheduled" else "approved"

        for language in ("es", "en", "ca"):
            variant = article["variants"][language]
            cid = content_id(article["spec_id"], language)
            critique = {
                "contract_valid": True,
                "contract_issues": [],
                "article_bank": True,
                "article_meta": article_meta(article, variant, slug_by_spec),
            }
            item = {
                "content_id": cid,
                "tenant_id": tenant_id,
                "channel": "website",
                "content_type": "article",
                "title": str(variant["title"]),
                "body": str(variant["body"]),
                "objective": "authority",
                "target_audience": [],
                "evidence_ids": [],
                "status": status,
                "visual_type": "none",
                "visual_path": "",
                "source_case": "",
                "scheduled_at": schedule_at,
                "brief_id": brief_id,
                "language": language,
                "content_family": article.get("content_family", "explain_understand"),
                "quality_score": 9.0,
                "critique": critique,
                "source_url": "",
            }
            store.upsert("content_items", item, key="content_id")
            seeded_items += 1

            aid = approval_id(article["spec_id"], language)
            approval = {
                "approval_id": aid,
                "tenant_id": tenant_id,
                "action_type": "publish_article",
                "target_id": cid,
                "summary": f"Knowledge bank approved: {variant['title']}",
                "payload": {
                    "content_id": cid,
                    "brief_id": brief_id,
                    "language": language,
                    "spec_id": article["spec_id"],
                    "sequence": article["sequence"],
                    "scheduled_at": schedule_at,
                    "source": "knowledge_bank_v1",
                    "execution_mode": "scheduled_website_publication",
                },
                "status": "approved",
                "created_at": now,
                "decided_at": now,
                "executed_at": None,
            }
            store.upsert("approvals", approval, key="approval_id")
            seeded_approvals += 1

    return {
        "mode": mode,
        "families": len(articles),
        "content_items": seeded_items,
        "approvals": seeded_approvals,
        "first_scheduled_at": articles[0].get("scheduled_at") if articles and mode == "scheduled" else None,
        "last_scheduled_at": articles[-1].get("scheduled_at") if articles and mode == "scheduled" else None,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Seed the materialized SC-Analytics Knowledge bank into the Growth content store.")
    parser.add_argument("--bank", type=Path, default=DEFAULT_BANK)
    parser.add_argument("--mode", choices=("staged", "scheduled"), default="staged")
    parser.add_argument("--expected", type=int, default=200)
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    articles = load_articles(args.bank)
    validate_bank(articles, expected=args.expected)
    if args.dry_run:
        print(json.dumps({
            "valid": True,
            "families": len(articles),
            "variants": len(articles) * 3,
            "first_scheduled_at": articles[0]["scheduled_at"],
            "last_scheduled_at": articles[-1]["scheduled_at"],
        }, indent=2))
        return 0

    result = seed(bank_dir=args.bank, mode=args.mode, expected=args.expected, limit=args.limit)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
