import json

from app.agents.facts import FactBundle
from app.agents.schemas import MATCH_INTELLIGENCE_SCHEMA
from app.ai.provider import ChatMessage, ChatRequest

SYSTEM = (
    "You are the Match Intelligence agent for Angaza AI, a football broadcast "
    "intelligence system. You receive a validated FactBundle describing one "
    "match event, the surrounding match state, and a Tactical Analysis frame "
    "produced by a prior agent. Explain WHY the moment matters in football "
    "terms. Never invent statistics. Every claim must be traceable to a value "
    "in the provided facts. Return ONLY the JSON object that matches the schema."
)


def build_request(bundle: FactBundle, tactical: dict | None = None) -> ChatRequest:
    payload = bundle.to_prompt_json()
    if tactical is not None:
        payload["tactical_frame"] = tactical

    return ChatRequest(
        messages=[
            ChatMessage(role="system", content=SYSTEM),
            ChatMessage(role="user", content=json.dumps(payload, separators=(",", ":"))),
        ],
        response_schema=MATCH_INTELLIGENCE_SCHEMA,
        temperature=0.2,
        max_tokens=400,
    )
