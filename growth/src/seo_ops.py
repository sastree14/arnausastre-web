from __future__ import annotations

import hashlib
import re
from datetime import datetime, timezone
from typing import Any

from .llm import get_llm
from .storage import get_store

TENANT_ID = "sc-analytics"


def _now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _slug(path: str, keyword: str) -> str:
    raw = str(path or "").strip().rstrip("/").split("/")[-1]
    if raw:
        return raw
    value = re.sub(r"[^a-z0-9]+", "-", keyword.lower()).strip("-")
    return value or "data-science-consulting"


def _recommendation_id(keyword_id: str, payload: dict[str, Any]) -> str:
    digest = hashlib.sha256(f"{keyword_id}:{payload.get('title')}:{payload.get('meta_description')}".encode("utf-8")).hexdigest()[:14]
    return f"seo_rec_{digest}"


def _existing_for_keyword(store: Any, keyword_id: str) -> list[dict[str, Any]]:
    return [row for row in store.list("seo_recommendations") if row.get("keyword_id") == keyword_id and row.get("status") == "proposed"]


def run_seo_audit(limit: int = 6) -> dict[str, Any]:
    store = get_store()
    targets = [row for row in store.list("seo_keyword_targets") if row.get("tenant_id") == TENANT_ID and row.get("status") == "active"]
    targets.sort(key=lambda row: float(row.get("priority", 0) or 0), reverse=True)
    pages = [row for row in store.list("seo_pages") if row.get("tenant_id") == TENANT_ID]
    page_by_keyword = {str(row.get("primary_keyword") or "").lower(): row for row in pages}
    candidates = [row for row in targets if not _existing_for_keyword(store, str(row.get("keyword_id") or ""))][:max(1, limit)]
    if not candidates:
        return {"created": 0, "reason": "no_targets_without_open_recommendation"}

    compact = []
    for row in candidates:
        keyword = str(row.get("keyword") or "")
        existing = page_by_keyword.get(keyword.lower())
        compact.append({
            "keyword_id": row.get("keyword_id"), "keyword": keyword, "intent": row.get("search_intent"), "service_area": row.get("service_area"),
            "priority": row.get("priority"), "target_path": row.get("target_path"),
            "existing_page": {"title": existing.get("title"), "intro": existing.get("intro"), "updated_at": existing.get("updated_at")} if existing else None,
        })
    result = get_llm(profile="balanced").json(
        "You are the SEO content strategist for SC-Analytics. Create useful service-intent pages, never keyword stuffing or fake freshness. Return JSON only.",
        f"""For each target, propose either a new service landing page or a meaningful content refresh.
The audience is a CEO, COO, CFO, operations/supply-chain leader, data leader or founder looking for practical data/AI help.
SC-Analytics positioning: understand the business decision before building technology; services include forecasting, optimisation/operations research, machine learning, AI automation, data engineering, BI/decision intelligence and pricing/revenue analytics.

Return {{"items":[{{
  "keyword_id":"...",
  "primary_keyword":"...",
  "secondary_keywords":["..."],
  "title":"SEO title under 60 chars where practical",
  "meta_description":"useful description under 160 chars where practical",
  "h1":"natural human heading",
  "intro":"2 concise paragraphs worth of text",
  "sections":[{{"heading":"...","body":"..."}}, ...],
  "cta_title":"...","cta_body":"...",
  "internal_links":[{{"href":"/services","label":"..."}},{{"href":"/contact","label":"..."}}],
  "rationale":"why this helps the searcher and semantic coverage"
}}]}}.
Rules:
- No invented client results, market statistics or guarantees.
- Do not repeat the exact keyword unnaturally.
- Cover the problem, decisions, data requirements, approach, limitations and when the service is/not useful.
- 3 to 5 sections per page.
- Write in the natural language of the target keyword (Spanish for Spanish queries, Catalan for Catalan queries, English otherwise).
- Make each target genuinely distinct.
- Link naturally to relevant projects, knowledge or /partner-analitico when it helps the searcher's decision.
- The conversion path should make the free 30-minute diagnostic clear without turning the page into a hard sell.
- Prefer decision/problem language and concrete use cases over generic claims such as "transform your business with AI".

TARGETS:
{compact}""",
    )
    items = result.get("items", []) if isinstance(result, dict) else []
    created = []
    by_id = {str(row.get("keyword_id")): row for row in candidates}
    for item in items if isinstance(items, list) else []:
        if not isinstance(item, dict):
            continue
        keyword_id = str(item.get("keyword_id") or "")
        target = by_id.get(keyword_id)
        if not target:
            continue
        primary_keyword = str(item.get("primary_keyword") or target.get("keyword") or "").strip()
        slug = _slug(str(target.get("target_path") or ""), primary_keyword)
        payload = {
            "slug": slug,
            "primary_keyword": primary_keyword,
            "secondary_keywords": [str(x).strip() for x in item.get("secondary_keywords", []) if str(x).strip()][:8],
            "search_intent": str(target.get("search_intent") or "commercial"),
            "title": str(item.get("title") or primary_keyword).strip()[:160],
            "meta_description": str(item.get("meta_description") or "").strip()[:320],
            "h1": str(item.get("h1") or item.get("title") or primary_keyword).strip()[:240],
            "intro": str(item.get("intro") or "").strip()[:3000],
            "sections": [row for row in item.get("sections", []) if isinstance(row, dict)][:6],
            "cta_title": str(item.get("cta_title") or "Talk through the decision").strip()[:240],
            "cta_body": str(item.get("cta_body") or "").strip()[:1000],
            "internal_links": [row for row in item.get("internal_links", []) if isinstance(row, dict)][:8],
        }
        rec_id = _recommendation_id(keyword_id, payload)
        recommendation = {
            "recommendation_id": rec_id, "tenant_id": TENANT_ID, "keyword_id": keyword_id,
            "target_path": f"/services/{slug}", "title": payload["title"], "rationale": str(item.get("rationale") or "")[:1200],
            "priority": float(target.get("priority", 5) or 5), "payload": payload, "status": "proposed", "created_at": _now(), "updated_at": _now(),
        }
        store.upsert("seo_recommendations", recommendation, key="recommendation_id")
        created.append(rec_id)
    return {"created": len(created), "recommendation_ids": created, "targets_considered": len(candidates)}
