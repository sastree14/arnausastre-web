from __future__ import annotations

import argparse
import json
import os
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

from growth.src.llm import LLMError, get_llm

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CATALOG = ROOT / "content" / "editorial" / "knowledge_bank_v1.json"
DEFAULT_OUTPUT = ROOT / "content" / "article-bank"
EDITORIAL_DIR = ROOT / "content" / "editorial"
BRAIN_DIR = ROOT / "growth" / "brain"
PILOT_ARTICLE = ROOT / "content" / "articles" / "why-inventory-visibility-is-not-inventory-control-and-what-that-costs.mdx"

LANGUAGES = ("es", "en", "ca")
BANNED_PHRASES = (
    "in today's fast-paced",
    "en el mundo actual",
    "en el panorama actual",
    "it is important to note",
    "es importante señalar",
    "the key is to",
    "la clave es",
    "with the right approach",
    "con el enfoque adecuado",
    "transform your business",
    "revolucionar tu negocio",
)
CASE_LANGUAGE = (
    "we delivered for a client",
    "our client achieved",
    "nuestro cliente consiguió",
    "hemos conseguido para un cliente",
    "en un proyecto para un cliente",
)


def slugify(value: str) -> str:
    text = value.lower().strip()
    replacements = {
        "á": "a", "à": "a", "ä": "a", "â": "a",
        "é": "e", "è": "e", "ë": "e", "ê": "e",
        "í": "i", "ì": "i", "ï": "i", "î": "i",
        "ó": "o", "ò": "o", "ö": "o", "ô": "o",
        "ú": "u", "ù": "u", "ü": "u", "û": "u",
        "ñ": "n", "ç": "c", "≠": " not ",
    }
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")[:96]


def words(value: str) -> int:
    return len(re.findall(r"\b[\wÀ-ÿ'-]+\b", value or ""))


def load_text(path: Path, max_chars: int | None = None) -> str:
    text = path.read_text(encoding="utf-8")
    return text[:max_chars] if max_chars else text


def editorial_context() -> str:
    parts = [
        ("ARTICLE STRUCTURE", EDITORIAL_DIR / "article_structure.md", 14000),
        ("EDITORIAL VOICE", EDITORIAL_DIR / "editorial_voice.md", 9000),
        ("COMPANY VOICE", BRAIN_DIR / "voice" / "company_voice.md", 6500),
        ("FORBIDDEN LANGUAGE", BRAIN_DIR / "voice" / "forbidden_language.md", 6500),
        ("EDITORIAL ARCHITECTURE", BRAIN_DIR / "content" / "editorial_architecture.md", 15000),
        ("PILOT ARTICLE", PILOT_ARTICLE, 9000),
    ]
    rendered = []
    for title, path, limit in parts:
        if path.exists():
            rendered.append(f"===== {title} =====\n{load_text(path, limit)}")
    return "\n\n".join(rendered)


def schedule_for(sequence: int, strategy: dict[str, Any]) -> str:
    timezone_name = str(strategy.get("timezone") or "Europe/Madrid")
    tz = ZoneInfo(timezone_name)
    base = datetime.fromisoformat(str(strategy["start_local"])).replace(tzinfo=tz)
    cadence = [int(value) for value in strategy.get("cadence_days") or [3]]
    initial_published = max(0, int(strategy.get("initial_published_articles") or 0))

    # The initial families are released together by the scheduler seed. The
    # configured start_local is therefore the first publication slot AFTER the
    # launch set, so sequence initial_published + 1 must land exactly on base.
    if sequence <= initial_published:
        return base.isoformat()

    cursor = base
    for idx in range(initial_published + 1, sequence):
        cursor += timedelta(days=cadence[(idx - initial_published - 1) % len(cadence)])
    return cursor.isoformat()


def related_spec_ids(spec: dict[str, Any], specs: list[dict[str, Any]]) -> list[str]:
    same_arc = [row for row in specs if row.get("arc_id") == spec.get("arc_id") and row.get("spec_id") != spec.get("spec_id")]
    return [str(row["spec_id"]) for row in same_arc[:3]]


