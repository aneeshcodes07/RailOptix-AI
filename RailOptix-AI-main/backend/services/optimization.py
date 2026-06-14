from sqlalchemy.orm import Session
from backend.models.db_models import Train, Station, Track, Conflict, Recommendation

def calculate_optimization_score(train: Train, db: Session) -> float:
    # 1. Priority Score (Priority 1 to 5, scaled by 15 => 15 to 75)
    priority_score = train.priority * 15

    # 2. Delay Weight (Delay in minutes, scaled by 0.5, capped at 60)
    delay_weight = min(train.delay_minutes, 120) * 0.5

    # 3. Track Availability Score
    # Check if target track segment is clear
    track_score = 20
    if train.target_station:
        track = db.query(Track).filter(
            (Track.source_station == train.current_station) & 
            (Track.destination_station == train.target_station)
        ).first()
        if track and track.occupied:
            track_score = 0

    # 4. Platform Availability Score
    # Check if target station has available platforms
    platform_score = 20
    if train.target_station:
        station = db.query(Station).filter(Station.station_name == train.target_station).first()
        if station and station.current_occupancy >= station.platform_count:
            platform_score = 0

    # Total Score
    total_score = priority_score + delay_weight + track_score + platform_score
    return total_score

def evaluate_and_generate_recommendations(db: Session):
    """
    Scans active conflicts and generates AI recommendations for each.
    """
    active_conflicts = db.query(Conflict).filter(Conflict.is_active == True).all()

    for conflict in active_conflicts:
        # Check if recommendation already exists for this conflict
        existing_rec = db.query(Recommendation).filter(Recommendation.conflict_id == conflict.id).first()
        if existing_rec:
            continue

        # Fetch the two trains involved
        train1 = db.query(Train).filter(Train.train_name == conflict.train1).first()
        train2 = db.query(Train).filter(Train.train_name == conflict.train2).first()

        if not train1 or not train2:
            continue

        # Calculate scores
        score1 = calculate_optimization_score(train1, db)
        score2 = calculate_optimization_score(train2, db)

        # Decide precedence
        if score1 >= score2:
            winner = train1
            loser = train2
            score_diff = score1 - score2
        else:
            winner = train2
            loser = train1
            score_diff = score2 - score1

        # Calculate Expected Benefit (rough estimate of minutes saved)
        # Prioritizing the higher score train saves its delay propagation.
        minutes_saved = int(max(10, min(winner.priority * 5 + (loser.delay_minutes * 0.3), 45)))
        expected_benefit = f"{minutes_saved} Minutes Saved"

        # Calculate Confidence Score (based on score differential, priority diff, etc.)
        priority_diff = abs(winner.priority - loser.priority)
        base_confidence = 80.0 + (priority_diff * 3) + min(score_diff * 0.2, 10)
        confidence_score = round(min(base_confidence, 98.0), 1)

        # Recommendation Text
        rec_text = f"Hold {loser.train_name} ({loser.train_type}) at {loser.current_station} and allow {winner.train_name} ({winner.train_type}) to proceed on section {conflict.track_section}."
        
        explanation = (
            f"Precedence determined via RailOptix AI Engine. "
            f"{winner.train_name} has higher precedence score ({round(max(score1, score2), 1)} vs {round(min(score1, score2), 1)}) "
            f"due to higher priority class ({winner.train_type}, Priority {winner.priority}) "
            f"and current delay of {winner.delay_minutes} mins."
        )

        # Write to DB
        recommendation = Recommendation(
            conflict_id=conflict.id,
            recommendation=rec_text,
            expected_benefit=expected_benefit,
            confidence_score=confidence_score,
            explanation=explanation
        )
        db.add(recommendation)
        
        # Link recommendation to conflict
        conflict.recommendation = rec_text
        db.commit()

def apply_recommendation(recommendation_id: int, db: Session) -> bool:
    """
    Applies the AI recommendation to resolve a conflict.
    """
    rec = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not rec:
        return False

    conflict = db.query(Conflict).filter(Conflict.id == rec.conflict_id).first()
    if not conflict or not conflict.is_active:
        return False

    train1 = db.query(Train).filter(Train.train_name == conflict.train1).first()
    train2 = db.query(Train).filter(Train.train_name == conflict.train2).first()

    if not train1 or not train2:
        return False

    # Fetch scores to determine winner/loser again
    score1 = calculate_optimization_score(train1, db)
    score2 = calculate_optimization_score(train2, db)

    if score1 >= score2:
        winner, loser = train1, train2
    else:
        winner, loser = train2, train1

    # Action: Winner proceeds (status becomes ON_TIME or RUNNING, speed is restored)
    winner.status = "ON_TIME" if winner.delay_minutes == 0 else "DELAYED"
    winner.speed = get_normal_speed_by_type(winner.train_type)
    
    # Loser gets held/stopped
    loser.status = "STOPPED"
    loser.speed = 0
    loser.delay_minutes += 5 # Additional delay for waiting

    # Deactivate the conflict
    conflict.is_active = False
    conflict.recommendation = f"Applied: {rec.recommendation}"

    db.commit()
    return True

def get_normal_speed_by_type(train_type: str) -> int:
    speeds = {
        "Vande Bharat": 130,
        "Rajdhani": 120,
        "Express": 100,
        "Passenger": 60,
        "Freight": 50
    }
    return speeds.get(train_type, 80)
