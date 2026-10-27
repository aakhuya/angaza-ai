import json

from app.agents.facts import FactBundle
from app.ai.provider import ChatMessage, ChatRequest

TACTICAL_SCHEMA: dict = {
    "type": "object",
    "properties": {
        "pattern": {
            "type": "string",
            "enum": [
                "high_press_success",
                "high_press_sustained",
                "possession_dominance",
                "counter_attack",
                "deep_block",
                "territory_shift",
                "momentum_reversal",
                "individual_moment",
                "neutral",
            ],
        },
        "description": {"type": "string"},
        "key_metrics": {
            "type": "array",
            "items": {"type": "string"},
        },
    },
    "required": ["pattern", "description", "key_metrics"],
}

SYSTEM = (
    "You are the Tactical Analysis agent for AngazaBol. You receive a "
    "validated FactBundle describing one match event and its surrounding "
    "state. Identify the tactical pattern in play and describe it in one or "
    "two sentences. Every claim must be traceable to a value in the facts. "
    "Return ONLY the JSON object that matches the schema."
)

RETRY_INSTRUCTIONS = (
    "\n\nIMPORTANT: Your previous response was rejected by the verification "
    "layer for the following reasons:\n{reasons}\n\n"
    "Fix every issue. Only reference values present in the facts."
)


def build_request(
    bundle: FactBundle,
    rejection_reasons: list[str] | None = None,
) -> ChatRequest:
    system = SYSTEM
    if rejection_reasons:
        system += RETRY_INSTRUCTIONS.format(reasons="; ".join(rejection_reasons))

    return ChatRequest(
        messages=[
            ChatMessage(role="system", content=system),
            ChatMessage(
                role="user",
                content=json.dumps(bundle.to_prompt_json(), separators=(",", ":")),
            ),
        ],
        response_schema=TACTICAL_SCHEMA,
        temperature=0.15,
        max_tokens=260,
    )