def compact_spec(spec: dict[str, Any]) -> dict[str, Any]:
    keep = (
        "spec_id", "sequence", "arc_id", "cluster", "knowledge_area", "editorial_pillar",
        "content_family", "angle", "title_seed_en", "title_seed_es", "title_seed_ca",
        "primary_keyword", "search_intent", "business_question", "thesis", "freshness",
        "related_case",
    )
    return {key: spec.get(key) for key in keep}


def build_prompt(spec: dict[str, Any], related: list[str], context: str) -> str:
    return f"""You are the senior website editor for SC-Analytics.

Write ONE finished SC-Analytics Knowledge article family in Spanish, English and Catalan.
This is not a draft, outline, LinkedIn post or case study. It must be publish-ready.

The website layout is already fixed. Your job is the editorial content only.

CANONICAL ARTICLE SPEC
{json.dumps(compact_spec(spec), ensure_ascii=False, indent=2)}

RELATED ARTICLE IDS
{json.dumps(related, ensure_ascii=False)}

NON-NEGOTIABLE EDITORIAL RULES
- Business-first, sober, specific, useful and commercially intelligent without sounding like sales copy.
- The reader should learn something useful even if they never contact SC-Analytics.
- Do not invent client work, company experience, project outcomes, benchmarks, market shares or statistics.
- Do not imply SC-Analytics has implemented a technology unless the spec explicitly says so. This bank excludes case/project-proof articles.
- Avoid time-sensitive product/version claims unless they are structurally durable. Technology comparisons should focus on decision criteria, operating model, architecture and trade-offs.
- No generic AI hype. No textbook introductions. Start with a substantive observation.
- Every article must contain a concrete operating scenario, but it must be explicitly generic/illustrative rather than a claimed client case.
- Explain trade-offs, limitations and when the proposed approach is NOT appropriate.
- Use selective **bold** emphasis as scanning anchors: normally 1-3 short bold phrases per section. Never bold whole paragraphs.
- Body should be approximately 750-1150 words PER LANGUAGE.
- Use 4 body sections after the opening context. Section headings must be short.
- The body format for every language is plain Markdown:
  opening paragraphs
  blank line
  **Section heading**
  paragraphs
  blank line
  **Section heading**
  paragraphs...
- Do not include H1, HTML, tables, metadata labels, CTA blocks or the 30-second summary inside body.
- Titles must be fast to understand and visually compact. Prefer <= 70 characters where natural.
- The Spanish, English and Catalan versions must sound native. Do not translate literally.
- Search optimization must never produce keyword stuffing or awkward titles.
- Excerpt: 1-2 concise sentences.
- quick: exactly 3 short hooks, each understandable without explanatory text below it.
- business_title: one strong implication sentence.
- business_steps: exactly 3 short cause -> decision -> result concepts that visually form a sequence.
- section_titles: exactly 4 short display titles matching the four body sections.
- SEO title should generally stay <= 60 characters where possible.
- SEO description should generally be 120-160 characters.
- SEO keywords: 3-6 natural phrases including the primary query and close semantic variants.

CONTENT FAMILY
Use the narrative logic of: {spec.get("content_family")}.
Angle: {spec.get("angle")}.
Search intent: {spec.get("search_intent")}.
Primary SEO query: {spec.get("primary_keyword")}.

Return VALID JSON ONLY with exactly this shape:
{{
  "slug": "stable-kebab-case-English-slug",
  "variants": {{
    "es": {{
      "title": "...",
      "excerpt": "...",
      "quick": ["...", "...", "..."],
      "section_titles": ["...", "...", "...", "..."],
      "business_title": "...",
      "business_steps": ["...", "...", "..."],
      "body": "...",
      "seo_title": "...",
      "seo_description": "...",
      "seo_keywords": ["...", "...", "..."],
      "tags": ["...", "...", "..."]
    }},
    "en": {{ same keys }},
    "ca": {{ same keys }}
  }}
}}

EDITORIAL REFERENCE
{context}
"""


