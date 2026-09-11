from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Literal
import uuid

EvidenceType = Literal[
    "REAL_CASE",
    "INTERNAL_EXPERIENCE",
    "PUBLIC_SOURCE",
    "ILLUSTRATIVE_EXAMPLE",
    "OPINION",
]
ApprovalType = Literal[
    "publish_post",
    "send_message",
    "connect_person",
    "follow_person",
    "contact_partner",
    "publish_article",
]


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


@dataclass
class Evidence:
    evidence_id: str
    type: EvidenceType
    claim: str
    source: str
    approved_for_public_use: bool = False
    confidential: bool = False
    anonymized: bool = False
    url: str | None = None
    notes: str = ""


@dataclass
class Task:
    task_id: str
    type: str
    scheduled_for: str
    status: str = "pending"
    requires_approval: bool = False
    inputs: dict[str, Any] = field(default_factory=dict)
    outputs: dict[str, Any] = field(default_factory=dict)


@dataclass
class WeeklyPlan:
    plan_id: str
    tenant_id: str
    week_start: str
    primary_goal: str
    commercial_focus: dict[str, Any]
    content_focus: dict[str, Any]
    targets: dict[str, Any]
    tasks: list[dict[str, Any]]
    created_at: str = field(default_factory=utc_now)


@dataclass
class CompanyCandidate:
    company_id: str
    tenant_id: str
    name: str
    website: str
    country: str = ""
    industry: str = ""
    employee_range: str = ""
    linkedin_url: str = ""
    source_url: str = ""
    fit_type: str = "partner"
    score: float = 0.0
    score_reason: str = ""
    capabilities: list[str] = field(default_factory=list)
    capability_gaps: list[str] = field(default_factory=list)
    status: str = "candidate"
    created_at: str = field(default_factory=utc_now)


@dataclass
class PersonCandidate:
    person_id: str
    tenant_id: str
    company_id: str
    name: str
    role: str
    linkedin_url: str = ""
    public_source_url: str = ""
    relevance_score: float = 0.0
    status: str = "candidate"
    created_at: str = field(default_factory=utc_now)


@dataclass
class ContentItem:
    content_id: str
    tenant_id: str
    channel: str
    content_type: str
    title: str
    body: str
    objective: str
    target_audience: list[str]
    evidence_ids: list[str]
    status: str = "draft"
    visual_type: str = "none"
    visual_path: str = ""
    source_case: str = ""
    scheduled_at: str | None = None
    brief_id: str = ""
    language: str = "es"
    content_family: str = ""
    quality_score: float = 0.0
    critique: dict[str, Any] = field(default_factory=dict)
    source_url: str = ""
    created_at: str = field(default_factory=utc_now)


@dataclass
class ApprovalItem:
    approval_id: str
    tenant_id: str
    action_type: ApprovalType
    target_id: str
    summary: str
    payload: dict[str, Any]
    status: str = "pending"
    created_at: str = field(default_factory=utc_now)
    decided_at: str | None = None


def to_dict(obj: Any) -> dict[str, Any]:
    return asdict(obj)
