from __future__ import annotations

import json
import os
import time
from typing import Any, Literal

import requests

from .config import load_config


class LLMError(RuntimeError):
    pass


_TRANSIENT_HTTP = {408, 409, 425, 429, 500, 502, 503, 504}


class OpenAIResponsesClient:
    def __init__(self, model: str):
        self.api_key = os.environ.get("OPENAI_API_KEY", "")
        if not self.api_key:
            raise LLMError("OPENAI_API_KEY is required")
        self.model = model
        self.endpoint = "https://api.openai.com/v1/responses"

    def _post(self, payload: dict[str, Any]) -> requests.Response:
        last_error: Exception | None = None
        for attempt in range(3):
            try:
                response = requests.post(
                    self.endpoint,
                    headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                    json=payload,
                    timeout=(20, 180),
                )
            except requests.RequestException as exc:
                last_error = exc
                if attempt == 2:
                    raise LLMError(f"OpenAI request failed after retries: {exc}") from exc
                time.sleep(2 ** attempt)
                continue

            if response.status_code < 400:
                return response
            if response.status_code not in _TRANSIENT_HTTP or attempt == 2:
                raise LLMError(f"OpenAI error {response.status_code}: {response.text[:500]}")

            retry_after = response.headers.get("Retry-After", "")
            try:
                wait = min(10.0, max(1.0, float(retry_after))) if retry_after else float(2 ** attempt)
            except ValueError:
                wait = float(2 ** attempt)
            time.sleep(wait)

        raise LLMError(f"OpenAI request failed: {last_error}")

    def text(self, instructions: str, input_text: str, *, model: str | None = None) -> str:
        payload = {
            "model": model or self.model,
            "instructions": instructions,
            "input": input_text,
        }
        response = self._post(payload)
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

    @staticmethod
    def _strip_json_fence(raw: str) -> str:
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.strip("`")
            if raw.lstrip().startswith("json"):
                raw = raw.lstrip()[4:].lstrip()
        return raw.strip()

    def json(self, instructions: str, input_text: str, *, model: str | None = None) -> Any:
        raw = self._strip_json_fence(self.text(
            instructions + "\nReturn valid JSON only. No markdown fences or commentary.",
            input_text,
            model=model,
        ))
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            # One targeted repair attempt is cheaper and more robust than rerunning the whole task.
            repaired = self._strip_json_fence(self.text(
                "Repair the supplied text into valid JSON without changing its meaning. Return JSON only.",
                raw,
                model=model,
            ))
            try:
                return json.loads(repaired)
            except json.JSONDecodeError as exc:
                raise LLMError(f"Model returned invalid JSON after repair: {repaired[:500]}") from exc


def get_llm(*, high_reasoning: bool = False, profile: Literal["fast", "balanced", "high"] | None = None):
    config = load_config()["providers"]["llm"]
    provider = config["provider"]
    if provider != "openai":
        raise LLMError(f"Unsupported v2 LLM provider: {provider}")
    selected = profile or ("high" if high_reasoning else "fast")
    if selected == "high":
        model = config["high_reasoning_model"]
    elif selected == "balanced":
        model = config.get("balanced_model", config["model"])
    else:
        model = config["model"]
    return OpenAIResponsesClient(model)
