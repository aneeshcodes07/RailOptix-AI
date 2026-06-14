from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database.connection import get_db
from backend.models.db_models import Train
from backend.schemas.schemas import TrainCreate, TrainUpdate, TrainResponse

router = APIRouter(prefix="/api/trains", tags=["Trains"])

@router.get("", response_model=List[TrainResponse])
def get_all_trains(db: Session = Depends(get_db)):
    return db.query(Train).all()

@router.get("/{train_id}", response_model=TrainResponse)
def get_train_by_id(train_id: int, db: Session = Depends(get_db)):
    train = db.query(Train).filter(Train.id == train_id).first()
    if not train:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Train not found")
    return train

@router.post("", response_model=TrainResponse, status_code=status.HTTP_201_CREATED)
def create_train(train_data: TrainCreate, db: Session = Depends(get_db)):
    # Check if name is unique
    existing = db.query(Train).filter(Train.train_name == train_data.train_name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Train name already exists")
    
    db_train = Train(**train_data.dict())
    db.add(db_train)
    db.commit()
    db.refresh(db_train)
    return db_train

@router.put("/{train_id}", response_model=TrainResponse)
def update_train(train_id: int, train_data: TrainUpdate, db: Session = Depends(get_db)):
    train = db.query(Train).filter(Train.id == train_id).first()
    if not train:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Train not found")
    
    update_dict = train_data.dict(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(train, key, value)
        
    db.commit()
    db.refresh(train)
    return train

@router.delete("/{train_id}", status_code=status.HTTP_200_OK)
def delete_train(train_id: int, db: Session = Depends(get_db)):
    train = db.query(Train).filter(Train.id == train_id).first()
    if not train:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Train not found")
    
    db.delete(train)
    db.commit()
    return {"message": f"Train {train_id} successfully deleted"}
