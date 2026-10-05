from app.simulation.roster import default_teams


def test_default_teams_unique_ids_and_numbers():
    home, away = default_teams()
    assert home.id != away.id
    for team in (home, away):
        assert len(team.players) == 11
        ids = {p.id for p in team.players}
        numbers = {p.number for p in team.players}
        assert len(ids) == 11
        assert len(numbers) == 11
