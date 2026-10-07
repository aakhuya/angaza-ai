"""Agent-backed insight generator.

Public interface is stable across phases: (event, state, importance, viewer_mode)
-> InsightEnvelope | None. Returning None means the pipeline declined to
publish an insight (verification rejected it, or a provider failed).
"""

from uuid import uuid4

from app.agents.facts import build_fact_bundle
from app.agents.orchestrator import run as run_agents
from app.ai.registry import get_provider
from app.analytics.state import ImportanceScore, MatchState
from app.schemas.events import Event
from app.schemas.stream import InsightEnvelope


async def generate(
    event: Event,
    state: MatchState,
    importance: ImportanceScore,
    viewer_mode: str = "analyst",
) -> InsightEnvelope | None:
    bundle = build_fact_bundle(event, state, importance)
    outcome = await run_agents(
        provider=get_provider(), bundle=bundle, viewer_mode=viewer_mode
    )
    if outcome is None:
        return None

    return InsightEnvelope(
        insight_id=str(uuid4()),
        match_id=state.match_id,
        minute=event.minute,
        second=event.second,
        category=outcome.category,
        title=outcome.title,
        body=outcome.body,
        viewer_mode=viewer_mode,
        supporting_event_ids=[event.event_id],
        confidence=outcome.confidence,
    )
