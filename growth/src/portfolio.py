from __future__ import annotations

from datetime import datetime, timezone
from functools import lru_cache
import json
import os
from pathlib import Path
from typing import Any

import requests
import yaml
from jsonschema import Draft202012Validator

from .brain import load_brain
from .llm import get_llm
from .models import new_id


DEFAULT_PORTFOLIO_REPOSITORY = "sastree14/Portfolio_SC_Analytics"
DEFAULT_PORTFOLIO_REF = "main"
DEFAULT_EVIDENCE_KEYS = (
    "business_impact",
    "results",
    "architecture",
    "technical_decisions",
    "limitations",
)


class PortfolioError(RuntimeError):
    pass


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _repository() -> str:
    return os.environ.get("SC_PORTFOLIO_REPOSITORY", DEFAULT_PORTFOLIO_REPOSITORY).strip() or DEFAULT_PORTFOLIO_REPOSITORY


def _ref() -> str:
    return os.environ.get("SC_PORTFOLIO_REF", DEFAULT_PORTFOLIO_REF).strip() or DEFAULT_PORTFOLIO_REF


def _raw_url(path: str) -> str:
    clean = path.lstrip("/")
    return f"https://raw.githubusercontent.com/{_repository()}/{_ref()}/{clean}"


@lru_cache(maxsize=256)
def _fetch_text(path: str) -> str:
    response = requests.get(_raw_url(path), timeout=15)
    if response.status_code != 200:
        raise PortfolioError(f"Unable to load portfolio source {path}: HTTP {response.status_code}")
    return response.text


@lru_cache(maxsize=1)
def load_project_index() -> list[dict[str, Any]]:
    payload = yaml.safe_load(_fetch_text("catalog/projects.yml")) or {}
    projects = payload.get("projects") or []
    if not isinstance(projects, list):
        raise PortfolioError("Portfolio index is invalid: projects must be a list")
    return [dict(row) for row in projects if isinstance(row, dict)]


def _normalise_project_id(project_id: str) -> str:
    value = str(project_id or "").strip().upper()
    if not value:
        raise PortfolioError("project_id is required")
    if value.isdigit():
        value = f"SC-{int(value):02d}"
    if value.startswith("SC") and not value.startswith("SC-"):
        suffix = value.removeprefix("SC").lstrip("-")
        if suffix.isdigit():
            value = f"SC-{int(suffix):02d}"
    return value


def resolve_project(project_id: str) -> dict[str, Any]:
    target = _normalise_project_id(project_id)
    for row in load_project_index():
        if str(row.get("id") or "").upper() == target:
            resolved = dict(row)
            if not resolved.get("manifest"):
                path = str(resolved.get("path") or "")
                if path:
                    resolved["manifest"] = f"catalog/{path.rstrip('/').split('/')[-1]}.yml"
            return resolved
    raise PortfolioError(f"Unknown portfolio project: {target}")


@lru_cache(maxsize=64)
def load_project_manifest(project_id: str) -> dict[str, Any]:
    row = resolve_project(project_id)
    manifest_path = str(row.get("manifest") or "")
    if not manifest_path:
        raise PortfolioError(f"Project {row.get('id')} has no manifest path")
    manifest = yaml.safe_load(_fetch_text(manifest_path)) or {}
    if not isinstance(manifest, dict):
        raise PortfolioError(f"Invalid project manifest: {manifest_path}")
    if int(manifest.get("schema_version") or 0) != 2:
        raise PortfolioError(f"Project {row.get('id')} does not use Project Manifest v2")
    if str(manifest.get("id") or "").upper() != str(row.get("id") or "").upper():
        raise PortfolioError(f"Project manifest id mismatch for {row.get('id')}")
    manifest = dict(manifest)
    manifest["_manifest_path"] = manifest_path
    return manifest


def project_evidence_paths(project_id: str) -> dict[str, str]:
    manifest = load_project_manifest(project_id)
    evidence = manifest.get("evidence") or {}
    if not isinstance(evidence, dict):
        return {}
    return {str(k): str(v) for k, v in evidence.items() if v}


def load_project_evidence(
    project_id: str,
    *,
    evidence_keys: list[str] | tuple[str, ...] | None = None,
    max_chars_per_source: int = 12000,
) -> dict[str, dict[str, str]]:
    paths = project_evidence_paths(project_id)
    keys = tuple(DEFAULT_EVIDENCE_KEYS if evidence_keys is None else evidence_keys)
    result: dict[str, dict[str, str]] = {}
    for key in keys:
        path = paths.get(str(key))
        if not path:
            continue
        text = _fetch_text(path)
        result[str(key)] = {
            "path": path,
            "text": text[:max(1000, int(max_chars_per_source))],
        }
    return result


