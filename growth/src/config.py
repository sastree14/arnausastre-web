from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "config.yaml"


class ConfigError(RuntimeError):
    pass


def load_config() -> dict[str, Any]:
    if not CONFIG_PATH.exists():
        raise ConfigError(f"Missing config file: {CONFIG_PATH}")
    data = yaml.safe_load(CONFIG_PATH.read_text(encoding="utf-8")) or {}
    for key in ("company", "growth", "content", "providers", "scheduling"):
        if key not in data:
            raise ConfigError(f"Missing top-level config section: {key}")
    return data


def env(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def require_env(name: str) -> str:
    value = env(name)
    if not value:
        raise ConfigError(f"Missing required environment variable: {name}")
    return value
