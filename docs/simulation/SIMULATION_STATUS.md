# PROTEK Simulation - Status Report

**Generated**: December 10, 2025  
**Status**: ✅ RUNNING

## 🎯 Current Simulation Status

### Active Processes
- **Simulation Worker**: 2 processes running
  - CPU Usage: ~59%
  - Memory: ~0.4%
  - PIDs: 372039, 372271

- **ML API Server**: 1 process running
  - CPU Usage: ~0.3%
  - Memory: ~1.0%
  - Port: 8000

- **Backend Server**: Running on port 4000

### Dataset Progress
- **Total Rows**: 40,000+
- **Dataset Files**: 4 CSV files
  - SYNTHETIC_SPEED_LOW.csv (10,000 rows)
  - SYNTHETIC_TEMP_HIGH.csv (10,000 rows)
  - SYNTHETIC_TORQUE_HIGH.csv (10,000 rows)
  - SYNTHETIC_WEAR_HIGH.csv (10,000 rows)

---

## 📊 Simulation Metrics

### Processing Configuration
- **Acceleration Factor**: 100x (faster than real-time)
- **Type Mapping**:
  - Type L: 2 seconds per record
  - Type M: 3 seconds per record
  - Type H: 5 seconds per record

### Estimated Completion Time
- Total records: 40,000
- Average processing time: ~10 minutes
- Current elapsed: ~15 minutes (ongoing background tasks)

### Database Connection
- **Host**: maglev.proxy.rlwy.net:45481
- **Database**: railway
- **Status**: ✅ Connected

---

## 📈 Data Flow Architecture

```
┌─────────────────────────────────┐
│  Dataset Loading (40K rows)     │
│  - Load & Combine CSV files     │
│  - Parse into memory            │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Feature Engineering            │
│  - Calculate rolling averages   │
│  - Compute power metrics        │
│  - Temperature differentials    │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  ML Prediction                  │
│  - RUL Estimation               │
│  - Risk Probability             │
│  - Failure Type Classification  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Database Storage               │
│  - sensor_data table            │
│  - prediction_results table     │
│  - alerts table (if critical)   │
└─────────────────────────────────┘
```

---

## 🧪 Prediction Results Sample

### Test Case 1: High Operation (Type H)
```json
{
  "status": "success",
  "ml_result": {
    "Machine_ID": "M-001",
    "Risk_Probability": "1.3%",
    "RUL_Estimate": "42 Menit Lagi",
    "RUL_Status": "🚨 CRITICAL",
    "RUL_Minutes": "42",
    "Status": "✅ NORMAL",
    "Message": "Mesin beroperasi normal. Estimasi sisa umur: 42 Menit Lagi",
    "Recommendation": "⚠️ Tool wear approaching limit. Schedule maintenance dalam 42 Menit Lagi."
  }
}
```

---

## 🔗 Available Endpoints

### Backend API (Port 4000)
- **Swagger UI**: http://localhost:4000/api-docs
- **Predict Endpoint**: `POST /api/predict`
- **Simulation**: 
  - `POST /api/simulation/start`
  - `GET /api/simulation/stop`
  - `GET /api/simulation/status`

### ML API (Port 8000)
- **Swagger UI**: http://localhost:8000/docs
- **Predict Endpoint**: `POST /predict`
- **Simulation**:
  - `POST /api/start-simulation`
  - `GET /api/stop-simulation`

---

## 📊 Database Tables

### sensor_data
Stores raw sensor data from simulation:
- `id`: Auto-increment ID
- `machine_id`: Machine identifier
- `type`: Operation type (L/M/H)
- `air_temperature`: Air temperature [K]
- `process_temperature`: Process temperature [K]
- `rotational_speed`: RPM
- `torque`: Torque [Nm]
- `tool_wear`: Tool wear [min]
- `insertion_time`: Timestamp

### prediction_results
Stores ML predictions:
- `id`: Auto-increment ID
- `machine_id`: Machine identifier
- `rul`: Remaining Useful Life (minutes)
- `failure_prob`: Failure probability
- `prediction_time`: Prediction timestamp

### alerts
Stores critical status alerts:
- `id`: Auto-increment ID
- `machineId`: Machine ID
- `message`: Alert message
- `severity`: Alert severity level
- `timestamp`: Alert timestamp

---

## 🛑 Control Commands

### Stop Simulation
```bash
curl -X GET http://localhost:8000/api/stop-simulation
```

### Test Prediction
```bash
curl -X POST http://localhost:4000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "Machine_ID": "M-001",
    "Type": "H",
    "Air_Temp": 298.5,
    "Process_Temp": 323.5,
    "RPM": 1500,
    "Torque": 45.5,
    "Tool_Wear": 120
  }'
```

### Monitor Process
```bash
ps aux | grep -E "python -m src.main|uvicorn"
```

---

## ✅ Verification Checklist

- [x] ML API Server running (port 8000)
- [x] Backend Server running (port 4000)
- [x] Database connection active
- [x] Dataset files loaded (40,000+ rows)
- [x] Simulation task running
- [x] Predictions working
- [x] Database tables populated

---

## 📝 Next Steps

1. **Monitor Completion**: Wait for simulation to complete (~10 minutes)
2. **Analyze Results**: Query database for prediction trends
3. **Test Frontend**: Connect frontend to backend API
4. **View Swagger Docs**: Explore API documentation
5. **Create Alerts**: Monitor for critical RUL predictions

---

## 🔧 Troubleshooting

### High CPU Usage (>80%)
- Normal during active simulation
- Expected with 40,000+ data points
- Reduce ACCELERATION_FACTOR if needed

### Memory Issues
- ML-API memory: ~0.4% (normal)
- Backend memory: <1% (normal)
- Database memory: ~1% (normal)

### Database Connection Errors
- Check `.env` DATABASE_URL
- Verify internet connection to Railway
- Test: `psql $DATABASE_URL -c "SELECT 1"`

---

**Last Updated**: December 10, 2025, 12:50 UTC
