from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator
from typing import Literal
import uvicorn

# Import class dari file predict.py
from src.predict import MaintenanceModel

# --- 1. Inisialisasi App & Model ---
app = FastAPI(title="PROTEK API", version="2.0 (Modular)")

# Buat instance model
ai_engine = MaintenanceModel()

# Load model saat aplikasi menyala (Startup Event)
@app.on_event("startup")
def startup_event():
    try:
        ai_engine.load_artifacts()
    except Exception as e:
        print(f"FATAL ERROR: {e}")

# Setup CORS (Agar bisa diakses Web/Flutter)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. Schema Data (Validasi) ---
class MachineSensorData(BaseModel):
    Machine_ID: str = Field(..., example="M-001")
    Type: Literal['L', 'M', 'H']
    Air_Temp: float = Field(..., gt=0)
    Process_Temp: float = Field(..., gt=0)
    RPM: int = Field(..., gt=0)
    Torque: float = Field(..., ge=0)
    Tool_Wear: int = Field(..., ge=0)

    @model_validator(mode='after')
    def check_physics(self):
        if self.Process_Temp < self.Air_Temp:
            raise ValueError("Process Temp harus >= Air Temp")
        return self

# --- 3. Endpoint ---
@app.get("/")
def root():
    return {"message": "PROTEK AI Service is Running!"}

@app.post("/predict")
def predict_maintenance_api(data: MachineSensorData):
    try:
        # Konversi Pydantic object ke Python Dict
        input_data = data.model_dump()
        
        # Panggil fungsi di predict.py
        prediction_result = ai_engine.make_prediction(input_data)
        
        return prediction_result

    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"ERROR DETAIL:\n{error_detail}")
        raise HTTPException(status_code=500, detail=str(e))

# Entry point untuk debugging lokal
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)