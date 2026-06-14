from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database.connection import get_db
from backend.models.db_models import Recommendation
from backend.schemas.schemas import RecommendationResponse
from backend.services.optimization import apply_recommendation

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

@router.get("", response_model=List[RecommendationResponse])
def get_recommendations(db: Session = Depends(get_db)):
    from backend.models.db_models import Conflict
    return db.query(Recommendation).join(
        Conflict, Recommendation.conflict_id == Conflict.id
    ).filter(Conflict.is_active == True).all()

@router.post("/{rec_id}/apply", status_code=status.HTTP_200_OK)
def apply_rec(rec_id: int, db: Session = Depends(get_db)):
    success = apply_recommendation(rec_id, db)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Failed to apply recommendation. Conflict may already be resolved or not active."
        )
    return {"message": "Recommendation successfully applied. Traffic updated."}
