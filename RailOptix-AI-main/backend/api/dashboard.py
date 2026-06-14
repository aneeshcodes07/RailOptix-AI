from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.db_models import Train, Conflict, Station
from backend.schemas.schemas import DashboardResponse
from backend.services.simulator import step_simulation

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardResponse)
def get_dashboard_data(db: Session = Depends(get_db)):
    # Run a physical simulation step to update train positions, speeds, occupancies, and check conflicts
    step_simulation(db)

    # 1. Total and Active Trains
    trains = db.query(Train).all()
    total_trains = len(trains)
    
    # Active means traveling or running (speed > 0)
    active_trains = sum(1 for t in trains if t.speed > 0 and t.status != "STOPPED")

    # 2. Active Conflicts
    active_conflicts = db.query(Conflict).filter(Conflict.is_active == True).count()

    # 3. Average Delay
    total_delay = sum(t.delay_minutes for t in trains)
    avg_delay = round(total_delay / total_trains, 1) if total_trains > 0 else 0.0

    # 4. On-Time Percentage
    on_time_trains = sum(1 for t in trains if t.status == "ON_TIME")
    on_time_percentage = round((on_time_trains / total_trains) * 100.0, 1) if total_trains > 0 else 100.0

    # 5. Average Platform Utilization
    stations = db.query(Station).all()
    total_util = sum(s.utilization for s in stations)
    avg_platform_util = round(total_util / len(stations), 1) if len(stations) > 0 else 0.0

    # 6. Throughput Score (represents overall system capacity flow)
    # Starts at 100%, drops with delay and conflicts
    throughput_base = 98.0 - (avg_delay * 0.4) - (active_conflicts * 4.0)
    throughput = int(max(35, min(throughput_base, 99)))

    return DashboardResponse(
        totalTrains=total_trains,
        activeTrains=active_trains,
        activeConflicts=active_conflicts,
        averageDelay=avg_delay,
        throughput=throughput,
        platformUtilization=avg_platform_util,
        onTimePercentage=on_time_percentage
    )
