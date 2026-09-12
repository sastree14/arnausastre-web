from growth.src import editorial_runtime as runtime
from growth.src.storage import LocalJsonStore


def test_content_contract_enforces_linkedin_hard_limit():
    draft = {"title": "A title", "body": "x" * (runtime.LINKEDIN_HARD_MAX_CHARS + 1)}
    issues = runtime.content_contract_issues(draft, "linkedin_post")
    assert any("hard maximum" in issue for issue in issues)


def test_content_contract_enforces_article_bounds():
    too_short = {"title": "A title", "body": "word " * 100}
    too_long = {"title": "A title", "body": "word " * (runtime.ARTICLE_HARD_MAX_WORDS + 1)}
    assert any("hard minimum" in issue for issue in runtime.content_contract_issues(too_short, "article"))
    assert any("hard maximum" in issue for issue in runtime.content_contract_issues(too_long, "article"))


def test_persist_variant_is_idempotent_and_does_not_duplicate_approval(monkeypatch, tmp_path):
    store = LocalJsonStore(tmp_path)
    monkeypatch.setattr(runtime, "get_store", lambda: store)
    monkeypatch.setattr(runtime, "_write_variant", lambda *args, **kwargs: {
        "title": "A useful article",
        "body": "word " * 900,
    })
    monkeypatch.setattr(runtime, "_critic", lambda *args, **kwargs: {
        "quality_score": 8.5,
        "generic_ai_risk": 2,
        "rewrite_required": False,
        "contract_valid": True,
        "contract_issues": [],
    })

    brief = {
        "brief_id": "brief_test",
        "tenant_id": "sc-analytics",
        "family": "educational",
        "target_audience": ["COO"],
        "evidence_ids": [],
        "research": {"source_urls": ["https://example.com/source"]},
        "output_decision": "ARTICLE",
        "primary_linkedin_language": "es",
    }

    first = runtime._persist_variant(brief, language="es", channel="website", content_type="article", primary=True)
    second = runtime._persist_variant(brief, language="es", channel="website", content_type="article", primary=True)

    assert first["content_id"] == second["content_id"]
    assert second["resumed"] is True
    assert len(store.list("content_items")) == 1
    assert len(store.list("approvals")) == 1


def test_invalid_contract_never_creates_approval(monkeypatch, tmp_path):
    store = LocalJsonStore(tmp_path)
    monkeypatch.setattr(runtime, "get_store", lambda: store)
    monkeypatch.setattr(runtime, "_write_variant", lambda *args, **kwargs: {
        "title": "Too long",
        "body": "x" * 4000,
    })
    monkeypatch.setattr(runtime, "_rewrite_variant", lambda brief, draft, critique, **kwargs: draft)
    monkeypatch.setattr(runtime, "_critic", lambda *args, **kwargs: {
        "quality_score": 9.5,
        "generic_ai_risk": 1,
        "rewrite_required": False,
    })
    monkeypatch.setattr(runtime.base, "_render_visual", lambda *args, **kwargs: ("none", ""))

    brief = {
        "brief_id": "brief_long",
        "tenant_id": "sc-analytics",
        "family": "opinion",
        "target_audience": ["Founder"],
        "evidence_ids": [],
        "research": {"source_urls": []},
        "visual": {"needed": False, "type": "none"},
    }

    item = runtime._persist_variant(brief, language="es", channel="arnau_linkedin", content_type="linkedin_post", primary=True)
    assert item["quality_score"] == 7.4
    assert item["status"] == "needs_review"
    assert len(store.list("approvals")) == 0



def test_legacy_invalid_variant_is_rewritten_in_place(monkeypatch, tmp_path):
    store = LocalJsonStore(tmp_path)
    monkeypatch.setattr(runtime, "get_store", lambda: store)
    monkeypatch.setattr(runtime, "_rewrite_variant", lambda *args, **kwargs: {
        "title": "Migrated post",
        "body": "x" * 1000,
    })
    monkeypatch.setattr(runtime, "_critic", lambda *args, **kwargs: {
        "quality_score": 8.8,
        "generic_ai_risk": 1,
        "rewrite_required": False,
        "contract_valid": True,
        "contract_issues": [],
    })
    monkeypatch.setattr(runtime.base, "_render_visual", lambda *args, **kwargs: ("none", ""))

    store.insert("content_items", {
        "content_id": "content_legacy",
        "tenant_id": "sc-analytics",
        "brief_id": "brief_legacy",
        "language": "es",
        "channel": "arnau_linkedin",
        "content_type": "linkedin_post",
        "title": "Legacy post",
        "body": "x" * 4000,
        "status": "draft",
        "quality_score": 9.1,
        "critique": {"quality_score": 9.1},
        "visual_type": "none",
        "visual_path": "",
    })
    store.insert("approvals", {
        "approval_id": "approval_legacy",
        "tenant_id": "sc-analytics",
        "action_type": "publish_post",
        "target_id": "content_legacy",
        "summary": "stale",
        "payload": {"body": "x" * 4000},
        "status": "pending",
    })
    brief = {
        "brief_id": "brief_legacy",
        "tenant_id": "sc-analytics",
        "family": "opinion",
        "target_audience": ["Founder"],
        "evidence_ids": [],
        "research": {"source_urls": []},
    }

    result = runtime._persist_variant(
        brief,
        language="es",
        channel="arnau_linkedin",
        content_type="linkedin_post",
        primary=True,
    )

    assert result["content_id"] == "content_legacy"
    assert result["resumed"] is True
    assert result["contract_migrated"] is True
    assert result["critique"]["contract_valid"] is True
    assert len(result["body"]) == 1000
    assert len(store.list("content_items")) == 1
    approvals = store.list("approvals")
    assert sum(1 for row in approvals if row.get("status") == "pending") == 1
    assert sum(1 for row in approvals if row.get("status") == "rejected") == 1
    assert next(row for row in approvals if row["approval_id"] == "approval_legacy")["payload"]["invalidated_reason"] == "content_rewritten_for_contract"


def test_valid_legacy_variant_backfills_contract_without_rewrite(monkeypatch, tmp_path):
    store = LocalJsonStore(tmp_path)
    monkeypatch.setattr(runtime, "get_store", lambda: store)
    monkeypatch.setattr(runtime, "_rewrite_variant", lambda *args, **kwargs: (_ for _ in ()).throw(AssertionError("rewrite not expected")))
    store.insert("content_items", {
        "content_id": "content_valid_legacy",
        "tenant_id": "sc-analytics",
        "brief_id": "brief_valid_legacy",
        "language": "es",
        "channel": "website",
        "content_type": "article",
        "title": "Valid legacy article",
        "body": "word " * 900,
        "status": "draft",
        "quality_score": 8.4,
        "critique": {"quality_score": 8.4},
        "visual_type": "none",
        "visual_path": "",
    })
    brief = {
        "brief_id": "brief_valid_legacy",
        "tenant_id": "sc-analytics",
        "family": "educational",
        "target_audience": ["COO"],
        "evidence_ids": [],
        "research": {"source_urls": []},
    }
    result = runtime._persist_variant(
        brief,
        language="es",
        channel="website",
        content_type="article",
        primary=True,
    )
    assert result["resumed"] is True
    assert result["critique"]["contract_valid"] is True
    assert len(store.list("content_items")) == 1
    assert len(store.list("approvals")) == 1
