from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BANK = ROOT / "content" / "article-bank"

# Final concise business implications for the remaining article families flagged
# by editorial QA. These are intentionally shorter than the body conclusion:
# they are scan-level implications, not summaries.
TITLES = {
    "KB-066": {
        "es": "ROC AUC y PR AUC responden a preguntas distintas sobre el riesgo.",
        "ca": "ROC AUC i PR AUC responen preguntes diferents sobre el risc.",
        "en": "ROC AUC and PR AUC answer different questions about risk.",
    },
    "KB-070": {
        "es": "La interpretabilidad gana cuando reduce riesgo y mejora la decisión.",
        "ca": "La interpretabilitat guanya quan redueix risc i millora la decisió.",
        "en": "Interpretability wins when it reduces risk and improves the decision.",
    },
    "KB-086": {
        "es": "Una IA a medida solo es estratégica si protege una ventaja real.",
        "ca": "Una IA a mida només és estratègica si protegeix un avantatge real.",
        "en": "Custom AI is strategic only when it protects a real advantage.",
    },
    "KB-087": {
        "es": "SaaS deja de ser barato cuando la dependencia supera su velocidad.",
        "ca": "SaaS deixa de ser barat quan la dependència supera la seva velocitat.",
        "en": "SaaS stops being cheap when dependency outweighs its speed advantage.",
    },
    "KB-089": {
        "es": "RAG da acceso al conocimiento; no define cómo gobernarlo.",
        "ca": "RAG dona accés al coneixement; no defineix com governar-lo.",
        "en": "RAG provides knowledge access; it does not define knowledge governance.",
    },
    "KB-097": {
        "es": "Un copilot crea valor cuando vive dentro del workflow real.",
        "ca": "Un copilot crea valor quan viu dins del workflow real.",
        "en": "A copilot creates value when it lives inside the real workflow.",
    },
    "KB-098": {
        "es": "Copilot mejora decisiones; automatización elimina trabajo repetible.",
        "ca": "Copilot millora decisions; l’automatització elimina feina repetible.",
        "en": "Copilots improve decisions; automation removes repeatable work.",
    },
    "KB-099": {
        "es": "La adopción crece cuando la IA mejora el proceso, no solo la herramienta.",
        "ca": "L’adopció creix quan la IA millora el procés, no només l’eina.",
        "en": "Adoption grows when AI improves the process, not just the tool.",
    },
    "KB-104": {
        "es": "Ve más allá del dashboard cuando ver datos ya no es el cuello de botella.",
        "ca": "Ves més enllà del dashboard quan veure dades ja no és el coll d’ampolla.",
        "en": "Move beyond dashboards when seeing data is no longer the bottleneck.",
    },
    "KB-105": {
        "es": "Cada KPI premia un comportamiento, también cuando el incentivo es equivocado.",
        "ca": "Cada KPI premia un comportament, també quan l’incentiu és equivocat.",
        "en": "Every KPI rewards behaviour, including when the incentive is wrong.",
    },
    "KB-108": {
        "es": "El mejor KPI mejora una decisión sin deteriorar el resultado global.",
        "ca": "El millor KPI millora una decisió sense deteriorar el resultat global.",
        "en": "The best KPI improves a decision without damaging the overall outcome.",
    },
    "KB-123": {
        "es": "El warehouse es un cuello de botella cuando cada nuevo análisis cuesta más.",
        "ca": "El warehouse és un coll d’ampolla quan cada nova anàlisi costa més.",
        "en": "The warehouse is a bottleneck when every new analysis costs more.",
    },
    "KB-127": {
        "es": "La transformación falla cuando una definición simple exige tocar demasiadas capas.",
        "ca": "La transformació falla quan una definició simple exigeix tocar massa capes.",
        "en": "Transformation breaks when a simple definition requires changing too many layers.",
    },
    "KB-129": {
        "es": "Real time merece inversión solo cuando la velocidad cambia una acción.",
        "ca": "Real time mereix inversió només quan la velocitat canvia una acció.",
        "en": "Real time deserves investment only when speed changes an action.",
    },
    "KB-135": {
        "es": "Data quality necesita un límite económico, no perfección técnica.",
        "ca": "Data quality necessita un límit econòmic, no perfecció tècnica.",
        "en": "Data quality needs an economic boundary, not technical perfection.",
    },
    "KB-140": {
        "es": "El mejor stack para una pyme es el que puede mantener.",
        "ca": "El millor stack per una pime és el que pot mantenir.",
        "en": "The best SME stack is the one the company can maintain.",
    },
    "KB-141": {
        "es": "AWS o Azure se eligen por encaje operativo, no por catálogo.",
        "ca": "AWS o Azure es trien per encaix operatiu, no per catàleg.",
        "en": "Choose AWS or Azure by operating fit, not by service catalogue.",
    },
    "KB-143": {
        "es": "Azure simplifica cuando la empresa ya opera alrededor de Microsoft.",
        "ca": "Azure simplifica quan l’empresa ja opera al voltant de Microsoft.",
        "en": "Azure simplifies the choice when the company already operates around Microsoft.",
    },
    "KB-145": {
        "es": "Google Cloud encaja cuando datos y ML son parte central del sistema.",
        "ca": "Google Cloud encaixa quan dades i ML són part central del sistema.",
        "en": "Google Cloud fits when data and ML are central to the system.",
    },
    "KB-146": {
        "es": "La mejor cloud es la que encaja con sistemas, equipo y operación.",
        "ca": "La millor cloud és la que encaixa amb sistemes, equip i operació.",
        "en": "The best cloud is the one that fits systems, team and operations.",
    },
    "KB-148": {
        "es": "Elige cloud por restricciones, operating model y coste total.",
        "ca": "Tria cloud per restriccions, model operatiu i cost total.",
        "en": "Choose cloud by constraints, operating model and total cost.",
    },
    "KB-151": {
        "es": "Un lakehouse compensa cuando elimina duplicación sin añadir más complejidad.",
        "ca": "Un lakehouse compensa quan elimina duplicació sense afegir més complexitat.",
        "en": "A lakehouse pays off when it removes duplication without adding more complexity.",
    },
    "KB-152": {
        "es": "Compara plataformas por workloads reales, no por listas de features.",
        "ca": "Compara plataformes per workloads reals, no per llistes de features.",
        "en": "Compare platforms by real workloads, not feature lists.",
    },
    "KB-156": {
        "es": "Managed o self-managed decide qué responsabilidad quiere asumir el equipo.",
        "ca": "Managed o self-managed decideix quina responsabilitat vol assumir l’equip.",
        "en": "Managed or self-managed decides which responsibility the team wants to own.",
    },
    "KB-157": {
        "es": "ClickHouse compensa cuando la velocidad analítica cambia el producto o la operación.",
        "ca": "ClickHouse compensa quan la velocitat analítica canvia el producte o l’operació.",
        "en": "ClickHouse pays off when analytical speed changes the product or operation.",
    },
    "KB-158": {
        "es": "PostgreSQL y ClickHouse sirven workloads distintos; no necesitan competir.",
        "ca": "PostgreSQL i ClickHouse serveixen workloads diferents; no han de competir.",
        "en": "PostgreSQL and ClickHouse serve different workloads; they need not compete.",
    },
    "KB-159": {
        "es": "Más velocidad solo compensa cuando supera la complejidad que añade.",
        "ca": "Més velocitat només compensa quan supera la complexitat que afegeix.",
        "en": "More speed pays off only when it outweighs the complexity it adds.",
    },
    "KB-160": {
        "es": "La mejor base analítica cumple el workload sin sobredimensionar la arquitectura.",
        "ca": "La millor base analítica compleix el workload sense sobredimensionar l’arquitectura.",
        "en": "The best analytical database meets the workload without overbuilding the architecture.",
    },
    "KB-166": {
        "es": "Directo e indirecto sirven decisiones de caja diferentes.",
        "ca": "Directe i indirecte serveixen decisions de caixa diferents.",
        "en": "Direct and indirect methods support different cash decisions.",
    },
    "KB-168": {
        "es": "Un forecast de caja útil anticipa restricciones y opciones de respuesta.",
        "ca": "Un forecast de caixa útil anticipa restriccions i opcions de resposta.",
        "en": "A useful cash forecast anticipates constraints and response options.",
    },
    "KB-169": {
        "es": "VaR resume exposición; no sustituye una arquitectura completa de riesgo.",
        "ca": "VaR resumeix exposició; no substitueix una arquitectura completa de risc.",
        "en": "VaR summarizes exposure; it does not replace a complete risk architecture.",
    },
    "KB-171": {
        "es": "Un único número resume riesgo, pero no explica cómo gestionarlo.",
        "ca": "Un únic número resumeix risc, però no explica com gestionar-lo.",
        "en": "One number summarizes risk, but it does not explain how to manage it.",
    },
    "KB-172": {
        "es": "Stress testing sirve para preparar escenarios que VaR puede ignorar.",
        "ca": "Stress testing serveix per preparar escenaris que VaR pot ignorar.",
        "en": "Stress testing prepares the business for scenarios VaR may miss.",
    },
    "KB-176": {
        "es": "Un buen scoring debe producir una cartera rentable, estable y gobernable.",
        "ca": "Un bon scoring ha de produir una cartera rendible, estable i governable.",
        "en": "Good scoring should produce a profitable, stable and governable portfolio.",
    },
    "KB-180": {
        "es": "Un stress test útil revela vulnerabilidades sobre las que todavía puedes actuar.",
        "ca": "Un stress test útil revela vulnerabilitats sobre les quals encara pots actuar.",
        "en": "A useful stress test reveals vulnerabilities you can still act on.",
    },
    "KB-185": {
        "es": "Simulación describe consecuencias; optimización busca la mejor decisión.",
        "ca": "Simulació descriu conseqüències; optimització busca la millor decisió.",
        "en": "Simulation describes consequences; optimization searches for the best decision.",
    },
    "KB-186": {
        "es": "La simulación muestra consecuencias; los objetivos siguen decidiendo la elección.",
        "ca": "La simulació mostra conseqüències; els objectius continuen decidint la tria.",
        "en": "Simulation shows consequences; objectives still determine the choice.",
    },
    "KB-190": {
        "es": "CRM y ERP registran; la capa de decisión convierte información en acción.",
        "ca": "CRM i ERP registren; la capa de decisió converteix informació en acció.",
        "en": "CRM and ERP record; the decision layer turns information into action.",
    },
    "KB-193": {
        "es": "Deja Excel cuando coordinar el modelo cuesta más que su flexibilidad.",
        "ca": "Deixa Excel quan coordinar el model costa més que la seva flexibilitat.",
        "en": "Move beyond Excel when coordination costs exceed spreadsheet flexibility.",
    },
    "KB-194": {
        "es": "Una plataforma no arregla un modelo de planning mal diseñado.",
        "ca": "Una plataforma no arregla un model de planning mal dissenyat.",
        "en": "A planning platform does not fix a poorly designed planning model.",
    },
    "KB-195": {
        "es": "La mejor plataforma de planning es la que encaja con tu modelo operativo.",
        "ca": "La millor plataforma de planning és la que encaixa amb el model operatiu.",
        "en": "The best planning platform is the one that fits the operating model.",
    },
    "KB-196": {
        "es": "Una plataforma compensa cuando el spreadsheet ya no coordina el proceso.",
        "ca": "Una plataforma compensa quan el spreadsheet ja no coordina el procés.",
        "en": "A planning platform pays off when spreadsheets no longer coordinate the process.",
    },
    "KB-199": {
        "es": "Un proyecto de analytics debe demostrar valor antes de ganar complejidad.",
        "ca": "Un projecte d’analytics ha de demostrar valor abans de guanyar complexitat.",
        "en": "An analytics project should prove value before it earns more complexity.",
    },
}


def main() -> int:
    changed_files = 0
    changed_variants = 0

    for path in sorted(BANK.glob("[0-9][0-9][0-9]-*.json")):
        article = json.loads(path.read_text(encoding="utf-8"))
        spec_id = str(article.get("spec_id") or "")
        localized = TITLES.get(spec_id)
        if not localized:
            continue

        touched = False
        for lang, value in localized.items():
            variant = (article.get("variants") or {}).get(lang)
            if not isinstance(variant, dict):
                continue
            if variant.get("business_title") != value:
                variant["business_title"] = value
                touched = True
                changed_variants += 1

        if touched:
            path.write_text(json.dumps(article, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            changed_files += 1

    print(json.dumps({
        "changed_files": changed_files,
        "changed_variants": changed_variants,
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
