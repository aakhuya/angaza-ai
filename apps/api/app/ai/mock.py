import hashlib
import json
import time
from typing import Any

from app.ai.provider import ChatRequest, ChatResponse


class MockProvider:
    """Deterministic offline provider.

    Fills the requested ``response_schema`` with values derived from a hash of
    the request, so identical requests produce identical outputs and different
    requests produce different — but reproducible — outputs.
    """

    name = "mock"

    async def complete_json(self, request: ChatRequest) -> ChatResponse:
        started = time.perf_counter()
        seed_material = "\n".join(f"{m.role}:{m.content}" for m in request.messages)
        digest = hashlib.sha256(seed_material.encode("utf-8")).hexdigest()
        data = _fill(request.response_schema, digest, request)
        raw = json.dumps(data, separators=(",", ":"))
        duration_ms = int((time.perf_counter() - started) * 1000)
        return ChatResponse(
            data=data,
            raw=raw,
            provider=self.name,
            model="mock-1",
            duration_ms=duration_ms,
            usage={"prompt_tokens": len(seed_material) // 4, "completion_tokens": len(raw) // 4},
        )


def _fill(schema: dict[str, Any], digest: str, request: ChatRequest) -> dict[str, Any]:
    props = schema.get("properties") or {}
    required = schema.get("required") or list(props.keys())
    out: dict[str, Any] = {}
    for i, key in enumerate(required):
        spec = props.get(key, {})
        out[key] = _fill_value(spec, digest, i, request)
    return out


def _fill_value(spec: dict[str, Any], digest: str, index: int, request: ChatRequest) -> Any:
    t = spec.get("type")
    if t == "string":
        enum = spec.get("enum")
        if enum:
            return enum[int(digest[index % len(digest)], 16) % len(enum)]
        # Small human-readable string, deterministic from digest.
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
        return [_fill_value(items, digest, index + i, request) for i in range(2)]
    if t == "object":
        nested_props = spec.get("properties") or {}
        nested_required = spec.get("required") or list(nested_props.keys())
        return {k: _fill_value(nested_props.get(k, {}), digest, index + j, request)
                for j, k in enumerate(nested_required)}
    # Unknown type — echo something harmless so callers can still validate.
    return None
