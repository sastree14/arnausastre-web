from growth.src.prospecting import (
    DIRECT_CLIENT_HARD_MAX_EMPLOYEES,
    DIRECT_CLIENT_IDEAL_MAX_EMPLOYEES,
    _employee_upper_bound,
    _query_prompt,
)


def test_employee_upper_bound_parses_common_ranges():
    assert _employee_upper_bound("11-50 employees") == 50
    assert _employee_upper_bound("51-200") == 200
    assert _employee_upper_bound("201-500 employees") == 500
    assert _employee_upper_bound("1,001-5,000 employees") == 5000
    assert _employee_upper_bound("500+") == 501
    assert _employee_upper_bound("") is None


def test_direct_client_icp_limits_are_explicit():
    assert DIRECT_CLIENT_IDEAL_MAX_EMPLOYEES == 200
    assert DIRECT_CLIENT_HARD_MAX_EMPLOYEES == 500
    prompt = _query_prompt("lead", set(), "brain")
    assert "10-200" in prompt
    assert "500" in prompt
    assert "global enterprises" in prompt
