/**
 * SYNCHRONIZED API CONTRACTS - Frontend & Backend
 * Capstone Project A25-CS050
 * Last synced: 2025-12-14
 * 
 * This is the single source of truth for all API contracts.
 * Both backend/src/types/index.ts and frontend/src/types/index.ts must match exactly.
 */

// ==========================================================
// PREDICTION TYPES (ML Integration)
// ==========================================================

export interface PredictPayload {
  Machine_ID: string;
  Type: string;
  Air_Temp: number;
  Process_Temp: number;
  RPM: number;
  Torque: number;
  Tool_Wear: number;
}

export interface MLPredictionResult {
  status: string;
  input_saved: boolean;
  alert_created: boolean;
  ml_result: {
    Machine_ID: string;
    Risk_Probability?: string;
    RUL_Status: string;
    Status: string;
    Failure_Type?: string;
    Action?: string;
  };
}

// ==========================================================
// DASHBOARD TYPES (Visualization)
// ==========================================================

export interface ChartDataPoint {
  time: string;
  val_torque: number;
  val_rpm: number;
  val_temp: number;
  status: string;
  risk: string;
}

export interface ChartHistoryResponse {
  status: string;
  machine_id: string;
  data: ChartDataPoint[];
  count: number;
}

export interface ChartLatestResponse {
  status: string;
  machine_id: string;
  data: ChartDataPoint | null;
}

export interface DashboardStats {
  totalMachines: number;
  criticalMachines: number;
  todaysAlerts: number;
  systemHealth: number;
}

export interface DashboardStatsResponse {
  status: string;
  summary: DashboardStats;
  timestamp: string;
}

// ==========================================================
// ALERT TYPES
// ==========================================================

export interface AlertData {
  id: number;
  message: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  machine_id: number;
  machine?: {
    id: number;
    aset_id: string;
    name: string;
    status: 'CRITICAL' | 'WARNING' | 'HEALTHY' | 'OFFLINE';
  };
}

export interface RecentAlertsResponse {
  status: string;
  data: AlertData[];
  count: number;
}

// ==========================================================
// MACHINE TYPES
// ==========================================================

export interface Machine {
  id: number;
  aset_id: string;
  name: string;
  status: 'CRITICAL' | 'WARNING' | 'HEALTHY' | 'OFFLINE';
  created_at: string;
  updated_at: string;
}

export interface MachineHistoryItem {
  machineId: string;
  timestamp: string;
  air_temperature_k: number;
  rotational_speed_rpm: number;
  torque_nm: number;
  tool_wear_min: number;
}

export interface MachineDetailResponse {
  id: number;
  aset_id: string;
  name: string;
  status: 'CRITICAL' | 'WARNING' | 'HEALTHY' | 'OFFLINE';
  created_at: string;
  updated_at: string;
}

// ==========================================================
// SIMULATION TYPES
// ==========================================================

export interface SimulationStatusResponse {
  status: string;
  isRunning: boolean;
  timestamp: string;
}

export interface SimulationControlResponse {
  status: string;
  message: string;
  isRunning: boolean;
  timestamp: string;
}

// ==========================================================
// API RESPONSE WRAPPER
// ==========================================================

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
  timestamp?: string;
}