def validate_variant(language: str, variant: dict[str, Any]) -> list[str]:
    issues: list[str] = []
    required = ("title", "excerpt", "quick", "section_titles", "business_title", "business_steps", "body", "seo_title", "seo_description", "seo_keywords", "tags")
    for key in required:
        if key not in variant or variant[key] in ("", None, []):
            issues.append(f"{language}: missing {key}")

    quick = variant.get("quick") or []
    if not isinstance(quick, list) or len(quick) != 3:
        issues.append(f"{language}: quick must contain exactly 3 hooks")

    section_titles = variant.get("section_titles") or []
    if not isinstance(section_titles, list) or len(section_titles) != 4:
        issues.append(f"{language}: section_titles must contain exactly 4 titles")

    steps = variant.get("business_steps") or []
    if not isinstance(steps, list) or len(steps) != 3:
        issues.append(f"{language}: business_steps must contain exactly 3 steps")

    body = str(variant.get("body") or "")
    wc = words(body)
    if wc < 620:
        issues.append(f"{language}: body too short ({wc} words)")
    if wc > 1450:
        issues.append(f"{language}: body too long ({wc} words)")

    headings = re.findall(r"(?m)^\*\*[^*\n]+\*\*\s*$", body)
    if len(headings) != 4:
        issues.append(f"{language}: expected exactly 4 standalone bold section headings, found {len(headings)}")

    bolds = re.findall(r"\*\*[^*\n]+\*\*", body)
    if len(bolds) < 8:
        issues.append(f"{language}: too few selective bold anchors ({len(bolds)})")

    lower = f"{variant.get('title','')} {body}".lower()
    for phrase in BANNED_PHRASES:
        if phrase in lower:
            issues.append(f"{language}: banned phrase '{phrase}'")
    for phrase in CASE_LANGUAGE:
        if phrase in lower:
            issues.append(f"{language}: implies unverified client experience '{phrase}'")

    seo_description = str(variant.get("seo_description") or "")
    if len(seo_description) < 90 or len(seo_description) > 190:
        issues.append(f"{language}: SEO description length {len(seo_description)}")

    for hook in quick if isinstance(quick, list) else []:
        if len(str(hook)) > 105:
            issues.append(f"{language}: quick hook too long")

    return issues


def validate_article(data: dict[str, Any], spec: dict[str, Any]) -> list[str]:
    issues: list[str] = []
    variants = data.get("variants")
    if not isinstance(variants, dict):
        return ["missing variants object"]
    for language in LANGUAGES:
        variant = variants.get(language)
        if not isinstance(variant, dict):
            issues.append(f"missing {language} variant")
            continue
        issues.extend(validate_variant(language, variant))

    titles = [str((variants.get(lang) or {}).get("title") or "").strip().lower() for lang in LANGUAGES]
    if any(not title for title in titles):
        issues.append("one or more empty titles")
    if spec.get("content_family") == "case_project_proof":
        issues.append("case_project_proof is forbidden in Knowledge bank")
    return issues


def article_path(output_dir: Path, spec: dict[str, Any]) -> Path:
    stable_slug = slugify(str(spec.get("title_seed_en") or spec["spec_id"]))
    return output_dir / f"{int(spec['sequence']):03d}-{stable_slug}.json"


