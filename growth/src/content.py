from __future__ import annotations

import re
from pathlib import Path

from .assets import get_asset_store
from .brain import load_brain
from .config import load_config
from .llm import get_llm
from .models import ApprovalItem, ContentItem, Evidence, new_id, to_dict
from .storage import get_store
from .visuals import choose_visual_type, render_branded_card, render_business_diagram

REPO_ROOT = Path(__file__).resolve().parents[2]
PROJECTS_DIR = REPO_ROOT / "content" / "projects"


def load_real_case(slug: str) -> str:
    path = PROJECTS_DIR / slug / "project.txt"
    if not path.exists():
        raise FileNotFoundError(f"Real case not found: {slug}")
    text = path.read_text(encoding="utf-8")
    if "Status:\nPublished" not in text and "Status:\r\nPublished" not in text:
        raise ValueError(f"Case is not marked Published and cannot be used automatically: {slug}")
    return text


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
Return JSON with exactly these useful fields:
- title: string
- body: string
- objective: string
- target_audience: array of roles
- evidence_claims: array of strings copied or conservatively paraphrased from the case
- visual_concept: short string
- visual_steps: array of 2-5 short labels when a process/decision diagram is useful, otherwise []
- has_real_metrics: boolean
Do not include hashtags inside body. Avoid a hard sales CTA.
If you use a case metric, preserve its meaning exactly and never imply causation beyond the case text.

BRAIN:
{brain}

REAL CASE ({case_slug}):
{case_text}
""",
    )
    content_id = new_id("content")
    slug = _safe_slug(str(raw.get("title", content_id)))
    concept = str(raw.get("visual_concept", ""))
    visual_type = choose_visual_type("linkedin_post", bool(raw.get("has_real_metrics")), concept)
    steps = [str(s) for s in (raw.get("visual_steps") or []) if str(s).strip()]

    if visual_type == "business_diagram" and steps:
        visual = render_business_diagram(str(raw.get("title", "SC-Analytics insight"))[:60], steps, slug=slug)
    else:
        visual = render_branded_card(
            str(raw.get("title", "SC-Analytics insight"))[:70],
            concept[:110] or "Business decision insight",
            slug=slug,
        )

    asset_key = f"{tenant_id}/content/{content_id}/{visual.name}"
    visual_ref = get_asset_store().put(visual, asset_key)

    store = get_store()
    evidence_ids: list[str] = []
    for claim in [str(c).strip() for c in (raw.get("evidence_claims") or []) if str(c).strip()]:
        evidence = Evidence(
            evidence_id=new_id("evidence"),
            type="REAL_CASE",
            claim=claim,
            source=case_slug,
            approved_for_public_use=True,
            confidential=False,
            anonymized=True,
            notes="Auto-created from a project file already marked Published; review remains required before publication.",
        )
        evidence_dict = to_dict(evidence)
        evidence_dict["tenant_id"] = tenant_id
        store.insert("evidence", evidence_dict)
        evidence_ids.append(evidence.evidence_id)

    item = ContentItem(
        content_id=content_id,
        tenant_id=tenant_id,
        channel=channel,
        content_type="linkedin_post",
        title=str(raw.get("title", "")),
        body=str(raw.get("body", "")),
        objective=str(raw.get("objective", "authority")),
        target_audience=list(raw.get("target_audience") or []),
        evidence_ids=evidence_ids,
        visual_type=visual_type,
        visual_path=visual_ref,
        source_case=case_slug,
    )
    store.insert("content_items", to_dict(item))
    approval = ApprovalItem(
        approval_id=new_id("approval"),
        tenant_id=tenant_id,
        action_type="publish_post",
        target_id=content_id,
        summary=f"Approve LinkedIn post: {item.title}",
        payload={
            "channel": channel,
            "content_id": content_id,
            "title": item.title,
            "body": item.body,
            "visual_type": visual_type,
            "visual_path": visual_ref,
            "evidence_ids": evidence_ids,
            "source_case": case_slug,
            "execution_mode": "official_api_when_configured",
        },
    )
    store.insert("approvals", to_dict(approval))
    return {"content": to_dict(item), "approval": to_dict(approval), "evidence_claims": raw.get("evidence_claims", [])}
