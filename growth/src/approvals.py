from __future__ import annotations

from .models import utc_now
from .storage import get_store


VALID_DECISIONS = {"approved", "rejected"}


def list_pending() -> list[dict]:
    store = get_store()
    return [row for row in store.list("approvals") if row.get("status") == "pending"]


def decide(approval_id: str, decision: str) -> dict:
    decision = decision.strip().lower()
    if decision not in VALID_DECISIONS:
        raise ValueError(f"Decision must be one of {sorted(VALID_DECISIONS)}")
    store = get_store()
    updated = store.update(
        "approvals",
        "approval_id",
        approval_id,
        {"status": decision, "decided_at": utc_now()},
    )
    if not updated:
        raise KeyError(f"Approval not found: {approval_id}")

    # Approval changes permission state only. External execution is always a separate step.
    if updated.get("action_type") == "publish_post":
        content_id = updated.get("target_id")
        store.update(
            "content_items",
            "content_id",
            content_id,
            {"status": "approved" if decision == "approved" else "rejected"},
        )
    return updated
