import asyncio
from dataclasses import dataclass

from app.ai.provider import (
    ChatMessage,
    ChatRequest,
    ChatResponse,
    ProviderError,
)
from app.ai.registry import FallbackProvider, get_provider, set_provider_override


class _Flaky:
    name = "flaky"

    def __init__(self) -> None:
        self.calls = 0

    async def complete_json(self, request: ChatRequest) -> ChatResponse:
        self.calls += 1
        raise ProviderError("boom")


class _Healthy:
    name = "healthy"

    async def complete_json(self, request: ChatRequest) -> ChatResponse:
        return ChatResponse(
            data={"ok": True}, raw='{"ok":true}',
            provider=self.name, model="h1", duration_ms=1,
        )


def _req() -> ChatRequest:
    return ChatRequest(
        messages=[ChatMessage(role="user", content="hi")],
        response_schema={
            "type": "object",
            "properties": {"ok": {"type": "boolean"}},
            "required": ["ok"],
        },
    )


def test_fallback_used_when_primary_errors():
    primary = _Flaky()
    fallback = _Healthy()
    fp = FallbackProvider(primary=primary, fallback=fallback)
    resp = asyncio.run(fp.complete_json(_req()))
    assert resp.provider == "healthy"
    assert primary.calls == 1


def test_get_provider_defaults_to_mock(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "mock")
    from app.core.config import get_settings
    get_settings.cache_clear()
    set_provider_override(None)
    p = get_provider()
    assert p.name == "mock"


def test_get_provider_missing_deepseek_key_falls_back_to_mock(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "deepseek")
    monkeypatch.setenv("DEEPSEEK_API_KEY", "")
    from app.core.config import get_settings
    get_settings.cache_clear()
    set_provider_override(None)
    p = get_provider()
    assert p.name == "mock"


def test_set_provider_override_bypasses_config():
    @dataclass
    class _Custom:
        name: str = "custom"

        async def complete_json(self, request: ChatRequest) -> ChatResponse:
            return ChatResponse(data={}, raw="", provider="custom", model="c", duration_ms=0)

    set_provider_override(_Custom())
    try:
        assert get_provider().name == "custom"
    finally:
        set_provider_override(None)
