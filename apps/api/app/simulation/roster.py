from dataclasses import dataclass

FIRST_NAMES = [
    "Amir", "Bruno", "Chidi", "Diego", "Emeka", "Felix", "Gabriel", "Hugo",
    "Idris", "Jonas", "Kwame", "Luca", "Mateo", "Noah", "Omar", "Pablo",
    "Quinn", "Rafael", "Sami", "Tariq", "Umar", "Victor", "Wale", "Yusuf",
]
LAST_NAMES = [
    "Adeyemi", "Baraka", "Costa", "Diallo", "Eriksen", "Ferreira", "Gomez",
    "Hassan", "Ibrahim", "Jensen", "Kone", "Lopez", "Mensah", "Ndidi",
    "Okafor", "Pereira", "Rossi", "Silva", "Traore", "Vega",
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
    players: tuple[RosterPlayer, ...]


def build_team(team_id: str, name: str, short_name: str, color: str, name_offset: int) -> RosterTeam:
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
        id=team_id, name=name, short_name=short_name, color=color,
        players=tuple(players),
    )


def default_teams() -> tuple[RosterTeam, RosterTeam]:
    home = build_team("HOME", "Angaza FC", "ANG", "#E8A33D", name_offset=0)
    away = build_team("AWAY", "Mwangaza United", "MWU", "#3FB6A8", name_offset=7)
    return home, away
