from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_password_hash_roundtrip():
    h = hash_password("correct-horse-battery")
    assert h != "correct-horse-battery"
    assert verify_password("correct-horse-battery", h)
    assert not verify_password("wrong", h)


def test_access_token_roundtrip():
    token = create_access_token("user-123")
    assert decode_access_token(token) == "user-123"


def test_access_token_tampering_rejected():
    token = create_access_token("user-123")
    assert decode_access_token(token + "x") is None
