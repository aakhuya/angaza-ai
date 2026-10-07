import pytest

from app.ai.deepseek import _validate_against_schema
from app.ai.provider import ProviderError


def test_missing_required_field_raises():
    with pytest.raises(ProviderError):
        _validate_against_schema({"a": 1}, {
            "type": "object",
            "properties": {"a": {"type": "integer"}, "b": {"type": "string"}},
            "required": ["a", "b"],
        })


def test_wrong_type_raises():
    with pytest.raises(ProviderError):
        _validate_against_schema({"a": "not a number"}, {
            "type": "object",
            "properties": {"a": {"type": "number"}},
            "required": ["a"],
        })


def test_valid_payload_passes():
    _validate_against_schema({"a": 1, "b": "x", "c": [1, 2], "d": True}, {
        "type": "object",
        "properties": {
            "a": {"type": "integer"},
            "b": {"type": "string"},
            "c": {"type": "array"},
            "d": {"type": "boolean"},
        },
        "required": ["a", "b", "c", "d"],
    })
