from __future__ import annotations

import argparse
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any

from growth.src.llm import LLMError, get_llm
from scripts.content_engine.build_knowledge_bank import (
    editorial_context,
    experience_register_for_spec,
    validate_article,
)

ROOT = Path(__file__).resolve().parents[2]
BANK = ROOT / "content" / "article-bank"
CATALOG = ROOT / "content" / "editorial" / "knowledge_bank_v1.json"
REVISION = "editorial-v3-2026-10-07"
# One-time full-bank refinement; gold standards remain fixed as editorial anchors.
GOLD_STANDARD_IDS = {
    "KB-001", "KB-004", "KB-041", "KB-061", "KB-081", "KB-088",
    "KB-101", "KB-117", "KB-173", "KB-197", "KB-200",
}


def load_specs() -> dict[str, dict[str, Any]]:
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    return {str(row["spec_id"]): row for row in data.get("specs") or []}


def prompt_for(article: dict[str, Any], spec: dict[str, Any], context: str) -> str:
    experience = experience_register_for_spec(spec)
    current = {
        "spec_id": article.get("spec_id"),
        "cluster": article.get("cluster"),
        "content_family": article.get("content_family"),
        "angle": article.get("angle"),
        "primary_keyword": article.get("primary_keyword"),
        "search_intent": article.get("search_intent"),
        "experience_register": experience,
        "variants": article.get("variants"),
    }

    return f"""You are the senior editorial director for SC-Analytics.

Your task is to REVISE an existing Knowledge article family, not to invent a new topic.
Return a finished, publish-ready family in Spanish, Catalan and English.

CURRENT ARTICLE FAMILY
{json.dumps(current, ensure_ascii=False, indent=2)}

REVISION GOAL
Keep the strongest ideas and technical substance, but rewrite wherever necessary so the article feels written by an experienced B2B analytics consultancy rather than generated from a template.

NON-NEGOTIABLE RULES
- Preserve the article's topic, search intent and core decision problem.
- Do not invent clients, deployments, numerical outcomes, market statistics, project durations or benchmarks.
- experience_register is "{experience}". If it is "first_hand", restrained first-hand language is allowed for implementation patterns SC-Analytics genuinely works with. If it is "analysis", do not simulate direct client experience.
- The reader is a CFO, COO, CTO, Head of Data, analytics lead or senior operations manager. Assume they are intelligent and busy.
- Make a defensible point. Do not write a textbook explainer or generic best-practice list.
- Explain mechanism, consequence and trade-off. State when the proposed approach is not worth the complexity.
- Open directly. Do not restate the title or announce what the article will cover.
- The closing must add a decision rule, diagnostic or concrete next question. It must NOT repeat the opening thesis.
- Normal prose must be real paragraphs, not stacks of isolated one-line sentences. Within a section, use 1-3 coherent paragraphs, normally about 50-100 words each.
- Use 3-6 body sections according to the argument. Do not force every article into four equal sections.
- Use selective **bold** anchors, normally 1-3 per section. Do not bold whole paragraphs.
- Keep most articles around 650-950 words per language. Shorter is fine for a narrow comparison; longer only when the argument earns it.
- Titles must be compact and specific.
- Excerpt: 1-2 concise sentences stating the central argument.
- quick: short hooks suited to the family. For a contrarian thesis, avoid cryptic 2-3 word slogans: the visible thesis should normally express a complete idea in roughly 5-12 words. Comparisons should read as alternatives; frameworks as steps; diagnostics as signals.
- business_title: a concise business implication, normally around 6-16 words where meaning allows it, and different from the opening thesis.
- business_steps: 2-4 short concepts only when useful.
- section_titles must match the actual body headings exactly.
- Spanish, Catalan and English must each sound native. Adapt terminology; do not translate mechanically.
- SEO keywords must be natural for EACH language. Do not simply copy the same keyword array across ES/CA/EN.
- SEO title should generally stay <= 60 characters where natural.
- SEO description should generally be 120-160 characters.
- No keyword stuffing.
- Preserve useful domain terminology such as forecasting, workflow, governance, scoring, cutoff, safety stock or ownership when that is the natural professional term; translate only when the local-language version reads better.
- Fix awkward mixed-language sentences, filler, repetition, redundant transitions and duplicated ideas.
- Keep concrete examples illustrative unless the article is explicitly grounded in first-hand experience.
- Do not add CTA text, HTML, H1 headings, tables or metadata labels inside body.

NARRATIVE LOGIC
Use the family "{article.get('content_family')}" as guidance, not as a rigid template:
- point_of_view_contrarian: thesis -> mechanism/evidence -> implication
- compare: alternatives -> criteria -> trade-offs -> decision rule
- failure_modes_mistakes: symptom -> mechanism -> consequence -> correction
- decision_guide: signals -> thresholds -> constraints -> recommendation
- framework_playbook: steps -> requirements -> limitations -> application
- diagnose: observable signals -> tests -> interpretation -> next action
- evidence_measurement: evidence -> interpretation -> limitations -> decision
- system_architecture: components -> interfaces -> failure points -> operating rule

OUTPUT
Return VALID JSON ONLY:
{{
  "variants": {{
    "es": {{
      "title": "...",
      "excerpt": "...",
      "quick": ["..."],
      "section_titles": ["..."],
      "business_title": "...",
      "business_steps": ["..."],
      "body": "...",
      "seo_title": "...",
      "seo_description": "...",
      "seo_keywords": ["..."],
      "tags": ["..."]
    }},
    "ca": {{ same keys }},
    "en": {{ same keys }}
  }}
}}

EDITORIAL STANDARD
{context}
"""


