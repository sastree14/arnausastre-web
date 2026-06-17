"""Decides which Topics Bank row (if any) still needs an article, and picks one."""

from __future__ import annotations

import random
from dataclasses import dataclass


class NoTopicsBankError(Exception):
    """Topics Bank has no rows at all — nothing to pick from."""


class NoPendingTopicsError(Exception):
    """Every Topics Bank row already has a matching Content Pipeline entry."""


@dataclass
class PendingTopic:
    theme: str
    industry: str
    possible_title: str
    decision_problem: str
    business_value: str
    analytical_background: str
    ceo_relevance: str
    difficulty: str
    notes: str


def _key(theme: str, industry: str) -> tuple[str, str]:
    return theme.strip().lower(), industry.strip().lower()


def get_pending_topics(topics_bank_rows: list[dict], content_pipeline_rows: list[dict]) -> list[PendingTopic]:
    if not topics_bank_rows:
        raise NoTopicsBankError(
            "Topics Bank no tiene filas — añade al menos una idea antes de ejecutar este workflow."
        )

    covered = {
        _key(row.get("Theme", ""), row.get("Industry", ""))
        for row in content_pipeline_rows
        if row.get("Theme") and row.get("Industry")
    }

    pending = [
        PendingTopic(
            theme=row.get("Theme", "").strip(),
            industry=row.get("Industry", "").strip(),
            possible_title=row.get("Possible Title", "").strip(),
            decision_problem=row.get("Decision Problem", "").strip(),
            business_value=row.get("Business Value", "").strip(),
            analytical_background=row.get("Analytical Background", "").strip(),
            ceo_relevance=row.get("CEO Relevance", "").strip(),
            difficulty=row.get("Difficulty", "").strip(),
            notes=row.get("Notes", "").strip(),
        )
        for row in topics_bank_rows
        if row.get("Theme") and row.get("Industry") and _key(row["Theme"], row["Industry"]) not in covered
    ]

    if not pending:
        raise NoPendingTopicsError(
            "Todos los temas de Topics Bank ya tienen una entrada en Content Pipeline. "
            "Añade ideas nuevas en Topics Bank antes de volver a ejecutar este workflow."
        )

    return pending


def choose_topic(pending_topics: list[PendingTopic]) -> tuple[PendingTopic, int]:
    """Returns the chosen topic and the integer seed used, so the choice is traceable in logs."""
    seed = random.SystemRandom().randrange(0, 2**31 - 1)
    rng = random.Random(seed)
    chosen = rng.choice(pending_topics)
    return chosen, seed
