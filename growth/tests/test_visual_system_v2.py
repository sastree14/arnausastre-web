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


def _valid_canonical_object() -> dict:
    return {
        "content_object_id": "content_test_overfitting",
        "status": "approved",
        "origin": "internal_knowledge",
        "editorial_pillar": "models_methods_decision_science",
        "content_family": "explain_understand",
        "angle": "what overfitting means in practice",
        "topic_entities": [{"type": "concept", "name": "Overfitting"}],
        "business_problem": "A model can fit training data while generalising poorly.",
        "business_question": "How should a decision-maker interpret improving training fit and worsening validation performance?",
        "thesis": "Better in-sample fit is not the same as better generalisation.",
        "key_points": ["Training and validation performance can diverge.", "Model choice should reflect out-of-sample behaviour."],
        "commercial_spine": {
            "target_buyer": ["CEO", "Head of Data"],
            "buyer_problem": "Model performance can look stronger than its real decision value.",
            "business_consequence": "A poorly generalising model can support unreliable decisions.",
            "value_mechanism": "Use validation evidence and decision-relevant evaluation before deployment.",
            "proof": {"type": "reasoned_point_of_view", "source_ref": None, "note": "Illustrative explanation."},
            "service_adjacency": ["Machine Learning", "Decision Systems"],
            "conversion_intent": "Demonstrate disciplined model evaluation.",
            "next_best_action": "reconsider_process"
        },
        "evidence": {
            "claims": [],
            "project_sources": [],
            "public_sources": [],
            "internal_sources": ["SC-Analytics methodology"],
            "limitations": ["The visual is conceptual, not measured client evidence."]
        },
        "primary_objective": "authority",
        "secondary_objectives": ["education"],
        "practical_takeaway": "Evaluate models on their ability to generalise, not only their ability to fit.",
        "desired_reader_action": "understand_concept",
        "target_audience": ["CEO", "Head of Data"],
        "industry_context": [],
        "funnel_stage": "awareness",
        "timeliness": "evergreen",
        "why_now": "",
        "valid_until": None,
        "confidentiality": "public",
        "language_context": ["en"],
        "risks_or_limits": ["Conceptual example only."],
        "output_hints": {
            "eligible_channels": ["sc_analytics_linkedin", "website_article"],
            "recommended_channels": ["sc_analytics_linkedin"],
            "visual_semantics": {
                "comparison": False,
                "architecture_available": False,
                "quantitative_evidence": False,
                "before_after": False,
                "project_assets_available": False
            }
        },
        "created_at": "2026-09-30T12:00:00Z",
        "updated_at": "2026-09-30T12:00:00Z"
    }


def test_visual_pipeline_orchestrates_validated_content_without_persistence(tmp_path: Path, monkeypatch):
    import growth.src.visual_pipeline as vp

    content_object = _valid_canonical_object()
    package = {
        "package_id": "pkg_test",
        "content_object_id": content_object["content_object_id"],
        "channel": "linkedin",
        "format": "dataviz",
        "visual_language": "D",
        "visual_role": "primary_evidence",
        "external_copy_mode": "medium",
        "content": _illustrative_spec()["content"],
        "external_copy": {"body": "", "hashtags": []},
        "created_at": "2026-09-30T12:00:00Z"
    }
    spec = _illustrative_spec()

    monkeypatch.setattr(vp, "recommend_visual_formats", lambda *a, **k: [{"format": "dataviz", "score": 0.95, "reason": "Conceptual curve."}])
    monkeypatch.setattr(vp, "build_presentation_package", lambda *a, **k: package)
    monkeypatch.setattr(vp, "plan_visual_candidates", lambda *a, **k: [spec])
    monkeypatch.setattr(vp, "critique_render", lambda *a, **k: {"available": True, "score": 0.9, "issues": [], "reason": "Clear."})

    result = vp.run_visual_pipeline(
        content_object,
        channel="linkedin",
        format_key=None,
        visual_language="AUTO",
        candidate_count=1,
        language="en",
        persist=False,
        auto_select=True,
        workdir=tmp_path,
    )
    assert result["status"] == "ready"
    assert result["selected_candidate_id"]
    assert result["candidates"][0]["qa"]["passed"]
    assert result["candidates"][0]["spec"]["evidence_mode"] == "illustrative"
