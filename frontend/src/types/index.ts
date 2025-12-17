/*
 * ==========================================================
 * KONTRAK API FINAL (RAILWAY - SAFETY PATCH)
 * ==========================================================
 * Update: Menyesuaikan fakta bahwa beberapa field ML API
 * bisa hilang tergantung kondisi (Normal vs Critical).
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
// 2. OUTPUT DATA (MATCHING POSTMAN IMAGE_B2FCDF)
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
  // Di screenshot 'Critical', Message & Recommendation TIDAK MUNCUL.
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
// 4. RESPONSE DATA (FE CONSUMPTION)
// ==========================================================

export interface AlertData {
  id: number;
  message: string;
  severity: string;
  timestamp: Date | string; 
  machine: {
    name: string;
    asetId: string;
  };
}

export interface DashboardSummaryResponse {
  summary: {
    totalMachines: number;
    criticalMachines: number;
    todaysAlerts: number;
    systemHealth: number;
  };
  recentAlerts: AlertData[];
}

export interface MachineDetailResponse {
  id: number;
  asetId: string;
  name: string;
  status: MachineStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SensorHistoryData {
  id: number;
  type: string;
  value: number;
  timestamp: string;
  machineId: number;
}

export interface SensorDataPoint {
  id: number;
  machine_id: number;
  type: string;
  air_temperature_K: number;
  process_temperature_K: number;
  rotational_speed_rpm: number;
  torque_Nm: number;
  tool_wear_min: number;
  insertion_time: string;
}

// ==========================================================
// 5. API RESPONSE WRAPPERS
// ==========================================================

export interface PredictResponseFE {
  status: 'success' | 'error';
  input_saved: boolean;
  ml_result: MLResponse;
  alert_created?: boolean;
}