from __future__ import annotations

import json

from growth.src import portfolio


INDEX = """
projects:
  - id: SC-12
    title: "Demand Forecasting"
    path: projects/sc-12-demo
    manifest: catalog/sc-12-demo.yml
    technologies:
      - "Python"
"""

MANIFEST = """
schema_version: 2
id: SC-12
title: "Demand Forecasting"
status: completed
project_type: public-portfolio-implementation
family: "Forecasting & Planning"
summary: "Forecasting system"
designed_for:
  - "Retail"
why_it_matters:
  - "Connect forecasts to planning"
technologies:
  - "Python"
provenance:
  evidence_class: public_portfolio_implementation
  client_claim_allowed: false
  confidentiality: public_safe_example
evidence:
  business_impact: projects/sc-12-demo/docs/BUSINESS_IMPACT.md
  results: projects/sc-12-demo/docs/RESULTS.md
  architecture: projects/sc-12-demo/docs/ARCHITECTURE.md
  technical_decisions: projects/sc-12-demo/docs/TECHNICAL_DECISIONS.md
  limitations: projects/sc-12-demo/docs/LIMITATIONS.md
visuals:
  primary: projects/sc-12-demo/examples/visuals/result.svg
execution:
  primary: projects/sc-12-demo/technical/run_project.py
paths:
  project: projects/sc-12-demo
  readme: projects/sc-12-demo/README.md
"""


def _sources():
    return {
        "catalog/projects.yml": INDEX,
        "catalog/sc-12-demo.yml": MANIFEST,
        "projects/sc-12-demo/README.md": "# SC-12\nBusiness README",
        "projects/sc-12-demo/docs/BUSINESS_IMPACT.md": "# Business impact\nPlanning value",
        "projects/sc-12-demo/docs/RESULTS.md": "# Results\nDocumented result",
        "projects/sc-12-demo/docs/ARCHITECTURE.md": "# Architecture\nSystem flow",
        "projects/sc-12-demo/docs/TECHNICAL_DECISIONS.md": "# Decisions\nBaseline first",
        "projects/sc-12-demo/docs/LIMITATIONS.md": "# Limitations\nRepresentative data",
    }


def test_manifest_and_bundle_are_resolved_from_index(monkeypatch):
    portfolio.load_project_index.cache_clear()
    portfolio.load_project_manifest.cache_clear()
    sources = _sources()
    monkeypatch.setattr(portfolio, "_fetch_text", lambda path: sources[path])

    manifest = portfolio.load_project_manifest("12")
    assert manifest["id"] == "SC-12"
    assert manifest["schema_version"] == 2

    bundle = portfolio.build_project_source_bundle("SC12")
    assert bundle["project_id"] == "SC-12"
    assert bundle["claim_policy"]["client_claim_allowed"] is False
    assert "results" in bundle["evidence"]
    assert "projects/sc-12-demo/docs/RESULTS.md" in bundle["allowed_source_refs"]


def test_project_seed_is_project_proof(monkeypatch):
    portfolio.load_project_index.cache_clear()
    portfolio.load_project_manifest.cache_clear()
    sources = _sources()
    monkeypatch.setattr(portfolio, "_fetch_text", lambda path: sources[path])

    seed = portfolio.project_content_seed("SC-12", angle="business_transformation")
    assert seed["origin"] == "portfolio_project"
    assert seed["editorial_pillar"] == "projects_proof"
    assert seed["content_family"] == "case_project_proof"
    assert seed["project_source"]["project_id"] == "SC-12"
    assert seed["provenance"]["client_claim_allowed"] is False
