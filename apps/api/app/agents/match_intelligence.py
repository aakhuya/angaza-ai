import json

from app.agents.facts import FactBundle
from app.agents.schemas import MATCH_INTELLIGENCE_SCHEMA
from app.ai.provider import ChatMessage, ChatRequest

SYSTEM = (
    "You are the Match Intelligence agent for Angaza AI, a football broadcast "
    "intelligence system. You receive a validated FactBundle describing one "
    "match event and the surrounding match state. Explain WHY the moment matters. "
    "Never invent statistics. Every claim must be traceable to a value in the "
    "provided facts. Return ONLY the JSON object that matches the schema."
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
        response_schema=MATCH_INTELLIGENCE_SCHEMA,
        temperature=0.2,
        max_tokens=400,
    )
