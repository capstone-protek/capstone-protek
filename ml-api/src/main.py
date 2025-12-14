import asyncio
import os
from datetime import datetime
from typing import Any, Dict, List, Literal, Optional, Set

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator

# Import komponen MLOps
try:
    from .db_connector import create_pool, db_pool, execute_query
    DB_AVAILABLE = True
except Exception as e:
    print(f"⚠️ DB import failed: {e}. Running in demo mode.")
    DB_AVAILABLE = False
    db_pool = None
    async def create_pool():
        pass
    async def execute_query(*args, **kwargs):
        return []

from .data_loader import load_and_combine_data

# Import class dari file predict.py (Asumsi: MaintenanceModel memiliki method make_prediction)
from src.predict import MaintenanceModel

# --- MLOPS SIMULATION CONFIGURATION ---
# Waktu jeda simulasi dalam DETIK (untuk testing: L=5s, M=10s, H=15s)
# Untuk production, ganti ke menit: {"L": 120, "M": 180, "H": 300}
TIME_MAPPING_MINUTES = {"L": 5, "M": 10, "H": 15}  # in seconds for demo

# Status Simulasi Global
DATA_SIMULASI: List[Dict[str, Any]] = []
SIMULATION_TASK: Optional[asyncio.Task] = None
SIMULATION_INDEX: int = 0
IS_RUNNING: bool = False
SIMULATION_TASKS: Set[asyncio.Task] = set()


def reset_simulation_state():
    """Reset indeks/flag simulasi dan bersihkan task sebelumnya."""

    global IS_RUNNING, SIMULATION_INDEX, SIMULATION_TASKS
    IS_RUNNING = True
    SIMULATION_INDEX = 0
    for t in list(SIMULATION_TASKS):
        if not t.done():
            t.cancel()
    SIMULATION_TASKS.clear()

# --- 1. Inisialisasi App & Model ---
app = FastAPI(title="PROTEK AI SERVICE (MLOPS SIMULATOR)", version="2.0 (Full MLOps)")

# Buat instance model
ai_engine = MaintenanceModel()

# --- Fungsi MLOps: Feature Engineering ---
# Fungsi ini menyiapkan fitur dari baris CSV tanpa sensor history (snake_case)
async def perform_feature_engineering(row: Dict[str, Any]):
    """Siapkan fitur prediksi dari baris CSV tanpa sensor history (snake_case)."""

    machine_id = row["machine_id"]
    return {
        "machine_id": machine_id,
        "type": row.get("Type"),
        "air_temp": row.get("Air temperature [K]"),
        "process_temp": row.get("Process temperature [K]"),
        "rpm": row.get("Rotational speed [rpm]"),
        "torque": row.get("Torque [Nm]"),
        "tool_wear": row.get("Tool wear [min]"),
    }


async def insert_sensor_row(row: Dict[str, Any]):
    """Sisipkan data sensor mentah dan kembalikan insertion_time (atau mock jika DB unavailable)."""
    
    if not DB_AVAILABLE:
        # Demo mode: return mock insertion_time
        return datetime.now().isoformat()

    # Lookup machine_id (integer) dari aset_id (string, e.g., "M-14850")
    machine_aset_id = row.get("machine_id")  # e.g., "M-14850"
    
    # Query to get integer id from aset_id
    lookup_sql = "SELECT id FROM machines WHERE aset_id = $1 LIMIT 1;"
    lookup_records = await execute_query(lookup_sql, machine_aset_id)
    
    if not lookup_records:
        print(f"⚠️ Machine {machine_aset_id} not found in database. Skipping insert.")
        return None
    
    machine_id_int = lookup_records[0]["id"]  # Integer ID

    sql_insert = """
        INSERT INTO sensor_data (machine_id, type, air_temperature_k,
            process_temperature_k, rotational_speed_rpm, torque_nm,
            tool_wear_min)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING insertion_time;
    """

    inserted_records = await execute_query(
        sql_insert,
        machine_id_int,  # Now pass integer ID
        row["Type"],
        row["Air temperature [K]"],
        row["Process temperature [K]"],
        row["Rotational speed [rpm]"],
        row["Torque [Nm]"],
        row["Tool wear [min]"],
    )

    return inserted_records[0]["insertion_time"] if inserted_records else datetime.now().isoformat()


def extract_prediction_metrics(prediction_result: Dict[str, Any], fallback_row: Dict[str, Any]):
    """Normalisasi hasil prediksi (snake_case) ke format angka dan string aman."""

    machine_id = prediction_result.get("machine_id", fallback_row.get("machine_id"))
    risk_str = prediction_result.get("risk_probability", "0%")
    try:
        risk_val = float(str(risk_str).replace("%", "")) / 100.0
    except Exception:
        risk_val = 0.0

    rul_estimate = prediction_result.get("rul_estimate", "")
    rul_status = prediction_result.get("rul_status", "")
    try:
        rul_minutes = float(prediction_result.get("rul_minutes", 0))
    except Exception:
        rul_minutes = 0.0

    status_text = prediction_result.get("status", "")
    failure_type = prediction_result.get("failure_type", "")
    action = prediction_result.get("action", "")
    urgency = prediction_result.get("urgency", "")

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

