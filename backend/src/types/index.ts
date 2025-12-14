/*
 * ==========================================================
 * KONTRAK API FINAL (RAILWAY - DASHBOARD + SIMULATION)
 * ==========================================================
 * Update: Menambahkan Dashboard, Simulation, dan Machine response types
 * berdasarkan endpoint baru yang telah diimplementasikan.
 * ==========================================================
 */

// ==========================================================
// 1. INPUT DATA (MATCHING SWAGGER IMAGE_B2DE81)
// ==========================================================

export interface PredictPayload {
  Machine_ID: string;   // String
  Type: string;         // String
  Air_Temp: number;     // Number
  Process_Temp: number; // Number (> 0)
  RPM: number;          // Integer (> 0)
  Torque: number;       // Number (>= 0)
  Tool_Wear: number;    // Integer (>= 0)
}

// ==========================================================
// 2. OUTPUT DATA FROM ML API (MATCHING POSTMAN)
// ==========================================================

export interface MLResponse {
  Machine_ID: string;
  
  // Data Statistik (Selalu ada berupa String)
  Risk_Probability: string; // "78.3%"
  RUL_Estimate: string;     // "0 Menit Lagi"
  RUL_Status: string;       // "🚨 CRITICAL"
  RUL_Minutes: string;      // "0"
  Status: string;           // "⚠️ CRITICAL FAILURE DETECTED"

  // Field Opsional (Tergantung Normal vs Critical)
  Message?: string;         
  Recommendation?: string;  

  // Field Tambahan saat Failure
  Failure_Type?: string;    // "Power Failure"
  Action?: string;          // "Cek tegangan..."
  Urgency?: string;         // "🚨 SANGAT MENDESAK..."
}

// ==========================================================
// 3. ENUMS & SHARED TYPES
// ==========================================================

export type MachineStatus = 'CRITICAL' | 'WARNING' | 'HEALTHY' | 'OFFLINE';
export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

// ==========================================================
// 4. DASHBOARD TYPES
// ==========================================================

// Chart data point (from sensor_data + prediction_results join)
export interface ChartDataPoint {
  time: string;           // ISO datetime (insertion_time)
  val_torque: number;     // torque_nm
  val_rpm: number;        // rotational_speed_rpm
  val_temp: number;       // air_temperature_k
  status: string;         // pred_status from prediction_results
  risk: string;           // risk_probability from prediction_results
}

// Chart history response
export interface ChartHistoryResponse {
  status: 'success' | 'error';
  machine_id: string;
  data: ChartDataPoint[];
  count: number;
  error?: string;
}

// Chart latest response
export interface ChartLatestResponse {
  status: 'success' | 'error';
  machine_id: string;
  data: ChartDataPoint | null;
  error?: string;
}

// Dashboard stats response
export interface DashboardStatsResponse {
  status: 'success' | 'error';
  summary: {
    totalMachines: number;
    criticalMachines: number;
    todaysAlerts: number;
    systemHealth: number; // percentage (0-100)
  };
  timestamp: string; // ISO datetime
  error?: string;
}

// Alert data
export interface AlertData {
  id: number;
  message: string;
  severity: string;
  timestamp: Date | string; 
  machine_id: number;
  machine?: {
    id: number;
    aset_id: string;
    name: string;
    status: MachineStatus;
  };
}

// Recent alerts response
export interface RecentAlertsResponse {
  status: 'success' | 'error';
  data: AlertData[];
  count: number;
  error?: string;
}

// ==========================================================
// 5. MACHINE TYPES
// ==========================================================

export interface MachineDetailResponse {
  id: number;
  aset_id: string;
  name: string;
  status: MachineStatus;
  created_at?: string;
  updated_at?: string;
}

export interface MachineHistoryItem {
  machineId: string;
  timestamp: string;
  air_temperature_k: number;
  process_temperature_k: number;
  rotational_speed_rpm: number;
  torque_nm: number;
  tool_wear_min: number;
  type: string;
}

// ==========================================================
// 6. SIMULATION TYPES
// ==========================================================

export interface SimulationStatusResponse {
  status: 'success' | 'error';
  isRunning: boolean;
  timestamp?: string;
  message?: string;
}

export interface SimulationControlRequest {
  action: 'start' | 'pause' | 'stop';
}

export interface SimulationControlResponse {
  status: 'success' | 'error';
  message: string;
  isRunning: boolean;
  timestamp?: string;
}

// ==========================================================
// 7. PREDICT RESPONSE (FE CONSUMPTION)
// ==========================================================

export interface PredictResponseFE {
  status: 'success' | 'error';
  input_saved: boolean;
  ml_result: MLResponse;
  alert_created?: boolean;
  error?: string;
}