import time
from dataclasses import dataclass

from app.agents import match_intelligence, narrative, personalization
from app.agents.facts import FactBundle
from app.agents.verification import verify
from app.ai.provider import AIProvider, ProviderError
from app.core.logging import get_logger
from app.services.agent_store import AgentExecution, agent_store

log = get_logger("angaza.orchestrator")

ALLOWED_CATEGORIES = {
    "key_moment", "chance", "progression", "defensive",
    "pressure", "milestone", "context",
}


@dataclass(frozen=True)
class AgentOutcome:
    title: str
    body: str
    category: str
    supporting_facts: tuple[str, ...]
    provider: str
    model: str
    confidence: float


async def run(
    *,
    provider: AIProvider,
    bundle: FactBundle,
    viewer_mode: str,
) -> AgentOutcome | None:
    event_id = bundle.event.get("event_id", "unknown")

    mi_result = await _call(provider, match_intelligence.build_request(bundle))
    if mi_result is None:
        _record_rejected(bundle, viewer_mode, "match_intelligence", "provider_error", event_id)
        return None
    mi_resp, mi_ms = mi_result

    v = verify(
        title=mi_resp.data["title"],
        body=mi_resp.data["why_it_matters"],
        supporting_facts=list(mi_resp.data.get("supporting_facts") or []),
        category=mi_resp.data["category"],
        bundle=bundle,
        allowed_categories=ALLOWED_CATEGORIES,
    )
    _record(
        match_id=bundle.match_id, event_id=event_id,
        agent="match_intelligence", stage="interpret",
        status="ok" if v.ok else "rejected", duration_ms=mi_ms,
        provider=mi_resp.provider, model=mi_resp.model,
        input_summary={"importance": bundle.importance_score,
                       "reasons": list(bundle.importance_reasons)},
        output_summary={"category": mi_resp.data["category"],
                        "title": mi_resp.data["title"]},
        reasons=v.reasons,
    )
    if not v.ok:
        return None

    nar_result = await _call(provider, narrative.build_request(bundle, mi_resp.data))
    if nar_result is None:
        _record_rejected(bundle, viewer_mode, "narrative", "provider_error", event_id)
        return None
    nar_resp, nar_ms = nar_result

    v = verify(
        title=nar_resp.data["headline"], body=nar_resp.data["body"],
        supporting_facts=[], category=mi_resp.data["category"],
        bundle=bundle, allowed_categories=ALLOWED_CATEGORIES,
    )
    _record(
        match_id=bundle.match_id, event_id=event_id,
        agent="narrative", stage="narrate",
        status="ok" if v.ok else "rejected", duration_ms=nar_ms,
        provider=nar_resp.provider, model=nar_resp.model,
        input_summary={"headline_in": mi_resp.data["title"]},
        output_summary={"headline": nar_resp.data["headline"]},
        reasons=v.reasons,
    )
    if not v.ok:
        return None

    per_result = await _call(
        provider,
        personalization.build_request(
            viewer_mode=viewer_mode,
            title=nar_resp.data["headline"], body=nar_resp.data["body"],
            intelligence=mi_resp.data, narrative=nar_resp.data,
        ),
    )
    if per_result is None:
        _record_rejected(bundle, viewer_mode, "personalization", "provider_error", event_id)
        return None
    per_resp, per_ms = per_result

    v = verify(
        title=per_resp.data["title"], body=per_resp.data["body"],
        supporting_facts=[], category=mi_resp.data["category"],
        bundle=bundle, allowed_categories=ALLOWED_CATEGORIES,
    )
    _record(
        match_id=bundle.match_id, event_id=event_id,
        agent="personalization", stage="personalize",
        status="ok" if v.ok else "rejected", duration_ms=per_ms,
        provider=per_resp.provider, model=per_resp.model,
        input_summary={"viewer_mode": viewer_mode},
        output_summary={"title": per_resp.data["title"]},
        reasons=v.reasons,
    )
    if not v.ok:
        return None

    confidence = min(
        1.0,
        0.55 + bundle.importance_score * 0.35 + (0.1 if mi_resp.provider != "mock" else 0.0),
    )

    return AgentOutcome(
        title=per_resp.data["title"],
        body=per_resp.data["body"],
        category=mi_resp.data["category"],
        supporting_facts=tuple(mi_resp.data.get("supporting_facts") or []),
        provider=per_resp.provider,
        model=per_resp.model,
        confidence=round(confidence, 3),
    )


async def _call(provider, request):
    started = time.perf_counter()
    try:
        response = await provider.complete_json(request)
    except ProviderError as exc:
        log.warning("agent_provider_error", request_id=request.request_id, error=str(exc))
        return None
    duration_ms = int((time.perf_counter() - started) * 1000)
    return response, duration_ms


def _record_rejected(bundle, viewer_mode, agent, reason, event_id):
    _record(
        match_id=bundle.match_id, event_id=event_id,
        agent=agent, stage=agent, status="rejected", duration_ms=0,
        provider=None, model=None,
        input_summary={"viewer_mode": viewer_mode}, output_summary={},
        reasons=(reason,),
    )


def _record(*, match_id, event_id, agent, stage, status, duration_ms,
            provider, model, input_summary, output_summary, reasons):
    agent_store.add(
        AgentExecution(
            id=f"{match_id}-{event_id}-{agent}-{duration_ms}",
            match_id=match_id, event_id=event_id,
            agent=agent, stage=stage, status=status,
            duration_ms=duration_ms, provider=provider, model=model,
            input_summary=input_summary, output_summary=output_summary,
            reasons=tuple(reasons),
        )
    )
