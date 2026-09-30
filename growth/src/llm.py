from __future__ import annotations

import base64
import json
import mimetypes
import os
from pathlib import Path
from typing import Any, Literal

import requests

from .config import load_config
from .http_retry import request_with_retry


class LLMError(RuntimeError):
    pass


class OpenAIResponsesClient:
    def __init__(self, model: str):
        self.api_key = os.environ.get("OPENAI_API_KEY", "")
        if not self.api_key:
            raise LLMError("OPENAI_API_KEY is required")
        self.model = model
        self.endpoint = "https://api.openai.com/v1/responses"

    @staticmethod
    def _output_text(data: dict[str, Any]) -> str:
        if data.get("output_text"):
            return str(data["output_text"])
        chunks: list[str] = []
        for item in data.get("output", []):
            for part in item.get("content", []):
                if part.get("type") == "output_text" and part.get("text"):
                    chunks.append(str(part["text"]))
        if not chunks:
            raise LLMError("OpenAI response contained no output text")
        return "\n".join(chunks)

    def _post(self, payload: dict[str, Any]) -> dict[str, Any]:
        try:
            response = request_with_retry(
                "POST",
                self.endpoint,
                attempts=3,
                # Do not automatically repeat ambiguous network failures: a model
                # response may already have been generated and billed upstream.
                retry_exceptions=False,
                headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                json=payload,
                timeout=180,
            )
        except requests.RequestException as exc:
            raise LLMError(f"OpenAI request failed: {exc}") from exc
        if response.status_code >= 400:
            raise LLMError(f"OpenAI error {response.status_code}: {response.text[:500]}")
        return response.json()

    def text(self, instructions: str, input_text: str, *, model: str | None = None) -> str:
        data = self._post({
            "model": model or self.model,
            "instructions": instructions,
            "input": input_text,
        })
        return self._output_text(data)

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

    def vision_json(self, instructions: str, input_text: str, image_path: str | Path, *, model: str | None = None) -> Any:
        """Return JSON after inspecting a local rendered image through the Responses API."""
        path = Path(image_path)
        if not path.exists():
            raise LLMError(f"Image not found: {path}")
        mime = mimetypes.guess_type(path.name)[0] or "image/png"
        encoded = base64.b64encode(path.read_bytes()).decode("ascii")
        data_url = f"data:{mime};base64,{encoded}"
        payload = {
            "model": model or self.model,
            "instructions": instructions + "\nReturn valid JSON only. No markdown fences or commentary.",
            "input": [{
                "role": "user",
                "content": [
                    {"type": "input_text", "text": input_text},
                    {"type": "input_image", "image_url": data_url},
                ],
            }],
        }
        raw = self._output_text(self._post(payload)).strip()
        if raw.startswith("```"):
            raw = raw.strip("`")
            if raw.lstrip().startswith("json"):
                raw = raw.lstrip()[4:].lstrip()
        try:
            return json.loads(raw)
        except json.JSONDecodeError as exc:
            raise LLMError(f"Vision model returned invalid JSON: {raw[:500]}") from exc


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
