from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BANK = ROOT / "content" / "article-bank"

WEAK_BOLD_ENDINGS = {
    "es": {"de","del","la","las","el","los","y","o","en","con","por","para","un","una","que"},
    "ca": {"de","del","la","les","el","els","i","o","en","amb","per","un","una","que"},
    "en": {"of","the","and","or","in","with","by","for","a","an","to","that"},
}
BOLD_RE = re.compile(r"\*\*([^*\n]+)\*\*")
WORD_RE = re.compile(r"[\wÀ-ÿ'-]+")

ES_REPLACEMENTS = {
    "KB-030": [
        (
            "OTIF mide cumplimiento respecto a una promesa; la variabilidad mide cuán predecible es el proceso de entrega.",
            "OTIF mide cumplimiento respecto a una promesa; la variabilidad mide hasta qué punto el proceso de entrega es predecible.",
        ),
    ],
    "KB-057": [
        (
            "Pero la flexibilidad tiene un coste: es más difícil saber cuán lejos estamos del mejor resultado posible y comparar calidad entre instancias.",
            "Pero la flexibilidad tiene un coste: es más difícil saber cuánto nos alejamos del mejor resultado posible y comparar calidad entre instancias.",
        ),
    ],
    "KB-141": [
        (
            "La governance necesita revisión. Qué plataforma facilita políticas, auditoría y segregación de acceso dentro de la estructura concreta de la empresa?",
            "La governance necesita revisión. ¿Qué plataforma facilita políticas, auditoría y segregación de acceso dentro de la estructura concreta de la empresa?",
        ),
    ],
    "KB-144": [
        (
            "Una decisión robusta separa capability de implementación: qué necesita el negocio y qué patrón AWS lo resuelve con menos fricción?",
            "Una decisión robusta separa capability de implementación: ¿qué necesita el negocio y qué patrón AWS lo resuelve con menos fricción?",
        ),
    ],
    "KB-146": [
        (
            "La decisión debería modelar cómo trabaja realmente la empresa. Quién administra cuentas, quién despliega infraestructura, cómo se auditan permisos, cómo se controla coste y cómo se responde a incidentes?",
            "La decisión debería modelar cómo trabaja realmente la empresa. ¿Quién administra cuentas, quién despliega infraestructura, cómo se auditan permisos, cómo se controla el coste y cómo se responde a incidentes?",
        ),
    ],
    "KB-148": [
        (
            "Primera: ecosystem fit. Qué tan bien se integra el proveedor con sistemas e identidad existentes?",
            "Primera: ecosystem fit. ¿Hasta qué punto encaja el proveedor con los sistemas y la identidad existentes?",
        ),
        (
            "Segunda: operating fit. **Puede el equipo desplegar, monitorizar y asegurar la plataforma sin depender continuamente de especialistas externos?**",
            "Segunda: operating fit. **¿Puede el equipo desplegar, monitorizar y asegurar la plataforma sin depender continuamente de especialistas externos?**",
        ),
        (
            "Tercera: workload fit. El patrón es batch, streaming, BI interactivo, ML, serving online o una combinación?",
            "Tercera: workload fit. ¿El patrón es batch, streaming, BI interactivo, ML, serving online o una combinación?",
        ),
        (
            "Cuarta: governance fit. Qué tan fácil es aplicar permisos, auditoría, segregación y políticas de coste?",
            "Cuarta: governance fit. ¿Qué facilidad ofrece la plataforma para aplicar permisos, auditoría, segregación y políticas de coste?",
        ),
        (
            "Quinta: commercial fit. Qué contratos, descuentos, pricing y soporte existen?",
            "Quinta: commercial fit. ¿Qué contratos, descuentos, pricing y soporte existen?",
        ),
        (
            "También conviene probar una incidencia: qué ocurre cuando falla un pipeline o cambia un permiso?",
            "También conviene probar una incidencia: ¿qué ocurre cuando falla un pipeline o cambia un permiso?",
        ),
    ],
    "KB-149": [
        (
            "La tercera pregunta es governance. Cómo se gestionan catálogos, permisos, lineage, datos sensibles y acceso de diferentes equipos?",
            "La tercera pregunta es governance. ¿Cómo se gestionan catálogos, permisos, lineage, datos sensibles y acceso de diferentes equipos?",
        ),
        (
            "La quinta es integración. Qué BI, orchestration, ML, cloud y herramientas externas existen ya?",
            "La quinta es integración. ¿Qué BI, orchestration, ML, cloud y herramientas externas existen ya?",
        ),
    ],
    "KB-150": [
        (
            "La selección debería empezar por patrones reales de trabajo. Qué volumen hay, qué latencia se necesita, qué porcentaje es SQL, cuánto ML existe, cuánta concurrencia tenemos y qué SLA importa?",
            "La selección debería empezar por patrones reales de trabajo. ¿Qué volumen hay, qué latencia se necesita, qué porcentaje es SQL, cuánto ML existe, cuánta concurrencia tenemos y qué SLA importa?",
        ),
        (
            "Después workload fit. Luego operating fit: qué tan bien puede el equipo mantener la plataforma.",
            "Después workload fit. Luego operating fit: la capacidad real del equipo para mantener la plataforma.",
        ),
    ],
    "KB-152": [
        (
            "La plataforma vivirá dentro de una organización. Qué skills existen hoy? Qué tan fácil es contratar? Cuánto tarda alguien nuevo en ser productivo?",
            "La plataforma vivirá dentro de una organización. ¿Qué skills existen hoy? ¿Es fácil contratar los perfiles necesarios? ¿Cuánto tarda alguien nuevo en ser productivo?",
        ),
    ],
    "KB-183": [
        (
            "También conviene revisar calibration de probabilidades: eventos estimados al 10 % ocurren aproximadamente con esa frecuencia?",
            "También conviene revisar la calibración de probabilidades: ¿los eventos estimados al 10 % ocurren aproximadamente con esa frecuencia?",
        ),
    ],
    "KB-187": [
        (
            "La pregunta práctica no es solo “cuál es la mejor decisión?”, sino “sigue siendo buena cuando el mundo deja de comportarse como el caso medio?”.",
            "La pregunta práctica no es solo “¿cuál es la mejor decisión?”, sino “¿sigue siendo buena cuando el mundo deja de comportarse como el caso medio?”.",
        ),
    ],
    "KB-193": [
        (
            "cuánto cuesta responder “qué pasa si cambia X?”.",
            "cuánto cuesta responder “¿qué pasa si cambia X?”.",
        ),
    ],
}


