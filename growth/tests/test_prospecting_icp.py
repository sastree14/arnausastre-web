from growth.src.prospecting import (
    DIRECT_CLIENT_HARD_MAX_EMPLOYEES,
    DIRECT_CLIENT_IDEAL_MAX_EMPLOYEES,
    DIRECT_CLIENT_MICRO_MIN_SCORE,
    DIRECT_CLIENT_STRETCH_MIN_SCORE,
    _direct_client_business_allowed,
    _direct_client_size_allowed,
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


def test_direct_client_icp_is_broad_but_has_enterprise_guardrails():
    assert DIRECT_CLIENT_IDEAL_MAX_EMPLOYEES == 250
    assert DIRECT_CLIENT_HARD_MAX_EMPLOYEES == 500
    prompt = _query_prompt("lead", set(), "brain")
    assert "1-250" in prompt
    assert "autónomos" in prompt
    assert "internal Data Science team" in prompt
    assert "AT LEAST 1,000" in prompt
    assert ">500" in prompt


def test_direct_client_size_gate_allows_unknown_but_rejects_enterprise():
    assert _direct_client_size_allowed("", 6.0) is True
    assert _direct_client_size_allowed("1,001-5,000 employees", 10.0) is False
    assert _direct_client_size_allowed("500+", 10.0) is False


def test_direct_client_size_gate_requires_quality_for_micro_and_stretch():
    assert DIRECT_CLIENT_MICRO_MIN_SCORE == 6.5
    assert DIRECT_CLIENT_STRETCH_MIN_SCORE == 7.5
    assert _direct_client_size_allowed("1-9 employees", 6.4) is False
    assert _direct_client_size_allowed("1-9 employees", 6.5) is True
    assert _direct_client_size_allowed("51-200 employees", 5.5) is True
    assert _direct_client_size_allowed("251-500 employees", 7.4) is False
    assert _direct_client_size_allowed("251-500 employees", 7.5) is True


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
    }, 9.0) is False
