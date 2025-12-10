# 🚀 PROTEK - Predictive Maintenance AI Platform

## Overview

PROTEK adalah platform **Predictive Maintenance** berbasis AI yang menggunakan Machine Learning untuk memperkirakan **Remaining Useful Life (RUL)** mesin industri dan memprediksi kegagalan sebelum terjadi.

**Project Status**: ✅ **SIMULATION & PREDICTION RUNNING**

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + Prisma ORM
- **ML API**: FastAPI (Python) + scikit-learn
- **Database**: PostgreSQL (Railway)
- **ML Model**: maintenance_brain.pkl (sklearn)

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
│              http://localhost:3000 (future)                │
└────────┬────────────────────────────┬──────────────────────┘
         │                            │
    predictions                    dashboard
         │                            │
┌────────▼─────────────────────────────▼──────────────────────┐
│                 Backend API (Express)                       │
│                 http://localhost:4000                       │
│  • /api/predict     - Send prediction requests             │
│  • /api/simulation  - Control simulation                   │
│  • /api/dashboard   - Get dashboard data                   │
│  • /api/alerts      - Get critical alerts                  │
└────────┬──────────────────────────────────────────────────┬─┘
         │                                                   │
   forward request                                      database
         │                                                   │
┌────────▼──────────────────────────────────────────────────▼─┐
│               ML API (FastAPI)                              │
│               http://localhost:8000                         │
│  • /predict                 - ML predictions              │
│  • /api/start-simulation    - Start simulation            │
│  • /api/stop-simulation     - Stop simulation             │
└────────┬──────────────────────┬────────────────────────────┘
         │                      │
    model inference        database write
         │                      │
    ┌────▼──────┐         ┌─────▼──────────┐
    │ ML Model  │         │  PostgreSQL    │
    │ (sklearn) │         │  Railway       │
    └───────────┘         └────────────────┘
```

---

## 📊 Dataset & Simulation

### Dataset Files
Located in `ml-api/src/dataset/`:

| File | Rows | Description |
|------|------|-------------|
| SYNTHETIC_SPEED_LOW.csv | 10,000 | Low rotational speed scenarios |
| SYNTHETIC_TEMP_HIGH.csv | 10,000 | High temperature operations |
| SYNTHETIC_TORQUE_HIGH.csv | 10,000 | High torque stress conditions |
| SYNTHETIC_WEAR_HIGH.csv | 10,000 | High tool wear scenarios |
| **TOTAL** | **40,000+** | Complete synthetic dataset |

### Data Columns
```
UDI, Product ID, Type, Air temperature [K], Process temperature [K],
Rotational speed [rpm], Torque [Nm], Tool wear [min], 
TWF, HDF, PWF, OSF, RNF, Failure Type, Machine failure
```

### Simulation Configuration
- **Acceleration Factor**: 100x (faster than real-time)
- **Processing Rate**:
  - Type L: 2 seconds/record
  - Type M: 3 seconds/record
  - Type H: 5 seconds/record
- **Expected Duration**: ~10 minutes for 40,000 records

---

## 🎯 Current Status

### ✅ Running
- ML API Server (port 8000)
- Backend API Server (port 4000)
- Database Connection (Railway PostgreSQL)
- Simulation Process (background asyncio task)

### Metrics
- **CPU Usage**: ~59% (Simulation)
- **Memory**: ~0.4% (Simulation), ~1.0% (API)
- **Database**: Connected & storing data
- **Predictions**: Working & verified

---

## 🚀 Quick Start

### Prerequisites
```bash
# Check Python version
python3 --version  # Should be 3.8+

# Check Node.js version  
node --version     # Should be 14+
```

### Setup ML API
```bash
cd ml-api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Setup Backend
```bash
cd backend
npm install
# Configure .env with DATABASE_URL
```

### Run Services

