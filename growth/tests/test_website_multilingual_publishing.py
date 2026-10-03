from pathlib import Path

import pytest

from growth.src.storage import LocalJsonStore
from growth.src import website_publishing


def seed_family(store: LocalJsonStore, *, invalid_ca: bool = False):
    brief_id = "brief_multilingual"
    for language in ("es", "ca", "en"):
        store.upsert(
            "content_items",
            {
                "content_id": f"content_{language}",
                "brief_id": brief_id,
                "tenant_id": "sc-analytics",
                "content_type": "article",
                "channel": "website",
                "language": language,
                "title": f"Title {language}",
                "body": f"Body {language}",
                "status": "approved" if language == "es" else ("needs_review" if invalid_ca and language == "ca" else "draft"),
                "critique": {"contract_valid": not (invalid_ca and language == "ca"), "contract_issues": ["bad"] if invalid_ca and language == "ca" else []},
                "visual_path": "supabase://growth-assets/shared.png" if language == "es" else "",
                "visual_type": "generated_contextual_illustration" if language == "es" else "",
                "visual_strategy": {"language_neutral": True} if language == "es" else {},
            },
            key="content_id",
        )
    store.upsert(
        "approvals",
        {
            "approval_id": "approval_es",
            "target_id": "content_es",
            "action_type": "publish_article",
            "status": "approved",
        },
        key="approval_id",
    )


def test_publish_article_publishes_complete_language_family(tmp_path: Path, monkeypatch):
    store = LocalJsonStore(tmp_path)
    seed_family(store)
    monkeypatch.setattr(website_publishing, "get_store", lambda: store)

    result = website_publishing.publish_article("content_es", force=True)

    assert result["status"] == "published"
    assert result["family_size"] == 3
    rows = {row["language"]: row for row in store.list("content_items")}
    assert set(rows) == {"es", "ca", "en"}
    assert all(row["status"] == "published" for row in rows.values())
    assert rows["es"]["external_post_url"] == "/knowledge/brief_multilingual/es"
    assert rows["ca"]["external_post_url"] == "/knowledge/brief_multilingual/ca"
    assert rows["en"]["external_post_url"] == "/knowledge/brief_multilingual/en"
    assert rows["ca"]["visual_path"] == "supabase://growth-assets/shared.png"
    assert rows["en"]["visual_strategy"]["language_neutral"] is True


def test_publish_article_blocks_incomplete_translation_family(tmp_path: Path, monkeypatch):
    store = LocalJsonStore(tmp_path)
    seed_family(store)
    store.replace_all("content_items", [row for row in store.list("content_items") if row.get("content_id") != "content_ca"])
    monkeypatch.setattr(website_publishing, "get_store", lambda: store)

    with pytest.raises(website_publishing.WebsitePublishingError, match="Missing language variants"):
        website_publishing.publish_article("content_es", force=True)


def test_publish_article_blocks_translation_needing_review(tmp_path: Path, monkeypatch):
    store = LocalJsonStore(tmp_path)
    seed_family(store, invalid_ca=True)
    monkeypatch.setattr(website_publishing, "get_store", lambda: store)

    with pytest.raises(website_publishing.WebsitePublishingError, match="needs review"):
        website_publishing.publish_article("content_es", force=True)



def test_publish_due_articles_publishes_due_family_once(tmp_path: Path, monkeypatch):
    store = LocalJsonStore(tmp_path)
    seed_family(store)
    for row in store.list("content_items"):
        store.update(
            "content_items",
            "content_id",
            row["content_id"],
            {"status": "scheduled", "scheduled_at": "2000-01-01T00:00:00+00:00"},
        )
    monkeypatch.setattr(website_publishing, "get_store", lambda: store)

    results = website_publishing.publish_due_articles(limit=20)

    assert len(results) == 1
    assert results[0]["status"] == "published"
    assert results[0]["family_size"] == 3
    rows = store.list("content_items")
    assert all(row["status"] == "published" for row in rows)
    assert all(row["scheduled_at"] is None for row in rows)
    assert all(row["published_at"] for row in rows)


def test_publish_due_articles_leaves_future_family_scheduled(tmp_path: Path, monkeypatch):
    store = LocalJsonStore(tmp_path)
    seed_family(store)
    for row in store.list("content_items"):
        store.update(
            "content_items",
            "content_id",
            row["content_id"],
            {"status": "scheduled", "scheduled_at": "2999-01-01T00:00:00+00:00"},
        )
    monkeypatch.setattr(website_publishing, "get_store", lambda: store)

    results = website_publishing.publish_due_articles(limit=20)

    assert results == []
    rows = store.list("content_items")
    assert all(row["status"] == "scheduled" for row in rows)
    assert all(row["published_at"] in (None, "") for row in rows)
