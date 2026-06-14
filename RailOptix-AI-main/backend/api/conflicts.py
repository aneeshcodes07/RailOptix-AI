from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.database.connection import get_db
from backend.models.db_models import Conflict, Recommendation
from backend.schemas.schemas import ConflictResponse

router = APIRouter(prefix="/api/conflicts", tags=["Conflicts"])

@router.get("", response_model=List[ConflictResponse])
def get_active_conflicts(db: Session = Depends(get_db)):
    conflicts = db.query(Conflict).filter(Conflict.is_active == True).order_by(Conflict.created_at.desc()).all()
    for c in conflicts:
        rec = db.query(Recommendation).filter(Recommendation.conflict_id == c.id).first()
        if rec:
            c.expected_benefit = rec.expected_benefit
            c.explanation = rec.explanation
    return conflicts

@router.get("/resolved", response_model=List[ConflictResponse])
def get_resolved_conflicts(db: Session = Depends(get_db)):
    conflicts = db.query(Conflict).filter(Conflict.is_active == False).order_by(Conflict.created_at.desc()).all()
    for c in conflicts:
        rec = db.query(Recommendation).filter(Recommendation.conflict_id == c.id).first()
        if rec:
            c.expected_benefit = rec.expected_benefit
            c.explanation = rec.explanation
    return conflicts
