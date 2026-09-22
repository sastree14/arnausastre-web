from growth.src.prospecting import (
    DIRECT_CLIENT_LARGE_EMPLOYEE_THRESHOLD,
    DIRECT_CLIENT_LARGE_MIN_SCORE,
    DIRECT_CLIENT_IDEAL_MAX_EMPLOYEES,
    DIRECT_CLIENT_MICRO_MIN_SCORE,
    DIRECT_CLIENT_STRETCH_MIN_SCORE,
    _direct_client_business_allowed,
    _direct_client_size_allowed,
    _lead_discovery_queries,
    _employee_upper_bound,
    _query_prompt,
)


def test_employee_upper_bound_parses_common_ranges():
    assert _employee_upper_bound("1-9 employees") == 9
    assert _employee_upper_bound("11-50 employees") == 50
    assert _employee_upper_bound("51-200") == 200
    assert _employee_upper_bound("201-500 employees") == 500
    assert _employee_upper_bound("1,001-5,000 employees") == 5000
    assert _employee_upper_bound("500+") == 501
    assert _employee_upper_bound("") is None


def test_direct_client_icp_is_broad_and_opportunity_first():
    assert DIRECT_CLIENT_IDEAL_MAX_EMPLOYEES == 250
    assert DIRECT_CLIENT_LARGE_EMPLOYEE_THRESHOLD == 500
    prompt = _query_prompt("lead", set(), "brain")
    assert "1-250" in prompt
    assert "autónomos" in prompt
    assert "AT LEAST 1,000" in prompt
    assert ">500" in prompt
    assert "DO NOT automatically reject" in prompt


def test_direct_client_size_gate_allows_strong_large_company_opportunities():
    assert _direct_client_size_allowed("", 6.0) is True
    assert DIRECT_CLIENT_LARGE_MIN_SCORE == 7.5
    assert _direct_client_size_allowed("1,001-5,000 employees", 7.4) is False
    assert _direct_client_size_allowed("1,001-5,000 employees", 7.5) is True
    assert _direct_client_size_allowed("500+", 8.0) is True


def test_direct_client_size_gate_requires_quality_for_micro_and_stretch():
    assert DIRECT_CLIENT_MICRO_MIN_SCORE == 6.5
    assert DIRECT_CLIENT_STRETCH_MIN_SCORE == 6.5
    assert _direct_client_size_allowed("1-9 employees", 6.4) is False
    assert _direct_client_size_allowed("1-9 employees", 6.5) is True
    assert _direct_client_size_allowed("51-200 employees", 5.5) is True
    assert _direct_client_size_allowed("251-500 employees", 6.4) is False
    assert _direct_client_size_allowed("251-500 employees", 6.5) is True


def test_business_gate_prioritizes_low_internal_data_capacity():
    assert _direct_client_business_allowed({
        "business_model_fit": "strong",
        "operational_leverage": "strong",
        "internal_data_team_likelihood": "low",
        "enterprise_risk": "low",
        "specialist_gap": "possible",
    }, 6.0) is True

    assert _direct_client_business_allowed({
        "business_model_fit": "strong",
        "operational_leverage": "strong",
        "internal_data_team_likelihood": "high",
        "enterprise_risk": "low",
        "specialist_gap": "none",
    }, 9.0) is False

    assert _direct_client_business_allowed({
        "business_model_fit": "strong",
        "operational_leverage": "strong",
        "internal_data_team_likelihood": "low",
        "enterprise_risk": "high",
        "specialist_gap": "clear",
    }, 9.0) is True


def test_lead_discovery_matrix_rotates_across_large_target_universe():
    first = _lead_discovery_queries(0)
    later = _lead_discovery_queries(100)
    assert len(first) == 24
    assert len(set(first)) == 24
    assert first != later
    assert any("autónomo" in query for query in first + later)
    assert any("Barcelona" in query or "Madrid" in query or "Valencia" in query for query in first + later)
