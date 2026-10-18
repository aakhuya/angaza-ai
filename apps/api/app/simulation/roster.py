"""
Synthetic team and player roster.

Player names are drawn from common Kenyan first/last names so the simulated
matches feel grounded. Team names are invented Swahili-flavoured clubs — no
real team or league is represented.

Team IDs remain "HOME" and "AWAY" so the rest of the pipeline (analytics,
verification, storage) is unchanged.
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
    color: str
    # Two-to-three-letter monogram used as a "crest" in the UI.
    # Avoids brand assets entirely, but reads as a real team mark.
    monogram: str
    players: tuple[RosterPlayer, ...]


def build_team(
    team_id: str,
    name: str,
    short_name: str,
    color: str,
    monogram: str,
    name_offset: int,
) -> RosterTeam:
    players: list[RosterPlayer] = []
    for i, pos in enumerate(POSITIONS):
        fn = FIRST_NAMES[(name_offset + i) % len(FIRST_NAMES)]
        ln = LAST_NAMES[(name_offset * 3 + i * 2) % len(LAST_NAMES)]
        players.append(
            RosterPlayer(
                id=f"{team_id}-p{i+1:02d}",
                name=f"{fn} {ln}",
                position=pos,
                number=i + 1,
            )
        )
    return RosterTeam(
        id=team_id,
        name=name,
        short_name=short_name,
        color=color,
        monogram=monogram,
        players=tuple(players),
    )


def default_teams() -> tuple[RosterTeam, RosterTeam]:
    """
    Angaza FC (home) and Mwangaza United (away).

    Names are invented Swahili-flavoured clubs:
    - "Angaza"  → "illuminate" (matches the product name)
    - "Mwangaza" → "light / radiance"

    Both are fictional and do not correspond to any real club.
    """
    home = build_team(
        team_id="HOME",
        name="Angaza FC",
        short_name="ANG",
        color="#E8BC67",
        monogram="ANG",
        name_offset=0,
    )
    away = build_team(
        team_id="AWAY",
        name="Mwangaza United",
        short_name="MWU",
        color="#39D6B0",
        monogram="MWU",
        name_offset=7,
    )
    return home, away
