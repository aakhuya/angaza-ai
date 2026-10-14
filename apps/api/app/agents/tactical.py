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
    "You are the Tactical Analysis agent for Angaza AI. You receive a "
    "validated FactBundle describing one match event and its surrounding "
    "state. Identify the tactical pattern in play and describe it in one or "
    "two sentences. Every claim must be traceable to a value in the facts. "
    "Return ONLY the JSON object that matches the schema."
)


def build_request(bundle: FactBundle) -> ChatRequest:
    return ChatRequest(
        messages=[
            ChatMessage(role="system", content=SYSTEM),
            ChatMessage(
                role="user",
                content=json.dumps(bundle.to_prompt_json(), separators=(",", ":")),
            ),
        ],
        response_schema=TACTICAL_SCHEMA,
        temperature=0.15,
        max_tokens=260,
    )
