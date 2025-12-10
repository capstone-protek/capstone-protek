# PROTEK Simulation & Prediction Guide

## 📊 Dataset Overview

Simulasi menggunakan 4 dataset sintetis dengan total **40,000+ sensor data points**:

### Dataset Files
```
ml-api/src/dataset/
├── SYNTHETIC_SPEED_LOW.csv      (10,000 rows) - Rotational speed rendah
├── SYNTHETIC_TEMP_HIGH.csv      (10,000 rows) - Temperatur tinggi  
├── SYNTHETIC_TORQUE_HIGH.csv    (10,000 rows) - Torque tinggi
└── SYNTHETIC_WEAR_HIGH.csv      (10,000 rows) - Tool wear tinggi
```

### Data Structure
Setiap file CSV memiliki kolom:
- `UDI` - Unique Device Identifier
- `Product ID` - ID Produk
- `Type` - Tipe operasi (L/M/H)
- `Air temperature [K]` - Suhu udara
- `Process temperature [K]` - Suhu proses
- `Rotational speed [rpm]` - Kecepatan rotasi
- `Torque [Nm]` - Torque
- `Tool wear [min]` - Keausan tool
- `Failure Type` - Jenis kegagalan (jika ada)
- `Machine failure` - Flag kegagalan

---

## 🚀 Cara Menjalankan Simulasi

### 1. Pastikan Semua Server Running

**Terminal 1 - ML API (Port 8000)**
```bash
cd ml-api
source venv/bin/activate
python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Backend (Port 4000)**
```bash
cd backend
npm run dev
```

### 2. Jalankan Simulasi Lengkap

```bash
# Di root directory
./run-full-simulation.sh
```

Script ini akan:
- ✅ Mengecek kedua server running
- 🎬 Memulai simulasi dengan 40,000+ data points
- 📈 Memonitor progress CPU dan memory
- 🧪 Test predictions dengan sample data
- 📊 Display metrics dan hasil

### 3. Monitor Simulasi (Optional)

Buka terminal baru:
```bash
./monitor-simple.sh
```

---

## 🔄 Alur Data Simulasi

```
Dataset (40,000 rows)
    ↓
ML API (/api/start-simulation)
    ↓
Load & Combine Data (data_loader.py)
    ↓
Simulasi Loop (asyncio background task)
    ├─ Inject raw data → PostgreSQL (sensor_data table)
    ├─ Feature Engineering (rolling avg, etc)
    ├─ Prediksi dengan ML Model
    └─ Simpan hasil → prediction_results table
    ↓
Backend (/api/predict endpoint)
    ├─ Terima data dari Frontend/API
    ├─ Forward ke ML API
    ├─ Save sensor history ke DB
    └─ Create alert jika CRITICAL
    ↓
Frontend/Client
    └─ Tampilkan hasil prediksi & alerts
```

---

## 📊 Prediction Payload Format

### Request
```json
{
  "Machine_ID": "M-001",
  "Type": "H",
  "Air_Temp": 298.5,
  "Process_Temp": 323.5,
  "RPM": 1500,
  "Torque": 45.5,
  "Tool_Wear": 120
}
```

### Response
```json
{
  "status": "success",
  "input_saved": false,
  "ml_result": {
    "Machine_ID": "M-001",
    "Risk_Probability": "1.3%",
    "RUL_Estimate": "42 Menit Lagi",
    "RUL_Status": "🚨 CRITICAL",
    "RUL_Minutes": "42",
    "Status": "✅ NORMAL",
    "Message": "Mesin beroperasi normal...",
    "Recommendation": "⚠️ Tool wear approaching limit..."
  },
  "alert_created": false
}
```

---

## 🧪 Test Cases

### Low Operation (Type: L)
```bash
curl -X POST http://localhost:4000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "Machine_ID": "M-001",
    "Type": "L",
    "Air_Temp": 298.1,
    "Process_Temp": 308.6,
    "RPM": 1351,
    "Torque": 42.8,
    "Tool_Wear": 0
  }'
```

### High Operation (Type: H)
```bash
curl -X POST http://localhost:4000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "Machine_ID": "M-002",
    "Type": "H",
    "Air_Temp": 305.0,
    "Process_Temp": 325.0,
    "RPM": 1600,
    "Torque": 50.0,
    "Tool_Wear": 150
  }'
```

### Medium Operation (Type: M)
```bash
curl -X POST http://localhost:4000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "Machine_ID": "M-003",
    "Type": "M",
    "Air_Temp": 300.0,
    "Process_Temp": 315.0,
    "RPM": 1400,
    "Torque": 45.0,
    "Tool_Wear": 75
  }'
```

---

## 📈 Expected Simulation Times

| Dataset Size | Expected Time | CPU Usage | Memory |
|---|---|---|---|
| 10,000 rows | ~2.5 minutes | 40-60% | <1% |
| 40,000 rows | ~10 minutes | 50-70% | <1% |
| 100,000 rows | ~25 minutes | 60-80% | ~2% |

---

## 🛑 Stop Simulation

```bash
curl -X GET http://localhost:8000/api/stop-simulation
```

Atau kill process:
```bash
kill -9 $(ps aux | grep "python -m src.main" | grep -v grep | awk '{print $2}')
```

---

## 📚 API Documentation

- **Backend Swagger**: http://localhost:4000/api-docs
- **ML API Swagger**: http://localhost:8000/docs

---

## 🔧 Troubleshooting

### Port sudah terpakai
```bash
# Cek proses yang menggunakan port
lsof -i :4000
lsof -i :8000

# Kill process jika perlu
kill -9 <PID>
```

### Database connection error
- Pastikan `.env` benar di backend dan ml-api
- Cek: `DATABASE_URL = postgresql://postgres:password@maglev.proxy.rlwy.net:45481/railway`
- Test koneksi: `psql $DATABASE_URL -c "SELECT 1"`

### Model tidak ditemukan
- File `src/models/maintenance_brain.pkl` harus ada
- Jika tidak ada, jalankan training notebook: `ml-api/notebooks/2_Model_Training.ipynb`

---

## 📝 Log Files

```bash
# ML API logs
tail -f ml-api/ml-api.log

# Backend logs  
tail -f backend/backend.log

# Check last 50 lines
tail -50 ml-api/ml-api.log
```

---

## ✅ Verification Checklist

- [ ] Backend running pada port 4000
- [ ] ML API running pada port 8000
- [ ] Database CONNECTION OK
- [ ] Dataset files exist di ml-api/src/dataset/
- [ ] Model file exists di ml-api/src/models/
- [ ] Simulasi berjalan (CPU usage >40%)
- [ ] Predictions working (status: success)

---

**Last Updated**: December 10, 2025
