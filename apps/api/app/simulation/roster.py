"""Synthetic team and player roster.

Eight fictional clubs, invented for this demo. Team IDs remain "HOME" and
"AWAY" so the rest of the pipeline is unchanged. Players are named from
common Kenyan name components — the characters are fictional.
"""
from dataclasses import dataclass

FIRST_NAMES = [
    "Mwangi", "Ochieng", "Kamau", "Otieno", "Njoroge", "Wanjiru", "Kipchoge",
    "Kiptoo", "Odhiambo", "Mutua", "Kimani", "Waweru", "Cheruiyot", "Onyango",
    "Wekesa", "Barasa", "Karanja", "Githinji", "Maina", "Kariuki",
]

LAST_NAMES = [
    "Achieng", "Njeri", "Wanjiku", "Kiprotich", "Kipkemboi", "Osoro",
    "Owino", "Owuor", "Mugambi", "Mutiso", "Kibet", "Rotich", "Chebet",
    "Kurgat", "Wafula", "Simiyu", "Nyambura", "Wambui", "Njoki", "Auma",
]

POSITIONS = ["GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "FW", "FW", "FW"]


@dataclass(frozen=True)
class RosterPlayer:
    id: str
    name: str
    position: str
    number: int


@dataclass(frozen=True)
class RosterTeam:
    id: str
    name: str
    short_name: str
    nickname: str
    identity: str
    color: str
    monogram: str
    players: tuple[RosterPlayer, ...]


# All eight clubs. `home` and `away` reference the two that participate in
# each scenario; the rest appear in the league table only.
CLUBS = [
    ("Angaza FC",      "ANG", "The Rising Stars", "Bold, ambitious, attacking football.",        "#E8BC67"),
    ("Mwangaza United","MWU", "The Luminaries",   "Patient build-up and intelligent passing.",   "#39D6B0"),
    ("Simba Ridge FC", "SRF", "The Lions",        "Physical defending and dangerous counters.",  "#E8A33D"),
    ("Bahari Athletic","BHA", "The Tide",         "Fast wing play and high pressing.",           "#4FBDB0"),
    ("Kivuli Rovers",  "KVR", "The Shadows",      "Compact defending and quick transitions.",    "#A67C2B"),
    ("Acacia Crown FC","ACF", "The Royals",       "Disciplined midfield and tactical control.",  "#F5B33F"),
    ("Mlima Forge",    "MLF", "The Highlanders",  "Relentless pressing and stamina.",            "#8A5F1E"),
    ("Zuberi City",    "ZBC", "The Falcons",      "Creative attacking play and individual flair.","#2E8B57"),
]


def _build_players(prefix: str, offset: int) -> tuple[RosterPlayer, ...]:
    players: list[RosterPlayer] = []
    for i, pos in enumerate(POSITIONS):
        fn = FIRST_NAMES[(offset + i) % len(FIRST_NAMES)]
        ln = LAST_NAMES[(offset * 3 + i * 2) % len(LAST_NAMES)]
        players.append(
            RosterPlayer(
                id=f"{prefix}-p{i+1:02d}",
                name=f"{fn} {ln}",
                position=pos,
                number=i + 1,
            )
        )
    return tuple(players)


def build_team(team_id: str, name: str, short_name: str, nickname: str,
               identity: str, color: str, monogram: str, offset: int) -> RosterTeam:
    return RosterTeam(
        id=team_id,
        name=name,
        short_name=short_name,
        nickname=nickname,
        identity=identity,
        color=color,
        monogram=monogram,
        players=_build_players(team_id, offset),
    )


def default_teams() -> tuple[RosterTeam, RosterTeam]:
    """The two teams participating in the current simulation."""
    home = build_team("HOME", "Angaza FC", "ANG", "The Rising Stars",
                      "Bold, ambitious, attacking football.", "#E8BC67", "ANG", 0)
    away = build_team("AWAY", "Mwangaza United", "MWU", "The Luminaries",
                      "Patient build-up and intelligent passing.", "#39D6B0", "MWU", 7)
    return home, away


def all_clubs() -> list[dict]:
    """All eight clubs for the league table."""
    out = []
    for i, (name, short, nickname, identity, color) in enumerate(CLUBS):
        out.append({
            "name": name,
            "short_name": short,
            "nickname": nickname,
            "identity": identity,
            "color": color,
            "players": [p.__dict__ for p in _build_players(f"CLUB{i}", i * 5)],
        })
    return out
