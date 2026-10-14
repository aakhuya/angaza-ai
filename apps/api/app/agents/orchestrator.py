import time
from dataclasses import dataclass

from app.agents import match_intelligence, narrative, personalization, tactical
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
    tactical_pattern: str | None
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

    # ── Stage 1: Tactical Analysis ────────────────────────────────────
    tac_result = await _call(provider, tactical.build_request(bundle))
    if tac_result is None:
        _record(bundle, event_id, "tactical", "interpret", "rejected", 0,
                None, None, {"viewer_mode": viewer_mode}, {}, ("provider_error",))
        return None
    tac_resp, tac_ms = tac_result

    v = verify(
        title=tac_resp.data["pattern"],
        body=tac_resp.data["description"],
        supporting_facts=list(tac_resp.data.get("key_metrics") or []),
        category="context",
        bundle=bundle,
        allowed_categories=ALLOWED_CATEGORIES | {"context"},
    )
    _record(bundle, event_id, "tactical", "interpret",
            "ok" if v.ok else "rejected", tac_ms,
            tac_resp.provider, tac_resp.model,
            {"importance": bundle.importance_score},
            {"pattern": tac_resp.data["pattern"]},
            v.reasons)
    if not v.ok:
        return None

    # ── Stage 2: Match Intelligence (uses tactical frame) ─────────────
    mi_result = await _call(provider, match_intelligence.build_request(bundle, tactical=tac_resp.data))
    if mi_result is None:
        _record(bundle, event_id, "match_intelligence", "explain", "rejected", 0,
                None, None, {}, {}, ("provider_error",))
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
    _record(bundle, event_id, "match_intelligence", "explain",
            "ok" if v.ok else "rejected", mi_ms,
            mi_resp.provider, mi_resp.model,
            {"tactical_pattern": tac_resp.data["pattern"]},
            {"category": mi_resp.data["category"], "title": mi_resp.data["title"]},
            v.reasons)
    if not v.ok:
        return None

    # ── Stage 3: Narrative ────────────────────────────────────────────
    nar_result = await _call(provider, narrative.build_request(bundle, mi_resp.data))
    if nar_result is None:
        _record(bundle, event_id, "narrative", "narrate", "rejected", 0,
                None, None, {}, {}, ("provider_error",))
        return None
    nar_resp, nar_ms = nar_result

    v = verify(
        title=nar_resp.data["headline"],
        body=nar_resp.data["body"],
        supporting_facts=[],
        category=mi_resp.data["category"],
        bundle=bundle,
        allowed_categories=ALLOWED_CATEGORIES,
    )
    _record(bundle, event_id, "narrative", "narrate",
            "ok" if v.ok else "rejected", nar_ms,
            nar_resp.provider, nar_resp.model,
            {}, {"headline": nar_resp.data["headline"]}, v.reasons)
    if not v.ok:
        return None

    # ── Stage 4: Personalization ──────────────────────────────────────
    per_result = await _call(
        provider,
        personalization.build_request(
            viewer_mode=viewer_mode,
            title=nar_resp.data["headline"],
            body=nar_resp.data["body"],
            intelligence=mi_resp.data,
            narrative=nar_resp.data,
        ),
    )
    if per_result is None:
        _record(bundle, event_id, "personalization", "personalize", "rejected", 0,
                None, None, {}, {}, ("provider_error",))
        return None
    per_resp, per_ms = per_result

    v = verify(
        title=per_resp.data["title"],
        body=per_resp.data["body"],
        supporting_facts=[],
        category=mi_resp.data["category"],
        bundle=bundle,
        allowed_categories=ALLOWED_CATEGORIES,
    )
    _record(bundle, event_id, "personalization", "personalize",
            "ok" if v.ok else "rejected", per_ms,
            per_resp.provider, per_resp.model,
            {"viewer_mode": viewer_mode},
            {"title": per_resp.data["title"]}, v.reasons)
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
        tactical_pattern=tac_resp.data["pattern"],
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
    return response, int((time.perf_counter() - started) * 1000)


def _record(bundle, event_id, agent, stage, status, duration_ms,
            provider, model, input_summary, output_summary, reasons):
    agent_store.add(AgentExecution(
        id=f"{bundle.match_id}-{event_id}-{agent}-{duration_ms}",
        match_id=bundle.match_id,
        event_id=event_id,
        agent=agent,
        stage=stage,
        status=status,
        duration_ms=duration_ms,
        provider=provider,
        model=model,
        input_summary=input_summary,
        output_summary=output_summary,
        reasons=tuple(reasons),
    ))
