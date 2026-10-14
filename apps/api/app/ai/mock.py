import hashlib
import json
import re
import time
from typing import Any

from app.ai.provider import ChatRequest, ChatResponse


class MockProvider:
    """Deterministic offline provider.

    Fills the requested ``response_schema`` with values derived from the
    request. Where the field is well-known (tactical pattern, insight
    category), it picks a plausible enum value. For free-text fields it
    composes sentences that reuse *only* numbers that appear in the prompt,
    so the verification layer accepts them.
    """

    name = "mock"

    async def complete_json(self, request: ChatRequest) -> ChatResponse:
        started = time.perf_counter()
        seed_material = "\n".join(f"{m.role}:{m.content}" for m in request.messages)
        digest = hashlib.sha256(seed_material.encode("utf-8")).hexdigest()
        prompt_numbers = _extract_numbers(seed_material)

        data = _fill(request.response_schema, digest, request, prompt_numbers)
        raw = json.dumps(data, separators=(",", ":"))
        duration_ms = int((time.perf_counter() - started) * 1000)
        return ChatResponse(
            data=data,
            raw=raw,
            provider=self.name,
            model="mock-1",
            duration_ms=duration_ms,
            usage={
                "prompt_tokens": len(seed_material) // 4,
                "completion_tokens": len(raw) // 4,
            },
        )


def _extract_numbers(text: str) -> list[float]:
    return [float(n) for n in re.findall(r"(?<![A-Za-z])(\d+(?:\.\d+)?)", text)]


def _fill(
    schema: dict[str, Any],
    digest: str,
    request: ChatRequest,
    numbers: list[float],
) -> dict[str, Any]:
    props = schema.get("properties") or {}
    required = schema.get("required") or list(props.keys())
    out: dict[str, Any] = {}
    for i, key in enumerate(required):
        spec = props.get(key, {})
        out[key] = _fill_value(spec, key, digest, i, request, numbers)
    return out


def _fill_value(
    spec: dict[str, Any],
    key: str,
    digest: str,
    index: int,
    request: ChatRequest,
    numbers: list[float],
) -> Any:
    t = spec.get("type")

    if t == "string":
        enum = spec.get("enum")
        if enum:
            # Prefer enum values that make semantic sense for the field name.
            preferred = _preferred_enum_value(key, enum)
            if preferred is not None:
                return preferred
            return enum[int(digest[index % len(digest)], 16) % len(enum)]

        # Free text: reuse numbers that already appear in the prompt so
        # verification accepts them.
        if key in {"description", "why_it_matters", "body", "headline", "title"}:
            return _compose_sentence(key, numbers)
        if key in {"tone_note"}:
            return "Neutral, evidence-led."
        return spec.get("default") or f"mock-{digest[index:index + 6]}"

    if t == "number" or t == "integer":
        lo = spec.get("minimum", 0.0)
        hi = spec.get("maximum", 1.0)
        raw = int(digest[index:index + 4], 16) / 0xFFFF
        val = lo + raw * (hi - lo)
        return int(val) if t == "integer" else round(val, 4)

    if t == "boolean":
        return bool(int(digest[index], 16) & 1)

    if t == "array":
        items = spec.get("items") or {"type": "string"}
        # Two short strings that reuse numbers from the prompt when available.
        if items.get("type") == "string":
            return _compose_facts(numbers, count=2)
        return [
            _fill_value(items, key, digest, index + i, request, numbers)
            for i in range(2)
        ]

    if t == "object":
        nested_props = spec.get("properties") or {}
        nested_required = spec.get("required") or list(nested_props.keys())
        return {
            k: _fill_value(nested_props.get(k, {}), k, digest, index + j, request, numbers)
            for j, k in enumerate(nested_required)
        }

    return None


_PREFERRED_PATTERN = {
    "pattern": "high_press_sustained",
    "category": "pressure",
    "stage": "interpret",
}


def _preferred_enum_value(key: str, enum: list[str]) -> str | None:
    """Choose an enum value that makes sense for the field, so mock output
    reads plausibly to a human and stays stable across requests."""
    preferred = _PREFERRED_PATTERN.get(key)
    if preferred and preferred in enum:
        return preferred
    return None


def _compose_sentence(key: str, numbers: list[float]) -> str:
    """A short sentence that uses only numbers present in the prompt."""
    if not numbers:
        return _static_sentence(key)

    pick = numbers[:2]
    nums = ", ".join(_fmt(n) for n in pick)

    if key == "description":
        return f"Pattern observed at values {nums}."
    if key == "why_it_matters":
        return f"This shifts the game state around {nums}."
    if key == "headline":
        return f"Key moment near {nums}."
    if key == "title":
        return f"Moment near {nums}."
    if key == "body":
        return f"Recorded facts cluster around {nums}."
    return f"Values {nums}."


def _compose_facts(numbers: list[float], count: int) -> list[str]:
    if not numbers:
        return ["Recorded fact."] * count
    facts: list[str] = []
    for i in range(count):
        n = numbers[i % len(numbers)]
        facts.append(f"Metric {_fmt(n)}.")
    return facts


def _static_sentence(key: str) -> str:
    if key == "description":
        return "Pattern observed in the current sequence."
    if key == "why_it_matters":
        return "This shifts the balance of the sequence."
    if key == "headline":
        return "Key moment in the sequence."
    if key == "title":
        return "Moment in the sequence."
    if key == "body":
        return "Recorded facts from the current state."
    return "Recorded."


def _fmt(n: float) -> str:
    if n.is_integer():
        return str(int(n))
    return f"{n:.2f}"
