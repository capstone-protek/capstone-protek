import axios from "axios";

// ==========================================================
// 1. DASHBOARD TYPES
// ==========================================================

export interface DashboardStats {
  total: number;
  healthy: number;
  warning: number;
  critical: number;
  offline: number;
}

// ==========================================================
// 2. ALERT TYPES
// ==========================================================

export interface AlertData {
  id: number;
  message: string;
  severity: "HIGH" | "MEDIUM" | "LOW" | "CRITICAL" | "WARNING" | string;
  timestamp: string;
  machine_id: string; // String sesuai database
  machine?: {
    name: string;
    machine_id: string;
  };
}

export interface AlertsResponse {
  alerts: AlertData[];
}

// ==========================================================
// 3. MACHINE TYPES
// ==========================================================

export interface MachineListItem {
  id: number;
  machine_id: string;
  name: string;
  status: string;
}

// Tipe data untuk Detail Mesin
export interface MachineDetailData {
  id: number;
  machine_id: string;
  name: string;
  status: string;
  created_at: string;
  sensor_data: Array<{
    air_temperature_k: number;
    process_temperature_k: number;
    rotational_speed_rpm: number;
    torque_nm: number;
    tool_wear_min: number;
    insertion_time: string;
  }>;
  alerts: Array<{
    id: number;
    message: string;
    severity: string;
    timestamp: string;
  }>;
}

// ==========================================================
// 4. HISTORY & PREDICTION TYPES
// ==========================================================

export interface HistoryItem {
  id: number;
  timestamp: string;
  air_temperature_k: number;
  process_temperature_k: number;
  rotational_speed_rpm: number;
  torque_nm: number;
  tool_wear_min: number;
  type: string;
}

export interface PredictionItem {
  id: number;
  prediction_time: string;
  risk_probability: number;
  rul_minutes_val: number;
}

// Return type bersih untuk dikonsumsi UI
export interface MachineHistoryResponse {
  sensor: HistoryItem[];
  prediction: PredictionItem[];
}

// Tipe RAW untuk menangani respon backend yang mungkin Array atau Object
// Ini pengganti 'any' yang aman
type RawHistoryResponse = 
  | HistoryItem[] 
  | { sensor?: HistoryItem[]; prediction?: PredictionItem[] };

// ==========================================================
// 5. SIMULATION TYPES
// ==========================================================

// Tipe RAW untuk menangani variasi case snake/camel dari backend
interface RawSimulationResponse {
  is_running?: boolean; // snake_case
  isRunning?: boolean;  // camelCase
  status?: string;
  message?: string;
}

export interface SimulationStatusResponse {
  is_running: boolean;
  message?: string;
}

export interface ChatResponse {
  reply: string;
}

// ==========================================================
// CONFIG
// ==========================================================

const API_URL = "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// ==========================================================
// SERVICES
// ==========================================================

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>("/dashboard/stats");
    return response.data;
  },

  getRecentAlerts: async (): Promise<AlertsResponse> => {
    const response = await api.get<AlertsResponse>("/alerts");
    return response.data;
  },

  getMachinesList: async (): Promise<MachineListItem[]> => {
    const response = await api.get<MachineListItem[]>("/dashboard/machines");
    return response.data;
  },

  getMachineHistory: async (machineId: string): Promise<HistoryItem[]> => {
    // Fungsi legacy untuk chart lama (hanya sensor)
    // Kita cast ke HistoryItem[] karena endpoint ini spesifik
    const response = await api.get<HistoryItem[]>(`/machines/${machineId}/history`);
    return response.data;
  }
};

export const machineService = {
  getDetail: async (machineId: string): Promise<MachineDetailData> => {
    const response = await api.get<MachineDetailData>(`/machines/${machineId}`);
    return response.data;
  },

  // Adapter AMAN tanpa 'any'
  getHistory: async (machineId: string): Promise<MachineHistoryResponse> => {
    // Kita minta tipe RawHistoryResponse (Union Type)
    const response = await api.get<RawHistoryResponse>(`/machines/${machineId}/history`);
    const data = response.data;

    // Type Guard: TypeScript cek apakah ini Array
    if (Array.isArray(data)) {
      return {
        sensor: data,       
        prediction: []       
      };
    }

    // Jika bukan array, TypeScript otomatis tahu ini adalah Object {sensor?, prediction?}
    return {
      sensor: data.sensor || [],
      prediction: data.prediction || []
    };
  }
};

export const simulationService = {
  getStatus: async (): Promise<SimulationStatusResponse> => {
    try {
      // Kita minta tipe RawSimulationResponse yang sudah didefinisikan strukturnya
      const response = await api.get<RawSimulationResponse>("/simulation/status");
      const data = response.data;
      
      return { 
        // Menggunakan Nullish Coalescing Operator (??) untuk fallback aman
        is_running: data.is_running ?? data.isRunning ?? false,
        message: data.message
      };
    } catch {
      return { is_running: false };
    }
  },
  
  start: async () => api.post("/simulation/start"),
  stop: async () => api.post("/simulation/stop"),
};

export const chatService = {
  sendMessage: async (message: string): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>("/chat", { message });
    return response.data;
  }
};

export default api;