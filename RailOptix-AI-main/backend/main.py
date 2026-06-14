import os
import sys

# Dynamic module registration to support deploying the backend folder directly to Vercel
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    import backend
except ImportError:
    import types
    backend_module = types.ModuleType('backend')
    backend_module.__path__ = [current_dir]
    sys.modules['backend'] = backend_module

import threading
import time
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.connection import engine, Base, SessionLocal
from backend.services.simulator import initialize_data, step_simulation
from backend.api import trains, stations, conflicts, recommendations, simulations, dashboard

# 1. Initialize DB tables
Base.metadata.create_all(bind=engine)

# Seed initial data
db = SessionLocal()
try:
    initialize_data(db)
finally:
    db.close()

# 2. Initialize FastAPI
app = FastAPI(
    title="RailOptix AI API",
    description="Intelligent Railway Traffic Optimization and Decision Support System Backend",
    version="1.0.0"
)

# 3. CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Include Routers
app.include_router(trains.router)
app.include_router(stations.router)
app.include_router(conflicts.router)
app.include_router(recommendations.router)
app.include_router(simulations.router)
app.include_router(dashboard.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to RailOptix AI Traffic Optimization API. Dashboard is active."}

# 5. Background Simulation Thread
def start_simulator_daemon():
    def run_loop():
        # Small delay on startup
        time.sleep(2)
        while True:
            db_session = SessionLocal()
            try:
                step_simulation(db_session)
            except Exception as e:
                print(f"[Simulator Daemon] Error: {e}")
            finally:
                db_session.close()
            time.sleep(0.5) # Run simulation step every 0.5 seconds

    thread = threading.Thread(target=run_loop, daemon=True)
    thread.start()

# Start background simulation on startup if not running in a serverless environment (e.g. Vercel)
if not os.getenv("VERCEL"):
    start_simulator_daemon()
