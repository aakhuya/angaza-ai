from dataclasses import dataclass, field
from typing import Any, Protocol


class ProviderError(RuntimeError):
    """Any failure talking to an AI provider."""


class ProviderNotConfigured(ProviderError):
    """Raised when a provider is selected but required config is missing."""


@dataclass(frozen=True)
class ChatMessage:
    role: str  # "system" | "user" | "assistant"
    content: str


@dataclass(frozen=True)
class ChatRequest:
    """A structured, agent-shaped request.

    ``response_schema`` is a JSON-schema dict the caller expects the model to
    emit as JSON. Providers that support JSON mode should enforce it; providers
    that do not must at least validate against it before returning.
    """

    messages: list[ChatMessage]
    response_schema: dict[str, Any]
    temperature: float = 0.2
    max_tokens: int = 512
    request_id: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ChatResponse:
    """Parsed JSON response from the provider.

    ``raw`` retains the model's literal text for logging/traceability.
    ``provider`` and ``model`` are recorded so agent executions can be
    attributed honestly on the /agents page.
    """

    data: dict[str, Any]
    raw: str
    provider: str
    model: str
    duration_ms: int
    usage: dict[str, int] = field(default_factory=dict)


class AIProvider(Protocol):
    name: str

    async def complete_json(self, request: ChatRequest) -> ChatResponse: ...
