from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BANK = ROOT / "content" / "article-bank"
LANGUAGES = ("es", "ca", "en")
WORD_RE = re.compile(r"\b[\wÀ-ÿ'-]+\b")

LANGUAGE_LEAKS = {
    "es": (
        " how easy is ",
        " should be ",
        " in order to ",
        " this means that ",
        " the best way ",
    ),
    "ca": (
        " de manera que el ",
        " sin embargo ",
        " por lo tanto ",
        " this means that ",
        " the best way ",
    ),
    "en": (
        " por lo tanto ",
        " sin embargo ",
        " en cambio ",
        " per tant ",
        " tanmateix ",
    ),
}


def words(text: str) -> int:
    return len(WORD_RE.findall(text or ""))


def headings(body: str) -> list[str]:
    return re.findall(r"(?m)^\*\*([^*\n]+)\*\*\s*$", body or "")


def paragraphs(body: str) -> list[str]:
    return [part.strip() for part in re.split(r"\n\s*\n", body or "") if part.strip()]


def token_set(text: str) -> set[str]:
    return {
        token.lower()
        for token in WORD_RE.findall(text or "")
        if len(token) >= 4
    }


def similarity(left: str, right: str) -> float:
    a, b = token_set(left), token_set(right)
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def main() -> int:
    files = sorted(BANK.glob("[0-9][0-9][0-9]-*.json"))
    errors: list[str] = []
    warnings: list[str] = []
    counts = Counter()

    if len(files) != 200:
        errors.append(f"Expected 200 canonical articles, found {len(files)}")

    for path in files:
        article = json.loads(path.read_text(encoding="utf-8"))
        spec_id = str(article.get("spec_id") or path.stem)
        variants = article.get("variants") or {}

        for language in LANGUAGES:
            variant = variants.get(language)
            if not isinstance(variant, dict):
                errors.append(f"{spec_id}: missing {language} variant")
                continue

            body = str(variant.get("body") or "")
            section_titles = variant.get("section_titles") or []
            quick = variant.get("quick") or []
            steps = variant.get("business_steps") or []
            body_headings = headings(body)
            wc = words(body)
            prose = [p for p in paragraphs(body) if not re.fullmatch(r"\*\*[^*\n]+\*\*", p)]
            opening = prose[0] if prose else ""
            closing = prose[-1] if prose else ""
            business_title = str(variant.get("business_title") or "")
            excerpt = str(variant.get("excerpt") or "")

            counts[f"{language}_words"] += wc
            counts[f"{language}_articles"] += 1

            if not 1 <= len(quick) <= 8:
                errors.append(f"{spec_id}/{language}: quick count {len(quick)} outside 1-8")
            if not 3 <= len(section_titles) <= 6:
                errors.append(f"{spec_id}/{language}: section count {len(section_titles)} outside 3-6")
            if len(body_headings) != len(section_titles):
                errors.append(
                    f"{spec_id}/{language}: {len(body_headings)} body headings != {len(section_titles)} section_titles"
                )
            if not 2 <= len(steps) <= 4:
                errors.append(f"{spec_id}/{language}: business_steps count {len(steps)} outside 2-4")

            if wc < 520:
                warnings.append(f"{spec_id}/{language}: short body ({wc} words)")
            if wc > 1200:
                warnings.append(f"{spec_id}/{language}: long body ({wc} words)")

            if opening and words(opening) > 125:
                warnings.append(f"{spec_id}/{language}: long opening ({words(opening)} words)")
            if closing and words(closing) > 150:
                warnings.append(f"{spec_id}/{language}: long closing ({words(closing)} words)")
            if opening and closing and similarity(opening, closing) >= 0.48:
                warnings.append(f"{spec_id}/{language}: opening/closing too similar ({similarity(opening, closing):.2f})")

            if business_title:
                business_words = words(business_title)
                if business_words < 5 or business_words > 24:
                    warnings.append(f"{spec_id}/{language}: business thesis length {business_words} words")
                if excerpt and similarity(excerpt, business_title) >= 0.62:
                    warnings.append(f"{spec_id}/{language}: excerpt/business thesis too similar ({similarity(excerpt, business_title):.2f})")

            quick_lengths = [words(str(item)) for item in quick]
            if any(length > 12 for length in quick_lengths):
                warnings.append(f"{spec_id}/{language}: long quick item {quick_lengths}")

            if str(article.get("content_family") or "") == "point_of_view_contrarian" and quick:
                first = str(quick[0])
                second = str(quick[1]) if len(quick) > 1 else ""
                display = first if words(first) >= 5 else f"{first}: {second}" if second else first
                if not 5 <= words(display) <= 14:
                    warnings.append(f"{spec_id}/{language}: statement thesis length {words(display)} words")

            seo_title = str(variant.get("seo_title") or "")
            seo_description = str(variant.get("seo_description") or "")
            if not seo_title:
                errors.append(f"{spec_id}/{language}: missing seo_title")
            if not seo_description:
                errors.append(f"{spec_id}/{language}: missing seo_description")
            if len(seo_title) > 70:
                warnings.append(f"{spec_id}/{language}: long seo_title ({len(seo_title)} chars)")
            if not 90 <= len(seo_description) <= 190:
                warnings.append(f"{spec_id}/{language}: seo_description length {len(seo_description)}")

            normalized = f" {body.lower()} "
            for phrase in LANGUAGE_LEAKS[language]:
                if phrase in normalized:
                    errors.append(f"{spec_id}/{language}: probable language leak {phrase.strip()!r}")

        es_kw = (variants.get("es") or {}).get("seo_keywords") or []
        ca_kw = (variants.get("ca") or {}).get("seo_keywords") or []
        en_kw = (variants.get("en") or {}).get("seo_keywords") or []
        if es_kw == ca_kw == en_kw:
            counts["identical_keyword_arrays"] += 1

    summary = {
        "files": len(files),
        "errors": len(errors),
        "warnings": len(warnings),
        "average_words": {
            lang: round(counts[f"{lang}_words"] / max(1, counts[f"{lang}_articles"]))
            for lang in LANGUAGES
        },
        "identical_keyword_arrays": counts["identical_keyword_arrays"],
        "error_examples": errors[:30],
        "warning_examples": warnings[:80],
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
