import re
from dataclasses import dataclass

from app.agents.facts import FactBundle

# A player ID looks like "<TEAM_ID>-p<digits>", e.g. "HOME-p06", "AWAY-p11".
# We match those directly rather than trying to identify generic uppercase
# tokens — this is more precise and avoids false positives on ordinary words.
_PLAYER_ID_PATTERN = re.compile(r"\b[A-Z][A-Z0-9]*-p\d{2,}\b")
# A number that is not adjacent to another letter or digit on the left.
# Catches "9999" in "9999m" and "30" in "30m" while ignoring digits inside IDs.
_NUMBER_PATTERN = re.compile(r"(?<![A-Za-z0-9])(\d+(?:\.\d+)?)")


@dataclass(frozen=True)
class VerificationResult:
    ok: bool
    reasons: tuple[str, ...]


def verify(
    *,
    title: str,
    body: str,
    supporting_facts: list[str],
    category: str,
    bundle: FactBundle,
    allowed_categories: set[str],
) -> VerificationResult:
    reasons: list[str] = []

    if category not in allowed_categories:
        reasons.append(f"unknown category: {category}")

    combined = " ".join([title, body, *supporting_facts])

    # Reject any player ID that is not in the bundle's known set.
    scrubbed = combined
    for player_id in _PLAYER_ID_PATTERN.findall(combined):
        if player_id not in bundle.known_player_ids:
            reasons.append(f"unknown player id: {player_id}")
        scrubbed = scrubbed.replace(player_id, " ")

    known_numbers = _collect_bundle_numbers(bundle)
    for raw in _NUMBER_PATTERN.findall(scrubbed):
        value = float(raw)
        if value <= 3 and value == int(value):
            if not _number_matches(value, known_numbers):
                reasons.append(f"unverified small number: {raw}")
        elif not _number_matches(value, known_numbers, tolerance=1.0):
            reasons.append(f"unverified number: {raw}")

    return VerificationResult(ok=not reasons, reasons=tuple(reasons))


def _collect_bundle_numbers(bundle: FactBundle) -> set[float]:
    numbers: set[float] = set()
    for source in (
        bundle.home_stats, bundle.away_stats, bundle.event_team_stats,
        bundle.event_player or {}, bundle.event,
    ):
        _harvest(source, numbers)
    numbers.add(float(bundle.home_score))
    numbers.add(float(bundle.away_score))
    numbers.add(float(bundle.minute))
    numbers.add(float(bundle.importance_score))
    return numbers


def _harvest(value, out: set[float]) -> None:
    if isinstance(value, dict):
        for v in value.values():
            _harvest(v, out)
    elif isinstance(value, list):
        for v in value:
            _harvest(v, out)
    elif isinstance(value, bool):
        return
    elif isinstance(value, (int, float)):
        out.add(float(value))


def _number_matches(value: float, known: set[float], tolerance: float = 0.15) -> bool:
    for k in known:
        if abs(k - value) <= tolerance:
            return True
    return False
