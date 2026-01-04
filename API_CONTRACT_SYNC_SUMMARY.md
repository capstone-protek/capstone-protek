# API Contract Synchronization Summary
**Date:** 2025-12-14  
**Status:** ✅ COMPLETE

## Overview
All API contracts have been successfully synchronized across:
1. ✅ Backend Type Definitions (`backend/src/types/index.ts`)
2. ✅ Frontend Type Definitions (`frontend/src/types/index.ts`)
3. ✅ OpenAPI/Swagger Documentation (`backend/swagger.yaml`)

---

## Files Modified

### 1. `backend/swagger.yaml` ✅
**Lines Changed:** Entire `paths:` and `components:` sections  
**Version:** OpenAPI 3.0.0

#### New Components (Schemas):
- `ChartDataPoint` - Time series data for chart visualization
- `DashboardStats` - Summary statistics for dashboard
- `AlertData` - Alert/warning information with machine relationship
- `Machine` - Machine metadata and status
- `PredictPayload` - ML prediction request structure

#### New Endpoints Documented:

**Dashboard (4 endpoints)**
- `GET /api/dashboard/chart-history?machineId=` → Returns last 50 data points
- `GET /api/dashboard/chart-latest?machineId=` → Returns latest 1 data point (realtime)
- `GET /api/dashboard/stats` → Returns system health metrics
- `GET /api/dashboard/alerts?limit=` → Returns recent alerts

**Prediction (1 endpoint)**
- `POST /api/predict` → ML integration with auto-alert creation

**Simulation (3 endpoints)**
- `POST /api/simulation/start` → Start data simulation
- `GET /api/simulation/stop` → Stop simulation
- `GET /api/simulation/status` → Check simulation status

**Machines (3 endpoints)**
- `GET /api/machines` → List all machines
- `GET /api/machines/{id}` → Get machine detail
- `GET /api/machines/{id}/history` → Get sensor history (time series)

**Alerts (1 endpoint)**
- `GET /api/alerts` → List all alerts

---

### 2. `backend/src/types/index.ts` ✅
**Status:** Already updated in previous session  
**Type Count:** 178 lines with 12+ interfaces

#### Interfaces Provided:
```typescript
// Prediction Types
- PredictPayload
- MLResponse
- PredictControllerResponse

// Dashboard Types  
- ChartDataPoint
- ChartHistoryResponse
- ChartLatestResponse
- DashboardStats
- DashboardStatsResponse

// Alert Types
- AlertData
- RecentAlertsResponse

// Machine Types
- Machine
- MachineHistoryItem
- MachineDetailResponse

// Simulation Types
- SimulationStatusResponse
- SimulationControlResponse

// Wrapper
- ApiResponse<T>
```

---

### 3. `frontend/src/types/index.ts` ✅
**Status:** Just synchronized  
**Content:** Complete copy of API contracts from backend/src/types/index.ts

#### Key Changes:
- ✅ Removed old Indonesian-named interfaces (PredictRequestML, PredictResponseML, Alert, DashboardSummary, MachineSummary, etc.)
- ✅ Added all new standardized types matching backend
- ✅ Simplified type naming for consistency

**Updated Interface List:**
```typescript
// All matching backend types (see section 2 above)
```

---

## Database Schema Alignment

### Sensor Data Model
Field mapping in `ChartDataPoint`:
```typescript
interface ChartDataPoint {
  time: string;              // ← sensor_data.insertion_time
  val_torque: number;        // ← sensor_data.torque_nm
  val_rpm: number;           // ← sensor_data.rotational_speed_rpm
  val_temp: number;          // ← sensor_data.air_temperature_k
  status: string;            // ← prediction_results.pred_status
  risk: string;              // ← prediction_results.risk_probability
}
```

### Alert Model
Field mapping in `AlertData`:
```typescript
interface AlertData {
  id: number;                // ← alerts.id
  message: string;           // ← alerts.message
  severity: string;          // ← alerts.severity
  timestamp: string;         // ← alerts.timestamp
  machine_id: number;        // ← alerts.machine_id (FK)
  machine?: Machine;         // ← Joined machine data
}
```

---

## Endpoint Status Summary

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/dashboard/chart-history` | GET | ✅ Implemented | Raw SQL JOIN on insertion_time |
| `/api/dashboard/chart-latest` | GET | ✅ Implemented | Single row LIMIT 1 |
| `/api/dashboard/stats` | GET | ✅ Implemented | Count aggregates + health calc |
| `/api/dashboard/alerts` | GET | ✅ Implemented | With machine relation |
| `/api/predict` | POST | ✅ Patched | Env var ML_API_URL, key normalization |
| `/api/simulation/start` | POST | ✅ Exists | In simulation.controller.ts |
| `/api/simulation/stop` | GET | ✅ Exists | In simulation.controller.ts |
| `/api/simulation/status` | GET | ✅ Exists | In simulation.controller.ts |
| `/api/machines` | GET | ✅ Implemented | In machine.controller.ts |
| `/api/machines/{id}` | GET | ✅ Implemented | Dynamic ID handling |
| `/api/machines/{id}/history` | GET | ✅ Implemented | 100 rows time series |
| `/api/alerts` | GET | ✅ Implemented | In alert.controller.ts |

---

## Environment Configuration

### Backend (.env)
```env
ML_API_URL=http://localhost:8000
DATABASE_URL=postgresql://postgres:password@localhost:5432/db_protek?schema=public
NODE_ENV=development
```

### ML API (.env)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/db_protek?schema=public
```

