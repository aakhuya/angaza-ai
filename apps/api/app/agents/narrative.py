import json

from app.agents.facts import FactBundle
from app.agents.schemas import NARRATIVE_SCHEMA
from app.ai.provider import ChatMessage, ChatRequest

SYSTEM = (
    "You are the Narrative agent for AngazaBol. Given a validated FactBundle "
    "and the Match Intelligence agent's analysis, write broadcast-style copy. "
    "Use football language. Do not invent facts. Do not add numbers that are "
    "not in the facts. Return ONLY the JSON object that matches the schema."
)

RETRY_INSTRUCTIONS = (
    "\n\nIMPORTANT: Your previous response was rejected by the verification "
    "layer for the following reasons:\n{reasons}\n\n"
    "Fix every issue. Do not introduce new numbers or player IDs."
)


def build_request(
    bundle: FactBundle,
    intelligence: dict,
    rejection_reasons: list[str] | None = None,
) -> ChatRequest:
    payload = {
        "facts": bundle.to_prompt_json(),
        "intelligence": intelligence,
    }

    system = SYSTEM
    if rejection_reasons:
        system += RETRY_INSTRUCTIONS.format(reasons="; ".join(rejection_reasons))

    return ChatRequest(
        messages=[
            ChatMessage(role="system", content=system),
            ChatMessage(role="user", content=json.dumps(payload, separators=(",", ":"))),
        ],
        response_schema=NARRATIVE_SCHEMA,
        temperature=0.4,
        max_tokens=300,
    )
