from datetime import datetime, timedelta, timezone

from growth.src import operator_queue
from growth.src.content_engagement import _clean_hashtags, _metric
from growth.src.gmail_sync import _heuristic
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