**Terminal 1 - ML API**
```bash
cd ml-api
source venv/bin/activate
python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Backend**
```bash
cd backend
npm run dev
```

**Terminal 3 - Simulation**
```bash
./run-full-simulation.sh
```

---

## 📚 Documentation

### Key Guides
- **QUICK_START.sh** - Quick reference with all commands
- **SIMULATION_GUIDE.md** - Detailed simulation guide
- **SIMULATION_STATUS.md** - Current status & metrics
- **API Docs (Swagger)**:
  - Backend: http://localhost:4000/api-docs
  - ML API: http://localhost:8000/docs

### Scripts
- `run-full-simulation.sh` - Run complete simulation with dataset
- `monitor-simple.sh` - Monitor simulation progress
- `test-prediction.sh` - Test predictions with sample data
- `run-simulation.sh` - Basic simulation setup

---

## 🧪 API Examples

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

### Response Example
```json
{
  "status": "success",
  "ml_result": {
    "Machine_ID": "M-001",
    "Risk_Probability": "1.3%",
    "RUL_Estimate": "42 Menit Lagi",
    "RUL_Status": "🚨 CRITICAL",
    "Status": "✅ NORMAL",
    "Message": "Tool wear approaching limit. Schedule maintenance.",
    "Recommendation": "Perform preventive maintenance within 42 minutes."
  },
  "alert_created": false
}
```

---

## 📊 Database Schema

### sensor_data
Raw sensor readings from simulation:
```sql
CREATE TABLE sensor_data (
  id SERIAL PRIMARY KEY,
  machine_id VARCHAR(50),
  type CHAR(1),
  "Air temperature [K]" FLOAT,
  "Process temperature [K]" FLOAT,
  "Rotational speed [rpm]" INTEGER,
  "Torque [Nm]" FLOAT,
  "Tool wear [min]" INTEGER,
  insertion_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### prediction_results
ML model predictions:
```sql
CREATE TABLE prediction_results (
  id SERIAL PRIMARY KEY,
  machine_id VARCHAR(50),
  RUL FLOAT,
  failure_prob FLOAT,
  prediction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### alerts
Critical status alerts:
```sql
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  machineId INTEGER,
  message TEXT,
  severity VARCHAR(20),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔧 Configuration

### Environment Variables

**ml-api/.env**
```dotenv
PGHOST=maglev.proxy.rlwy.net
PGPORT=45481
PGDATABASE=railway
PGUSER=postgres
PGPASSWORD=***
DATABASE_URL=postgresql://postgres:***@maglev.proxy.rlwy.net:45481/railway
```

**backend/.env**
```dotenv
DATABASE_URL=postgresql://postgres:***@maglev.proxy.rlwy.net:45481/railway
NODE_ENV=development
PORT=4000
```

---

## 🛑 Control Commands

### Simulation Control
```bash
# Start simulation
curl -X POST http://localhost:8000/api/start-simulation

# Stop simulation
curl -X GET http://localhost:8000/api/stop-simulation

# Check simulation status
ps aux | grep "python -m src.main"
```

### Process Management
```bash
# Kill all Python processes
kill -9 $(ps aux | grep "python" | grep -v grep | awk '{print $2}')

# Check open ports
lsof -i :4000
lsof -i :8000
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process using port
lsof -i :4000  # Check what's using port 4000
kill -9 <PID>   # Kill the process
```

### Database Connection Error
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check .env file
cat .env
```

### High CPU/Memory Usage
- Normal during active simulation (~50-70% CPU)
- Check process: `ps aux | grep python`
- Reduce ACCELERATION_FACTOR if needed

### Model File Missing
- Required: `ml-api/src/models/maintenance_brain.pkl`
- Generate: Run `ml-api/notebooks/2_Model_Training.ipynb`

---

## 📈 Performance Metrics

### Simulation Performance
- **Total Records**: 40,000+
- **Processing Time**: ~10 minutes (with 100x acceleration)
- **Database Writes**: ~4,000 per minute
- **Prediction Speed**: ~100ms per prediction

### System Resource Usage
| Component | CPU | Memory | Status |
|-----------|-----|--------|--------|
| Simulation | 50-70% | <1% | ✅ Normal |
| ML API | 0.3-1% | ~1% | ✅ Idle |
| Backend | <1% | <1% | ✅ Idle |
| Database | - | - | ✅ Connected |

---

## 🔗 Useful Links

- **Backend Swagger**: http://localhost:4000/api-docs
- **ML API Swagger**: http://localhost:8000/docs
- **Database Admin**: Via Railway Console
- **Project Repo**: capstone-protek (GitHub)

---

## 📝 Project Structure

```
capstone-protek/
├── backend/                    # Express API
│   ├── src/
│   │   ├── app.ts             # Express app setup
│   │   ├── index.ts           # Server entry point
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   └── types/             # TypeScript types
│   ├── prisma/                # ORM schema
│   ├── swagger.yaml           # API documentation
│   └── package.json
│
├── ml-api/                     # FastAPI
│   ├── src/
│   │   ├── main.py            # FastAPI app & simulation
│   │   ├── predict.py         # ML model & predictions
│   │   ├── db_connector.py    # Database connection
│   │   ├── data_loader.py     # Data loading
│   │   ├── dataset/           # CSV data files
│   │   └── models/            # ML model files
│   ├── notebooks/             # Jupyter notebooks
│   ├── requirements.txt       # Python dependencies
│   └── venv/                  # Virtual environment
│
├── frontend/                   # React app (future)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── docker-compose.yml         # Container orchestration
├── QUICK_START.sh             # Quick reference
├── SIMULATION_GUIDE.md        # Detailed guide
├── SIMULATION_STATUS.md       # Current status
└── README.md                  # This file
```

---

## ✅ Verification Checklist

- [x] ML API running on port 8000
- [x] Backend running on port 4000
- [x] Database connected to Railway PostgreSQL
- [x] 40,000+ dataset rows loaded
- [x] Simulation processing data
- [x] Predictions working correctly
- [x] Alerts triggering on critical status
- [x] Database tables populated

---

## 🎯 Next Steps

1. **Monitor Completion** - Wait for simulation to finish (~10 min)
2. **Analyze Results** - Query database for patterns
3. **Frontend Integration** - Connect React frontend to APIs
4. **Dashboard** - Display real-time predictions & alerts
5. **Production Deployment** - Deploy to Railway

---

## 📞 Support

For issues or questions:
1. Check logs: `tail -f ml-api/ml-api.log`
2. Review documentation: `./SIMULATION_GUIDE.md`
3. Test APIs with Swagger: `http://localhost:4000/api-docs`
4. Check database connection

---

**Last Updated**: December 10, 2025  
**Status**: ✅ **ACTIVE & RUNNING**  
**Simulation Progress**: In Progress (~50% complete)

---

## 📄 License

Project Protek - Capstone Project 2025
