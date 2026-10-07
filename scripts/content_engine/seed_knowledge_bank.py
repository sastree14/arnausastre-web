from __future__ import annotations

import argparse
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

from growth.src.config import load_config
from growth.src.storage import get_store

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_BANK = ROOT / "content" / "article-bank"
DEFAULT_CATALOG = ROOT / "content" / "editorial" / "knowledge_bank_v1.json"


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
        # Scheduling is deliberately separate from article validity. Canonical
        # article files may remain unscheduled until editorial review is complete.


def content_id(spec_id: str, language: str) -> str:
    return f"knowledge_{spec_id.lower().replace('-', '_')}_{language}"


def approval_id(spec_id: str, language: str) -> str:
    return f"approval_knowledge_{spec_id.lower().replace('-', '_')}_{language}"


PUBLICATION_LOCAL_ORDER = [1, 5, 9, 13, 17, 4, 8, 12, 16, 20, 2, 6, 10, 14, 18, 3, 7, 11, 15, 19]

GOLD_STANDARD_IDS = {
    "KB-001", "KB-004", "KB-041", "KB-061", "KB-081", "KB-088",
    "KB-101", "KB-117", "KB-173", "KB-197", "KB-200",
}

EXPERIENCE_NOTES = {
    "KB-001": {
        "es": "En proyectos de forecasting, la mejora estadística solo se vuelve útil cuando cada horizonte termina conectado con una decisión real: compra, capacidad, inventario o priorización.",
        "ca": "En projectes de forecasting, la millora estadística només es torna útil quan cada horitzó acaba connectat amb una decisió real: compra, capacitat, inventari o priorització.",
        "en": "In forecasting work, statistical improvement only becomes useful when each horizon is connected to a real decision: purchasing, capacity, inventory or prioritisation.",
    },
    "KB-009": {
        "es": "Trabajar con horizontes H1, H3, H6 o H9 obliga a separar decisiones. Un horizonte corto puede alimentar operación; uno largo puede servir para capacidad, caja o compras con otra lógica.",
        "ca": "Treballar amb horitzons H1, H3, H6 o H9 obliga a separar decisions. Un horitzó curt pot alimentar operació; un de llarg pot servir per capacitat, caixa o compres amb una altra lògica.",
        "en": "Working with H1, H3, H6 or H9 horizons forces decisions apart. A short horizon may drive operations while a longer one supports capacity, cash or purchasing under different logic.",
    },
    "KB-021": {
        "es": "En planificación de demanda e inventario, los buffers fijos tienden a esconder el problema: mezclan incertidumbre real con decisiones heredadas de reposición, proveedor o nivel de servicio.",
        "ca": "En planificació de demanda i inventari, els buffers fixos tendeixen a amagar el problema: barregen incertesa real amb decisions heretades de reposició, proveïdor o nivell de servei.",
        "en": "In demand and inventory planning, fixed buffers tend to hide the real problem: they mix genuine uncertainty with inherited replenishment, supplier or service-level decisions.",
    },
    "KB-061": {
        "es": "En proyectos de machine learning, una baseline sencilla suele ser una de las pruebas más valiosas: obliga a demostrar cuánto valor incremental compra realmente la complejidad del modelo.",
        "ca": "En projectes de machine learning, una baseline senzilla acostuma a ser una de les proves més valuoses: obliga a demostrar quant valor incremental compra realment la complexitat del model.",
        "en": "In machine-learning projects, a simple baseline is often one of the most valuable tests: it forces the team to show how much incremental value the model complexity actually buys.",
    },
    "KB-065": {
        "es": "En scoring y riesgo, optimizar AUC sin revisar el cutoff, la capacidad de actuación y el coste de falsos positivos y falsos negativos deja incompleta la decisión.",
        "ca": "En scoring i risc, optimitzar AUC sense revisar el cutoff, la capacitat d’actuació i el cost de falsos positius i falsos negatius deixa incompleta la decisió.",
        "en": "In scoring and risk work, optimising AUC without reviewing the cutoff, intervention capacity and the cost of false positives and false negatives leaves the decision incomplete.",
    },
    "KB-080": {
        "es": "Cuando un modelo llega a producción, la parte difícil deja de ser el entrenamiento. Datos, drift, thresholds, outcomes y overrides necesitan una lectura conjunta para saber si la decisión sigue funcionando.",
        "ca": "Quan un model arriba a producció, la part difícil deixa de ser l’entrenament. Dades, drift, thresholds, outcomes i overrides necessiten una lectura conjunta per saber si la decisió continua funcionant.",
        "en": "Once a model reaches production, training stops being the hard part. Data, drift, thresholds, outcomes and overrides have to be read together to know whether the decision still works.",
    },
    "KB-081": {
        "es": "Al construir agentes y automatizaciones, separar interpretación de ejecución reduce mucho el riesgo: la IA puede decidir qué camino seguir y una capa determinista puede validar qué acciones están realmente permitidas.",
        "ca": "En construir agents i automatitzacions, separar interpretació d’execució redueix molt el risc: la IA pot decidir quin camí seguir i una capa determinista pot validar quines accions estan realment permeses.",
        "en": "When building agents and automations, separating interpretation from execution reduces risk considerably: AI can choose the path while a deterministic layer validates which actions are actually allowed.",
    },
    "KB-088": {
        "es": "En sistemas de datos e IA, una combinación frecuente funciona mejor que una elección absoluta: comprar infraestructura commodity, conservar la lógica diferencial y apoyarse en especialistas para acelerar integración y delivery.",
        "ca": "En sistemes de dades i IA, una combinació freqüent funciona millor que una elecció absoluta: comprar infraestructura commodity, conservar la lògica diferencial i recolzar-se en especialistes per accelerar integració i delivery.",
        "en": "In data and AI systems, a mixed model often works better than an absolute choice: buy commodity infrastructure, retain differentiated logic and use specialists to accelerate integration and delivery.",
    },
    "KB-101": {
        "es": "Al construir cuadros de mando y CMI, el salto de valor aparece cuando el sistema deja de limitarse a enseñar métricas y empieza a conectar señal, contexto, siguiente acción y trazabilidad.",
        "ca": "En construir quadres de comandament i CMI, el salt de valor apareix quan el sistema deixa de limitar-se a mostrar mètriques i comença a connectar senyal, context, següent acció i traçabilitat.",
        "en": "When building management dashboards and decision interfaces, the value jump appears when the system stops merely showing metrics and starts connecting signal, context, next action and traceability.",
    },
    "KB-117": {
        "es": "En automatización y reporting, acelerar el dato no sirve si la aprobación, la interpretación o la ejecución siguen bloqueando la acción. La latencia debe medirse hasta la decisión real.",
        "ca": "En automatització i reporting, accelerar la dada no serveix si l’aprovació, la interpretació o l’execució continuen bloquejant l’acció. La latència s’ha de mesurar fins a la decisió real.",
        "en": "In automation and reporting work, faster data does not help if approval, interpretation or execution still blocks action. Latency has to be measured all the way to the real decision.",
    },
    "KB-173": {
        "es": "En modelos de riesgo y crédito, una AUC fuerte puede convivir con una mala política. El valor aparece al conectar ranking, calibración, cutoff, expected loss y restricciones reales del portfolio.",
        "ca": "En models de risc i crèdit, una AUC forta pot conviure amb una mala política. El valor apareix en connectar ranking, calibratge, cutoff, expected loss i restriccions reals del portfolio.",
        "en": "In credit-risk models, strong AUC can coexist with a poor policy. Value appears when ranking, calibration, cutoff, expected loss and real portfolio constraints are connected.",
    },
    "KB-193": {
        "es": "En entornos de planning con Anaplan y reporting, migrar la hoja de cálculo sin revisar la lógica de decisión solo traslada complejidad. El modelo operativo debe revisarse antes que la interfaz.",
        "ca": "En entorns de planning amb Anaplan i reporting, migrar el full de càlcul sense revisar la lògica de decisió només trasllada complexitat. El model operatiu s’ha de revisar abans que la interfície.",
        "en": "In planning environments using Anaplan and reporting, migrating the spreadsheet without revisiting the decision logic merely moves complexity. The operating model should be reviewed before the interface.",
    },
    "KB-197": {
        "es": "En automatización, machine learning y agentes, una parte importante del trabajo es descartar complejidad. Una regla, un SQL o un workflow determinista pueden ser la mejor solución cuando compran casi todo el valor.",
        "ca": "En automatització, machine learning i agents, una part important de la feina és descartar complexitat. Una regla, un SQL o un workflow determinista poden ser la millor solució quan compren gairebé tot el valor.",
        "en": "In automation, machine learning and agent work, an important part of the job is rejecting unnecessary complexity. A rule, SQL query or deterministic workflow can be the best solution when it captures almost all the value.",
    },
}


