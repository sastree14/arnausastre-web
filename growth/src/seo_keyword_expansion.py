"""Curated multilingual SEO discovery hypotheses for existing SC-Analytics services.

Variants are *research prompts*, NOT proven Google searches, Google Trends
topics, keyword volumes, rankings or promises of indexation. Every phrase
must lead to an already published and directly relevant service URL.
No public page, metadata, backlink or keyword-target row is ever changed.
"""
from __future__ import annotations

from datetime import date
from hashlib import sha256
import re
from typing import Any

from .seo_intelligence import classify_query

# Columns: phrase, existing landing slug, language, intent, expected use.
# Any competitor wording inspired by an observed page still needs SERP/GSC
# verification. Do not confuse a competitor's site copy with search volume.
CURATED_HYPOTHESES = (
    ("consultoría de datos para pymes", "consultoria-datos", "es", "commercial", "existing_service"),
    ("consultoría de datos Barcelona", "consultoria-datos", "es", "commercial", "existing_service"),
    ("consultora de ciencia de datos", "consultoria-datos", "es", "commercial", "existing_service"),
    ("consultoria de dades per a pimes", "consultoria-dades", "ca", "commercial", "existing_service"),
    ("consultoria de dades Barcelona", "consultoria-dades", "ca", "commercial", "existing_service"),
    ("data science consulting for SMEs", "data-science-consulting", "en", "commercial", "existing_service"),
    ("consultora de analítica avanzada", "analitica-datos-empresas", "es", "commercial", "existing_service"),
    ("dashboards de indicadores para dirección", "analitica-datos-empresas", "es", "commercial", "existing_service"),
    ("automatización de reporting empresarial", "analitica-datos-empresas", "es", "commercial", "existing_service"),
    ("automatizar procesos de empresa con IA", "automatizacion-ia-empresas", "es", "commercial", "existing_service"),
    ("automatización de documentos con IA", "automatizacion-ia-empresas", "es", "commercial", "existing_service"),
    ("integrar agentes de IA con CRM", "automatizacion-ia-empresas", "es", "commercial", "existing_service"),
    ("automatització de processos amb IA", "consultoria-intelligencia-artificial", "ca", "commercial", "existing_service"),
    ("AI workflow automation consulting", "ai-automation", "en", "commercial", "existing_service"),
    ("previsión de ventas por producto", "prediccion-demanda", "es", "commercial", "existing_service"),
    ("forecasting de demanda para ecommerce", "prediccion-demanda", "es", "commercial", "existing_service"),
    ("predicción de demanda por SKU", "prediccion-demanda", "es", "commercial", "existing_service"),
    ("cómo prever ventas y evitar exceso de stock", "prediccion-demanda", "es", "informational", "content_question"),
    ("previsió de vendes per producte", "previsio-demanda", "ca", "commercial", "existing_service"),
    ("demand forecasting by SKU", "demand-forecasting", "en", "commercial", "existing_service"),
    ("sales forecasting consulting", "demand-forecasting", "en", "commercial", "existing_service"),
    ("optimización de stock y reposición", "optimizacion-inventario", "es", "commercial", "existing_service"),
    ("cómo reducir roturas de stock", "optimizacion-inventario", "es", "informational", "content_question"),
    ("gestión de inventario con modelos predictivos", "optimizacion-inventario", "es", "commercial", "existing_service"),
    ("optimización de procesos operativos", "optimizacion-operaciones", "es", "commercial", "existing_service"),
    ("optimización matemática para empresas", "optimizacion-operaciones", "es", "commercial", "existing_service"),
    ("optimització de recursos empresarials", "optimitzacio-empresarial", "ca", "commercial", "existing_service"),
    ("supply chain forecasting consulting", "supply-chain-analytics", "en", "commercial", "existing_service"),
    ("route optimization consulting", "route-optimization", "en", "commercial", "existing_service"),
    ("pricing and margin optimization", "pricing-optimization", "en", "commercial", "existing_service"),
    ("data pipeline consulting", "data-engineering", "en", "commercial", "existing_service"),
    ("business intelligence for small businesses", "business-intelligence", "en", "commercial", "existing_service"),
)


def _normalized(value: str) -> str:
    return " ".join(str(value).casefold().split())


def propose_variant_research(
    targets: list[dict[str, Any]],
    pages: list[dict[str, Any]],
    *,
    today: date,
    limit: int = 2,
) -> list[dict[str, Any]]:
    """Rotate safe hypotheses weekly; never represent them as real search data.

    A hypothesis only qualifies if its existing landing is published and the
    service's language and buyer intent have been pre-curated. Existing tracked
    keywords are excluded; no artificial keyword rows/landings are added.
    """
    if limit <= 0:
        return []
    published = {"/services/" + str(page.get("slug")) for page in pages
                 if page.get("status") == "published" and page.get("slug")}
    tracked = {_normalized(row.get("keyword") or "") for row in targets
               if row.get("status") == "active"}
    viable: list[tuple[str, str, str, str, str]] = []
    used: set[str] = set()
    for phrase, slug, language, intent, use in CURATED_HYPOTHESES:
        path = "/services/" + slug
        norm = _normalized(phrase)
        if (path not in published or norm in tracked or norm in used or
                classify_query(phrase) != "nonbrand" or
                language not in {"es", "ca", "en"} or
                intent not in {"commercial", "informational"}):
            continue
        used.add(norm)
        viable.append((phrase, path, language, intent, use))
    if not viable:
        return []
    # Stable weekly deterministic rotation and no domain-specific traffic claim.
    iso_year, iso_week, _ = today.isocalendar()
    start = ((iso_year * 53 + iso_week) * max(1, limit)) % len(viable)
    selected = [viable[(start + i) % len(viable)]
                for i in range(min(limit, len(viable)))]
    results = []
    for phrase, path, language, intent, use in selected:
        identifier = sha256(_normalized(phrase).encode("utf-8")).hexdigest()[:16]
        results.append({
            "recommendation_id": "seo_variant_" + identifier,
            "tenant_id": "sc-analytics",
            "keyword_id": None,
            "target_path": path,
            "title": "Validate search phrasing: " + phrase[:105],
            "rationale": (
                "Editorial search-language hypothesis relevant to an existing published "
                "service; validate country-specific intent and demand before revising copy."
            ),
            "priority": 2.6 if intent == "commercial" else 2.1,
            "status": "proposed",
            "payload": {
                "kind": "seo_opportunity",
                "action": "research_keyword_variant",
                "publishable": False,
                "review_required": True,
                "evidence": {
                    "query": phrase,
                    "language": language,
                    "intent_hypothesis": intent,
                    "target_existing_service_path": path,
                    "recommended_use": use,
                    "source": "curated_editorial_hypothesis",
                    "observed_gsc_impressions": None,
                    "verified_market_search_volume": None,
                    "verified_serp_rank": None,
                    "trend_verified": False,
                    "commercial_intent_verified": False,
                    "search_demand_verified": False,
                },
                "research": {
                    "validation_tasks": [
                        "Check whether GSC actually observes this phrase or close intent on its real URL",
                        "Inspect country and language SERP for intent and competing results",
                        "Check whether this is already answered by the existing service or useful case",
                        "If buyer intent differs, propose a helpful FAQ/article rather than duplicate landing",
                        "Require human approval before visible or invisible content edits",
                    ],
                    "new_landing_authorized": False,
                    "automatic_keyword_target_changes": False,
                },
            },
        })
    return results