# --- FUNGSI SIMULASI PER MESIN (Background Task) ---
async def run_simulation_loop_for_machine(machine_id: str, rows: List[Dict[str, Any]]):
    idx = 0
    while idx < len(rows):
        row = rows[idx]
        seconds = TIME_MAPPING_MINUTES.get(row.get('Type', 'L'), 5)
        sleep_time = seconds  # Already in seconds

        try:
            # 1) Injeksi data mentah ke DB
            insertion_time = await insert_sensor_row(row)

            # 2) Feature engineering
            features_for_prediction = await perform_feature_engineering(row)

            # 3) Prediksi (Inference)
            prediction_result = ai_engine.make_prediction(features_for_prediction)
            (
                mid,
                risk_str,
                _risk_val,
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
            if DB_AVAILABLE:
                # Lookup machine_id (integer) dari aset_id (string)
                lookup_sql = "SELECT id FROM machines WHERE aset_id = $1 LIMIT 1;"
                lookup_records = await execute_query(lookup_sql, mid)
                
                if lookup_records:
                    machine_id_int = lookup_records[0]["id"]
                    await execute_query(
                        sql_predict,
                        machine_id_int,  # Use integer ID
                        _risk_val,
                        rul_estimate,
                        rul_status,
                        rul_minutes,
                        status_text,
                        failure_type,
                        action_text,
                        urgency_text,
                        insertion_time,
                    )
                else:
                    print(f"⚠️ Machine {mid} not found in database. Skipping prediction insert.")

            # 5) Logging ringkas
            log_prediction(mid, risk_str, rul_estimate, rul_status, rul_minutes)

        except asyncio.CancelledError:
            print(f"Simulasi {machine_id} dibatalkan.")
            break
        except Exception as e:
            print(f"ERROR SIMULASI [{machine_id}] idx {idx}: {e}")
            import traceback
            traceback.print_exc()
            break

        idx += 1
        await asyncio.sleep(sleep_time)


# --- 2. Schema Data (Validasi) ---
class MachineSensorData(BaseModel):
    # Sesuaikan Pydantic dengan skema data yang Anda gunakan di FE (misalnya, jika Anda ingin menguji API secara langsung)
    machine_id: str = Field(..., example="M-001")
    type: Literal['L', 'M', 'H']
    air_temp: float = Field(..., gt=0)
    process_temp: float = Field(..., gt=0)
    rpm: int = Field(..., gt=0)
    torque: float = Field(..., ge=0)
    tool_wear: int = Field(..., ge=0)
    
    # Perluasan untuk fitur FE jika diuji langsung:
    # rolling_torque_avg: Optional[float] = None 

    @model_validator(mode='after')
    def check_physics(self):
        if self.process_temp < self.air_temp:
            raise ValueError("process_temp harus >= air_temp")
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
        
    # 3. Create DB Pool (ENABLED for simulation)
    try:
        await create_pool()
        print("✅ Database pool berhasil dibuat.")
    except Exception as e:
        print(f"⚠️ Database connection failed: {e}")
        print("✅ API ready (demo mode - no database)")
    
    print("✅ API ready for simulation!")

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
    global SIMULATION_TASKS, IS_RUNNING, SIMULATION_TASK, SIMULATION_INDEX

    if IS_RUNNING:
        raise HTTPException(status_code=400, detail="Simulasi sudah berjalan.")

    reset_simulation_state()

    # Group data per mesin
    from collections import defaultdict
    grouped: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for row in DATA_SIMULASI:
        mid = str(row.get("machine_id"))
        grouped[mid].append(row)

    if not grouped:
        raise HTTPException(status_code=500, detail="DATA_SIMULASI kosong atau tidak memiliki machine_id.")

    print(f"[{datetime.now().strftime('%H:%M:%S')}] SIMULASI DIMULAI - {len(grouped)} mesin (parallel)")

    # Buat task paralel untuk setiap mesin
    for mid, rows in grouped.items():
        t = asyncio.create_task(run_simulation_loop_for_machine(mid, rows))
        SIMULATION_TASKS.add(t)

    return {"status": "success", "message": f"Simulasi paralel dimulai untuk {len(SIMULATION_TASKS)} mesin."}

@app.get("/api/simulation/stop")
async def stop_simulation():
    global SIMULATION_TASKS, IS_RUNNING, SIMULATION_TASK
    if SIMULATION_TASKS and IS_RUNNING:
        for t in list(SIMULATION_TASKS):
            t.cancel()
        SIMULATION_TASKS.clear()
        IS_RUNNING = False
        SIMULATION_TASK = None
        return {"status": "success", "message": "Semua simulasi mesin dihentikan."}
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