def publication_order_for_sequence(sequence: int) -> int:
    safe = max(1, min(200, int(sequence or 1)))
    cluster_index = (safe - 1) // 20
    local_index = ((safe - 1) % 20) + 1
    try:
        round_index = PUBLICATION_LOCAL_ORDER.index(local_index)
    except ValueError:
        round_index = local_index - 1
    return round_index * 10 + cluster_index + 1


def presentation_for_family(content_family: str | None) -> str:
    return {
        "point_of_view_contrarian": "statement",
        "compare": "duo",
        "decision_guide": "triad",
        "failure_modes_mistakes": "matrix",
        "framework_playbook": "sequence",
        "diagnose": "diagnostic",
        "evidence_measurement": "evidence",
        "system_architecture": "architecture",
    }.get(str(content_family or ""), "triad")


def service_for_article(article: dict[str, Any]) -> str:
    cluster = str(article.get("cluster") or "")
    spec = int("".join(ch for ch in str(article.get("spec_id") or "") if ch.isdigit()) or 0)
    if cluster == "Forecasting & Planning":
        return "forecasting-planning"
    if cluster in {"Inventory & Supply Chain", "Optimization & OR"}:
        return "optimisation"
    if cluster == "Machine Learning":
        return "machine-learning"
    if cluster == "AI & Automation":
        return "ai-automation"
    if cluster in {"Analytics & Decision Intelligence", "Data Engineering & Architecture", "Cloud & Platforms"}:
        return "analytics-bi"
    if cluster == "Finance, Risk & Pricing":
        if 165 <= spec <= 168:
            return "forecasting-planning"
        if 173 <= spec <= 176:
            return "machine-learning"
        return "simulation-modelling"
    if cluster == "Simulation & Business Systems":
        if 189 <= spec <= 192:
            return "analytics-bi"
        if 193 <= spec <= 196:
            return "forecasting-planning"
        if spec >= 197:
            return "ai-automation"
        return "simulation-modelling"
    return "analytics-bi"


