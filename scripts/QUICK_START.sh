#!/bin/bash

# PROTEK Quick Reference - Simulation & Prediction

cat << 'EOF'

╔═══════════════════════════════════════════════════════════════════════════╗
║                   PROTEK SIMULATION & PREDICTION QUICK START             ║
╚═══════════════════════════════════════════════════════════════════════════╝

📊 DATASET STATS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Location: ml-api/src/dataset/
  Files:    4 CSV files (SYNTHETIC_*.csv)
  Total:    40,000+ sensor data points
  Size:     ~2.4 MB

🚀 QUICK START
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: Start ML API (Terminal 1)
  $ cd ml-api
  $ source venv/bin/activate
  $ python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload

STEP 2: Start Backend (Terminal 2)
  $ cd backend
  $ npm run dev

STEP 3: Run Full Simulation (Terminal 3)
  $ ./run-full-simulation.sh

📡 SERVER ENDPOINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Backend:
  API Docs:        http://localhost:4000/api-docs
  Predict:         POST http://localhost:4000/api/predict
  Simulation:      POST http://localhost:4000/api/simulation/start
                   GET  http://localhost:4000/api/simulation/status

ML API:
  API Docs:        http://localhost:8000/docs
  Prediction:      POST http://localhost:8000/predict
  Start Sim:       POST http://localhost:8000/api/start-simulation
  Stop Sim:        GET  http://localhost:8000/api/stop-simulation

🧪 TEST PREDICTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

🛑 STOP SIMULATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  curl -X GET http://localhost:8000/api/stop-simulation

📊 MONITORING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  # Simple monitoring
  $ ./monitor-simple.sh

  # Process status
  $ ps aux | grep "python -m src.main"

  # Full logs
  $ tail -f ml-api/ml-api.log

🗄️  DATABASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Host:     maglev.proxy.rlwy.net:45481
  Database: railway
  Tables:
    • sensor_data          (raw sensor data from simulation)
    • prediction_results   (ML prediction outputs)
    • alerts              (critical status alerts)
    • machines            (machine metadata)
    • sensor_history      (sensor data history per machine)

🎯 SIMULATION FLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Load CSV datasets (40,000 rows)
           ↓
  2. Start background simulation task
           ↓
  3. For each row:
     • Insert raw data → PostgreSQL
     • Feature Engineering
     • Predict RUL & Risk
     • Save results → PostgreSQL
           ↓
  4. Simulation Complete (total ~10 minutes for full dataset)

⚙️  ENVIRONMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ML API:
    ACCELERATION_FACTOR = 100 (faster than real-time)
    TIME_MAPPING = {'H': 5s, 'M': 3s, 'L': 2s}

  Database:
    DATABASE_URL = postgresql://...@maglev.proxy.rlwy.net:45481/railway

✅ CHECKLIST BEFORE RUNNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ☐ Python 3.8+ installed
  ☐ Node.js 14+ installed
  ☐ Python venv activated (ml-api)
  ☐ npm dependencies installed (backend)
  ☐ .env files configured (both backend & ml-api)
  ☐ Database connection working
  ☐ Model file exists: ml-api/src/models/maintenance_brain.pkl
  ☐ Dataset files exist: ml-api/src/dataset/*.csv

📚 DOCUMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Full Guide: ./SIMULATION_GUIDE.md
  API Spec:   Backend swagger.yaml
  Code:       See backend/src/controllers/ & ml-api/src/

╚═══════════════════════════════════════════════════════════════════════════╝

EOF

echo ""
echo "Run ./run-full-simulation.sh to start the complete simulation!"
echo ""
