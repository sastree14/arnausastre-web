from growth.src import channel_contracts


def test_channel_contracts_cover_primary_surfaces():
    for output_type in (
        "linkedin_post",
        "website_article",
        "website_project",
        "marketplace_project",
        "github_portfolio",
    ):
        contract = channel_contracts.get_channel_contract(output_type)
        assert contract["required_components"]


def test_linkedin_contract_rejects_thin_body():
    issues = channel_contracts.draft_contract_issues(
        {"title": "Test", "body": "Too short"},
        "linkedin_post",
    )
    assert any("hard minimum" in issue for issue in issues)


def test_project_contract_requires_verified_project_source_semantically():
    contract = channel_contracts.get_channel_contract("website_project")
    assert contract["requires_project_source"] is True
    assert contract["purpose"] == "executive_to_technical_proof"
