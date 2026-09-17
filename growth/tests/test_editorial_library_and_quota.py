from growth.src.editorial_library import _match_brief, _recent_repetition_terms
from growth.src.research import _int_list, _rate_windows


def test_recent_repetition_terms_detects_overused_theme():
    rows = [
        {"title": "Cómo reducir ausencias operativas", "topic": "absentismo", "challenge": "ausencias"},
        {"title": "Predicción de ausencias en equipos", "topic": "ausencias", "challenge": "planificación"},
        {"title": "Coste de las ausencias", "topic": "absentismo", "challenge": "ausencias"},
        {"title": "Ausencias y planificación de capacidad", "topic": "ausencias", "challenge": "capacidad"},
        {"title": "Forecast de demanda", "topic": "forecasting", "challenge": "inventario"},
    ]
    terms = _recent_repetition_terms(rows)
    assert "ausencias" in terms


def test_match_brief_links_semantically_related_research():
    proposal = {
        "title": "Optimizar inventario con forecasting de demanda",
        "business_problem": "exceso de inventario y roturas de stock",
        "thesis": "el forecast debe alimentar decisiones de reposición",
    }
    briefs = [
        {
            "brief_id": "brief_inventory",
            "canonical_title": "Forecasting de demanda para decisiones de inventario",
            "business_problem": "exceso de inventario y roturas de stock",
            "thesis": "forecasting y reposición deben diseñarse juntos",
        },
        {
            "brief_id": "brief_credit",
            "canonical_title": "Modelos de riesgo de crédito",
            "business_problem": "default en préstamos",
            "thesis": "calibrar probabilidad de impago",
        },
    ]
    matched = _match_brief(proposal, briefs)
    assert matched is not None
    assert matched["brief_id"] == "brief_inventory"


def test_brave_rate_limit_header_parsing():
    assert _int_list("1, 2000") == [1, 2000]
    assert _int_list("1, invalid, 1999") == [1, 1999]
    assert _rate_windows("1;w=1, 2000;w=2592000") == [1, 2592000]
