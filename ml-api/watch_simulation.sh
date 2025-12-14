#!/bin/bash

# Script untuk monitor simulasi real-time

echo "=== 🚀 Starting ML API & Simulation Monitor ==="
echo ""

# Start ML API
cd /home/dekhsa/Desktop/Project-Protek/capstone-protek/ml-api
export PYTHONPATH=/home/dekhsa/Desktop/Project-Protek/capstone-protek/ml-api

echo "Starting ML API server..."
/home/dekhsa/Desktop/Project-Protek/capstone-protek/ml-api/.venv/bin/uvicorn src.main:app --host 0.0.0.0 --port 8000 &
API_PID=$!

echo "Waiting for server startup..."
sleep 6

echo ""
echo "=== Starting Simulation ==="
curl -X POST http://localhost:8000/api/simulation/start
echo ""
echo ""

echo "=== 📊 Live Simulation Output (Loop setiap 10 detik) ==="
echo "Press Ctrl+C to stop"
echo ""

# Monitor loop
while true; do
    clear
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║          🔧 PROTEK SIMULATION MONITOR (Snake_case)              ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Get latest sensor data count
    echo "📈 Latest Sensor Data (M-14850):"
    curl -s http://localhost:4000/api/machines/M-14850/history | \
        python3 -c "import sys, json; data=json.load(sys.stdin); print(f'   Total rows: {len(data)}'); \
        [print(f'   [{i+1}] Time: {d[\"timestamp\"][:19]}, Temp: {d[\"air_temperature_k\"]:.1f}K, RPM: {d[\"rotational_speed_rpm\"]}, Torque: {d[\"torque_nm\"]:.1f}Nm') for i,d in enumerate(data[-3:])]" 2>/dev/null || echo "   Waiting for data..."
    
    echo ""
    echo "📊 Prediction Results (Latest 3):"
    # This would need backend endpoint for prediction_results
    echo "   (Check database directly for predictions)"
    
    echo ""
    echo "⏰ $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    echo "Next update in 10 seconds... (Ctrl+C to stop)"
    
    sleep 10
done

# Cleanup on exit
trap "kill $API_PID 2>/dev/null; exit" INT TERM
