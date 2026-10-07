from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BANK = ROOT / "content" / "article-bank"
# Scanner scope: editorial prose only; domain terminology is intentionally allowed.

PATTERNS = {
    "es": [
        r"(?<!/)\bi\b(?!/)", r"\bshould\b", r"\bthis\b", r"\bthat\b",
        r"\bwithout\b", r"\bwhen\b", r"\bwhere\b", r"\balso\b",
        r"\bdoes\b", r"\bwill\b",
    ],
    "ca": [
        r"\bsin embargo\b", r"\bpor lo tanto\b", r"\bpor tanto\b",
        r"\bpero\b", r"\baunque\b", r"\bcuando\b", r"\btambién\b",
        r"\bdebe\b", r"\bpuede\b",
    ],
    "en": [
        r"\bsin embargo\b", r"\bpor lo tanto\b", r"\bpero\b", r"\baunque\b",
        r"\bcuando\b", r"\btambién\b", r"\bperò\b", r"\btambé\b",
        r"\bquan\b", r"\bperquè\b",
    ],
}

FIELDS = ("excerpt", "business_title", "seo_description", "body")


def flatten(variant: dict) -> str:
    parts = [str(variant.get(field) or "") for field in FIELDS]
    for field in ("quick", "section_titles", "business_steps"):
        value = variant.get(field) or []
        if isinstance(value, list):
            parts.extend(str(item) for item in value)
    return "\n".join(parts)


def context(text: str, start: int, end: int, radius: int = 80) -> str:
    left = max(0, start - radius)
    right = min(len(text), end + radius)
    return re.sub(r"\s+", " ", text[left:right]).strip()


def main() -> int:
    findings = defaultdict(list)
    for path in sorted(BANK.glob("[0-9][0-9][0-9]-*.json")):
        article = json.loads(path.read_text(encoding="utf-8"))
        spec_id = str(article.get("spec_id") or path.stem)
        for lang, patterns in PATTERNS.items():
            variant = (article.get("variants") or {}).get(lang)
            if not isinstance(variant, dict):
                continue
            text = flatten(variant)
            for pattern in patterns:
                for match in re.finditer(pattern, text, flags=re.IGNORECASE):
                    findings[lang].append({
                        "spec_id": spec_id,
                        "pattern": pattern,
                        "match": match.group(0),
                        "context": context(text, match.start(), match.end()),
                    })

    payload = {
        "counts": {lang: len(findings[lang]) for lang in PATTERNS},
        "findings": {lang: findings[lang] for lang in PATTERNS},
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