def build_project_source_bundle(
    project_id: str,
    *,
    evidence_keys: list[str] | tuple[str, ...] | None = None,
    max_chars_per_source: int = 12000,
) -> dict[str, Any]:
    row = resolve_project(project_id)
    manifest = load_project_manifest(project_id)
    readme_path = str((manifest.get("paths") or {}).get("readme") or "")
    readme = _fetch_text(readme_path)[:max(1000, int(max_chars_per_source))] if readme_path else ""
    evidence = load_project_evidence(
        project_id,
        evidence_keys=evidence_keys,
        max_chars_per_source=max_chars_per_source,
    )
    allowed_refs = {
        str(manifest.get("_manifest_path") or ""),
        readme_path,
        *[str(v) for v in (manifest.get("evidence") or {}).values() if v],
        str((manifest.get("visuals") or {}).get("primary") or ""),
        str((manifest.get("execution") or {}).get("primary") or ""),
    }
    allowed_refs.discard("")
    return {
        "repository": _repository(),
        "ref": _ref(),
        "project_id": str(manifest.get("id") or row.get("id")),
        "manifest": {k: v for k, v in manifest.items() if not str(k).startswith("_")},
        "manifest_path": str(manifest.get("_manifest_path") or ""),
        "readme": {"path": readme_path, "text": readme},
        "evidence": evidence,
        "allowed_source_refs": sorted(allowed_refs),
        "claim_policy": {
            "client_claim_allowed": bool((manifest.get("provenance") or {}).get("client_claim_allowed", False)),
            "evidence_class": str((manifest.get("provenance") or {}).get("evidence_class") or ""),
            "rule": "Do not convert public portfolio proof into a named client claim unless separate approved evidence explicitly allows it.",
        },
    }


def project_content_seed(
    project_id: str,
    *,
    family: str = "case_project_proof",
    angle: str = "business_value_and_implementation",
) -> dict[str, Any]:
    bundle = build_project_source_bundle(project_id, evidence_keys=())
    manifest = bundle["manifest"]
    technologies = [str(x) for x in (manifest.get("technologies") or []) if str(x).strip()]
    entities = [
        {"type": "project", "name": f"{manifest.get('id')} · {manifest.get('title')}", "role": "primary_source"}
    ]
    entities.extend({"type": "technology", "name": tech, "role": "implementation"} for tech in technologies[:8])
    return {
        "origin": "portfolio_project",
        "editorial_pillar": "projects_proof",
        "content_family": family,
        "angle": angle,
        "topic_entities": entities,
        "project_source": {
            "repository": bundle["repository"],
            "ref": bundle["ref"],
            "project_id": manifest.get("id"),
            "manifest_path": bundle["manifest_path"],
            "project_path": (manifest.get("paths") or {}).get("project"),
        },
        "documented_summary": str(manifest.get("summary") or ""),
        "designed_for": list(manifest.get("designed_for") or []),
        "why_it_matters": list(manifest.get("why_it_matters") or []),
        "technologies": technologies,
        "provenance": dict(manifest.get("provenance") or {}),
    }


def _canonical_schema() -> dict[str, Any]:
    path = Path(__file__).resolve().parents[1] / "schemas" / "canonical_content_object.schema.json"
    return json.loads(path.read_text(encoding="utf-8"))


def _validate_claim_refs(content_object: dict[str, Any], allowed_refs: set[str]) -> None:
    evidence = content_object.get("evidence") or {}
    claims = evidence.get("claims") or []
    for claim in claims:
        if not isinstance(claim, dict):
            continue
        if claim.get("source_type") != "portfolio_project":
            raise PortfolioError("Project-derived content may only use portfolio_project claims unless another approved source is added explicitly")
        ref = str(claim.get("source_ref") or "")
        if ref not in allowed_refs:
            raise PortfolioError(f"Claim uses an unapproved project source_ref: {ref}")


