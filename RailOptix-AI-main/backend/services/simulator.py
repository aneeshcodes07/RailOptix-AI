import random
from sqlalchemy.orm import Session
from backend.models.db_models import Train, Station, Track, Conflict, Recommendation
from backend.services.optimization import evaluate_and_generate_recommendations

STATION_LIST = ["Station A", "Station B", "Station C", "Station D", "Station E"]

def initialize_data(db: Session):
    """
    Initializes mock data if the database is empty.
    """
    # 1. Initialize Stations
    if db.query(Station).count() == 0:
        stations = [
            Station(station_name="Station A", platform_count=4, capacity=6, current_occupancy=0, utilization=0.0),
            Station(station_name="Station B", platform_count=2, capacity=3, current_occupancy=0, utilization=0.0),
            Station(station_name="Station C", platform_count=3, capacity=4, current_occupancy=0, utilization=0.0),
            Station(station_name="Station D", platform_count=2, capacity=3, current_occupancy=0, utilization=0.0),
            Station(station_name="Station E", platform_count=4, capacity=6, current_occupancy=0, utilization=0.0),
        ]
        db.add_all(stations)
        db.commit()

    # 2. Initialize Tracks
    if db.query(Track).count() == 0:
        tracks = [
            Track(source_station="Station A", destination_station="Station B", capacity=2, occupied=False),
            Track(source_station="Station B", destination_station="Station C", capacity=2, occupied=False),
            Track(source_station="Station C", destination_station="Station D", capacity=2, occupied=False),
            Track(source_station="Station D", destination_station="Station E", capacity=2, occupied=False),
        ]
        db.add_all(tracks)
        db.commit()

    # 3. Initialize Trains
    if db.query(Train).count() == 0:
        # Priority mapping: Vande Bharat = 5, Rajdhani = 4, Express = 3, Passenger = 2, Freight = 1
        trains = [
            Train(train_name="Vande Bharat (22436)", train_type="Vande Bharat", priority=5, 
                  current_station="Station A", target_station="Station B", segment_progress=0.1, 
                  delay_minutes=0, speed=130, status="ON_TIME", direction="OUTBOUND"),
            
            Train(train_name="Rajdhani Express (12301)", train_type="Rajdhani", priority=4, 
                  current_station="Station E", target_station="Station D", segment_progress=0.2, 
                  delay_minutes=2, speed=120, status="DELAYED", direction="INBOUND"),
            
            Train(train_name="Garib Rath (12909)", train_type="Express", priority=3, 
                  current_station="Station B", target_station="Station C", segment_progress=0.5, 
                  delay_minutes=5, speed=100, status="DELAYED", direction="OUTBOUND"),
            
            Train(train_name="Duronto Express (12260)", train_type="Rajdhani", priority=4, 
                  current_station="Station D", target_station="Station C", segment_progress=0.6, 
                  delay_minutes=0, speed=120, status="ON_TIME", direction="INBOUND"),
            
            Train(train_name="Shatabdi Express (12002)", train_type="Vande Bharat", priority=5, 
                  current_station="Station C", target_station="Station D", segment_progress=0.3, 
                  delay_minutes=0, speed=130, status="ON_TIME", direction="OUTBOUND"),
            
            Train(train_name="Express 11005", train_type="Express", priority=3, 
                  current_station="Station B", target_station="Station A", segment_progress=0.0, 
                  delay_minutes=15, speed=100, status="DELAYED", direction="INBOUND"),
            
            Train(train_name="Passenger 51182", train_type="Passenger", priority=2, 
                  current_station="Station D", target_station="Station E", segment_progress=0.7, 
                  delay_minutes=8, speed=60, status="DELAYED", direction="OUTBOUND"),
            
            Train(train_name="Local Passenger 51201", train_type="Passenger", priority=2, 
                  current_station="Station C", target_station="Station B", segment_progress=0.0, 
                  delay_minutes=0, speed=60, status="ON_TIME", direction="INBOUND"),
            
            Train(train_name="Coal Freight 9001", train_type="Freight", priority=1, 
                  current_station="Station A", target_station="Station B", segment_progress=0.05, 
                  delay_minutes=25, speed=50, status="DELAYED", direction="OUTBOUND"),
            
            Train(train_name="Container Freight 9002", train_type="Freight", priority=1, 
                  current_station="Station E", target_station="Station D", segment_progress=0.1, 
                  delay_minutes=12, speed=55, status="DELAYED", direction="INBOUND")
        ]
        db.add_all(trains)
        db.commit()

