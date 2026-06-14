import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database.connection import Base
from backend.models.db_models import Train, Station, Track, Conflict, Recommendation
from backend.services.optimization import calculate_optimization_score, evaluate_and_generate_recommendations, apply_recommendation

# 1. Setup in-memory DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def run_tests():
    print(">>> Initializing In-Memory DB for testing...")
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    try:
        # Test 1: Priority and Delay Scoring
        print(">>> Test 1: Testing Precedence Scoring...")
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
            speed=130,
            direction="OUTBOUND"
        )

        # Freight train (Priority 1, 60 minutes delay)
        freight_train = Train(
            train_name="Coal Freight",
            train_type="Freight",
            priority=1,
            current_station="Station A",
            target_station="Station B",
            delay_minutes=60,
            speed=50,
            direction="OUTBOUND"
        )

        db.add_all([vb_train, freight_train])
        db.commit()

        vb_score = calculate_optimization_score(vb_train, db)
        freight_score = calculate_optimization_score(freight_train, db)

        # VB priority score = 5 * 15 = 75
        # VB delay weight = 0
        # VB tracks clear, target clear = +40
        # Total VB = 115
        assert vb_score == 115, f"Expected 115, got {vb_score}"

        # Freight priority score = 1 * 15 = 15
        # Freight delay weight = 60 * 0.5 = 30
        # Freight tracks clear, target clear = +40
        # Total Freight = 85
        assert freight_score == 85, f"Expected 85, got {freight_score}"
        assert vb_score > freight_score, "Vande Bharat should have higher precedence than delayed Freight"
        print("[PASS] Test 1: Precedence scoring is correct.")

        # Test 2: Conflict Detection & Resolution
        print(">>> Test 2: Testing Conflict Resolution...")
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
        assert rec is not None, "Recommendation was not created"
        assert "Hold Coal Freight" in rec.recommendation or "Hold" in rec.recommendation
        assert rec.confidence_score >= 80

        # Apply recommendation
        success = apply_recommendation(rec.id, db)
        assert success is True, "Failed to apply recommendation"

        # Check that conflict is now inactive
        db.refresh(conflict)
        assert conflict.is_active is False, "Conflict remains active after applying resolution"

        # Check that Freight is STOPPED (speed 0) and VB is running
        db.refresh(vb_train)
        db.refresh(freight_train)
        assert freight_train.status == "STOPPED", f"Expected STOPPED, got {freight_train.status}"
        assert freight_train.speed == 0, f"Expected speed 0, got {freight_train.speed}"
        assert vb_train.status == "ON_TIME", f"Expected ON_TIME, got {vb_train.status}"
        assert vb_train.speed == 130, f"Expected speed 130, got {vb_train.speed}"
        print("[PASS] Test 2: Conflict resolution applied successfully.")

        print("\n==============================================")
        print("[SUCCESS] ALL BACKEND SYSTEM TESTS PASSED")
        print("==============================================\n")

    except AssertionError as e:
        print(f"[FAIL] TEST FAILURE: {e}")
        sys.exit(1)
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

if __name__ == "__main__":
    run_tests()