def schedule_for(sequence: int, strategy: dict[str, Any]) -> str:
    """Resolve the canonical publication slot from the editorial strategy.

    Article-bank JSON can outlive scheduling-policy changes. Seeding therefore
    treats the catalog as the source of truth instead of trusting stale
    scheduled_at values materialized in individual article files.
    """
    timezone_name = str(strategy.get("timezone") or "Europe/Madrid")
    tz = ZoneInfo(timezone_name)
    base = datetime.fromisoformat(str(strategy["start_local"])).replace(tzinfo=tz)
    cadence = [int(value) for value in strategy.get("cadence_days") or [3]]
    initial_published = max(0, int(strategy.get("initial_published_articles") or 0))

    if sequence <= initial_published:
        return base.isoformat()

    cursor = base
    for idx in range(initial_published + 1, sequence):
        cursor += timedelta(days=cadence[(idx - initial_published - 1) % len(cadence)])
    return cursor.isoformat()


def article_meta(
    article: dict[str, Any],
    variant: dict[str, Any],
    language: str,
    article_by_spec: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    related_rows = [
        article_by_spec[spec]
        for spec in article.get("related_specs") or []
        if spec in article_by_spec
    ]
    related_articles = [
        {
            "href": f"/knowledge/{row['slug']}/{language}",
            "title": str((row.get("variants") or {}).get(language, {}).get("title") or row.get("slug") or ""),
        }
        for row in related_rows
    ]
    spec_id = str(article.get("spec_id") or "")
    return {
        "excerpt": variant.get("excerpt", ""),
        "quick": variant.get("quick", []),
        "section_titles": variant.get("section_titles", []),
        "business_title": variant.get("business_title", ""),
        "business_steps": variant.get("business_steps", []),
        "knowledge_area": article.get("knowledge_area", "analytics"),
        "related_case": article.get("related_case", ""),
        "related_article": related_articles[0]["href"] if related_articles else "",
        "related_article_title": related_articles[0]["title"] if related_articles else "",
        "related_articles": related_articles,
        "seo_title": variant.get("seo_title", ""),
        "seo_description": variant.get("seo_description", ""),
        "seo_keywords": variant.get("seo_keywords", []),
        "tags": variant.get("tags", []),
        "spec_id": spec_id,
        "sequence": article.get("sequence"),
        "publication_order": publication_order_for_sequence(int(article.get("sequence") or 0)),
        "cluster": article.get("cluster"),
        "editorial_pillar": article.get("editorial_pillar"),
        "content_family": article.get("content_family"),
        "angle": article.get("angle"),
        "primary_keyword": article.get("primary_keyword"),
        "search_intent": article.get("search_intent"),
        "freshness": article.get("freshness"),
        "presentation_variant": presentation_for_family(article.get("content_family")),
        "service_key": service_for_article(article),
        "gold_standard": spec_id in GOLD_STANDARD_IDS,
        "experience_note": EXPERIENCE_NOTES.get(spec_id, {}).get(language, ""),
    }


def seed(*, bank_dir: Path, catalog_path: Path, mode: str, expected: int, limit: int = 0) -> dict[str, Any]:
    articles = load_articles(bank_dir)
    validate_bank(articles, expected=expected)
    if limit > 0:
        articles = articles[:limit]

    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    strategy = catalog.get("publication_strategy") or {}
    if mode == "scheduled" and strategy.get("enabled") is not True:
        raise RuntimeError(
            "Knowledge publication scheduling is disabled. Complete editorial review "
            "and explicitly enable publication_strategy.enabled before seeding scheduled content."
        )
    initial_published = max(0, int(strategy.get("initial_published_articles") or 0))

    cfg = load_config()
    tenant_id = cfg["company"]["tenant_id"]
    store = get_store()
    all_articles = load_articles(bank_dir)
    article_by_spec = {str(row["spec_id"]): row for row in all_articles}
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    existing_items = {str(row.get("content_id")): row for row in store.list("content_items")}
    existing_approvals = {str(row.get("approval_id")): row for row in store.list("approvals")}

    seeded_items = 0
    seeded_approvals = 0

    for article in articles:
        brief_id = str(article["slug"])
        sequence = int(article.get("sequence") or 0)
        publication_order = publication_order_for_sequence(sequence)
        schedule_at = schedule_for(publication_order, strategy) if mode == "scheduled" else None
        if mode == "scheduled" and publication_order <= initial_published:
            schedule_at = now
        status = "scheduled" if mode == "scheduled" else "needs_review"

        for language in ("es", "en", "ca"):
            variant = article["variants"][language]
            cid = content_id(article["spec_id"], language)
            critique = {
                "contract_valid": True,
                "contract_issues": [],
                "article_bank": True,
                "article_meta": article_meta(article, variant, language, article_by_spec),
            }
            existing_item = existing_items.get(cid) or {}
            already_published = existing_item.get("status") == "published" and bool(existing_item.get("published_at"))
            item_status = "published" if already_published else status
            item_schedule = None if already_published else schedule_at

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
                "status": item_status,
                "visual_type": "none",
                "visual_path": "",
                "source_case": "",
                "scheduled_at": item_schedule,
                "published_at": existing_item.get("published_at") if already_published else None,
                "external_post_url": existing_item.get("external_post_url") if already_published else None,
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
            existing_approval = existing_approvals.get(aid) or {}
            approval_executed = already_published or existing_approval.get("status") == "executed"
            approval_status = "executed" if approval_executed else ("approved" if mode == "scheduled" else "pending")
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
                    "publication_order": publication_order,
                    "scheduled_at": item_schedule,
                    "source": "knowledge_bank_v1",
                    "execution_mode": "scheduled_website_publication",
                },
                "status": approval_status,
                "created_at": existing_approval.get("created_at") or now,
                "decided_at": existing_approval.get("decided_at") or now,
                "executed_at": (existing_approval.get("executed_at") or existing_item.get("published_at") or now) if approval_executed else None,
            }
            store.upsert("approvals", approval, key="approval_id")
            seeded_approvals += 1

    return {
        "mode": mode,
        "families": len(articles),
        "content_items": seeded_items,
        "approvals": seeded_approvals,
        "initial_release_families": min(initial_published, len(articles)) if mode == "scheduled" else 0,
        "first_scheduled_at": now if articles and mode == "scheduled" and initial_published else (schedule_for(1, strategy) if articles and mode == "scheduled" else None),
        "next_scheduled_at": schedule_for(initial_published + 1, strategy) if articles and mode == "scheduled" and initial_published < len(articles) else None,
        "last_scheduled_at": schedule_for(len(articles), strategy) if articles and mode == "scheduled" else None,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Seed the materialized SC-Analytics Knowledge bank into the Growth content store.")
    parser.add_argument("--bank", type=Path, default=DEFAULT_BANK)
    parser.add_argument("--catalog", type=Path, default=DEFAULT_CATALOG)
    parser.add_argument("--mode", choices=("staged", "scheduled"), default="staged")
    parser.add_argument("--expected", type=int, default=200)
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    articles = load_articles(args.bank)
    validate_bank(articles, expected=args.expected)
    if args.dry_run:
        catalog = json.loads(args.catalog.read_text(encoding="utf-8"))
        strategy = catalog.get("publication_strategy") or {}
        initial_published = max(0, int(strategy.get("initial_published_articles") or 0))
        next_sequence = initial_published + 1
        print(json.dumps({
            "valid": True,
            "families": len(articles),
            "variants": len(articles) * 3,
            "initial_release_families": min(initial_published, len(articles)),
            "first_scheduled_at": schedule_for(1, strategy) if articles else None,
            "next_scheduled_at": schedule_for(next_sequence, strategy) if len(articles) >= next_sequence else None,
            "last_scheduled_at": schedule_for(int(articles[-1]["sequence"]), strategy) if articles else None,
        }, indent=2))
        return 0

    result = seed(bank_dir=args.bank, catalog_path=args.catalog, mode=args.mode, expected=args.expected, limit=args.limit)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
