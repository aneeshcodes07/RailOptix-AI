from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database.connection import Base

class Train(Base):
    __tablename__ = "trains"

    id = Column(Integer, primary_key=True, index=True)
    train_name = Column(String(255), unique=True, index=True, nullable=False)
    train_type = Column(String(100), nullable=False) # Vande Bharat, Rajdhani, Express, Passenger, Freight
    priority = Column(Integer, nullable=False) # 5 to 1
    current_station = Column(String(255), nullable=False) # e.g. Station A, Station B
    target_station = Column(String(255), nullable=True) # Next station they are heading to
    segment_progress = Column(Float, default=0.0) # Progress between current_station and target_station (0.0 to 1.0)
    delay_minutes = Column(Integer, default=0)
    speed = Column(Integer, default=0) # in km/h
    status = Column(String(50), default="ON_TIME") # ON_TIME, DELAYED, STOPPED
    direction = Column(String(50), default="OUTBOUND") # OUTBOUND or INBOUND
    dwell_ticks = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    station_name = Column(String(255), unique=True, index=True, nullable=False)
    platform_count = Column(Integer, default=2)
    capacity = Column(Integer, default=4) # Total trains that can be at the station
    current_occupancy = Column(Integer, default=0)
    utilization = Column(Float, default=0.0) # Percent (0.0 to 100.0)

class Track(Base):
    __tablename__ = "tracks"

    id = Column(Integer, primary_key=True, index=True)
    source_station = Column(String(255), nullable=False)
    destination_station = Column(String(255), nullable=False)
    capacity = Column(Integer, default=1) # Max trains on this track segment
    occupied = Column(Boolean, default=False)

class Conflict(Base):
    __tablename__ = "conflicts"

    id = Column(Integer, primary_key=True, index=True)
    train1 = Column(String(255), nullable=False) # Name of Train 1
    train2 = Column(String(255), nullable=False) # Name of Train 2
    track_section = Column(String(255), nullable=False) # e.g., "Station A - Station B"
    severity = Column(String(50), nullable=False) # Low, Medium, High, Critical
    recommendation = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    conflict_id = Column(Integer, nullable=False)
    recommendation = Column(String(500), nullable=False)
    expected_benefit = Column(String(255), nullable=False) # e.g. "18 Minutes Saved"
    confidence_score = Column(Float, nullable=False) # Percentage, e.g. 94.0
    explanation = Column(String(1000), nullable=True)

class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    scenario_name = Column(String(255), nullable=False)
    before_delay = Column(Integer, default=0)
    after_delay = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)
