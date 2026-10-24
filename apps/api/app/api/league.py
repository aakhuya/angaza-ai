from fastapi import APIRouter

from app.simulation.roster import all_clubs

router = APIRouter(prefix="/league", tags=["league"])


@router.get("/teams")
def teams() -> dict:
    return {"teams": all_clubs()}
