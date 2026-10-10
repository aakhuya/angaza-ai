import re

MIN_LENGTH = 8

# We require any three of the four classes to keep the demo friendly while
# still stronger than a two-class minimum.
_RULES = {
    "length": lambda p: len(p) >= MIN_LENGTH,
    "lower": lambda p: bool(re.search(r"[a-z]", p)),
    "upper": lambda p: bool(re.search(r"[A-Z]", p)),
    "digit": lambda p: bool(re.search(r"\d", p)),
    "symbol": lambda p: bool(re.search(r"[^A-Za-z0-9]", p)),
}


def evaluate(password: str) -> dict:
    results = {name: fn(password) for name, fn in _RULES.items()}
    classes = sum(bool(results[k]) for k in ("lower", "upper", "digit", "symbol"))
    return {
        "rules": results,
        "classes_met": classes,
        "valid": results["length"] and classes >= 3,
    }


def assert_valid(password: str) -> None:
    report = evaluate(password)
    if not report["valid"]:
        raise ValueError("Password does not meet the required strength")
