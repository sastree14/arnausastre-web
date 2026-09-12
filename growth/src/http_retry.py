from __future__ import annotations

import random
import time
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone
from typing import Iterable

import requests

DEFAULT_RETRY_STATUSES = frozenset({408, 425, 429, 500, 502, 503, 504})


def _retry_delay(response: requests.Response | None, attempt: int) -> float:
    if response is not None:
        value = response.headers.get("Retry-After", "").strip()
        if value:
            try:
                return min(30.0, max(0.0, float(value)))
            except ValueError:
                try:
                    when = parsedate_to_datetime(value)
                    if when.tzinfo is None:
                        when = when.replace(tzinfo=timezone.utc)
                    return min(30.0, max(0.0, (when - datetime.now(timezone.utc)).total_seconds()))
                except Exception:
                    pass
    base = min(8.0, 0.75 * (2 ** max(0, attempt - 1)))
    return base + random.uniform(0.0, 0.25)


def request_with_retry(
    method: str,
    url: str,
    *,
    attempts: int = 4,
    retry_statuses: Iterable[int] = DEFAULT_RETRY_STATUSES,
    retry_exceptions: bool = True,
    **kwargs,
) -> requests.Response:
    """Make a bounded HTTP request with exponential backoff for transient failures.

    Callers should only use this for idempotent requests, deterministic upserts, or
    external APIs where repeating the operation is explicitly acceptable.
    """
    statuses = set(retry_statuses)
    attempts = max(1, attempts)
    last_error: requests.RequestException | None = None

    for attempt in range(1, attempts + 1):
        try:
            response = requests.request(method, url, **kwargs)
        except requests.RequestException as exc:
            last_error = exc
            if not retry_exceptions or attempt >= attempts:
                raise
            time.sleep(_retry_delay(None, attempt))
            continue

        if response.status_code not in statuses or attempt >= attempts:
            return response
        time.sleep(_retry_delay(response, attempt))

    if last_error is not None:
        raise last_error
    raise RuntimeError("HTTP retry loop ended without a response")
