from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np

app = FastAPI(title="Carbon Supply Chain Optimizer")

# Emission factors (kg CO2 per km per unit weight/distance)
# Source: Simplified estimates for demonstration
EMISSION_FACTORS = {
    "truck": 0.105,
    "van": 0.085,
    "rail": 0.025,
    "ship": 0.015
}

class OptimizationRequest(BaseModel):
    distanceKm: float
    vehicleType: str

class OptimizationResponse(BaseModel):
    currentEmissionKg: float
    recommendedVehicle: str
    recommendedEmissionKg: float
    savingsKg: float

@app.get("/")
async def root():
    return {"message": "Carbon Optimizer Engine is running"}

@app.post("/optimize", response_model=OptimizationResponse)
async def optimize(request: OptimizationRequest):
    if request.vehicleType not in EMISSION_FACTORS:
        raise HTTPException(status_code=400, detail="Invalid vehicle type")
    
    # Calculate current emission
    current_emission = request.distanceKm * EMISSION_FACTORS[request.vehicleType]
    
    # Find the best alternative (lowest emission factor)
    # In a real scenario, this would involve complex routing and logistics constraints
    recommended_vehicle = min(EMISSION_FACTORS, key=EMISSION_FACTORS.get)
    recommended_emission = request.distanceKm * EMISSION_FACTORS[recommended_vehicle]
    
    # If the current vehicle is already the best, recommend the next best or just itself
    if recommended_vehicle == request.vehicleType:
        # Find second best or just keep current
        sorted_vehicles = sorted(EMISSION_FACTORS.items(), key=lambda x: x[1])
        if len(sorted_vehicles) > 1:
            recommended_vehicle = sorted_vehicles[0][0]
            recommended_emission = request.distanceKm * sorted_vehicles[0][1]

    savings = max(0, current_emission - recommended_emission)
    
    return {
        "currentEmissionKg": round(current_emission, 2),
        "recommendedVehicle": recommended_vehicle,
        "recommendedEmissionKg": round(recommended_emission, 2),
        "savingsKg": round(savings, 2)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
