from __future__ import annotations

import json
import os
from typing import Any

import requests

from .config import load_config


class LLMError(RuntimeError):
    pass


class OpenAIResponsesClient:
    def __init__(self, model: str):
        self.api_key = os.environ.get("OPENAI_API_KEY", "")
        if not self.api_key:
            raise LLMError("OPENAI_API_KEY is required")
        self.model = model
        self.endpoint = "https://api.openai.com/v1/responses"

    def text(self, instructions: str, input_text: str, *, model: str | None = None) -> str:
        payload = {
            "model": model or self.model,
            "instructions": instructions,
            "input": input_text,
        }
        response = requests.post(
            self.endpoint,
            headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
            json=payload,
            timeout=180,
        )
        if response.status_code >= 400:
            raise LLMError(f"OpenAI error {response.status_code}: {response.text[:500]}")
        data = response.json()
        if data.get("output_text"):
            return data["output_text"]
        chunks: list[str] = []
        for item in data.get("output", []):
            for part in item.get("content", []):
                if part.get("type") == "output_text" and part.get("text"):
                    chunks.append(part["text"])
        if not chunks:
            raise LLMError("OpenAI response contained no output text")
        return "\n".join(chunks)

    def json(self, instructions: str, input_text: str, *, model: str | None = None) -> Any:
        raw = self.text(
            instructions + "\nReturn valid JSON only. No markdown fences or commentary.",
            input_text,
            model=model,
        ).strip()
        if raw.startswith("```"):
            raw = raw.strip("`")
            if raw.lstrip().startswith("json"):
                raw = raw.lstrip()[4:].lstrip()
        try:
            return json.loads(raw)
        except json.JSONDecodeError as exc:
            raise LLMError(f"Model returned invalid JSON: {raw[:500]}") from exc


def get_llm(*, high_reasoning: bool = False):
    config = load_config()["providers"]["llm"]
    provider = config["provider"]
    if provider != "openai":
        raise LLMError(f"Unsupported v2 LLM provider: {provider}")
    model = config["high_reasoning_model"] if high_reasoning else config["model"]
    return OpenAIResponsesClient(model)
