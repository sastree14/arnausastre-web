"""Local tests for the JSON extraction robustness layer.

Run from the repo root:
  python scripts/content_engine/test_json_parser.py

Tests _extract_all_json_objects, _best_json_from_text, and _has_required_fields
with the malformed responses that Gemini has been observed to produce.
Does NOT call the API.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from write_article import (
    BASE_REQUIRED_FIELDS,
    _best_json_from_text,
    _extract_all_json_objects,
    _has_required_fields,
    _strip_code_fences,
    _try_parse,
)

# Minimal valid article JSON (all required fields present)
ARTICLE = {
    "slug": "test-slug",
    "titleEn": "Test Title",
    "titleEs": "Título de prueba",
    "date": "2026-01-01",
    "readingTime": 5,
    "tagsEn": ["Tag1", "Tag2", "Tag3"],
    "tagsEs": ["Etiqueta1", "Etiqueta2", "Etiqueta3"],
    "excerptEn": "Test excerpt.",
    "excerptEs": "Extracto de prueba.",
    "angle": "Test angle.",
    "challenge": "Forecasting",
    "audience": "CEO",
    "level": "Strategic",
    "bodyEn": "Body content in English.",
    "bodyEs": "Contenido del cuerpo en español.",
}
ARTICLE_JSON = json.dumps(ARTICLE)

# Checklist object that Gemini sometimes emits before the article JSON
CHECKLIST_OBJ = json.dumps({
    "verification": {
        "title_check": "pass",
        "excerpt_check": "pass",
        "scenario_check": "pass",
    }
})

CASES: list[tuple[str, str, bool]] = [
    # (name, raw_input, expect_success)
    ("clean JSON", ARTICLE_JSON, True),
    ("JSON in ```json fence", f"```json\n{ARTICLE_JSON}\n```", True),
    ("JSON in ``` fence", f"```\n{ARTICLE_JSON}\n```", True),
    ("text before JSON", f"Here is the article:\n\n{ARTICLE_JSON}", True),
    ("text after JSON", f"{ARTICLE_JSON}\n\nI hope this meets requirements.", True),
    (
        "checklist text before JSON (real failure mode)",
        f"[✓] Title check passed\n[✓] Scenario present\n[✓] Trade-off present\n\n{ARTICLE_JSON}",
        True,
    ),
    (
        "checklist object before article object (Gemini emits two JSON objects)",
        f"{CHECKLIST_OBJ}\n\n{ARTICLE_JSON}",
        True,
    ),
    (
        "code fence + checklist + JSON",
        f"Internal verification complete.\n\n```json\n{ARTICLE_JSON}\n```\n\nAll checks passed.",
        True,
    ),
    (
        "JSON with braces inside strings",
        json.dumps({**ARTICLE, "bodyEn": "The formula is {x + y} where x > 0."}),
        True,
    ),
    (
        "JSON with escaped quotes in strings",
        json.dumps({**ARTICLE, "bodyEn": 'He said "this is important" and left.'}),
        True,
    ),
    (
        "JSON missing tail fields (angle/challenge/audience/level cut off)",
        # Simulates truncation: article JSON without the tail fields
        json.dumps({k: v for k, v in ARTICLE.items() if k not in ("angle", "challenge", "audience", "level")}),
        False,  # should fail _has_required_fields — we expect None from _best_json_from_text
    ),
    (
        "completely invalid — no JSON at all",
        "Sorry, I cannot produce this article due to content restrictions.",
        False,
    ),
    (
        "only checklist object, no article",
        CHECKLIST_OBJ,
        False,
    ),
]


def run_tests() -> bool:
    passed = 0
    failed = 0

    for name, raw_input, expect_success in CASES:
        result = _best_json_from_text(raw_input)
        has_fields = result is not None and _has_required_fields(result)

        if expect_success:
            ok = has_fields
        else:
            # We expect either None or a JSON missing required fields
            ok = not has_fields

        status = "PASS" if ok else "FAIL"
        if ok:
            passed += 1
            print(f"  [PASS] {name}")
        else:
            failed += 1
            print(f"  [FAIL] {name}")
            print(f"         input (first 120 chars): {raw_input[:120]!r}")
            if result is not None:
                missing = [f for f in BASE_REQUIRED_FIELDS if f not in result or result[f] in (None, "")]
                print(f"         got JSON but missing fields: {missing}")
            else:
                print(f"         got: None")

    print(f"\n{passed}/{passed + failed} tests passed.")
    return failed == 0


if __name__ == "__main__":
    print("=== JSON parser robustness tests ===\n")
    success = run_tests()
    sys.exit(0 if success else 1)
