from growth.src.editorial import SUPPORTED_LANGUAGES, _signal_id, _weighted_score


def test_weighted_editorial_score_is_bounded_and_deterministic():
    scores = {
        "icp_relevance": 10,
        "business_consequence": 9,
        "angle_originality": 8,
        "evidence_quality": 7,
        "principles_fit": 10,
        "reader_usefulness": 9,
        "commercial_adjacency": 2,
    }
    assert _weighted_score(scores) == 8.95
    assert _weighted_score({"icp_relevance": 100}) == 2.0
    assert _weighted_score({}) == 0.0


def test_signal_id_is_stable_for_same_url():
    url = "https://example.com/article"
    assert _signal_id(url) == _signal_id(url + "/")
    assert _signal_id(url).startswith("signal_")


def test_editorial_languages_are_explicit():
    assert SUPPORTED_LANGUAGES == ("es", "en", "ca")