---

## Frontend Integration Checklist

- [x] Type contracts synchronized to `frontend/src/types/index.ts`
- [x] All dashboard response types available (ChartDataPoint, DashboardStats, etc.)
- [x] Alert response type updated with machine relationship
- [x] Machine type includes status field
- [x] Prediction response type includes ML result details

**Frontend Usage Example:**
```typescript
// In React component
import { ChartHistoryResponse, ChartDataPoint } from '@/types';

const Dashboard = () => {
  const [chart, setChart] = useState<ChartHistoryResponse | null>(null);
  
  useEffect(() => {
    fetch('/api/dashboard/chart-history?machineId=M-14850')
      .then(r => r.json())
      .then((data: ChartHistoryResponse) => setChart(data));
  }, []);
  
  return chart?.data.map((point: ChartDataPoint) => (
    <DataPoint key={point.time} data={point} />
  ));
};
```

---

## Swagger/OpenAPI Access

**URL:** http://localhost:4000/api-docs  
**Format:** OpenAPI 3.0.0  
**Endpoints Documented:** 12+  
**Servers:** 2 (Production + Development)  
**Tags:** 5 (Dashboard, Prediction, Simulation, Machines, Alerts)

---

## Data Flow Verification

### Complete Request → Response Path:

**Example: Get Dashboard Chart History**
```
Frontend Request:
  GET /api/dashboard/chart-history?machineId=M-14850

Backend Processing (dashboard.controller.ts):
  1. Extract machineId = "M-14850"
  2. Execute SQL JOIN:
     SELECT ... FROM sensor_data s
     LEFT JOIN prediction_results p ON s.insertion_time = p.prediction_time
     WHERE s.machine_id = 'M-14850'
     ORDER BY s.insertion_time DESC LIMIT 50
  3. Map to ChartDataPoint[]
  4. Return ChartHistoryResponse

Response Body:
  {
    "status": "success",
    "machine_id": "M-14850",
    "count": 50,
    "data": [ChartDataPoint[], ...]
  }

Frontend Consumption:
  import { ChartHistoryResponse } from '@/types'
  const data: ChartHistoryResponse = await response.json()
  // ✅ Type-safe access to data[0].val_torque, etc.
```

---

## Testing Recommendations

### Manual Testing
1. Start Backend: `cd backend && npm run dev`
2. Start ML API: `cd ml-api && uvicorn src.main:app --reload`
3. Test each endpoint in Swagger UI: http://localhost:4000/api-docs
4. Verify response structure matches type definitions

### Unit Tests (Recommended)
```typescript
// Test type compatibility
import { ChartHistoryResponse } from '@/types';

test('dashboard returns valid ChartHistoryResponse', async () => {
  const response = await fetch('/api/dashboard/chart-history?machineId=M-14850');
  const data: ChartHistoryResponse = await response.json();
  
  expect(data.status).toBe('success');
  expect(Array.isArray(data.data)).toBe(true);
  expect(data.data[0]).toHaveProperty('time');
  expect(data.data[0]).toHaveProperty('val_torque');
});
```

---

## Notes & Known Issues

### ✅ Resolved
- Seeder error (sensorHistory → sensor_data) - FIXED
- Local vs production database persistence - FIXED (ML_API_URL env var + key normalization)
- Duplicate getMachines function - REMOVED
- Incomplete type contracts - UPDATED
- Missing Swagger documentation - COMPLETE

### ⚠️ To Monitor
- Raw SQL JOIN on `insertion_time = prediction_time` works only if both timestamp columns have identical precision
- Snake_case vs PascalCase response keys handled by normalization function `f()` in predict.controller.ts
- Frontend needs to be restarted after types update for TypeScript compilation

### 📝 Future Improvements
- Consider adding GraphQL layer for frontend type safety
- Add request validation middleware (Zod/Joi)
- Implement API versioning (v1/, v2/) if breaking changes planned

---

## Completion Checklist

- [x] Backend types updated (dashboard, machine, alert, simulation types)
- [x] Frontend types synchronized with backend
- [x] Swagger.yaml completely rewritten with OpenAPI 3.0
- [x] 12+ endpoints documented with schemas
- [x] Response examples provided
- [x] Database field mapping validated
- [x] Environment configuration verified
- [x] All endpoints marked as implemented

**Session Status:** ✅ COMPLETE - All API contracts are now synchronized and documented.