def step_simulation(db: Session):
    """
    Advances the physical state of the network.
    """
    # 1. Initialize data if empty
    initialize_data(db)

    trains = db.query(Train).all()
    stations = db.query(Station).all()
    tracks = db.query(Track).all()

    # Create a station mapping for quick lookup
    station_map = {s.station_name: s for s in stations}

    # Step size factor. (adjust for simulation speed)
    # A multiplier of 0.0001 is adjusted for smoother, more frequent updates (every 1.5s).
    STEP_FACTOR = 0.0001

    # Reset occupancy counts for updating
    for s in stations:
        # Simulate base background local/regional traffic (always at least 1 train, never 0)
        # Ensure at least 1 platform remains free for simulated express trains
        base_occupancy = random.choices([1, 2, 3], weights=[0.5, 0.4, 0.1])[0]
        s.current_occupancy = min(base_occupancy, s.platform_count - 1) if s.platform_count > 1 else 1

    # Tracks occupied status tracker
    track_occupancy_map = {} # key: (station1, station2), value: list of train names

    for train in trains:
        # Check if train is dwelling at a station
        if getattr(train, 'dwell_ticks', 0) > 0:
            train.dwell_ticks -= 1
            train.segment_progress = 0.0
            train.speed = 0
            # Keep status as is (ON_TIME or DELAYED) while dwelling
        # Increment delay if train is stopped due to optimization hold
        elif train.status == "STOPPED":
            train.speed = 0
            train.delay_minutes += random.choices([0, 1], weights=[0.9, 0.1])[0] # 10% chance to accumulate delay
        else:
            # Re-establish speed if it got set to zero somehow
            if train.speed == 0:
                # restore speed
                train.speed = get_normal_speed(train.train_type)
            
            # Progress train along track segment
            # speed * STEP_FACTOR increases progress
            train.segment_progress += train.speed * STEP_FACTOR

            # Random micro delay addition (simulates reality)
            if random.random() < 0.01: # 1% chance (reduced for least failed notifications)
                train.delay_minutes += 1
                train.status = "DELAYED"
            elif train.delay_minutes == 0:
                train.status = "ON_TIME"

        # Check if train arrived at target_station
        if train.segment_progress >= 1.0:
            train.segment_progress = 0.0
            
            # Transition to target station
            prev_station = train.current_station
            train.current_station = train.target_station
            
            # Find next target station based on route direction
            current_idx = STATION_LIST.index(train.current_station)
            if train.direction == "OUTBOUND":
                if train.current_station == "Station E":
                    train.direction = "INBOUND"
                    train.target_station = "Station D"
                else:
                    train.target_station = STATION_LIST[current_idx + 1]
            else: # INBOUND
                if train.current_station == "Station A":
                    train.direction = "OUTBOUND"
                    train.target_station = "Station B"
                else:
                    train.target_station = STATION_LIST[current_idx - 1]

            # Set a random dwell time at the new station platform (3 to 6 simulator ticks)
            train.dwell_ticks = random.randint(3, 6)
            train.speed = 0
            if train.delay_minutes > 0:
                train.status = "DELAYED"
            else:
                train.status = "ON_TIME"

        # Track train occupancy
        if train.segment_progress == 0.0:
            # Stopped/halted/dwelling at current station
            if train.current_station in station_map:
                station_map[train.current_station].current_occupancy += 1
        else:
            # Traveling on track segment between current_station and target_station
            # Sort station names to keep track segment keys consistent regardless of direction
            segment_key = tuple(sorted([train.current_station, train.target_station]))
            if segment_key not in track_occupancy_map:
                track_occupancy_map[segment_key] = []
            track_occupancy_map[segment_key].append(train)

    # 2. Update station utilizations
    for s in stations:
        if s.platform_count > 0:
            s.utilization = round((s.current_occupancy / s.platform_count) * 100.0, 1)
            # Cap at 100%
            s.utilization = min(s.utilization, 100.0)

    # 3. Update track occupancy flag in DB
    for track in tracks:
        track_key = tuple(sorted([track.source_station, track.destination_station]))
        if track_key in track_occupancy_map and len(track_occupancy_map[track_key]) > 0:
            track.occupied = True
        else:
            track.occupied = False

    # 4. Conflict Detection
    # Keep database clean by limiting history to last 30 resolved conflicts
    resolved_count = db.query(Conflict).filter(Conflict.is_active == False).count()
    if resolved_count > 30:
        old_resolved = db.query(Conflict).filter(Conflict.is_active == False).order_by(Conflict.created_at.asc()).limit(resolved_count - 30).all()
        for old_c in old_resolved:
            db.query(Recommendation).filter(Recommendation.conflict_id == old_c.id).delete()
            db.delete(old_c)
        db.commit()

    # Auto-resolve conflicts that are no longer physically active (trains moved past the segment)
    active_conflicts = db.query(Conflict).filter(Conflict.is_active == True).all()
    for conflict in active_conflicts:
        t1 = db.query(Train).filter(Train.train_name == conflict.train1).first()
        t2 = db.query(Train).filter(Train.train_name == conflict.train2).first()
        
        still_active = False
        if t1 and t2:
            t1_seg = tuple(sorted([t1.current_station, t1.target_station])) if t1.target_station else None
            t2_seg = tuple(sorted([t2.current_station, t2.target_station])) if t2.target_station else None
            if t1_seg and t2_seg and t1_seg == t2_seg and t1.segment_progress > 0.0 and t2.segment_progress > 0.0:
                still_active = True
                
        if not still_active:
            conflict.is_active = False
            conflict.recommendation = "Auto-Resolved: trains moved past section"
            
    db.commit()

    # Refresh active conflicts list
    active_conflicts = db.query(Conflict).filter(Conflict.is_active == True).all()
    active_conflict_keys = {(c.train1, c.train2) for c in active_conflicts}

    # Detect new conflicts in each occupied track segment
    for track_key, segment_trains in track_occupancy_map.items():
        if len(segment_trains) < 2:
            continue

        # Two or more trains are on the same track segment! Let's check for conflicts.
        for i in range(len(segment_trains)):
            for j in range(i + 1, len(segment_trains)):
                t1 = segment_trains[i]
                t2 = segment_trains[j]

                # Check if conflict is already logged
                conflict_exists = (t1.train_name, t2.train_name) in active_conflict_keys or \
                                  (t2.train_name, t1.train_name) in active_conflict_keys

                if conflict_exists:
                    continue

                track_section_str = f"{track_key[0]} - {track_key[1]}"

                # Head-on conflict (different directions on same track segment)
                if t1.direction != t2.direction:
                    new_conflict = Conflict(
                        train1=t1.train_name,
                        train2=t2.train_name,
                        track_section=track_section_str,
                        severity="Critical",
                        is_active=True
                    )
                    db.add(new_conflict)
                    db.commit()
                
                # Overtaking / Space conflict (same direction, behind train is faster and within 0.2 segment progress)
                elif t1.direction == t2.direction:
                    # Determine who is behind
                    if t1.segment_progress > t2.segment_progress:
                        front, behind = t1, t2
                    else:
                        front, behind = t2, t1

                    progress_diff = abs(front.segment_progress - behind.segment_progress)
                    # If behind train is faster and close (progress_diff < 0.2)
                    if progress_diff < 0.2 and behind.speed > front.speed:
                        new_conflict = Conflict(
                            train1=front.train_name,
                            train2=behind.train_name,
                            track_section=track_section_str,
                            severity="High",
                            is_active=True
                        )
                        db.add(new_conflict)
                        db.commit()

    # 5. Run optimization engine to generate recommendations for any newly created conflicts
    evaluate_and_generate_recommendations(db)
    db.commit()

def get_normal_speed(train_type: str) -> int:
    speeds = {
        "Vande Bharat": 130,
        "Rajdhani": 120,
        "Express": 100,
        "Passenger": 60,
        "Freight": 50
    }
    return speeds.get(train_type, 80)