def create_project_content_object(
    project_id: str,
    *,
    family: str = "case_project_proof",
    angle: str = "business_value_and_implementation",
    target_buyer: str = "",
    evidence_keys: list[str] | tuple[str, ...] | None = None,
) -> dict[str, Any]:
    bundle = build_project_source_bundle(project_id, evidence_keys=evidence_keys)
    manifest = bundle["manifest"]
    brain = load_brain([
        "company/services.md",
        "company/positioning.md",
        "commercial/icp.md",
        "content/editorial_architecture.md",
        "content/canonical_content_model.md",
        "content/editorial_playbook.md",
        "content/portfolio_integration.md",
    ])
    llm = get_llm(high_reasoning=True)
    now = _utc_now()
    content_object_id = new_id("cco")
    result = llm.json(
        "You are the SC-Analytics senior content strategist. Build one canonical content object from verified portfolio evidence. Return JSON only.",
        f"""Create one Canonical Content Object for the portfolio project below.

Required editorial direction:
- editorial_pillar: projects_proof
- content_family: {family}
- angle: {angle}
- preferred target buyer: {target_buyer or 'infer from the documented business context'}

Commercial rule:
Lead with the buyer problem and business consequence. Technical depth proves credibility but must not dominate the executive narrative.

Evidence rule:
- Use ONLY facts contained in SOURCE_BUNDLE.
- Every factual claim in evidence.claims must use source_type=portfolio_project.
- source_ref must be one exact path from ALLOWED_SOURCE_REFS.
- Do not invent metrics, client results, technologies or implementation details.
- client_claim_allowed={bundle['claim_policy']['client_claim_allowed']}. If false, never describe the project as named client work or imply a client outcome.
- The public portfolio implementation is capability/implementation proof.

Return all fields required by the CanonicalContentObject schema:
content_object_id, status, origin, editorial_pillar, content_family, angle,
topic_entities, business_problem, business_question, thesis, key_points,
commercial_spine, evidence, primary_objective, secondary_objectives,
practical_takeaway, desired_reader_action, target_audience, industry_context,
funnel_stage, timeliness, why_now, valid_until, confidentiality,
language_context, risks_or_limits, output_hints, created_at, updated_at.

Use:
- content_object_id: {content_object_id}
- status: draft
- origin: portfolio_project
- created_at and updated_at: {now}
- confidentiality: public
- timeliness: evergreen unless the source itself is time-sensitive
- evidence.project_sources must reference repository {_repository()}, project_id {manifest.get('id')}, path {(manifest.get('paths') or {}).get('project')}
- commercial_spine.proof.type must be portfolio_project and source_ref must be {manifest.get('id')}
- public_sources and internal_sources should be empty arrays unless explicitly supplied (none are supplied here)
- recommended channels should prioritize executive discovery and proof; technical depth should point back to the portfolio.

ALLOWED_SOURCE_REFS:
{bundle['allowed_source_refs']}

SOURCE_BUNDLE:
{bundle}

BRAIN:
{brain}
""",
    )
    if not isinstance(result, dict):
        raise PortfolioError("LLM did not return a canonical content object")

    # Enforce source identity after generation.
    result["content_object_id"] = content_object_id
    result["origin"] = "portfolio_project"
    result["editorial_pillar"] = "projects_proof"
    result["content_family"] = family
    result["angle"] = angle
    result["created_at"] = str(result.get("created_at") or now)
    result["updated_at"] = str(result.get("updated_at") or now)
    result["status"] = str(result.get("status") or "draft")
    result["confidentiality"] = "public"

    evidence = dict(result.get("evidence") or {})
    evidence["project_sources"] = [{
        "repository": _repository(),
        "project_id": str(manifest.get("id") or ""),
        "path": str((manifest.get("paths") or {}).get("project") or ""),
    }]
    evidence["public_sources"] = []
    evidence["internal_sources"] = []
    result["evidence"] = evidence

    commercial = dict(result.get("commercial_spine") or {})
    commercial["proof"] = {
        "type": "portfolio_project",
        "source_ref": str(manifest.get("id") or ""),
        "note": "Public portfolio implementation; use as capability and implementation proof.",
    }
    result["commercial_spine"] = commercial

    risks = [str(x) for x in (result.get("risks_or_limits") or [])]
    policy_note = "Public portfolio implementation; do not imply named client work without separate approved evidence."
    if not bundle["claim_policy"]["client_claim_allowed"] and policy_note not in risks:
        risks.append(policy_note)
    result["risks_or_limits"] = risks

    _validate_claim_refs(result, set(bundle["allowed_source_refs"]))
    validator = Draft202012Validator(_canonical_schema())
    errors = sorted(validator.iter_errors(result), key=lambda e: list(e.path))
    if errors:
        details = "; ".join(error.message for error in errors[:8])
        raise PortfolioError(f"Canonical content object failed schema validation: {details}")
    return result
