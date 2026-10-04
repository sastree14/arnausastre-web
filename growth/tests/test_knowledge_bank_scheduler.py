from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

from growth.src.storage import LocalJsonStore
from scripts.content_engine import build_knowledge_bank, seed_knowledge_bank


def _variant(language: str) -> dict:
    return {
        "title": f"Title {language}",
        "body": "Body",
        "excerpt": "Excerpt",
        "quick": ["One", "Two", "Three"],
        "section_titles": ["A", "B", "C", "D"],
        "business_title": "Business implication",
        "business_steps": ["Cause", "Decision", "Result"],
        "seo_title": "SEO title",
        "seo_description": "A sufficiently long SEO description used only by the scheduler seed test fixture.",
        "seo_keywords": ["test"],
        "tags": ["test"],
    }


def _write_bank(bank: Path, count: int = 6) -> None:
    bank.mkdir(parents=True, exist_ok=True)
    for sequence in range(1, count + 1):
        payload = {
            "schema_version": 1,
            "spec_id": f"KB-{sequence:03d}",
            "sequence": sequence,
            "slug": f"article-{sequence:03d}",
            "scheduled_at": "2030-01-01T09:00:00+01:00" if sequence == 6 else "2026-10-07T09:00:00+02:00",
            "variants": {lang: _variant(lang) for lang in ("es", "en", "ca")},
        }
        (bank / f"{sequence:03d}-article-{sequence:03d}.json").write_text(
            json.dumps(payload),
            encoding="utf-8",
        )


def _write_catalog(path: Path, initial: int = 5) -> None:
    path.write_text(
        json.dumps(
            {
                "publication_strategy": {
                    "initial_published_articles": initial,
                    "start_local": "2026-10-07T09:00:00",
                    "timezone": "Europe/Madrid",
                    "cadence_days": [2, 3],
                }
            }
        ),
        encoding="utf-8",
    )


def test_schedule_starts_after_initial_release():
    strategy = {
        "initial_published_articles": 5,
        "start_local": "2026-10-07T09:00:00",
        "timezone": "Europe/Madrid",
        "cadence_days": [2, 3],
    }

    assert build_knowledge_bank.schedule_for(1, strategy) == "2026-10-07T09:00:00+02:00"
    assert build_knowledge_bank.schedule_for(5, strategy) == "2026-10-07T09:00:00+02:00"
    assert build_knowledge_bank.schedule_for(6, strategy) == "2026-10-07T09:00:00+02:00"
    assert build_knowledge_bank.schedule_for(7, strategy) == "2026-10-09T09:00:00+02:00"
    assert build_knowledge_bank.schedule_for(8, strategy) == "2026-10-12T09:00:00+02:00"


def test_seed_releases_first_five_and_preserves_published_rows(tmp_path: Path, monkeypatch):
    bank = tmp_path / "bank"
    catalog = tmp_path / "catalog.json"
    _write_bank(bank)
    _write_catalog(catalog)

    store = LocalJsonStore(tmp_path / "store")
    monkeypatch.setattr(seed_knowledge_bank, "get_store", lambda: store)
    monkeypatch.setattr(seed_knowledge_bank, "load_config", lambda: {"company": {"tenant_id": "sc-analytics"}})

    result = seed_knowledge_bank.seed(
        bank_dir=bank,
        catalog_path=catalog,
        mode="scheduled",
        expected=6,
    )

    assert result["initial_release_families"] == 5
    assert result["content_items"] == 18
    assert result["approvals"] == 18

    rows = store.list("content_items")
    launch_rows = [row for row in rows if row["brief_id"] in {f"article-{i:03d}" for i in range(1, 6)}]
    later_rows = [row for row in rows if row["brief_id"] == "article-006"]

    assert len(launch_rows) == 15
    assert all(row["status"] == "scheduled" for row in launch_rows)
    assert len({row["scheduled_at"] for row in launch_rows}) == 1
    assert datetime.fromisoformat(launch_rows[0]["scheduled_at"].replace("Z", "+00:00")).timestamp() <= datetime.now().timestamp() + 2

    assert len(later_rows) == 3
    # The bank fixture deliberately carries a stale 2030 date for sequence 6.
    # The seed must ignore it and resolve the canonical first post-launch slot
    # from publication_strategy.
    assert all(row["scheduled_at"] == "2026-10-07T09:00:00+02:00" for row in later_rows)
    assert result["next_scheduled_at"] == "2026-10-07T09:00:00+02:00"

    published_at = "2026-10-03T12:00:00Z"
    for row in [row for row in rows if row["brief_id"] == "article-001"]:
        store.update(
            "content_items",
            "content_id",
            row["content_id"],
            {
                "status": "published",
                "published_at": published_at,
                "scheduled_at": None,
                "external_post_url": f"/knowledge/article-001/{row['language']}",
            },
        )
    for approval in [row for row in store.list("approvals") if "kb_001" in row["approval_id"]]:
        store.update(
            "approvals",
            "approval_id",
            approval["approval_id"],
            {"status": "executed", "executed_at": published_at},
        )

    seed_knowledge_bank.seed(
        bank_dir=bank,
        catalog_path=catalog,
        mode="scheduled",
        expected=6,
    )

    preserved = [row for row in store.list("content_items") if row["brief_id"] == "article-001"]
    assert all(row["status"] == "published" for row in preserved)
    assert all(row["published_at"] == published_at for row in preserved)
    assert all(row["scheduled_at"] is None for row in preserved)

    approvals = [row for row in store.list("approvals") if "kb_001" in row["approval_id"]]
    assert approvals
    assert all(row["status"] == "executed" for row in approvals)
