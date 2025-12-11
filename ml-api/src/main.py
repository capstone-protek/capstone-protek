
import asyncio
import os
from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator

# Import komponen MLOps
from .db_connector import create_pool, db_pool, execute_query
from .data_loader import load_and_combine_data

# Import class dari file predict.py (Asumsi: MaintenanceModel memiliki method make_prediction)
from src.predict import MaintenanceModel

# --- MLOPS SIMULATION CONFIGURATION ---
ACCELERATION_FACTOR = 100
# Waktu nyata dalam detik (300s=5m, 180s=3m, 120s=2m)
TIME_MAPPING = {"H": 5, "M": 3, "L": 2}

# Status Simulasi Global
DATA_SIMULASI: List[Dict[str, Any]] = []
SIMULATION_TASK: Optional[asyncio.Task] = None
SIMULATION_INDEX: int = 0
IS_RUNNING: bool = False


def reset_simulation_state():
    """Reset indeks dan flag simulasi sebelum dijalankan."""

    global IS_RUNNING, SIMULATION_INDEX
    IS_RUNNING = True
    SIMULATION_INDEX = 0

# --- 1. Inisialisasi App & Model ---
app = FastAPI(title="PROTEK AI SERVICE (MLOPS SIMULATOR)", version="2.0 (Full MLOps)")

# Buat instance model
ai_engine = MaintenanceModel()

# --- Fungsi MLOps: Feature Engineering ---
# Fungsi ini harus mengambil data historis dari DB dan menghitung fitur
async def perform_feature_engineering(row: Dict[str, Any]):
    """Mengambil data historis relevan dan menghitung fitur turunan."""

    data_sql = """
        SELECT tool_wear_min, torque_nm, rotational_speed_rpm
        FROM sensor_data
        WHERE machine_id = $1
        ORDER BY insertion_time DESC
        LIMIT 5;
    """

    machine_id = row["machine_id"]
    history = await execute_query(data_sql, machine_id)

    if not history:
        return {
            "machine_id": machine_id,
            "rolling_torque_avg": row["Torque [Nm]"],
            "latest_tool_wear": row["Tool wear [min]"],
            "latest_torque": row["Torque [Nm]"],
        }

    torque_data = [float(record["torque_nm"]) for record in history]
    rolling_torque_avg = sum(torque_data) / len(torque_data)
    latest = history[0]

    return {
        "Machine_ID": machine_id,
        "Type": row["Type"],
        "Air_Temp": row["Air temperature [K]"],
        "Process_Temp": row["Process temperature [K]"],
        "RPM": row["Rotational speed [rpm]"],
        "Torque": float(latest["torque_nm"]),
        "Tool_Wear": float(latest["tool_wear_min"]),
        "rolling_torque_avg": rolling_torque_avg,
    }


async def insert_sensor_row(row: Dict[str, Any]):
    """Sisipkan data sensor mentah dan kembalikan insertion_time."""

    sql_insert = """
        INSERT INTO sensor_data (machine_id, type, air_temperature_k,
            process_temperature_k, rotational_speed_rpm, torque_nm,
            tool_wear_min)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING insertion_time;
    """

    inserted_records = await execute_query(
        sql_insert,
        row["machine_id"],
        row["Type"],
        row["Air temperature [K]"],
        row["Process temperature [K]"],
        row["Rotational speed [rpm]"],
        row["Torque [Nm]"],
        row["Tool wear [min]"],
    )

    return inserted_records[0]["insertion_time"]


def extract_prediction_metrics(prediction_result: Dict[str, Any], fallback_row: Dict[str, Any]):
    """Normalisasi hasil prediksi ke format angka dan string aman."""

    machine_id = prediction_result.get("Machine_ID", fallback_row.get("machine_id"))
    risk_str = prediction_result.get("Risk_Probability", "0%")
    try:
        risk_val = float(str(risk_str).replace("%", "")) / 100.0
    except Exception:
        risk_val = 0.0

    rul_estimate = prediction_result.get("RUL_Estimate", "")
    rul_status = prediction_result.get("RUL_Status", "")
    try:
        rul_minutes = float(prediction_result.get("RUL_Minutes", 0))
    except Exception:
        rul_minutes = 0.0

    status_text = prediction_result.get("Status", "")
    failure_type = prediction_result.get("Failure_Type", "")
    action = prediction_result.get("Action", "")
    urgency = prediction_result.get("Urgency", "")

    return (
        machine_id,
        risk_str,
        risk_val,
        rul_estimate,
        rul_status,
        rul_minutes,
        status_text,
        failure_type,
        action,
        urgency,
    )


def log_prediction(machine_id: Any, risk_str: str, rul_estimate: str, rul_status: str, rul_minutes: float):
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(
        f"[{timestamp}] Sim Mesin {machine_id} | "
        f"Risk: {risk_str} | RUL: {rul_estimate} | "
        f"Status: {rul_status} | RUL_Min: {rul_minutes:.1f}"
    )

