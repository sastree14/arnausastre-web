from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, RefResolver

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_DIR = ROOT / "schemas"


def validate_against_schema(payload: dict[str, Any], schema_name: str) -> None:
    path = SCHEMA_DIR / schema_name
    schema = json.loads(path.read_text(encoding="utf-8"))
    resolver = RefResolver(base_uri=SCHEMA_DIR.as_uri() + "/", referrer=schema)
    validator = Draft202012Validator(schema, resolver=resolver)
    errors = sorted(validator.iter_errors(payload), key=lambda e: list(e.path))
    if errors:
        message = "; ".join(f"{'.'.join(map(str, e.path)) or '<root>'}: {e.message}" for e in errors[:10])
        raise ValueError(f"Schema validation failed for {schema_name}: {message}")
