#!/bin/bash

# Simple Simulation Monitor
echo "╔════════════════════════════════════════════════╗"
echo "║  PROTEK SIMULATION MONITOR                    ║"
echo "║  (Press Ctrl+C to stop monitoring)            ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

COUNTER=0
while true; do
    COUNTER=$((COUNTER + 1))
    
    # Get simulation process info
    SIM_PROC=$(ps aux | grep "python -m src.main" | grep -v grep | head -1)
    
    if [ -z "$SIM_PROC" ]; then
        echo "[$(date '+%H:%M:%S')] ❌ Simulation stopped or completed"
        break
    fi
    
    CPU=$(echo "$SIM_PROC" | awk '{print $3}')
    MEM=$(echo "$SIM_PROC" | awk '{print $4}')
    PID=$(echo "$SIM_PROC" | awk '{print $2}')
    
    # Get uvicorn process info
    UV_PROC=$(ps aux | grep "python.*uvicorn.*8000" | grep -v grep)
    UV_CPU=$(echo "$UV_PROC" | awk '{print $3}')
    UV_MEM=$(echo "$UV_PROC" | awk '{print $4}')
    
    # Show status
    TIMESTAMP=$(date '+%H:%M:%S')
    echo -ne "\r[$TIMESTAMP] Sim CPU: ${CPU}% MEM: ${MEM}% | API CPU: ${UV_CPU}% MEM: ${UV_MEM}%       "
    
    sleep 3
done

echo ""
