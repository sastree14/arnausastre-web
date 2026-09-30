from pathlib import Path

import pytest
from PIL import Image

from growth.src.visual_candidates import generate_candidates
from growth.src.visual_qa import hard_qa
from growth.src.visual_renderer_v2 import render_visual_spec
from growth.src.visual_system import VisualSystemError, assert_language_allowed, format_contract, load_visual_system


def _illustrative_spec() -> dict:
    return {
        "visual_spec_id": "vspec_test_overfitting",
        "format": "dataviz",
        "visual_language": "D",
        "semantic_pattern": "overfitting",
        "evidence_mode": "illustrative",
        "visual_role": "primary_evidence",
        "channel": "linkedin",
        "content": {
            "title": "More training can make validation performance worse.",
            "context": "A conceptual overfitting curve explains why model fit and generalisation are different questions.",
            "analytical_question": "How does model complexity affect training and validation error?",
            "analytical_relationship": "conceptual_curve",
            "takeaway": "The best in-sample fit is not automatically the best decision model.",
        },
        "composition": {
            "variant_key": "illustrative_multi_line",
            "orientation": "auto",
            "chart_type": "illustrative_multi_line",
            "connector_type": None,
            "density": "medium",
            "annotations": [],
            "options": {},
        },
        "source_refs": [],
        "illustrative_disclosure": "Illustrative example — conceptual relationship, not measured evidence.",
        "planner_reason": "A two-line conceptual curve explains overfitting without fabricating metrics.",
        "planner_score": 0.92,
        "created_at": "2026-09-30T12:00:00Z",
    }


def test_visual_system_contains_four_languages_and_expected_format_limits():
    system = load_visual_system()
    assert set(system["visual_languages"]) == {"A", "B", "C", "D"}
    assert format_contract("carousel")["allowed_languages"] == ["A", "B", "C", "D"]
    assert format_contract("architecture")["allowed_languages"] == ["A", "B", "C"]
    assert format_contract("before_after")["allowed_languages"] == ["A", "B", "C"]


def test_architecture_d_is_blocked_until_a_gold_standard_exists():
    with pytest.raises(VisualSystemError):
        assert_language_allowed("architecture", "D")


def test_candidate_engine_uses_chart_grammar_for_conceptual_curves():
    package = {
        "format": "dataviz",
        "content": {"analytical_relationship": "conceptual_curve"},
    }
    candidates = generate_candidates(package, max_candidates=3)
    assert candidates
    assert candidates[0]["chart_type"] == "illustrative_line"
    assert all(row["variant_key"] in {"illustrative_line", "illustrative_multi_line"} for row in candidates)


def test_illustrative_dataviz_renders_at_1080x1350_and_passes_hard_qa(tmp_path: Path):
    spec = _illustrative_spec()
    rendered = render_visual_spec(spec, output_dir=tmp_path, slug="overfitting")
    assert len(rendered["assets"]) == 1
    png = Path(rendered["assets"][0]["png_path"])
    with Image.open(png) as image:
        assert image.size == (1080, 1350)
    qa = hard_qa(spec, rendered["layout"])
    assert qa["passed"], qa


def test_empirical_dataviz_without_data_is_rejected():
    spec = _illustrative_spec()
    spec["evidence_mode"] = "empirical"
    spec["illustrative_disclosure"] = None
    qa = hard_qa(spec, {
        "boxes": [],
        "series_count": 0,
        "visual_language": "D",
        "format": "dataviz",
    })
    assert not qa["passed"]
    assert "empirical_dataviz_without_quantitative_data" in qa["issues"]


def test_carousel_mixed_language_is_hard_failure():
    spec = {
        "format": "carousel",
        "visual_language": "B",
        "evidence_mode": "empirical",
    }
    qa = hard_qa(spec, {
        "slides": [
            {"visual_language": "B", "boxes": []},
            {"visual_language": "C", "boxes": []},
        ],
        "format": "carousel",
        "visual_language": "B",
    })
    assert not qa["passed"]
    assert "mixed_visual_language" in qa["issues"]