def refine_one(path: Path, spec: dict[str, Any], context: str, profile: str, overwrite: bool) -> dict[str, Any]:
    article = json.loads(path.read_text(encoding="utf-8"))
    spec_id = str(article.get("spec_id") or path.stem)

    if spec_id in GOLD_STANDARD_IDS:
        return {"spec_id": spec_id, "status": "gold-standard-preserved"}

    if article.get("editorial_revision") == REVISION and not overwrite:
        return {"spec_id": spec_id, "status": "already-refined"}

    base_prompt = prompt_for(article, spec, context)
    issues: list[str] = []
    last_error = ""

    for attempt in range(1, 4):
        try:
            llm = get_llm(profile=profile)
            repair = ""
            if issues:
                repair = "\n\nPREVIOUS VALIDATION ISSUES TO FIX:\n- " + "\n- ".join(issues)
            data = llm.json(
                "You are SC-Analytics' senior editorial director. Revise the supplied article family into native, publish-ready website copy. Return JSON only.",
                base_prompt + repair,
            )
            if not isinstance(data, dict) or not isinstance(data.get("variants"), dict):
                issues = ["output must contain a variants object"]
                continue

            candidate = dict(article)
            candidate["variants"] = data["variants"]
            validation = validate_article(candidate, spec)
            if validation:
                issues = validation
                continue

            candidate["editorial_revision"] = REVISION
            path.write_text(json.dumps(candidate, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            return {"spec_id": spec_id, "status": "refined"}
        except (LLMError, Exception) as exc:
            last_error = str(exc)
            if attempt < 3:
                time.sleep(min(20, 3 * attempt))

    return {
        "spec_id": spec_id,
        "status": "failed",
        "issues": issues,
        "error": last_error,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--workers", type=int, default=6)
    parser.add_argument("--profile", default="balanced")
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--max", type=int, default=0)
    args = parser.parse_args()

    specs = load_specs()
    context = editorial_context()
    files = sorted(BANK.glob("[0-9][0-9][0-9]-*.json"))
    if args.max > 0:
        files = files[: args.max]

    results: list[dict[str, Any]] = []
    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
        futures = {}
        for path in files:
            article = json.loads(path.read_text(encoding="utf-8"))
            spec_id = str(article.get("spec_id") or "")
            spec = specs.get(spec_id)
            if not spec:
                results.append({"spec_id": spec_id, "status": "failed", "error": "missing spec"})
                continue
            futures[pool.submit(refine_one, path, spec, context, args.profile, args.overwrite)] = spec_id

        for future in as_completed(futures):
            result = future.result()
            results.append(result)
            print(json.dumps(result, ensure_ascii=False), flush=True)

    counts: dict[str, int] = {}
    for row in results:
        status = str(row.get("status") or "unknown")
        counts[status] = counts.get(status, 0) + 1

    failed = [row for row in results if row.get("status") == "failed"]
    print(json.dumps({"revision": REVISION, "counts": counts, "failed": failed}, ensure_ascii=False, indent=2))
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
