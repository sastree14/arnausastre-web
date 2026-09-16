from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from .config import load_config
from .storage import get_store


def _parse_datetime(value: Any) -> datetime | None:
    raw = str(value or '').strip()
    if not raw:
        return None
    try:
        parsed = datetime.fromisoformat(raw.replace('Z', '+00:00'))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except ValueError:
        return None


def editorial_reset_at() -> datetime | None:
    tenant_id = load_config()['company']['tenant_id']
    rows = get_store().filter(
        'growth_workspace_settings',
        tenant_id=tenant_id,
        setting_key='editorial_reset',
    )
    if not rows:
        return None
    value = rows[0].get('value') or {}
    if not isinstance(value, dict):
        return None
    return _parse_datetime(value.get('reset_at'))


def is_after_editorial_reset(row: dict[str, Any], *, field: str = 'created_at') -> bool:
    reset_at = editorial_reset_at()
    if reset_at is None:
        return True
    created = _parse_datetime(row.get(field))
    return created is not None and created >= reset_at


def filter_after_editorial_reset(rows: list[dict[str, Any]], *, field: str = 'created_at') -> list[dict[str, Any]]:
    reset_at = editorial_reset_at()
    if reset_at is None:
        return rows
    output: list[dict[str, Any]] = []
    for row in rows:
        created = _parse_datetime(row.get(field))
        if created is not None and created >= reset_at:
            output.append(row)
    return output