# --- FUNGSI SIMULASI UTAMA (Background Task) ---
async def run_simulation_loop():
    global SIMULATION_TASK, IS_RUNNING, SIMULATION_INDEX
    
    while SIMULATION_INDEX < len(DATA_SIMULASI):
        row = DATA_SIMULASI[SIMULATION_INDEX]
        time_interval_seconds = TIME_MAPPING.get(row['Type'], 0)
        sleep_time = time_interval_seconds / ACCELERATION_FACTOR
        
        try:
            # 1) Injeksi data mentah ke DB
            insertion_time = await insert_sensor_row(row)

            # 2) Feature engineering
            features_for_prediction = await perform_feature_engineering(row)

            # 3) Prediksi (Inference)
            prediction_result = ai_engine.make_prediction(features_for_prediction)
            (
                machine_id,
                risk_str,
                risk_val,
                rul_estimate,
                rul_status,
                rul_minutes,
                status_text,
                failure_type,
                action_text,
                urgency_text,
            ) = extract_prediction_metrics(prediction_result, row)

            # 4) Simpan hasil prediksi
            sql_predict = """
                INSERT INTO prediction_results (
                    machine_id,
                    risk_probability,
                    rul_estimate,
                    rul_status,
                    rul_minutes_val,
                    pred_status,
                    failure_type,
                    action,
                    urgency,
                    prediction_time
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
            """
            await execute_query(
                sql_predict,
                str(machine_id),
                risk_str,
                rul_estimate,
                rul_status,
                rul_minutes,
                status_text,
                failure_type,
                action_text,
                urgency_text,
                insertion_time,
            )

            # 5) Logging ringkas
            log_prediction(machine_id, risk_str, rul_estimate, rul_status, rul_minutes)

        except asyncio.CancelledError:
            print("Simulasi dibatalkan.")
            break
        except Exception as e:
            print(f"ERROR SIMULASI di index {SIMULATION_INDEX}: {e}")
            import traceback
            traceback.print_exc()
            break # Berhenti jika terjadi error fatal

        SIMULATION_INDEX += 1
        await asyncio.sleep(sleep_time)

    IS_RUNNING = False
    SIMULATION_TASK = None
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Simulasi Selesai. Total rows: {SIMULATION_INDEX}")


# --- 2. Schema Data (Validasi) ---
class MachineSensorData(BaseModel):
    # Sesuaikan Pydantic dengan skema data yang Anda gunakan di FE (misalnya, jika Anda ingin menguji API secara langsung)
    Machine_ID: str = Field(..., example="M-001")
    Type: Literal['L', 'M', 'H']
    Air_Temp: float = Field(..., gt=0)
    Process_Temp: float = Field(..., gt=0)
    RPM: int = Field(..., gt=0)
    Torque: float = Field(..., ge=0)
    Tool_Wear: int = Field(..., ge=0)
    
    # Perluasan untuk fitur FE jika diuji langsung:
    # rolling_torque_avg: Optional[float] = None 

    @model_validator(mode='after')
    def check_physics(self):
        if self.Process_Temp < self.Air_Temp:
            raise ValueError("Process Temp harus >= Air Temp")
        return self

# --- Setup App & Events ---

# Setup CORS (Agar bisa diakses Web/Flutter)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model, DB Pool, dan Data Simulasi saat aplikasi menyala
@app.on_event("startup")
async def startup_event_unified():
    global DATA_SIMULASI
    # 1. Load Model
    try:
        ai_engine.load_artifacts()
    except Exception as e:
        print(f"FATAL ERROR: {e}")
        
    # 2. Load Data Simulasi (dari data_loader.py)
    DATA_SIMULASI = load_and_combine_data()
        
    # 3. Create DB Pool (DISABLED for demo - no database required)
    # await create_pool()
    # print("Database pool berhasil dibuat.")
    print("✅ API ready without database (demo mode)")

@app.on_event("shutdown")
async def shutdown_event_unified():
    if db_pool:
        await db_pool.close()
    global SIMULATION_TASK
    if SIMULATION_TASK and not SIMULATION_TASK.done():
        SIMULATION_TASK.cancel()
        print("Simulasi dihentikan saat shutdown.")

# --- 3. Endpoint Dasar ---
@app.get("/")
def root():
    return {"message": "PROTEK AI Service is Running (SIMULATION ENABLED)!"}

# --- 4. Endpoint Simulasi ---
@app.post("/api/simulation/start")
async def start_simulation():
    global SIMULATION_TASK, IS_RUNNING, SIMULATION_INDEX
    
    if IS_RUNNING:
        raise HTTPException(status_code=400, detail="Simulasi sudah berjalan.")

    reset_simulation_state()
    
    print(f"[{datetime.now().strftime('%H:%M:%S')}] SIMULASI DIMULAI - Creating async task")
    
    # Create task yang berjalan di background
    SIMULATION_TASK = asyncio.create_task(run_simulation_loop())
    
    return {"status": "success", "message": "Simulasi data realtime dimulai!"}

@app.get("/api/simulation/stop")
async def stop_simulation():
    global SIMULATION_TASK, IS_RUNNING
    if SIMULATION_TASK and IS_RUNNING:
        SIMULATION_TASK.cancel()
        IS_RUNNING = False
        SIMULATION_TASK = None
        return {"status": "success", "message": "Simulasi berhasil dihentikan."}
    return {"status": "error", "message": "Tidak ada simulasi yang berjalan."}

# --- 5. Endpoint Prediksi Asli (untuk pengujian/penggunaan langsung) ---
@app.post("/predict")
def predict_maintenance_api(data: MachineSensorData):
    try:
        # Konversi Pydantic object ke Python Dict
        input_data = data.model_dump()
        
        # Panggil fungsi di predict.py (Ini akan menjalankan FE internal)
        prediction_result = ai_engine.make_prediction(input_data)
        
        return prediction_result

    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"ERROR DETAIL:\n{error_detail}")
        raise HTTPException(status_code=500, detail="Internal Server Error during prediction.")

# Entry point untuk debugging lokal
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)