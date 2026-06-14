from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Train Schemas
class TrainBase(BaseModel):
    train_name: str
    train_type: str
    priority: int = Field(..., ge=1, le=5)
    current_station: str
    target_station: Optional[str] = None
    segment_progress: float = 0.0
    delay_minutes: int = 0
    speed: int = 0
    status: str = "ON_TIME"
    direction: str = "OUTBOUND"
    dwell_ticks: int = 0

class TrainCreate(TrainBase):
    pass

class TrainUpdate(BaseModel):
    train_name: Optional[str] = None
    train_type: Optional[str] = None
    priority: Optional[int] = Field(None, ge=1, le=5)
    current_station: Optional[str] = None
    target_station: Optional[str] = None
    segment_progress: Optional[float] = None
    delay_minutes: Optional[int] = None
    speed: Optional[int] = None
    status: Optional[str] = None

class TrainResponse(TrainBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Station Schemas
class StationBase(BaseModel):
    station_name: str
    platform_count: int
    capacity: int
    current_occupancy: int = 0
    utilization: float = 0.0

class StationCreate(StationBase):
    pass

class StationResponse(StationBase):
    id: int

    class Config:
        from_attributes = True

# Track Schemas
class TrackBase(BaseModel):
    source_station: str
    destination_station: str
    capacity: int = 1
    occupied: bool = False

class TrackResponse(TrackBase):
    id: int

    class Config:
        from_attributes = True

# Conflict Schemas
class ConflictResponse(BaseModel):
    id: int
    train1: str
    train2: str
    track_section: str
    severity: str
    recommendation: Optional[str] = None
    is_active: bool
    expected_benefit: Optional[str] = None
    explanation: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Recommendation Schemas
class RecommendationResponse(BaseModel):
    id: int
    conflict_id: int
    recommendation: str
    expected_benefit: str
    confidence_score: float
    explanation: Optional[str] = None

    class Config:
        from_attributes = True

# Simulation Schemas
class SimulationRequest(BaseModel):
    scenario_name: str # Rain, Signal failure, Track blockage, Platform closure, Breakdown, High Traffic, Emergency

class SimulationResponse(BaseModel):
    scenario_name: str
    before_delay: int
    after_delay: int
    recovery_plan: str
    details: str
    timestamp: datetime

# Dashboard Schemas
class DashboardResponse(BaseModel):
    totalTrains: int
    activeTrains: int
    activeConflicts: int
    averageDelay: float
    throughput: int
    platformUtilization: float
    onTimePercentage: float
