from app.ai.deepseek import DeepSeekProvider
from app.ai.foundry import MicrosoftFoundryProvider
from app.ai.mock import MockProvider
from app.ai.provider import AIProvider, ChatRequest, ChatResponse, ProviderError
from app.core.config import get_settings
from app.core.logging import get_logger

log = get_logger("angaza.ai")


class FallbackProvider:
    """Primary + fallback provider.

    Any ProviderError from the primary is caught, logged, and retried on the
    fallback. The ChatResponse carries the provider name that actually
    answered, so downstream traceability stays honest.
    """

    def __init__(self, primary: AIProvider, fallback: AIProvider) -> None:
        self._primary = primary
        self._fallback = fallback
        self.name = f"{primary.name}->{fallback.name}"

    async def complete_json(self, request: ChatRequest) -> ChatResponse:
        try:
            return await self._primary.complete_json(request)
        except ProviderError as exc:
            log.warning(
                "ai_provider_fallback",
                primary=self._primary.name,
                fallback=self._fallback.name,
                request_id=request.request_id,
                error=str(exc),
            )
            return await self._fallback.complete_json(request)


_OVERRIDE: AIProvider | None = None


def set_provider_override(provider: AIProvider | None) -> None:
    """Testing hook — bypasses config-based selection."""
    global _OVERRIDE
    _OVERRIDE = provider


def get_provider() -> AIProvider:
    if _OVERRIDE is not None:
        return _OVERRIDE

    settings = get_settings()
    name = settings.ai_provider.lower()
    fallback = MockProvider()

    if name == "mock":
        return fallback

    if name == "deepseek":
        try:
            return FallbackProvider(
                primary=DeepSeekProvider(
                    api_key=settings.deepseek_api_key,
                    base_url=settings.deepseek_base_url,
                    model=settings.deepseek_model,
                ),
                fallback=fallback,
            )
        except ProviderError as exc:
            log.warning("ai_provider_unavailable", provider="deepseek", error=str(exc))
            return fallback

    if name == "foundry":
        try:
            return FallbackProvider(
                primary=MicrosoftFoundryProvider(
                    endpoint=settings.foundry_endpoint,
                    api_key=settings.foundry_api_key,
                ),
                fallback=fallback,
            )
        except ProviderError as exc:
            log.warning("ai_provider_unavailable", provider="foundry", error=str(exc))
            return fallback

    log.warning("ai_provider_unknown", requested=name, using="mock")
    return fallback
