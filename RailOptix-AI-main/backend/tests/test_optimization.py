import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database.connection import Base
from backend.models.db_models import Train, Station, Track, Conflict, Recommendation
from backend.services.optimization import calculate_optimization_score, evaluate_and_generate_recommendations, apply_recommendation

# In-memory database setup for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

def test_priority_and_delay_scoring(db):
    # Setup stations and tracks
    station_a = Station(station_name="Station A", platform_count=2, capacity=4)
    station_b = Station(station_name="Station B", platform_count=2, capacity=4)
    track = Track(source_station="Station A", destination_station="Station B", capacity=1, occupied=False)
    db.add_all([station_a, station_b, track])
    db.commit()

    # Vande Bharat (Priority 5, no delay)
    vb_train = Train(
        train_name="Vande Bharat Express",
        train_type="Vande Bharat",
        priority=5,
        current_station="Station A",
        target_station="Station B",
        delay_minutes=0,
        speed=130
    )

    # Freight train (Priority 1, 60 minutes delay)
    freight_train = Train(
        train_name="Coal Freight",
        train_type="Freight",
        priority=1,
        current_station="Station A",
        target_station="Station B",
        delay_minutes=60,
        speed=50
    )

    db.add_all([vb_train, freight_train])
    db.commit()

    vb_score = calculate_optimization_score(vb_train, db)
    freight_score = calculate_optimization_score(freight_train, db)

    # VB priority score = 5 * 15 = 75
    # VB delay weight = 0
    # VB tracks clear, target clear = +40
    # Total VB = 115
    assert vb_score == 115

    # Freight priority score = 1 * 15 = 15
    # Freight delay weight = 60 * 0.5 = 30
    # Freight tracks clear, target clear = +40
    # Total Freight = 85
    assert freight_score == 85
    assert vb_score > freight_score

def test_conflict_detection_and_resolution(db):
    # Seed data
    vb_train = Train(
        train_name="Vande Bharat",
        train_type="Vande Bharat",
        priority=5,
        current_station="Station A",
        target_station="Station B",
        delay_minutes=0,
        speed=130
    )

    freight_train = Train(
        train_name="Freight",
        train_type="Freight",
        priority=1,
        current_station="Station A",
        target_station="Station B",
        delay_minutes=10,
        speed=50
    )
    db.add_all([vb_train, freight_train])
    db.commit()

    # Create manual conflict
    conflict = Conflict(
        train1=vb_train.train_name,
        train2=freight_train.train_name,
        track_section="Station A - Station B",
        severity="High",
        is_active=True
    )
    db.add(conflict)
    db.commit()

    # Run recommendations generator
    evaluate_and_generate_recommendations(db)

    # Verify recommendation was created
    rec = db.query(Recommendation).filter(Recommendation.conflict_id == conflict.id).first()
    assert rec is not None
    assert "Hold Freight" in rec.recommendation
    assert rec.confidence_score >= 80

    # Apply recommendation
    success = apply_recommendation(rec.id, db)
    assert success is True

    # Check that conflict is now inactive
    db.refresh(conflict)
    assert conflict.is_active is False

    # Check that Freight is STOPPED (speed 0) and VB is running
    db.refresh(vb_train)
    db.refresh(freight_train)
    assert freight_train.status == "STOPPED"
    assert freight_train.speed == 0
    assert vb_train.status == "ON_TIME"
    assert vb_train.speed == 130
