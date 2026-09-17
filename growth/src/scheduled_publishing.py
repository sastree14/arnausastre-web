from __future__ import annotations

from .publishing import publish_all_approved
from .website_publishing import publish_due_articles


def publish_due_content(limit: int = 20) -> dict:
    """Publish due, already-approved content across supported destinations.

    LinkedIn Articles intentionally remain excluded until their dedicated
    publishing contract is implemented. Web articles and LinkedIn posts are
    idempotent at the underlying publisher level.
    """
    linkedin = publish_all_approved(limit=limit)
    website = publish_due_articles(limit=limit)
    failures = [row for row in [*linkedin, *website] if row.get("status") == "failed"]
    return {
        "linkedin": linkedin,
        "website": website,
        "published_or_checked": len(linkedin) + len(website),
        "failures": failures,
    }
