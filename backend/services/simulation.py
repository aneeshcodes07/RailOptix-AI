import random
from datetime import datetime
from sqlalchemy.orm import Session
from backend.models.db_models import Train, Simulation

SCENARIOS = {
    "Heavy Rain": {
        "multiplier": 1.8,
        "base_add": 35,
        "opt_divisor": 2.2,
        "details": (
            "Monsoon downpours have caused waterlogging on low-lying tracks near Station C.\n"
            "• Test Case A (Outbound track): Water level at 80mm; speed restricted to 50 km/h for passenger safety.\n"
            "• Test Case B (Inbound track): Water level at 150mm; track submerged; high-speed runs suspended; maximum caution speed of 30 km/h enforced."
        ),
        "recovery_plan": (
            "1. Enforce wet-weather caution speed limits across affected sectors.\n"
            "2. Park Freight trains 9001 and 9002 at Station A and Station E siding yards to prevent main line gridlock.\n"
            "3. Grant absolute track precedence to Vande Bharat & Rajdhani Express trains to minimize high-profile delay hours.\n"
            "4. Dynamic schedule adjustment: Increment buffer headway between follow-on trains from 5 mins to 12 mins."
        )
    },
    "Signal Failure": {
        "multiplier": 2.2,
        "base_add": 55,
        "opt_divisor": 2.6,
        "details": (
            "Major electronic interlocking failure at Junction D has halted automatic signaling sensors.\n"
            "• Test Case A (Junction D Loops): Points locked in loop 2; manual route inspection required.\n"
            "• Test Case B (Section C-D): Absolute signal blackout; block section occupancy tracked via physical paper tokens."
        ),
        "recovery_plan": (
            "1. Establish Single Line Token Working (SLTW) protocol between Station C and Station D.\n"
            "2. Deploy hand-signaling staff at Junction D points to verify mechanical lock alignment.\n"
            "3. Terminate local passenger loops early; hold Passenger 51182 and 51201 at Station B platform loop.\n"
            "4. Clear mainline for express transit; authorize Rajdhani Express (12301) to proceed with manual pilots.\n"
            "5. Push digital route advisories to all locomotive cabs."
        )
    },
    "Track Block": {
        "multiplier": 2.5,
        "base_add": 75,
        "opt_divisor": 3.0,
        "details": (
            "Scheduled OHE mast replacement and track maintenance block on the outbound line between Station B and Station C.\n"
            "• Test Case A (Outbound line): Total closure for engineering work.\n"
            "• Test Case B (Inbound line): Single-line operation with 30 km/h speed limit for track worker safety."
        ),
        "recovery_plan": (
            "1. Activate single-line bi-directional signaling on the remaining active track.\n"
            "2. Establish 25-minute alternating traffic windows for outbound and inbound convoys.\n"
            "3. Hold Garib Rath Express (12909) and Freight trains at Station B loop to clear bottleneck.\n"
            "4. Fast-track Vande Bharat Express during the primary outbound slot.\n"
            "5. Maximize station platform utility at Station B to buffer passenger transfers."
        )
    },
    "Platform Closure": {
        "multiplier": 1.5,
        "base_add": 25,
        "opt_divisor": 2.0,
        "details": (
            "Emergency overhead wire repair at Station C has closed Platform 2.\n"
            "• Test Case A (Platform 2): Complete power cutoff for contact wire replacement.\n"
            "• Test Case B (Platform 1 & 3): Speed caution of 15 km/h during platform approach due to workers on adjacent line."
        ),
        "recovery_plan": (
            "1. Route all incoming trains to Platform 1 and Platform 3 using yard crossover points.\n"
            "2. Limit station dwell times to 1 minute for local trains to keep platforms clear.\n"
            "3. Reroute Freight trains to bypass loops to avoid occupying passenger platforms.\n"
            "4. Hold Express 11005 at Station B platform for 8 minutes to wait for Platform 1 occupancy clearance.\n"
            "5. Update passenger display systems with revised platform assignments."
        )
    },
    "Engine Breakdown": {
        "multiplier": 2.0,
        "base_add": 45,
        "opt_divisor": 2.4,
        "details": (
            "Freight locomotive engine failure on the single line track section between Station C and Station D.\n"
            "• Test Case A (Freight 9001): Train stalled with air brake leakage; incapable of self-movement.\n"
            "• Test Case B (Affected Section): Total block; behind Express trains backed up at Station C."
        ),
        "recovery_plan": (
            "1. Dispatch emergency relief locomotive from Station E locomotive shed.\n"
            "2. Hold all inbound and outbound traffic at Station C and Station E platforms.\n"
            "3. Prepare Station C loop lines to receive Garib Rath Express (12909) to keep mainline free.\n"
            "4. Upon coupler attachment, pull stalled freight train to Station D siding.\n"
            "5. Run accumulated traffic in order of precedence: Vande Bharat -> Rajdhani -> Express -> Passenger."
        )
    },
    "High Traffic Period": {
        "multiplier": 1.4,
        "base_add": 15,
        "opt_divisor": 1.8,
        "details": (
            "Holiday season rush causing extreme line density with 3 extra holiday special passenger runs scheduled.\n"
            "• Test Case A (Main Line): Inter-train headway reduced to 4 minutes.\n"
            "• Test Case B (Station Platforms): Extreme passenger volumes slowing down passenger boarding/boarding times."
        ),
        "recovery_plan": (
            "1. Enforce active yellow alert warning signals to prompt locomotive drivers to maintain caution speeds.\n"
            "2. Restrict non-essential Freight runs to nighttime slots (22:00 to 05:00).\n"
            "3. Standardize platform dwell times to 2 minutes maximum; deploy board assistants.\n"
            "4. Utilize Station A and Station E loop lines to dynamically overtake slower passenger units.\n"
            "5. Enable automated priority scheduling override for all premium services."
        )
    },
    "Emergency Train Movement": {
        "multiplier": 1.6,
        "base_add": 30,
        "opt_divisor": 2.1,
        "details": (
            "Military special convoy and Medical Relief Train transiting the section with absolute priority.\n"
            "• Test Case A (Outbound path): Priority path booked from Station A to E.\n"
            "• Test Case B (Opposing path): Multiple inbound trains must clear the single line segments."
        ),
        "recovery_plan": (
            "1. Clear all track segments between Station B and C 15 minutes before emergency train arrival.\n"
            "2. Direct all inbound and outbound trains (including Vande Bharat) to take platform loops.\n"
            "3. Enforce red signaling on all junctions feeding the mainline.\n"
            "4. Lock crossover points to prevent entry from auxiliary siding yards.\n"
            "5. Resume normal scheduling queue order immediately after the emergency convoy exits the block."
        )
    }
}

