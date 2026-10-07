from app.ai.provider import ChatRequest, ChatResponse, ProviderNotConfigured


class MicrosoftFoundryProvider:
    """Placeholder implementation of the AIProvider interface for Microsoft Foundry.

    The provider abstraction is genuinely in place; the transport is not yet
    implemented. If Foundry credentials are provisioned during the hackathon,
    fill in ``complete_json`` using the Foundry inference endpoint and keep the
    same interface. Until then, selecting this provider fails fast so we do not
    pretend it works.
    """

    name = "foundry"

    def __init__(self, endpoint: str = "", api_key: str = "") -> None:
        if not endpoint or not api_key:
            raise ProviderNotConfigured(
                "Microsoft Foundry is not configured (set FOUNDRY_ENDPOINT and FOUNDRY_API_KEY)"
            )
        self._endpoint = endpoint
        self._api_key = api_key

    async def complete_json(self, request: ChatRequest) -> ChatResponse:  # pragma: no cover
        raise ProviderNotConfigured("Microsoft Foundry transport not implemented yet")
