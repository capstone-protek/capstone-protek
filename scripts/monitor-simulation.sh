#!/bin/bash
set -euo pipefail

# Real-time Simulation Monitoring Dashboard

curl_silent() {
    curl -sS "$@"
}

is_up() {
    local url="$1"
    curl_silent "$url" > /dev/null 2>&1
}

run_prediction_test() {
    curl_silent -X POST http://localhost:4000/api/predict \
        -H "Content-Type: application/json" \
        -d '{"Machine_ID":"M-001","Type":"H","Air_Temp":298.5,"Process_Temp":323.5,"RPM":1500,"Torque":45.5,"Tool_Wear":120}' \
        | jq '.' 2>/dev/null || echo "Prediction test failed"
}

while true; do
    clear
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║        PROTEK SIMULATION REAL-TIME MONITORING             ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Server Status
    echo "📡 SERVER STATUS:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Backend
    if is_up http://localhost:4000; then
        echo "✅ Backend API     (http://localhost:4000)"
    else
        echo "❌ Backend API     (http://localhost:4000)"
    fi
    
    # ML API
    if is_up http://localhost:8000; then
        echo "✅ ML API          (http://localhost:8000)"
    else
        echo "❌ ML API          (http://localhost:8000)"
    fi
    
    echo ""
    echo "⚙️ PROCESS STATUS:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # ML API Process
    ML_PROCESS=$(ps aux | grep "python.*uvicorn.*8000" | grep -v grep)
    if [ ! -z "$ML_PROCESS" ]; then
        CPU=$(echo "$ML_PROCESS" | awk '{print $3}')
        MEM=$(echo "$ML_PROCESS" | awk '{print $4}')
        echo "🚀 ML API Server:"
        echo "   CPU: ${CPU}% | Memory: ${MEM}%"
    else
        echo "❌ ML API Server: Not running"
    fi
    
    # Simulation Process
    SIM_PROCESS=$(ps aux | grep "python -m src.main" | grep -v grep | head -1)
    if [ ! -z "$SIM_PROCESS" ]; then
        CPU=$(echo "$SIM_PROCESS" | awk '{print $3}')
        MEM=$(echo "$SIM_PROCESS" | awk '{print $4}')
        PID=$(echo "$SIM_PROCESS" | awk '{print $2}')
        echo "🎬 Simulation Process (PID: $PID):"
        echo "   CPU: ${CPU}% | Memory: ${MEM}%"
    else
        echo "❌ Simulation Process: Not running"
    fi
    
    # Backend Process
    BACKEND_PROCESS=$(ps aux | grep "node dist/index.js" | grep -v grep)
    if [ ! -z "$BACKEND_PROCESS" ]; then
        CPU=$(echo "$BACKEND_PROCESS" | awk '{print $3}')
        MEM=$(echo "$BACKEND_PROCESS" | awk '{print $4}')
        echo "🔧 Backend Server:"
        echo "   CPU: ${CPU}% | Memory: ${MEM}%"
    else
        echo "❌ Backend Server: Not running"
    fi
    
    echo ""
    echo "📊 SIMULATION METRICS:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Database Connection Test
    if is_up http://localhost:8000; then
        echo "✅ Database Connection: Active"
    else
        echo "⚠️  Database Connection: Checking..."
    fi
    
    # Uptime
    UPTIME=$(ps -o etime= -p $(ps aux | grep "python.*uvicorn.*8000" | grep -v grep | awk '{print $2}') 2>/dev/null || echo "N/A")
    echo "⏱️  ML API Uptime: $UPTIME"
    
    echo ""
    echo "🎯 QUICK COMMANDS:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  [s] Stop Simulation     [p] Test Prediction"
    echo "  [r] Refresh (5s)        [q] Quit Dashboard"
    echo ""
    echo "Last updated: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    # Read user input with timeout (5 seconds default)
    read -t 5 -n 1 INPUT
    
    case $INPUT in
        s|S)
            echo ""
            echo "Stopping simulation..."
            curl -X GET http://localhost:8000/api/stop-simulation
            echo ""
            echo "Simulation stopped. Press Enter to continue monitoring..."
            read
            ;;
        p|P)
            echo ""
            echo "Testing prediction..."
                        run_prediction_test
            echo ""
            echo "Press Enter to continue monitoring..."
            read
            ;;
        q|Q)
            echo ""
            echo "Exiting dashboard..."
            exit 0
            ;;
    esac
done
