from growth.src.publishing import (
    LINKEDIN_INTERNAL_MAX_CHARS,
    _commentary_for_mode,
    _fit_commentary_with_hashtags,
    _linkedin_post_url,
    _publication_mode,
    _short_commentary,
    _visual_ref_for_mode,
)


def test_publication_mode_defaults_to_text_only():
    assert _publication_mode({}) == "text_only"
    assert _publication_mode({"publication_mode": "unknown"}) == "text_only"


def test_text_only_keeps_body_and_ignores_visual():
    item = {"publication_mode": "text_only", "body": "Full written post", "visual_path": "supabase://growth-assets/a.png"}
    assert _commentary_for_mode(item) == "Full written post"
    assert _visual_ref_for_mode(item) == ""


def test_text_with_visual_keeps_full_body_and_visual():
    item = {"publication_mode": "text_with_visual", "body": "Full written post", "visual_path": "supabase://growth-assets/a.png"}
    assert _commentary_for_mode(item) == "Full written post"
    assert _visual_ref_for_mode(item) == "supabase://growth-assets/a.png"


def test_visual_first_uses_short_first_paragraph_and_visual():
    item = {
        "publication_mode": "visual_first",
        "body": "This is the concise opening paragraph that should become the LinkedIn commentary.\n\nThis second paragraph should not be included.",
        "visual_path": "supabase://growth-assets/a.png",
    }
    assert _commentary_for_mode(item) == "This is the concise opening paragraph that should become the LinkedIn commentary."
    assert _visual_ref_for_mode(item) == "supabase://growth-assets/a.png"


def test_image_led_uses_minimal_required_caption(monkeypatch):
    monkeypatch.delenv("LINKEDIN_IMAGE_ONLY_COMMENTARY", raising=False)
    item = {"publication_mode": "image_only", "body": "Long text must not be copied", "visual_path": "supabase://growth-assets/a.png"}
    assert _commentary_for_mode(item) == "SC-Analytics"
    assert _visual_ref_for_mode(item) == "supabase://growth-assets/a.png"


def test_short_commentary_truncates_on_word_boundary():
    body = "word " * 100
    result = _short_commentary(body, max_chars=80)
    assert len(result) <= 80
    assert result.endswith("…")


def test_hashtags_are_appended_once():
    item = {"publication_mode": "text_only", "body": "Useful post", "hashtags": ["#DemandForecasting", "DemandForecasting", "SupplyChain"]}
    assert _commentary_for_mode(item) == "Useful post\n\n#DemandForecasting #SupplyChain"


def test_hashtags_never_push_commentary_over_internal_limit():
    body = "forecasting " * 300
    result = _fit_commentary_with_hashtags(body, "#DemandForecasting #SupplyChain")
    assert len(result) <= LINKEDIN_INTERNAL_MAX_CHARS
    assert result.endswith("#DemandForecasting #SupplyChain")
    assert "…\n\n#DemandForecasting" in result


def test_linkedin_post_url_uses_returned_post_urn():
    post_id = "urn:li:share:123456789"
    assert _linkedin_post_url(post_id) == "https://www.linkedin.com/feed/update/urn:li:share:123456789/"


def test_linkedin_post_url_is_empty_without_post_id():
    assert _linkedin_post_url("") == ""
