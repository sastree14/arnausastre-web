import base64
from datetime import datetime, timedelta, timezone

from growth.src import gmail_sync, operator_queue
from growth.src.content_engagement import _clean_hashtags, _metric
from growth.src.gmail_sync import _connection_access_token, _heuristic
from growth.src.integrations import decrypt_secret, encrypt_secret
from growth.src.seo_ops import _slug
from growth.src.storage import LocalJsonStore


def test_clean_hashtags_deduplicates_and_limits():
    values = ["#DemandForecasting", "DemandForecasting", "Supply Chain", "#AI_Automation", "x", "Pricing", "Extra", "Overflow"]
    assert _clean_hashtags(values) == ["#DemandForecasting", "#SupplyChain", "#AI_Automation", "#Pricing", "#Extra"]


def test_metric_only_returns_real_metric_from_text():
    assert _metric("WAPE improved by 18% after the forecasting change") is not None
    assert _metric("Forecast quality improved materially") is None


def test_gmail_heuristic_keeps_business_mail_visible():
    important = _heuristic({"sender_email": "client@example.com", "subject": "Invoice payment overdue", "snippet": "Can we resolve this today?"})
    noise = _heuristic({"sender_email": "news@example.com", "subject": "Weekly newsletter", "snippet": "Unsubscribe here"})
    assert important["relevance_score"] >= 5
    assert important["category"] == "finance"
    assert noise["relevance_score"] < 5


def test_integration_secret_round_trip(monkeypatch):
    monkeypatch.setenv("GROWTH_ENCRYPTION_KEY", base64.b64encode(b"k" * 32).decode("ascii"))
    encrypted = encrypt_secret("refresh-token-value")
    assert encrypted.startswith("v1.")
    assert encrypted != "refresh-token-value"
    assert decrypt_secret(encrypted) == "refresh-token-value"


def test_gmail_refresh_persists_new_access_token(monkeypatch, tmp_path):
    monkeypatch.setenv("GROWTH_ENCRYPTION_KEY", base64.b64encode(b"r" * 32).decode("ascii"))
    monkeypatch.setenv("GOOGLE_CLIENT_ID", "client-id")
    monkeypatch.setenv("GOOGLE_CLIENT_SECRET", "client-secret")
    store = LocalJsonStore(tmp_path)
    expired = (datetime.now(timezone.utc) - timedelta(minutes=5)).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    connection = {
        "connection_id": "gmail_test_connection",
        "tenant_id": "sc-analytics",
        "provider": "gmail",
        "account_type": "mailbox",
        "provider_subject": "owner@example.com",
        "access_token_ciphertext": encrypt_secret("old-access-token"),
        "token_expires_at": expired,
        "metadata": {"refresh_token_ciphertext": encrypt_secret("refresh-token")},
    }
    store.insert("integration_connections", connection)

    class Response:
        status_code = 200
        text = ""
        def json(self):
            return {"access_token": "new-access-token", "expires_in": 3600}

    monkeypatch.setattr(gmail_sync.requests, "post", lambda *args, **kwargs: Response())
    token = _connection_access_token(dict(connection), store)
    saved = store.filter("integration_connections", connection_id="gmail_test_connection")[0]
    assert token == "new-access-token"
    assert decrypt_secret(saved["access_token_ciphertext"]) == "new-access-token"
    assert datetime.fromisoformat(saved["token_expires_at"].replace("Z", "+00:00")) > datetime.now(timezone.utc)


def test_seo_slug_prefers_target_path():
    assert _slug("/services/demand-forecasting", "Demand Forecasting") == "demand-forecasting"
    assert _slug("", "AI Automation Services") == "ai-automation-services"


def test_recovery_window_recovers_two_hour_old_task(monkeypatch, tmp_path):
    store = LocalJsonStore(tmp_path)
    created = (datetime.now(timezone.utc) - timedelta(hours=2)).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    store.insert("tasks", {
        "task_id": "task_recovery_test",
        "tenant_id": "sc-analytics",
        "type": "OPERATOR_SEO_AUDIT",
        "status": "queued",
        "scheduled_for": created,
        "created_at": created,
        "inputs": {},
        "outputs": {},
    })
    monkeypatch.setattr(operator_queue, "get_store", lambda: store)
    monkeypatch.setattr(operator_queue, "_execute", lambda task: {"ok": True})
    result = operator_queue.run_operator_queue(recovery=True, recovery_minutes=10080)
    assert result[0]["status"] == "completed"
    assert store.filter("tasks", task_id="task_recovery_test")[0]["status"] == "completed"


def test_recovery_requeues_and_executes_stale_running_task(monkeypatch, tmp_path):
    store = LocalJsonStore(tmp_path)
    created = (datetime.now(timezone.utc) - timedelta(minutes=60)).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    store.insert("tasks", {
        "task_id": "task_stale_running",
        "tenant_id": "sc-analytics",
        "type": "OPERATOR_SEO_AUDIT",
        "status": "running",
        "scheduled_for": created,
        "created_at": created,
        "inputs": {},
        "outputs": {},
    })
    monkeypatch.setattr(operator_queue, "get_store", lambda: store)
    monkeypatch.setattr(operator_queue, "_execute", lambda task: {"ok": True})
    result = operator_queue.run_operator_queue(recovery=True, recovery_minutes=10080)
    saved = store.filter("tasks", task_id="task_stale_running")[0]
    assert result[0]["status"] == "completed"
    assert saved["status"] == "completed"


def test_recovery_does_not_touch_recent_running_task(monkeypatch, tmp_path):
    store = LocalJsonStore(tmp_path)
    created = (datetime.now(timezone.utc) - timedelta(minutes=10)).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    store.insert("tasks", {
        "task_id": "task_recent_running",
        "tenant_id": "sc-analytics",
        "type": "OPERATOR_SEO_AUDIT",
        "status": "running",
        "scheduled_for": created,
        "created_at": created,
        "inputs": {},
        "outputs": {},
    })
    monkeypatch.setattr(operator_queue, "get_store", lambda: store)
    monkeypatch.setattr(operator_queue, "_execute", lambda task: {"ok": True})
    result = operator_queue.run_operator_queue(recovery=True, recovery_minutes=10080)
    assert result == []
    assert store.filter("tasks", task_id="task_recent_running")[0]["status"] == "running"