def generate_one(
    spec: dict[str, Any],
    *,
    specs: list[dict[str, Any]],
    output_dir: Path,
    context: str,
    profile: str,
    overwrite: bool,
) -> dict[str, Any]:
    path = article_path(output_dir, spec)
    if path.exists() and not overwrite:
        try:
            existing = json.loads(path.read_text(encoding="utf-8"))
            issues = validate_article(existing, spec)
            if not issues:
                return {"spec_id": spec["spec_id"], "status": "skipped", "path": str(path)}
        except Exception:
            pass

    related = related_spec_ids(spec, specs)
    prompt = build_prompt(spec, related, context)
    last_issues: list[str] = []
    last_error = ""

    for attempt in range(1, 4):
        try:
            llm = get_llm(profile=profile)  # fresh client per worker
            data = llm.json(
                "You are SC-Analytics' senior editorial writer. Produce native, publish-ready multilingual website articles. Return JSON only.",
                prompt if attempt == 1 else prompt + "\n\nPREVIOUS VALIDATION ISSUES TO FIX:\n- " + "\n- ".join(last_issues),
            )
            if not isinstance(data, dict):
                last_issues = ["model output is not an object"]
                continue
            issues = validate_article(data, spec)
            if issues:
                last_issues = issues
                continue

            stable_slug = slugify(str(spec.get("title_seed_en") or data.get("slug") or spec["spec_id"]))
            payload = {
                "schema_version": 1,
                "spec_id": spec["spec_id"],
                "sequence": spec["sequence"],
                "arc_id": spec.get("arc_id"),
                "slug": stable_slug,
                "scheduled_at": None,
                "knowledge_area": spec.get("knowledge_area"),
                "cluster": spec.get("cluster"),
                "editorial_pillar": spec.get("editorial_pillar"),
                "content_family": spec.get("content_family"),
                "angle": spec.get("angle"),
                "primary_keyword": spec.get("primary_keyword"),
                "search_intent": spec.get("search_intent"),
                "freshness": spec.get("freshness"),
                "related_case": spec.get("related_case") or "",
                "related_specs": related,
                "variants": data["variants"],
            }
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            return {"spec_id": spec["spec_id"], "status": "generated", "path": str(path)}
        except (LLMError, Exception) as exc:
            last_error = str(exc)
            if attempt < 3:
                time.sleep(min(20, 3 * attempt))
                continue

    return {
        "spec_id": spec["spec_id"],
        "status": "failed",
        "issues": last_issues,
        "error": last_error,
        "path": str(path),
    }


