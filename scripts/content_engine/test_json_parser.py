"""Local tests for the JSON extraction robustness layer.

Run from the repo root:
  python scripts/content_engine/test_json_parser.py

Tests _strip_code_fences and _extract_json_object with various malformed
responses that Gemini has been observed to produce. Does NOT call the API.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from write_article import _extract_json_object, _strip_code_fences, _try_parse

VALID_JSON = '{"slug": "test-slug", "titleEn": "Test", "bodyEn": "Hello world."}'


CASES: list[tuple[str, str, str | None]] = [
    (
        "clean JSON",
        VALID_JSON,
        VALID_JSON,
    ),
    (
        "JSON wrapped in ```json fence",
        f"```json\n{VALID_JSON}\n```",
        VALID_JSON,
    ),
    (
        "JSON wrapped in ``` fence",
        f"```\n{VALID_JSON}\n```",
        VALID_JSON,
    ),
    (
        "text before JSON",
        f"Here is the article:\n\n{VALID_JSON}",
        VALID_JSON,
    ),
    (
        "text after JSON",
        f"{VALID_JSON}\n\nI hope this meets the requirements.",
        VALID_JSON,
    ),
    (
        "checklist text before JSON (the actual failure mode)",
        (
            "[ ] Title makes a specific claim ✓\n"
            "[ ] Excerpt states argument ✓\n"
            "[ ] Concrete scenario present ✓\n\n"
            + VALID_JSON
        ),
        VALID_JSON,
    ),
    (
        "checklist text AND code fence",
        (
            "Internal verification complete.\n\n"
            "```json\n"
            + VALID_JSON
            + "\n```\n\n"
            "All editorial requirements satisfied."
        ),
        VALID_JSON,
    ),
    (
        "JSON with nested objects",
        '{"outer": {"inner": "value"}, "list": [1, 2, 3]}',
        '{"outer": {"inner": "value"}, "list": [1, 2, 3]}',
    ),
    (
        "JSON with braces inside strings",
        '{"bodyEn": "The formula is {x + y}.", "slug": "test"}',
        '{"bodyEn": "The formula is {x + y}.", "slug": "test"}',
    ),
    (
        "completely invalid — no JSON object",
        "Sorry, I cannot produce this article.",
        None,
    ),
]


def run_tests() -> bool:
    passed = 0
    failed = 0

    for name, raw_input, expected_json in CASES:
        # Stage 1: strip fences + direct parse
        cleaned = _strip_code_fences(raw_input)
        result = _try_parse(cleaned)

        # Stage 2: brace extraction
        if result is None:
            extracted = _extract_json_object(cleaned) or _extract_json_object(raw_input)
            if extracted:
                result = _try_parse(extracted)

        # Evaluate
        if expected_json is None:
            # We expect failure
            ok = result is None
        else:
            # We expect the JSON to parse to the same object
            import json
            try:
                expected_obj = json.loads(expected_json)
                ok = result == expected_obj
            except Exception:
                ok = False

        status = "PASS" if ok else "FAIL"
        if ok:
            passed += 1
        else:
            failed += 1
            print(f"  [{status}] {name}")
            print(f"         input:    {raw_input[:80]!r}")
            print(f"         got:      {result!r}")
            print(f"         expected: {expected_json!r}")
            continue

        print(f"  [{status}] {name}")

    print(f"\n{passed}/{passed + failed} tests passed.")
    return failed == 0


if __name__ == "__main__":
    print("=== JSON parser robustness tests ===\n")
    success = run_tests()
    sys.exit(0 if success else 1)
