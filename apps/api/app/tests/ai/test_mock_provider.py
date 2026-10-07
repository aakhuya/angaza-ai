import asyncio
import json

from app.ai.mock import MockProvider
from app.ai.provider import ChatMessage, ChatRequest

SCHEMA = {
    "type": "object",
    "properties": {
        "explanation": {"type": "string"},
        "confidence": {"type": "number", "minimum": 0.0, "maximum": 1.0},
        "reasons": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["explanation", "confidence", "reasons"],
}


def _req(text: str) -> ChatRequest:
    return ChatRequest(messages=[ChatMessage(role="user", content=text)], response_schema=SCHEMA)


def test_mock_is_deterministic():
    p = MockProvider()
    a = asyncio.run(p.complete_json(_req("hello")))
    b = asyncio.run(p.complete_json(_req("hello")))
    assert a.data == b.data
    assert a.raw == b.raw


def test_mock_varies_with_input():
    p = MockProvider()
    a = asyncio.run(p.complete_json(_req("hello")))
    b = asyncio.run(p.complete_json(_req("different")))
    assert a.data != b.data


def test_mock_respects_schema_shape():
    p = MockProvider()
    resp = asyncio.run(p.complete_json(_req("x")))
    assert set(resp.data.keys()) == {"explanation", "confidence", "reasons"}
    assert isinstance(resp.data["explanation"], str)
    assert 0.0 <= resp.data["confidence"] <= 1.0
    assert isinstance(resp.data["reasons"], list)


def test_mock_response_is_json_serialisable():
    p = MockProvider()
    resp = asyncio.run(p.complete_json(_req("x")))
    json.dumps(resp.data)
