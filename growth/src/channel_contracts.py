from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[1]
CONTRACT_PATH = ROOT / "schemas" / "channel_contracts.yml"


class ChannelContractError(RuntimeError):
    pass


@lru_cache(maxsize=1)
def load_channel_contracts() -> dict[str, Any]:
    payload = yaml.safe_load(CONTRACT_PATH.read_text(encoding="utf-8")) or {}
    contracts = payload.get("contracts")
    if not isinstance(contracts, dict):
        raise ChannelContractError("Invalid channel contract file")
    return payload


def get_channel_contract(output_type: str) -> dict[str, Any]:
    key = str(output_type or "").strip()
    contracts = load_channel_contracts().get("contracts") or {}
    contract = contracts.get(key)
    if not isinstance(contract, dict):
        raise ChannelContractError(f"Unknown channel output type: {key}")
    return dict(contract)


def channel_contract_prompt(output_type: str) -> str:
    contract = get_channel_contract(output_type)
    length = contract.get("length") or {}
    required = contract.get("required_components") or []
    parts = [
        f"Output type: {output_type}",
        f"Purpose: {contract.get('purpose', '')}",
        f"Technical depth: {contract.get('technical_depth', '')}",
        f"Commercial intensity: {contract.get('commercial_intensity', '')}",
        "Required narrative components: " + ", ".join(str(x) for x in required),
    ]
    if length:
        parts.append(
            "Length: target "
            f"{length.get('target_min')}-{length.get('target_max')} {length.get('unit')}; "
            f"hard range {length.get('hard_min')}-{length.get('hard_max')}."
        )
    if contract.get("requires_project_source"):
        parts.append("A verified portfolio project source is mandatory.")
    if contract.get("project_depth_target"):
        parts.append(f"Project depth target: {contract.get('project_depth_target')}.")
    if contract.get("technical_proof_target"):
        parts.append(f"Technical proof target: {contract.get('technical_proof_target')}.")
    return "\n".join(parts)


def draft_contract_issues(draft: dict[str, Any], output_type: str) -> list[str]:
    contract = get_channel_contract(output_type)
    title = str(draft.get("title") or "").strip()
    body = str(draft.get("body") or "").strip()
    issues: list[str] = []
    if not title:
        issues.append("missing title")
    if not body:
        issues.append("missing body")
        return issues

    length = contract.get("length") or {}
    if length:
        unit = str(length.get("unit") or "")
        hard_min = int(length.get("hard_min") or 0)
        hard_max = int(length.get("hard_max") or 0)
        value = len(body) if unit == "characters" else len([x for x in body.split() if x.strip()])
        if hard_min and value < hard_min:
            issues.append(f"{output_type} is {value} {unit}; hard minimum is {hard_min}")
        if hard_max and value > hard_max:
            issues.append(f"{output_type} is {value} {unit}; hard maximum is {hard_max}")
    return issues


def default_channel(output_type: str) -> str:
    return str(get_channel_contract(output_type).get("default_channel") or "")
