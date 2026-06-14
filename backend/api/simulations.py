from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.schemas.schemas import SimulationRequest, SimulationResponse
from backend.services.simulation import run_scenario_simulation

router = APIRouter(prefix="/api/simulate", tags=["Simulations"])

@router.post("", response_model=SimulationResponse)
def run_simulation(payload: SimulationRequest, db: Session = Depends(get_db)):
    try:
        result = run_scenario_simulation(payload.scenario_name, db)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Simulation failed: {str(e)}"
        )
