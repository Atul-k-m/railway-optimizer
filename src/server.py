import sys
import os
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from pydantic import BaseModel

# Add local src to path to import existing modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.data_manager import DataManager
from src.optimizer import JourneyOptimizer

app = FastAPI(title="Railway Optimizer API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DataManager and Optimizer
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
dm = DataManager(DATA_DIR)
optimizer = JourneyOptimizer(dm)

@app.get("/api/stations")
def get_stations():
    """Return list of all available stations."""
    return sorted([{"code": s.code, "name": s.name} for s in dm.stations], key=lambda x: x['name'])

@app.get("/api/search")
def search_trains(
    source: str = Query(..., min_length=2, max_length=5),
    destination: str = Query(..., min_length=2, max_length=5),
    date: str = Query(..., description="Date in DD-MM-YYYY format"),
    pclass: str = Query("SL", description="Preferred Class")
):
    try:
        travel_date = datetime.strptime(date, "%d-%m-%Y")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use DD-MM-YYYY")

    try:
        options = optimizer.get_best_options(source.upper(), destination.upper(), travel_date, pclass)
    except Exception as e:
         print(f"Error during optimization: {e}")
         raise HTTPException(status_code=500, detail=str(e))

    # Convert complex objects to JSON-friendly dicts
    results = []
    for opt in options:
        legs_data = []
        for leg in opt.legs:
            legs_data.append({
                "train_name": leg.train.name,
                "train_number": leg.train.number,
                "source": leg.source,
                "destination": leg.destination,
                "dep_time": leg.dep_time,
                "arr_time": leg.arr_time,
                "duration": leg.duration,
                "fare": leg.fare,
                "wait_time_before": leg.wait_time_before
            })
            
        results.append({
            "total_fare": opt.total_fare,
            "total_duration": opt.total_duration_minutes,
            "total_duration_str": opt.total_duration_str,
            "transfers": opt.total_transfers,
            "via": opt.via,
            "route_type": opt.route_type,
            "legs": legs_data
        })
        
    return {"source": source, "destination": destination, "date": date, "options": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
