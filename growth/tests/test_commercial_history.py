from growth.src.commercial_history import (
    canonical_domain, canonical_linkedin_profile, find_existing_company,
    find_existing_person, may_discover, preserve_existing_record,
)


def test_domain_variants_match_one_persistent_company():
    row = {'company_id': 'old', 'website': 'https://www.Example.com/about?source=mail', 'name': 'Éxample, SL'}
    for url in ['http://example.com/', 'example.com/products#hello', 'https://EXAMPLE.com:443?q=1']:
        assert canonical_domain(url) == 'example.com'
        assert find_existing_company([row], url, 'Different trading name') == row
    assert find_existing_company([row], '', 'Example SL') == row


def test_fresh_discovery_excludes_all_known_even_explicit_false_but_followup_can_revisit():
    row = {'status': 'candidate', 'exclude_from_discovery': False}
    assert may_discover(None)
    assert not may_discover(row)
    assert may_discover(row, include_existing=True)
    assert not may_discover({'status': 'declined'}, include_existing=True)
    assert not may_discover({'completed_at': '2026-10-09'}, include_existing=True)
    assert not may_discover({'contact_status': 'do_not_contact'}, include_existing=True)


def test_followup_merge_preserves_declined_history_identity_and_contact():
    old = {'company_id': 'old', 'status': 'declined', 'contact_status': 'replied', 'notes': 'Not interested', 'completed_at': '2026-10-09', 'email': 'real@example.com'}
    proposed = {'company_id': 'new', 'status': 'candidate', 'notes': '', 'completed_at': None, 'email': '', 'score': 8}
    merged = preserve_existing_record(old, proposed)
    assert merged == {**old, 'score': 8}


def test_person_profile_dedupes_country_locale_query_and_company_change():
    old = {'person_id': 'old', 'company_id': 'former', 'linkedin_url': 'https://es.linkedin.com/in/arnau-sastre/en?x=1', 'status': 'connected'}
    candidate = {'company_id': 'new', 'name': 'Arnau Sastre', 'linkedin_url': 'https://www.linkedin.com/in/Arnau-Sastre/'}
    assert find_existing_person([old], candidate) == old
    assert canonical_linkedin_profile('https://linkedin.com/search/results/people/?keywords=arnau') == ''
    assert canonical_linkedin_profile('https://evil.test/in/arnau') == ''


def test_signal_scan_fresh_mode_never_revives_contacted_or_discarded_companies():
    from types import SimpleNamespace
    from unittest.mock import Mock, patch
    from growth.src import commercial_intelligence as module
    hit = SimpleNamespace(url='https://news.example/job', title='Job', snippet='Hiring', query='hiring')
    rows = [
        {'company_id': 'one', 'name': 'Known', 'website': 'https://www.example.com/', 'status': 'contacted'},
        {'company_id': 'two', 'name': 'Closed', 'website': 'https://closed.example/', 'status': 'discarded'},
    ]
    signals = [dict(company_name=row['name'], website=row['website'].replace('https:', 'http:'), source_url=hit.url, strength=9) for row in rows]
    store = Mock()
    store.filter.side_effect = lambda table, **kw: rows if table == 'companies' else []
    search = Mock(); search.search.return_value = [hit]
    llm = Mock(); llm.json.return_value = signals
    with patch.object(module, 'load_config', return_value={'company': {'tenant_id': 'sc'}}), patch.object(module, 'load_brain', return_value=''), patch.object(module, 'get_store', return_value=store), patch.object(module, 'BraveResearchClient', return_value=search), patch.object(module, 'get_llm', return_value=llm):
        assert module.run_commercial_signal_scan() == []
    store.upsert.assert_not_called()
    store.update.assert_not_called()


def test_new_signal_company_is_saved_and_not_returned_on_next_scan(tmp_path):
    from types import SimpleNamespace
    from unittest.mock import Mock, patch
    from growth.src import commercial_intelligence as module
    from growth.src.storage import LocalJsonStore
    hit = SimpleNamespace(url='https://news.example/job', title='Job', snippet='Hiring', query='hiring')
    raw = {'company_name': 'Fresh', 'website': 'https://www.fresh.example/about', 'source_url': hit.url, 'strength': 7, 'employee_range': '11-50', 'recommended_offer': 'Data & BI Audit'}
    store = LocalJsonStore(tmp_path)
    search = Mock(); search.search.return_value = [hit]
    llm = Mock(); llm.json.return_value = [raw]
    with patch.object(module, 'load_config', return_value={'company': {'tenant_id': 'sc'}}), patch.object(module, 'load_brain', return_value=''), patch.object(module, 'get_store', return_value=store), patch.object(module, 'BraveResearchClient', return_value=search), patch.object(module, 'get_llm', return_value=llm), patch.object(module, '_linkedin_company_url', return_value=''), patch.object(module, '_discover_primary_person', return_value=None):
        assert len(module.run_commercial_signal_scan()) == 1
        assert module.run_commercial_signal_scan() == []
    assert len(store.list('companies')) == 1
    assert store.list('companies')[0]['exclude_from_discovery'] is True
    assert store.list('companies')[0]['canonical_domain'] == 'fresh.example'
    assert len(store.list('commercial_signals')) == 1
