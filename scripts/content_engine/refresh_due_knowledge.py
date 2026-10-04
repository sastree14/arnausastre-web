from __future__ import annotations

import argparse
from datetime import datetime, timedelta, timezone
from typing import Any

from growth.src.llm import get_llm
from growth.src.storage import get_store


def parse_dt(value: Any) -> datetime | None:
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt.astimezone(timezone.utc)
    except (TypeError, ValueError):
        return None


def article_meta(row: dict[str, Any]) -> dict[str, Any]:
    critique = row.get("critique") if isinstance(row.get("critique"), dict) else {}
    raw = critique.get("article_meta") if isinstance(critique, dict) else {}
    return raw if isinstance(raw, dict) else {}


def due_for_refresh(row: dict[str, Any], *, window_days: int, max_age_days: int) -> bool:
    if row.get("status") != "scheduled" or row.get("content_type") != "article" or row.get("channel") != "website":
        return False
    meta = article_meta(row)
    if meta.get("freshness") != "review_180d":
        return False
    scheduled = parse_dt(row.get("scheduled_at"))
    if not scheduled:
        return False
    now = datetime.now(timezone.utc)
    if scheduled < now or scheduled > now + timedelta(days=window_days):
        return False
    refreshed = parse_dt(meta.get("last_refreshed_at")) or parse_dt(row.get("created_at"))
    if not refreshed:
        return True
    return refreshed <= now - timedelta(days=max_age_days)


def family_rows(store: Any, brief_id: str) -> list[dict[str, Any]]:
    return [
        row for row in store.filter("content_items", brief_id=brief_id)
        if row.get("content_type") == "article" and row.get("channel") == "website"
    ]


def refresh_family(store: Any, family: list[dict[str, Any]]) -> dict[str, Any]:
    by_language = {str(row.get("language") or ""): row for row in family}
    if not all(lang in by_language for lang in ("es", "en", "ca")):
        raise RuntimeError("Knowledge family is missing ES/EN/CA variants")

    sample_meta = article_meta(family[0])
    payload = {
        lang: {
            "title": by_language[lang].get("title"),
            "body": by_language[lang].get("body"),
            "meta": article_meta(by_language[lang]),
        }
        for lang in ("es", "en", "ca")
    }

    result = get_llm(profile="balanced").json(
        "You are the SC-Analytics freshness editor. Refresh only time-sensitive technology/platform claims while preserving the article's thesis, structure and sober company voice. Return JSON only.",
        f"""Review this already-approved multilingual Knowledge article shortly before publication.

The article was intentionally written to be durable. Change content ONLY where a technology/platform claim may have become stale.
Do not introduce vendor marketing claims, benchmark numbers, prices, version-specific details, invented experience, or unsupported statistics.
Do not change the underlying business thesis unless the original framing is no longer defensible.
Preserve the Gold Standard structure:
- native ES/EN/CA
- short title
- excerpt
- exactly 3 quick hooks
- exactly 4 section titles
- business implication + 3 business steps
- selective bold emphasis
- 4 body sections
- natural SEO title/description/keywords

Return:
{{
  "variants": {{
    "es": {{"title":"...","body":"...","excerpt":"...","quick":["...","...","..."],"section_titles":["...","...","...","..."],"business_title":"...","business_steps":["...","...","..."],"seo_title":"...","seo_description":"...","seo_keywords":["..."]}},
    "en": {{same keys}},
    "ca": {{same keys}}
  }},
  "refresh_note": "one concise sentence describing what changed; say 'No material changes' if none"
}}

CURRENT FAMILY:
{payload}
""",
    )

    variants = result.get("variants") if isinstance(result, dict) else None
    if not isinstance(variants, dict) or not all(isinstance(variants.get(lang), dict) for lang in ("es", "en", "ca")):
        raise RuntimeError("Freshness editor returned an incomplete multilingual family")

    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    for lang in ("es", "en", "ca"):
        row = by_language[lang]
        updated = variants[lang]
        previous_meta = article_meta(row)
        new_meta = {
            **previous_meta,
            "excerpt": updated.get("excerpt", previous_meta.get("excerpt", "")),
            "quick": updated.get("quick", previous_meta.get("quick", [])),
            "section_titles": updated.get("section_titles", previous_meta.get("section_titles", [])),
            "business_title": updated.get("business_title", previous_meta.get("business_title", "")),
            "business_steps": updated.get("business_steps", previous_meta.get("business_steps", [])),
            "seo_title": updated.get("seo_title", previous_meta.get("seo_title", "")),
            "seo_description": updated.get("seo_description", previous_meta.get("seo_description", "")),
            "seo_keywords": updated.get("seo_keywords", previous_meta.get("seo_keywords", [])),
            "last_refreshed_at": now,
            "refresh_note": str(result.get("refresh_note") or ""),
        }
        critique = row.get("critique") if isinstance(row.get("critique"), dict) else {}
        critique = {**critique, "article_meta": new_meta, "contract_valid": True, "contract_issues": []}
        store.update(
            "content_items",
            "content_id",
            row["content_id"],
            {
                "title": str(updated.get("title") or row.get("title") or ""),
                "body": str(updated.get("body") or row.get("body") or ""),
                "critique": critique,
            },
        )

    return {
        "brief_id": family[0].get("brief_id"),
        "status": "refreshed",
        "note": result.get("refresh_note"),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Refresh time-sensitive Knowledge articles shortly before publication.")
    parser.add_argument("--window-days", type=int, default=21)
    parser.add_argument("--max-age-days", type=int, default=150)
    parser.add_argument("--limit", type=int, default=4)
    args = parser.parse_args()

    store = get_store()
    candidates = [row for row in store.list("content_items") if due_for_refresh(row, window_days=args.window_days, max_age_days=args.max_age_days)]
    seen: set[str] = set()
    results = []

    for row in candidates:
        brief_id = str(row.get("brief_id") or "")
        if not brief_id or brief_id in seen:
            continue
        seen.add(brief_id)
        family = family_rows(store, brief_id)
        try:
            results.append(refresh_family(store, family))
        except Exception as exc:
            for variant in family:
                store.update(
                    "content_items",
                    "content_id",
                    variant["content_id"],
                    {"status": "needs_review"},
                )
            results.append({"brief_id": brief_id, "status": "needs_review", "error": str(exc)})
        if len(results) >= max(1, args.limit):
            break

    print({"checked": len(candidates), "families": len(results), "results": results})
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
