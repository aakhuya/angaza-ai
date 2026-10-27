import json

from app.agents.schemas import PERSONALIZATION_SCHEMA
from app.ai.provider import ChatMessage, ChatRequest

SYSTEM = (
    "You are the Personalization agent for AngazaBol. Rewrite the given "
    "insight for the requested viewer mode. You MUST NOT change any numbers, "
    "team names, player names, or factual claims. Only change tone, emphasis, "
    "and depth. Viewer modes: 'casual' (short, plain, energetic), 'analyst' "
    "(precise, tactical, metric-led), 'player_focus' (centred on a specific "
    "player's contribution). Return ONLY the JSON object that matches the schema."
)

RETRY_INSTRUCTIONS = (
    "\n\nIMPORTANT: Your previous response was rejected by the verification "
    "layer for the following reasons:\n{reasons}\n\n"
    "Fix every issue. Preserve every number and name exactly as given."
)


def build_request(
    *,
    viewer_mode: str,
    title: str,
    body: str,
    intelligence: dict,
    narrative: dict,
    rejection_reasons: list[str] | None = None,
) -> ChatRequest:
    payload = {
        "viewer_mode": viewer_mode,
        "current_title": title,
        "current_body": body,
        "intelligence": intelligence,
        "narrative": narrative,
    }

    system = SYSTEM
    if rejection_reasons:
        system += RETRY_INSTRUCTIONS.format(reasons="; ".join(rejection_reasons))

    return ChatRequest(
        messages=[
            ChatMessage(role="system", content=system),
            ChatMessage(role="user", content=json.dumps(payload, separators=(",", ":"))),
        ],
        response_schema=PERSONALIZATION_SCHEMA,
        temperature=0.3,
        max_tokens=280,
    )
