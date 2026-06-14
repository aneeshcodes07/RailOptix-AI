from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database.connection import get_db
from backend.models.db_models import Station
from backend.schemas.schemas import StationCreate, StationResponse

router = APIRouter(prefix="/api/stations", tags=["Stations"])

@router.get("", response_model=List[StationResponse])
def get_all_stations(db: Session = Depends(get_db)):
    return db.query(Station).all()

@router.post("", response_model=StationResponse, status_code=status.HTTP_201_CREATED)
def create_station(station_data: StationCreate, db: Session = Depends(get_db)):
    existing = db.query(Station).filter(Station.station_name == station_data.station_name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Station name already exists")
    
    db_station = Station(**station_data.dict())
    db.add(db_station)
    db.commit()
    db.refresh(db_station)
    return db_station