def apply_schedule(output_dir: Path, catalog: dict[str, Any]) -> None:
    strategy = catalog["publication_strategy"]
    for spec in catalog["specs"]:
        path = article_path(output_dir, spec)
        if not path.exists():
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        data["scheduled_at"] = schedule_for(int(spec["sequence"]), strategy)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def build_manifest(output_dir: Path, catalog: dict[str, Any]) -> dict[str, Any]:
    articles = []
    failures = []
    for spec in catalog["specs"]:
        path = article_path(output_dir, spec)
        if not path.exists():
            failures.append({"spec_id": spec["spec_id"], "reason": "missing"})
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            issues = validate_article(data, spec)
            if issues:
                failures.append({"spec_id": spec["spec_id"], "reason": issues})
                continue
            try:
                manifest_path = path.resolve().relative_to(ROOT.resolve())
            except ValueError:
                manifest_path = path.resolve()

            articles.append({
                "spec_id": data["spec_id"],
                "sequence": data["sequence"],
                "slug": data["slug"],
                "scheduled_at": data.get("scheduled_at"),
                "knowledge_area": data.get("knowledge_area"),
                "content_family": data.get("content_family"),
                "freshness": data.get("freshness"),
                "path": str(manifest_path),
            })
        except Exception as exc:
            failures.append({"spec_id": spec["spec_id"], "reason": str(exc)})

    manifest = {
        "schema_version": 1,
        "expected": len(catalog["specs"]),
        "valid": len(articles),
        "failed": len(failures),
        "articles": sorted(articles, key=lambda row: row["sequence"]),
        "failures": failures,
        "generated_at": datetime.now().astimezone().isoformat(),
    }
    (output_dir / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest


def validate_catalog(catalog: dict[str, Any]) -> list[dict[str, Any]]:
    specs = list(catalog.get("specs") or [])
    if len(specs) != 200:
        raise ValueError(f"Knowledge catalog must contain exactly 200 specs; found {len(specs)}")

    seen_ids: set[str] = set()
    seen_slugs: dict[str, str] = {}
    seen_titles: dict[str, str] = {}
    seen_keywords: dict[str, str] = {}

    for spec in specs:
        spec_id = str(spec.get("spec_id") or "")
        if not spec_id or spec_id in seen_ids:
            raise ValueError(f"Duplicate or empty spec_id: {spec_id!r}")
        seen_ids.add(spec_id)

        if spec.get("content_family") == "case_project_proof":
            raise ValueError(f"{spec_id}: case_project_proof is excluded from the website Knowledge bank")

        stable_slug = slugify(str(spec.get("title_seed_en") or spec_id))
        normalized_title = re.sub(r"[^a-z0-9]+", " ", str(spec.get("title_seed_en") or "").lower()).strip()
        keyword = re.sub(r"\s+", " ", str(spec.get("primary_keyword") or "").lower()).strip()

        if stable_slug in seen_slugs:
            raise ValueError(f"Slug collision: {spec_id} and {seen_slugs[stable_slug]} -> {stable_slug}")
        seen_slugs[stable_slug] = spec_id

        if normalized_title in seen_titles:
            raise ValueError(f"Title collision: {spec_id} and {seen_titles[normalized_title]}")
        seen_titles[normalized_title] = spec_id

        if keyword and keyword in seen_keywords:
            raise ValueError(f"Primary keyword collision: {spec_id} and {seen_keywords[keyword]} -> {keyword}")
        if keyword:
            seen_keywords[keyword] = spec_id

    sequences = sorted(int(spec.get("sequence") or 0) for spec in specs)
    if sequences != list(range(1, 201)):
        raise ValueError("Knowledge catalog sequences must be exactly 1..200")

    return specs


def cleanup_orphans(output_dir: Path, specs: list[dict[str, Any]]) -> list[str]:
    expected = {article_path(output_dir, spec).resolve() for spec in specs}
    removed: list[str] = []
    if not output_dir.exists():
        return removed
    for candidate in output_dir.glob("*.json"):
        if candidate.name == "manifest.json":
            continue
        if candidate.resolve() not in expected:
            removed.append(str(candidate))
            candidate.unlink()
    return removed

def main() -> int:
    parser = argparse.ArgumentParser(description="Materialize the SC-Analytics 200-article Knowledge bank.")
    parser.add_argument("--catalog", type=Path, default=DEFAULT_CATALOG)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--workers", type=int, default=6)
    parser.add_argument("--profile", choices=("fast", "balanced", "high"), default="balanced")
    parser.add_argument("--max", type=int, default=0)
    parser.add_argument("--only", default="")
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--validate-only", action="store_true")
    args = parser.parse_args()

    catalog = json.loads(args.catalog.read_text(encoding="utf-8"))
    try:
        specs = validate_catalog(catalog)
    except ValueError as exc:
        raise SystemExit(str(exc)) from exc

    args.output.mkdir(parents=True, exist_ok=True)
    removed = cleanup_orphans(args.output, specs)
    if removed:
        print(json.dumps({"removed_orphan_articles": len(removed), "paths": removed}, ensure_ascii=False), flush=True)

    if args.only:
        requested = {value.strip() for value in args.only.split(",") if value.strip()}
        specs_to_run = [spec for spec in specs if spec.get("spec_id") in requested]
    else:
        specs_to_run = specs[: args.max] if args.max > 0 else specs

    if args.validate_only:
        apply_schedule(args.output, catalog)
        manifest = build_manifest(args.output, catalog)
        print(json.dumps({
            "valid": manifest["valid"],
            "failed": manifest["failed"],
            "failures": manifest["failures"],
        }, indent=2, ensure_ascii=False))
        return 0 if manifest["failed"] == 0 else 1

    if not os.environ.get("OPENAI_API_KEY"):
        raise SystemExit("OPENAI_API_KEY is required to materialize the article bank.")

    context = editorial_context()
    results = []
    workers = max(1, min(args.workers, 10))

    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {
            pool.submit(
                generate_one,
                spec,
                specs=specs,
                output_dir=args.output,
                context=context,
                profile=args.profile,
                overwrite=args.overwrite,
            ): spec
            for spec in specs_to_run
        }
        for future in as_completed(futures):
            result = future.result()
            results.append(result)
            print(json.dumps(result, ensure_ascii=False), flush=True)

    apply_schedule(args.output, catalog)
    manifest = build_manifest(args.output, catalog)
    summary = {
        "requested": len(specs_to_run),
        "generated": sum(1 for row in results if row["status"] == "generated"),
        "skipped": sum(1 for row in results if row["status"] == "skipped"),
        "failed_this_run": sum(1 for row in results if row["status"] == "failed"),
        "bank_valid": manifest["valid"],
        "bank_failed": manifest["failed"],
    }
    print(json.dumps(summary, indent=2), flush=True)
    return 0 if summary["failed_this_run"] == 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())