def unbold_weak_fragments(body: str, lang: str) -> tuple[str, int]:
    removed = 0

    def repl(match: re.Match[str]) -> str:
        nonlocal removed
        phrase = match.group(1)
        stripped = phrase.strip()
        if not stripped or stripped[-1] in ".!?;:":
            return match.group(0)
        toks = WORD_RE.findall(stripped.lower())
        if toks and toks[-1] in WEAK_BOLD_ENDINGS[lang]:
            removed += 1
            return phrase
        return match.group(0)

    return BOLD_RE.sub(repl, body), removed


def main() -> int:
    changed_files = 0
    bold_removed = 0
    replacements_applied = 0

    for path in sorted(BANK.glob("[0-9][0-9][0-9]-*.json")):
        article = json.loads(path.read_text(encoding="utf-8"))
        spec_id = str(article.get("spec_id") or "")
        touched = False

        for lang in ("es","ca","en"):
            variant = (article.get("variants") or {}).get(lang)
            if not isinstance(variant, dict):
                continue
            body = str(variant.get("body") or "")

            if lang == "es":
                for old, new in ES_REPLACEMENTS.get(spec_id, []):
                    if old in body:
                        body = body.replace(old, new)
                        replacements_applied += 1
                        touched = True

            cleaned, removed = unbold_weak_fragments(body, lang)
            if removed:
                body = cleaned
                bold_removed += removed
                touched = True

            variant["body"] = body

        if touched:
            path.write_text(json.dumps(article, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            changed_files += 1

    print(json.dumps({
        "changed_files": changed_files,
        "bold_fragments_unbolded": bold_removed,
        "spanish_replacements_applied": replacements_applied,
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
