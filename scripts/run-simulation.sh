#!/bin/bash
set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

curl_silent() {
    curl -sS "$@"
}

require_service() {
    local url="$1"; shift
    local name="$1"; shift
    if curl_silent "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ${name} is running (${url})${NC}"
    else
        echo -e "${RED}❌ ${name} is NOT running (${url})${NC}"
        exit 1
    fi
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  PROTEK SIMULATION & PREDICTION TEST${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}[1/5] Checking Backend Server...${NC}"
require_service "http://localhost:4000" "Backend"

echo -e "${YELLOW}[2/5] Checking ML API Server...${NC}"
require_service "http://localhost:8000" "ML API"

echo ""
echo -e "${YELLOW}[3/5] Starting Simulation...${NC}"
SIM_RESPONSE=$(curl_silent -X POST http://localhost:8000/api/start-simulation \
    -H "Content-Type: application/json")

if echo "$SIM_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Simulation started successfully${NC}"
    echo -e "    Response: $SIM_RESPONSE"
else
    echo -e "${RED}❌ Failed to start simulation${NC}"
    echo -e "    Response: $SIM_RESPONSE"
    exit 1
fi

echo ""
echo -e "${YELLOW}[4/5] Waiting for data to be processed...${NC}"
echo -e "    Giving simulation 10 seconds to process data..."
sleep 10

echo ""
echo -e "${YELLOW}[5/5] Testing Prediction Endpoint...${NC}"
echo -e "    Sending sample prediction request to Backend..."

# Sample data untuk prediksi
PREDICTION_DATA='{
  "Machine_ID": "M-001",
  "Type": "H",
  "Air_Temp": 298.5,
  "Process_Temp": 323.5,
  "RPM": 1500,
  "Torque": 45.5,
  "Tool_Wear": 120
}'

echo -e "${BLUE}    Request Data:${NC}"
echo "$PREDICTION_DATA" | jq '.' 2>/dev/null || echo "$PREDICTION_DATA"

PRED_RESPONSE=$(curl_silent -X POST http://localhost:4000/api/predict \
    -H "Content-Type: application/json" \
    -d "$PREDICTION_DATA")

echo ""
echo -e "${BLUE}    Response from Backend → ML API:${NC}"
if command -v jq &> /dev/null; then
    echo "$PRED_RESPONSE" | jq '.' 2>/dev/null || echo "$PRED_RESPONSE"
else
    echo "$PRED_RESPONSE"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ SIMULATION & PREDICTION TEST COMPLETE${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📊 Server Status:${NC}"
echo "  Backend API:    http://localhost:4000"
echo "  Backend Docs:   http://localhost:4000/api-docs"
echo "  ML API:         http://localhost:8000"
echo "  ML API Docs:    http://localhost:8000/docs"
echo ""
echo -e "${BLUE}📋 Commands:${NC}"
echo "  Stop simulation:  curl -X GET http://localhost:8000/api/stop-simulation"
echo "  View ML API logs: tail -f /home/dekhsa/Desktop/Project-Protek/capstone-protek/ml-api/ml-api.log"
echo ""
