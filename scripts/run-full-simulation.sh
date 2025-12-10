#!/bin/bash
set -euo pipefail

# PROTEK Simulation with Real Dataset

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

curl_silent() {
    curl -sS "$@"
}

require_service() {
    local url="$1"; shift
    local name="$1"; shift
    if curl_silent "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ${name} (${url})${NC}"
        return 0
    fi
    echo -e "${RED}❌ ${name} (${url})${NC}"
    exit 1
}

print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  PROTEK SIMULATION WITH DATASET                           ║${NC}"
    echo -e "${BLUE}║  Processing: 40,000+ Sensor Data Points                   ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

stop_running_simulation_if_any() {
    local running
    running=$(ps aux | grep "python -m src.main" | grep -v grep | wc -l)
    if [ "$running" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Simulation already running (${running} processes)${NC}"
        echo "Stopping previous simulation..."
        curl_silent -X GET http://localhost:8000/api/stop-simulation > /dev/null || true
        sleep 2
    fi
}

start_simulation() {
    echo "Starting new simulation..."
    local resp
    resp=$(curl_silent -X POST http://localhost:8000/api/start-simulation \
        -H "Content-Type: application/json")
    if echo "$resp" | grep -q "success"; then
        echo -e "${GREEN}✅ Simulation Started Successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to start simulation${NC}"
        echo "Response: $resp"
        exit 1
    fi
}

monitor_simulation() {
    local iteration=0
    while true; do
        iteration=$((iteration + 1))
        local sim_proc
        sim_proc=$(ps aux | grep "python -m src.main" | grep -v grep | head -1)
        if [ -z "$sim_proc" ]; then
                echo -e "${YELLOW}⏹️  Simulation Completed or Stopped${NC}"
                break
        fi

        local cpu mem pid progress_bar=""
        cpu=$(echo "$sim_proc" | awk '{print $3}')
        mem=$(echo "$sim_proc" | awk '{print $4}')
        pid=$(echo "$sim_proc" | awk '{print $2}')

        for ((i=0; i<10; i++)); do
            if [ $i -lt $((iteration % 10)) ]; then progress_bar+="█"; else progress_bar+="░"; fi
        done

        printf "\r[%s] Iteration %d | CPU: %s%% | Memory: %s%% | PID: %s" "$progress_bar" "$iteration" "$cpu" "$mem" "$pid"
        sleep 10
    done
    echo ""
}

run_post_tests() {
    echo -e "${YELLOW}🧪 TESTING PREDICTIONS WITH PROCESSED DATA${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    local tests=(
        '{"Machine_ID":"M-001","Type":"L","Air_Temp":298.1,"Process_Temp":308.6,"RPM":1351,"Torque":42.8,"Tool_Wear":0}'
        '{"Machine_ID":"M-002","Type":"H","Air_Temp":305.0,"Process_Temp":325.0,"RPM":1600,"Torque":50.0,"Tool_Wear":150}'
        '{"Machine_ID":"M-003","Type":"M","Air_Temp":300.0,"Process_Temp":315.0,"RPM":1400,"Torque":45.0,"Tool_Wear":75}'
    )

    for i in "${!tests[@]}"; do
        local test_num=$((i + 1))
        echo "Test $test_num:"
        local response
        response=$(curl_silent -X POST http://localhost:4000/api/predict \
            -H "Content-Type: application/json" \
            -d "${tests[$i]}")

        if echo "$response" | grep -q '"status":"success"'; then
                local rul_status risk rul
                rul_status=$(echo "$response" | grep -o '"RUL_Status":"[^"]*"' | cut -d'"' -f4)
                risk=$(echo "$response" | grep -o '"Risk_Probability":"[^"]*"' | cut -d'"' -f4)
                rul=$(echo "$response" | grep -o '"RUL_Estimate":"[^"]*"' | cut -d'"' -f4)

                echo -e "  ${GREEN}✅ Success${NC}"
                echo "  RUL Status: $rul_status"
                echo "  Risk Probability: $risk"
                echo "  RUL Estimate: $rul"
        else
                echo -e "  ${RED}❌ Failed${NC}"
                echo "  Response: $response"
        fi

        echo ""
        sleep 1
    done
}

print_footer() {
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ SIMULATION & PREDICTION TEST COMPLETE${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}📚 Available Endpoints:${NC}"
    echo "  Backend Swagger:  http://localhost:4000/api-docs"
    echo "  ML API Swagger:   http://localhost:8000/docs"
    echo ""
    echo -e "${BLUE}🛑 To stop simulation:${NC}"
    echo "  curl -X GET http://localhost:8000/api/stop-simulation"
    echo ""
}

print_header

# Dataset Info
echo -e "${YELLOW}📊 DATASET INFORMATION${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Location: ml-api/src/dataset/"
echo ""
echo "  1. SYNTHETIC_SPEED_LOW.csv      (10,000 rows)"
echo "  2. SYNTHETIC_TEMP_HIGH.csv      (10,000 rows)"
echo "  3. SYNTHETIC_TORQUE_HIGH.csv    (10,000 rows)"
echo "  4. SYNTHETIC_WEAR_HIGH.csv      (10,000 rows)"
echo ""
echo "Total Records: 40,000+"
echo "Columns: UDI, Product_ID, Type, Air_Temp, Process_Temp, RPM, Torque, Tool_Wear, Failure_Type, etc."
echo ""

# Check servers
echo -e "${YELLOW}✅ CHECKING SERVERS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
require_service "http://localhost:4000" "Backend API"
require_service "http://localhost:8000" "ML API"

echo ""
echo -e "${YELLOW}🎬 STARTING SIMULATION${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

stop_running_simulation_if_any
start_simulation

echo ""
echo -e "${YELLOW}📈 MONITORING SIMULATION${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "The simulation is now processing 40,000+ sensor data points..."
echo "This will take approximately 5-10 minutes depending on:"
echo "  • Database performance"
echo "  • Model prediction speed"
echo "  • System resources"
echo ""
echo -e "${BLUE}Real-time monitoring will start below...${NC}"
echo ""

# Wait a bit for simulation to start then monitor
sleep 3
monitor_simulation

echo ""
echo -e "${YELLOW}📊 SIMULATION COMPLETE${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

run_post_tests
print_footer
