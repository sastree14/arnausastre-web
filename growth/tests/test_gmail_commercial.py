import unittest
from src.gmail_commercial import resolve_company, message_kind, thread_state, addresses

class GmailEvidenceTests(unittest.TestCase):
    def row(self, kind='human', date='2026-10-09T08:00:00Z', **changes):
        r = {'sender_email': 'jessica@kodah.ai', 'account_email': 'arnau@sc-analytics.io', 'recipients': ['arnau@sc-analytics.io'], 'subject': 'Meeting', 'snippet': 'Can you share availability?', 'metadata': {'headers': {}}, 'labels': [], 'received_at': date, 'message_key': date}
        if kind == 'sent':
            r.update(sender_email=r['account_email'], recipients=['jessica@kodah.ai'], labels=['SENT'])
        r.update(changes)
        return r
    def test_already_replied_incoming_not_pending(self):
        r = thread_state([self.row(), self.row('sent', '2026-10-09T09:00:00Z')])
        self.assertEqual(r['status'], 'waiting_reply')
    def test_auto_ack_not_interest(self):
        r = self.row(snippet='Thank you for contacting us. We have received your request.')
        self.assertEqual(message_kind(r), 'automatic_ack')
        self.assertIsNone(thread_state([r]))
    def test_vacation_preserves_human_state(self):
        r = self.row(subject='Automatic reply', snippet='Out of office until October 15')
        self.assertEqual(message_kind(r), 'out_of_office')
        self.assertEqual(thread_state([self.row('sent'), r])['status'], 'waiting_reply')
    def test_bounce_is_not_human_reply(self):
        row = self.row(sender_email='mailer-daemon@googlemail.com', snippet='Delivery failure')
        self.assertEqual(message_kind(row), 'bounce')
        self.assertIsNone(thread_state([row]))

    def test_ambiguous_company_does_not_guess(self):
        companies = [{'company_id': 'a', 'website': 'https://kodah.ai'}, {'company_id': 'b', 'website': 'https://kodah.ai'}]
        self.assertEqual(resolve_company(self.row(), companies, [])[0], None)
    def test_consumer_domain_not_identity(self):
        self.assertEqual(resolve_company(self.row(sender_email='x@gmail.com'), [{'company_id': 'a', 'email': 'y@gmail.com'}], [])[0], None)
    def test_exact_email_and_outgoing_recipient(self):
        people = [{'company_id': 'a', 'email': 'jessica@kodah.ai'}]
        self.assertEqual(resolve_company(self.row('sent'), [], people), ('a', 'exact_email'))
    def test_recipient_with_comma_in_display_name(self):
        self.assertEqual(addresses('"Botha, Jessica" <jessica@kodah.ai>, Other <x@test.io>'), ['jessica@kodah.ai', 'x@test.io'])
    def test_older_context_does_not_regress(self):
        rows = [self.row('sent', '2026-10-09T09:00:00Z'), self.row(date='2026-10-08T08:00:00Z')]
        self.assertEqual(thread_state(rows)['status'], 'waiting_reply')

if __name__ == '__main__': unittest.main()

class GmailSyncTests(unittest.TestCase):
    def test_duplicate_sync_idempotency_and_partial_failure_checkpoint(self):
        from unittest.mock import patch
        from src import gmail_sync
        class Store:
            def __init__(self):
                self.connection = {'tenant_id': 'sc-analytics', 'provider': 'gmail', 'account_type': 'CORPORATE', 'provider_subject': 'arnau@sc-analytics.io', 'connection_id': 'c', 'metadata': {}}
                self.rows = {}; self.events = {}; self.fail = False; self.known = False
            def list(self, table):
                return [self.connection] if table == 'integration_connections' else list(self.rows.values())
            def upsert(self, table, row, key): self.rows[row[key]] = row
            def update(self, table, key, value, changes): self.connection.update(changes)
            def filter(self, table, **filters):
                return [e for e in self.events.values() if e.get('idempotency_key') == filters.get('idempotency_key')]
            def rpc(self, name, payload):
                if name.endswith('snapshot'):
                    return {'companies': [{'company_id': 'k', 'canonical_domain': 'kodah.ai'}] if self.known else [], 'people': []}
                if self.fail: raise RuntimeError('RPC unavailable')
                event = payload['p_payload']['event']; self.events[event['idempotency_key']] = event
                return {'ok': True}
        class Response:
            def __init__(self, data): self.data = data
            def raise_for_status(self): pass
            def json(self): return self.data
        def get(url, **kwargs):
            if url.endswith('/messages'):
                return Response({'messages': [{'id': 'm', 'threadId': 't'}]})
            return Response({'messages': [{'id': 'm', 'threadId': 't', 'internalDate': '1791532800000', 'labelIds': ['SENT'], 'snippet': 'Hello', 'payload': {'headers': [{'name': 'From', 'value': 'arnau@sc-analytics.io'}, {'name': 'To', 'value': 'jessica@kodah.ai'}]}}]})
        store = Store()
        with patch.object(gmail_sync, 'get_store', return_value=store), patch.object(gmail_sync, '_connection_access_token', return_value='fake'), patch.object(gmail_sync.requests, 'get', side_effect=get):
            first = gmail_sync.sync_gmail()
            self.assertEqual(len(store.events), 0)
            self.assertEqual(first['unmatched'], 1)
            store.known = True
            second = gmail_sync.sync_gmail()
            third = gmail_sync.sync_gmail()
            self.assertEqual(first['new_messages'], 1)
            self.assertEqual(second['new_messages'], 0)
            self.assertEqual(len(store.events), 1)
            success = store.connection['metadata']['gmail_sync']['last_success_at']
            self.assertEqual(third['already_linked'], 1)
            store.events.clear()
            store.fail = True
            result = gmail_sync.sync_gmail()
            self.assertEqual(len(result['errors']), 1)
            self.assertEqual(store.connection['metadata']['gmail_sync']['last_success_at'], success)
            self.assertFalse(result['runs'][0]['complete'])

class ExistingEventTests(unittest.TestCase):
    def test_existing_event_summary_difference_does_not_mutate(self):
        from src.gmail_sync import _validate_existing_event
        row = {'external_message_id': 'm', 'thread_id': 't'}
        event = {'external_message_id': 'm', 'external_thread_id': 't', 'company_id': 'a', 'content': 'Different presentation'}
        _validate_existing_event([event], row, 'a')
        self.assertEqual(event['content'], 'Different presentation')
    def test_conflicting_link_fails_closed(self):
        from src.gmail_sync import _validate_existing_event
        with self.assertRaises(RuntimeError):
            _validate_existing_event([{'external_message_id':'m','external_thread_id':'t','company_id':'other'}], {'external_message_id':'m','thread_id':'t'}, 'a')
