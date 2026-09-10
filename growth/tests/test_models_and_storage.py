from pathlib import Path

from growth.src.models import CompanyCandidate, Evidence, Task, WeeklyPlan, new_id, to_dict
from growth.src.storage import LocalJsonStore
from growth.src.validation import validate_against_schema


def test_weekly_plan_schema():
    task = Task(task_id=new_id("task"), type="CONTENT_CREATE", scheduled_for="2026-09-16")
    plan = WeeklyPlan(
        plan_id=new_id("plan"),
        tenant_id="sc-analytics",
        week_start="2026-09-14",
        primary_goal="Generate qualified conversations",
        commercial_focus={"channel": "partnerships"},
        content_focus={"theme": "forecasting"},
        targets={"companies_researched": 30},
        tasks=[to_dict(task)],
    )
    validate_against_schema(to_dict(plan), "weekly_plan.schema.json")


def test_company_and_evidence_schemas():
    company = CompanyCandidate(
        company_id=new_id("company"), tenant_id="sc-analytics", name="Example", website="https://example.com", score=8.2
    )
    evidence = Evidence(
        evidence_id=new_id("evidence"), type="REAL_CASE", claim="Example approved claim", source="case-1", approved_for_public_use=True
    )
    company_payload = to_dict(company)
    evidence_payload = to_dict(evidence)
    evidence_payload["tenant_id"] = "sc-analytics"
    validate_against_schema(company_payload, "company.schema.json")
    validate_against_schema(evidence_payload, "evidence.schema.json")


def test_local_store_composite_upsert(tmp_path: Path):
    store = LocalJsonStore(tmp_path)
    store.upsert("companies", {"tenant_id": "a", "website": "x", "score": 2}, key="tenant_id,website")
    store.upsert("companies", {"tenant_id": "a", "website": "x", "score": 9}, key="tenant_id,website")
    store.upsert("companies", {"tenant_id": "b", "website": "x", "score": 3}, key="tenant_id,website")
    rows = store.list("companies")
    assert len(rows) == 2
    assert [r for r in rows if r["tenant_id"] == "a"][0]["score"] == 9
