from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[1]
SYSTEM_PATH = ROOT / "schemas" / "visual_system.yml"


class VisualSystemError(RuntimeError):
    pass


@lru_cache(maxsize=1)
def load_visual_system() -> dict[str, Any]:
    payload = yaml.safe_load(SYSTEM_PATH.read_text(encoding="utf-8")) or {}
    if not isinstance(payload, dict):
        raise VisualSystemError("visual_system.yml must contain an object")
    return payload


def visual_language(language: str) -> dict[str, Any]:
    key = str(language or "").upper()
    row = (load_visual_system().get("visual_languages") or {}).get(key)
    if not isinstance(row, dict):
        raise VisualSystemError(f"Unknown visual language: {language}")
    return dict(row)


def format_contract(format_key: str) -> dict[str, Any]:
    key = str(format_key or "").strip()
    row = (load_visual_system().get("format_contracts") or {}).get(key)
    if not isinstance(row, dict):
        raise VisualSystemError(f"Unknown visual format: {format_key}")
    return dict(row)


def format_layout(format_key: str, language: str) -> dict[str, Any]:
    row = ((load_visual_system().get("format_layouts") or {}).get(format_key) or {}).get(str(language).upper())
    if not isinstance(row, dict):
        raise VisualSystemError(f"No layout for {format_key}/{language}")
    return dict(row)


def presentation_contract(channel: str, format_key: str) -> dict[str, Any]:
    contracts = load_visual_system().get("channel_visual_contracts") or {}
    row = contracts.get(channel) or {}
    contract = row.get(format_key) or row.get("any_visual")
    if not isinstance(contract, dict):
        raise VisualSystemError(f"Unsupported channel/format combination: {channel}/{format_key}")
    return dict(contract)


def allowed_languages(format_key: str) -> list[str]:
    return [str(x) for x in format_contract(format_key).get("allowed_languages", [])]


def assert_language_allowed(format_key: str, language: str) -> None:
    if str(language).upper() not in allowed_languages(format_key):
        raise VisualSystemError(f"Visual language {language} is not allowed for {format_key}")


def chart_candidates(relationship: str) -> list[str]:
    row = (load_visual_system().get("chart_grammar") or {}).get(str(relationship or "").strip()) or []
    return [str(x) for x in row]


def connector_candidates(relationship: str) -> list[str]:
    row = ((load_visual_system().get("diagram_grammar") or {}).get("connector_semantics") or {}).get(str(relationship or "").strip()) or []
    return [str(x) for x in row]


def format_candidates(content_family: str) -> list[str]:
    row = (load_visual_system().get("format_selection") or {}).get(str(content_family or "").strip()) or []
    return [str(x) for x in row]


def auto_visual_language(content_family: str, format_key: str) -> str:
    family = str(content_family or "").strip()
    if format_key in {"architecture", "before_after"}:
        return "B" if family in {"decision_guide", "compare"} else "C"
    if family in {"point_of_view_contrarian", "explain_understand"}:
        return "A"
    if family in {"compare", "decision_guide", "transformation"}:
        return "B"
    if family in {"system_architecture", "diagnose", "failure_modes_mistakes"}:
        return "C"
    if family in {"evidence_measurement", "current_development_implication"}:
        return "D"
    return "B"
