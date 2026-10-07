import json

from app.agents.facts import FactBundle
from app.agents.schemas import NARRATIVE_SCHEMA
from app.ai.provider import ChatMessage, ChatRequest

SYSTEM = (
    "You are the Narrative agent for Angaza AI. Given a validated FactBundle and "
    "the Match Intelligence agent's analysis, write broadcast-style copy. "
    "Use football language. Do not invent facts. Do not add numbers that are not "
    "in the facts. Return ONLY the JSON object that matches the schema."
)


def build_request(bundle: FactBundle, intelligence: dict) -> ChatRequest:
    payload = {"facts": bundle.to_prompt_json(), "intelligence": intelligence}
    return ChatRequest(
        messages=[
            ChatMessage(role="system", content=SYSTEM),
            ChatMessage(role="user", content=json.dumps(payload, separators=(",", ":"))),
        ],
        response_schema=NARRATIVE_SCHEMA,
        temperature=0.4,
        max_tokens=300,
    )
