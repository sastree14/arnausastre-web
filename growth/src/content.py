from __future__ import annotations

import json
import re
from pathlib import Path

from .brain import load_brain
from .config import load_config
from .llm import get_llm
from .models import ApprovalItem, ContentItem, new_id, to_dict
from .storage import get_store
from .visuals import choose_visual_type, render_branded_card

REPO_ROOT = Path(__file__).resolve().parents[2]
PROJECTS_DIR = REPO_ROOT / "content" / "projects"


def load_real_case(slug: str) -> str:
    path = PROJECTS_DIR / slug / "project.txt"
    if not path.exists():
        raise FileNotFoundError(f"Real case not found: {slug}")
    return path.read_text(encoding="utf-8")


def _safe_slug(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:80] or new_id("content")


def create_content_from_case(case_slug: str, channel: str = "arnau_linkedin") -> dict:
    cfg = load_config()
    tenant_id = cfg["company"]["tenant_id"]
    case_text = load_real_case(case_slug)
    brain = load_brain([
        "company/identity.md",
        "company/positioning.md",
        "company/principles.md",
        "voice/arnau_voice.md" if channel == "arnau_linkedin" else "voice/company_voice.md",
        "voice/forbidden_language.md",
        "evidence/evidence_policy.md",
        "content/content_strategy.md",
    ])
    llm = get_llm()
    raw = llm.json(
        "You are SC-Analytics' evidence-aware content editor.",
        f"""Create ONE high-value LinkedIn post from the approved anonymized real case below.
Do not fabricate metrics, outcomes, client details, experience or external facts.
The post must be useful even if the reader never becomes a client.
Prefer one strong idea over a summary of the whole case.
Return JSON with: title, body, objective, target_audience (array), evidence_claims (array), visual_concept, has_real_metrics (boolean).
Do not include hashtags inside body. Avoid a hard sales CTA.

BRAIN:
{brain}

REAL CASE ({case_slug}):
{case_text}
""",
    )
    content_id = new_id("content")
    visual_type = choose_visual_type(
        "linkedin_post", bool(raw.get("has_real_metrics")), str(raw.get("visual_concept", ""))
    )
    visual_path = ""
    if visual_type in {"business_diagram", "branded_card", "real_data_chart"}:
        visual = render_branded_card(
            str(raw.get("title", "SC-Analytics insight"))[:70],
            str(raw.get("visual_concept", "Business decision insight"))[:110],
            slug=_safe_slug(str(raw.get("title", content_id))),
        )
        visual_path = str(visual.relative_to(REPO_ROOT)).replace("\\", "/")

    item = ContentItem(
        content_id=content_id,
        tenant_id=tenant_id,
        channel=channel,
        content_type="linkedin_post",
        title=str(raw.get("title", "")),
        body=str(raw.get("body", "")),
        objective=str(raw.get("objective", "authority")),
        target_audience=list(raw.get("target_audience") or []),
        evidence_ids=[],
        visual_type=visual_type,
        visual_path=visual_path,
        source_case=case_slug,
    )
    store = get_store()
    store.insert("content_items", to_dict(item))
    approval = ApprovalItem(
        approval_id=new_id("approval"),
        tenant_id=tenant_id,
        action_type="publish_post",
        target_id=content_id,
        summary=f"Approve LinkedIn post: {item.title}",
        payload={"channel": channel, "content_id": content_id, "visual_path": visual_path},
    )
    store.insert("approvals", to_dict(approval))
    return {"content": to_dict(item), "approval": to_dict(approval), "evidence_claims": raw.get("evidence_claims", [])}
