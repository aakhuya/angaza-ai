import asyncio
import json
import time
from typing import Any

import httpx

from app.ai.provider import ChatRequest, ChatResponse, ProviderError, ProviderNotConfigured


class DeepSeekProvider:
    """DeepSeek-compatible chat-completions provider.

    Uses JSON mode and validates the response against the requested schema
    before returning. Retries on transient network errors only; 4xx is fatal.
    """

    name = "deepseek"

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.deepseek.com",
        model: str = "deepseek-chat",
        timeout_seconds: float = 30.0,
        max_retries: int = 2,
    ) -> None:
        if not api_key:
            raise ProviderNotConfigured("DEEPSEEK_API_KEY is not set")
        self._api_key = api_key
        self._base_url = base_url.rstrip("/")
        self._model = model
        self._timeout = timeout_seconds
        self._max_retries = max_retries

    async def complete_json(self, request: ChatRequest) -> ChatResponse:
        started = time.perf_counter()
        payload = {
            "model": self._model,
            "messages": [{"role": m.role, "content": m.content} for m in request.messages],
            "temperature": request.temperature,
            "max_tokens": request.max_tokens,
            "response_format": {"type": "json_object"},
        }
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

        last_error: Exception | None = None
        for attempt in range(self._max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self._timeout) as client:
                    resp = await client.post(
                        f"{self._base_url}/chat/completions",
                        json=payload,
                        headers=headers,
                    )
                if resp.status_code >= 500:
                    raise ProviderError(f"provider 5xx: {resp.status_code}")
                if resp.status_code >= 400:
                    # Non-retryable.
                    raise ProviderError(
                        f"provider {resp.status_code}: {resp.text[:200]}"
                    )
                body = resp.json()
                content = body["choices"][0]["message"]["content"]
                data = json.loads(content)
                _validate_against_schema(data, request.response_schema)
                duration_ms = int((time.perf_counter() - started) * 1000)
                usage = body.get("usage") or {}
                return ChatResponse(
                    data=data,
                    raw=content,
                    provider=self.name,
                    model=body.get("model", self._model),
                    duration_ms=duration_ms,
                    usage={
                        "prompt_tokens": int(usage.get("prompt_tokens", 0)),
                        "completion_tokens": int(usage.get("completion_tokens", 0)),
                    },
                )
            except (httpx.HTTPError, ProviderError, json.JSONDecodeError) as exc:
                last_error = exc
                if attempt >= self._max_retries:
                    break
                await asyncio.sleep(0.5 * (attempt + 1))

        raise ProviderError(f"deepseek failed after {self._max_retries + 1} attempts: {last_error}")


def _validate_against_schema(data: dict[str, Any], schema: dict[str, Any]) -> None:
    """Minimal shape check: required keys present and known types.

    Deliberately not full JSON Schema — jsonschema is heavy for a hackathon
    and the provider is not adversarial. Missing or mis-typed required fields
    are the only realistic failure mode and those are what we catch here.
    """
    if not isinstance(data, dict):
        raise ProviderError("response is not a JSON object")
    required = schema.get("required") or []
    props = schema.get("properties") or {}
    for key in required:
        if key not in data:
            raise ProviderError(f"missing required field: {key}")
        expected = (props.get(key) or {}).get("type")
        if expected and not _matches_type(data[key], expected):
            raise ProviderError(f"field {key} expected {expected}, got {type(data[key]).__name__}")


def _matches_type(value: Any, expected: str) -> bool:
    if expected == "string":
        return isinstance(value, str)
    if expected in ("number", "integer"):
        return isinstance(value, int | float) and not isinstance(value, bool)
    if expected == "boolean":
        return isinstance(value, bool)
    if expected == "array":
        return isinstance(value, list)
    if expected == "object":
        return isinstance(value, dict)
    return True