def run_scenario_simulation(scenario_name: str, db: Session) -> dict:
    """
    Runs a what-if simulation for a disruption scenario, calculates average delays
    before and after AI optimization, and writes the simulation result to the DB.
    """
    scenario = SCENARIOS.get(scenario_name)
    if not scenario:
        # Fallback if unknown scenario
        scenario = {
            "multiplier": 1.5,
            "base_add": 20,
            "opt_divisor": 2.0,
            "details": "General signaling delay on network segment.",
            "recovery_plan": "Resume normal traffic operations. Prioritize delayed trains."
        }

    # Fetch active trains
    trains = db.query(Train).all()
    train_count = len(trains) if trains else 1

    total_current_delay = sum([t.delay_minutes for t in trains])
    
    # Calculate simulated delay before optimization
    # Scale existing delays and add base scenario disruption delay
    simulated_before_delay = 0
    for train in trains:
        # Priority 1 trains suffer worst in manual, Priority 5 trains get delayed too
        priority_factor = (6 - train.priority) * 0.5
        train_delay = int((train.delay_minutes * scenario["multiplier"]) + (scenario["base_add"] * priority_factor))
        simulated_before_delay += train_delay

    avg_before_delay = int(simulated_before_delay / train_count)

    # Calculate simulated delay after optimization
    # AI optimization mitigates delays by holding low priority, running high priority trains, clearing bottlenecks
    simulated_after_delay = 0
    for train in trains:
        # High priority trains suffer very little delay post-optimization
        priority_factor = (6 - train.priority) * 0.15
        train_delay = int((train.delay_minutes * 1.1) + ((scenario["base_add"] / scenario["opt_divisor"]) * priority_factor))
        simulated_after_delay += train_delay

    avg_after_delay = int(simulated_after_delay / train_count)

    # Save simulation history record
    sim_record = Simulation(
        scenario_name=scenario_name,
        before_delay=avg_before_delay,
        after_delay=avg_after_delay,
        timestamp=datetime.utcnow()
    )
    db.add(sim_record)
    db.commit()

    return {
        "scenario_name": scenario_name,
        "before_delay": avg_before_delay,
        "after_delay": avg_after_delay,
        "recovery_plan": scenario["recovery_plan"],
        "details": scenario["details"],
        "timestamp": sim_record.timestamp
    }
