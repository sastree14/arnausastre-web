from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BRAIN_DIR = ROOT / "brain"

REQUIRED_BRAIN_FILES = [
    "company/identity.md",
    "company/positioning.md",
    "company/services.md",
    "company/principles.md",
    "commercial/icp.md",
    "commercial/channels.md",
    "voice/arnau_voice.md",
    "voice/company_voice.md",
    "voice/forbidden_language.md",
    "evidence/evidence_policy.md",
]


class BrainError(RuntimeError):
    pass


def validate_brain() -> list[str]:
    missing = [relative for relative in REQUIRED_BRAIN_FILES if not (BRAIN_DIR / relative).exists()]
    if missing:
        raise BrainError(f"Missing Brain files: {missing}")
    return REQUIRED_BRAIN_FILES


def load_brain(files: list[str] | None = None) -> str:
    selected = files or validate_brain()
    blocks: list[str] = []
    for relative in selected:
        path = BRAIN_DIR / relative
        if not path.exists():
            raise BrainError(f"Brain file not found: {relative}")
        blocks.append(f"===== {relative} =====\n{path.read_text(encoding='utf-8').strip()}")
    return "\n\n".join(blocks)
