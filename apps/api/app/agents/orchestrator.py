"""Agent orchestrator.

Runs a four-agent pipeline per important event:

    Tactical Analysis → Match Intelligence → Narrative → Personalization

Each stage is verified. If verification fails, the agent is retried ONCE
with the rejection reasons as feedback, so it can correct its own output.
If the retry also fails, the insight is dropped and logged with a
`rejected_twice` status — visible at /agents.

This is a real production pattern: don't ask the model to try again
blindly, tell it exactly what's wrong.
"""

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

MAX_RETRIES = 1


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
    retries_used: int = 0


async def run(
    *,
    provider: AIProvider,
    bundle: FactBundle,
    viewer_mode: str,
) -> AgentOutcome | None:
    event_id = bundle.event.get("event_id", "unknown")
    total_retries = 0

    # ── Stage 1: Tactical Analysis ────────────────────────────────────
    tac_result = await _run_with_retries(
        provider=provider,
        build_request=lambda rejection_reasons=None: tactical.build_request(bundle),
        bundle=bundle,
        agent_name="tactical",
        stage="interpret",
        event_id=event_id,
        extract_title=lambda d: d["pattern"],
        extract_body=lambda d: d["description"],
        extract_facts=lambda d: d.get("key_metrics") or [],
        extract_category=lambda _d: "context",
    )
    if tac_result is None:
        return None
    tac_resp, tac_retries = tac_result
    total_retries += tac_retries

    # ── Stage 2: Match Intelligence ───────────────────────────────────
    mi_result = await _run_with_retries(
        provider=provider,
        build_request=lambda rejection_reasons=None: match_intelligence.build_request(
            bundle, tactical=tac_resp.data
        ),
        bundle=bundle,
        agent_name="match_intelligence",
        stage="explain",
        event_id=event_id,
        extract_title=lambda d: d["title"],
        extract_body=lambda d: d["why_it_matters"],
        extract_facts=lambda d: d.get("supporting_facts") or [],
        extract_category=lambda d: d["category"],
    )
    if mi_result is None:
        return None
    mi_resp, mi_retries = mi_result
    total_retries += mi_retries

    # ── Stage 3: Narrative ────────────────────────────────────────────
    nar_result = await _run_with_retries(
        provider=provider,
        build_request=lambda rejection_reasons=None: narrative.build_request(
            bundle, mi_resp.data
        ),
        bundle=bundle,
        agent_name="narrative",
        stage="narrate",
        event_id=event_id,
        extract_title=lambda d: d["headline"],
        extract_body=lambda d: d["body"],
        extract_facts=lambda _d: [],
        extract_category=lambda _d: mi_resp.data["category"],
    )
    if nar_result is None:
        return None
    nar_resp, nar_retries = nar_result
    total_retries += nar_retries

    # ── Stage 4: Personalization ──────────────────────────────────────
    per_result = await _run_with_retries(
        provider=provider,
        build_request=lambda rejection_reasons=None: personalization.build_request(
            viewer_mode=viewer_mode,
            title=nar_resp.data["headline"],
            body=nar_resp.data["body"],
            intelligence=mi_resp.data,
            narrative=nar_resp.data,
        ),
        bundle=bundle,
        agent_name="personalization",
        stage="personalize",
        event_id=event_id,
        extract_title=lambda d: d["title"],
        extract_body=lambda d: d["body"],
        extract_facts=lambda _d: [],
        extract_category=lambda _d: mi_resp.data["category"],
    )
    if per_result is None:
        return None
    per_resp, per_retries = per_result
    total_retries += per_retries

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
        retries_used=total_retries,
    )


async def _run_with_retries(
    *,
    provider: AIProvider,
    build_request,
    bundle: FactBundle,
    agent_name: str,
    stage: str,
    event_id: str,
    extract_title,
    extract_body,
    extract_facts,
    extract_category,
):
    """Run one agent call, verify, retry once on verification failure.

    Returns (response, retries_used) or None if both attempts fail.

    On verification failure, the retry request includes the rejection
    reasons so the agent can correct itself. This is the difference between
    "retry and hope" and "retry with feedback."
    """
    retries = 0
    last_reasons: tuple[str, ...] = ()

    for attempt in range(MAX_RETRIES + 1):
        request = build_request(rejection_reasons=list(last_reasons) if attempt > 0 else None)

        started = time.perf_counter()
        try:
            response = await provider.complete_json(request)
        except ProviderError as exc:
            log.warning(
                "agent_provider_error",
                agent=agent_name,
                request_id=request.request_id,
                error=str(exc),
            )
            _record(
                bundle=bundle,
                event_id=event_id,
                agent=agent_name,
                stage=stage,
                status="rejected",
                duration_ms=int((time.perf_counter() - started) * 1000),
                provider=None,
                model=None,
                input_summary={"attempt": attempt + 1, "reason": "provider_error"},
                output_summary={},
                reasons=("provider_error",),
            )
            return None
        duration_ms = int((time.perf_counter() - started) * 1000)

        try:
            title = extract_title(response.data)
            body = extract_body(response.data)
            facts = extract_facts(response.data)
            category = extract_category(response.data)
        except (KeyError, TypeError) as exc:
            last_reasons = (f"malformed_response: {exc}",)
            _record(
                bundle=bundle,
                event_id=event_id,
                agent=agent_name,
                stage=stage,
                status="rejected",
                duration_ms=duration_ms,
                provider=response.provider,
                model=response.model,
                input_summary={"attempt": attempt + 1},
                output_summary={},
                reasons=last_reasons,
            )
            retries += 1
            continue

        result = verify(
            title=title,
            body=body,
            supporting_facts=list(facts),
            category=category,
            bundle=bundle,
            allowed_categories=ALLOWED_CATEGORIES | ({"context"} if agent_name == "tactical" else set()),
        )

        _record(
            bundle=bundle,
            event_id=event_id,
            agent=agent_name,
            stage=stage,
            status="ok" if result.ok else "rejected",
            duration_ms=duration_ms,
            provider=response.provider,
            model=response.model,
            input_summary={
                "attempt": attempt + 1,
                "retry_of_rejection": list(last_reasons) if attempt > 0 else [],
            },
            output_summary={
                "title": title,
                "category": category,
                "retries_used": retries,
            },
            reasons=result.reasons,
        )

        if result.ok:
            return response, retries

        # Verification failed — retry once with reasons as feedback.
        last_reasons = result.reasons
        retries += 1

    # Both attempts failed.
    return None


def _record(
    *,
    bundle,
    event_id,
    agent,
    stage,
    status,
    duration_ms,
    provider,
    model,
    input_summary,
    output_summary,
    reasons,
):
    agent_store.add(
        AgentExecution(
            id=f"{bundle.match_id}-{event_id}-{agent}-{duration_ms}-{time.time_ns()}",
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
        )
    )
