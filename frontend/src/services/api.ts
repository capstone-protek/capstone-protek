// frontend/src/services/api.ts
import axios from "axios";
import type { 
  DashboardSummaryResponse, 
  MachineDetailResponse, 
  SensorHistoryData,
  AlertData,
  PredictPayload,
  PredictResponseFE
} from "../types";

// Gunakan URL Railway Anda jika di production, atau localhost saat dev
const API_URL = import.meta.env.VITE_API_URL || "https://api-protek-production.up.railway.app/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- INTERFACES (Di-export agar bisa dipakai di Komponen) ---

export interface SimulationResponse {
  status: "success" | "error";
  message: string;
  is_running?: boolean;
}

export interface TrendDataPoint {
  time: string;
  healthScore: number;
  machineId: string;
}

export interface DebugMatchItem {
  mesin: string;
  kode: string;
  status_saat_ini: string;
  prediksi_ml: {
    sisa_umur_rul: string;
    risiko_kerusakan: string;
    status_prediksi: string;
  } | string; 
}

export interface ChatResponse {
  reply: string;
  debug_match?: DebugMatchItem[]; 
}

// --- SERVICES ---

export const simulationService = {
  // 1. Start Simulasi
  start: async () => {
    const response = await api.post<SimulationResponse>("/simulation/start");
    return response.data;
  },

  // 2. Stop Simulasi
  stop: async () => {
    // Menggunakan GET sesuai controller backend Anda saat ini
    const response = await api.get<SimulationResponse>("/simulation/stop");
    return response.data;
  },

  // 3. Cek Status (Untuk tombol Start/Stop)
  getStatus: async () => {
    const response = await api.get<{ is_running: boolean }>("/simulation/status");
    return response.data;
  }
};

export const dashboardService = {
  getSummary: async () => {
    const response = await api.get<DashboardSummaryResponse>("/dashboard/summary");
    return response.data;
  },

  getTrend: async () => {
    const response = await api.get<TrendDataPoint[]>("/dashboard/trend");
    return response.data;
  },

  getMachines: async () => {
    const response = await api.get<MachineDetailResponse[]>("/machines");
    return response.data;
  },

  getMachineDetail: async (asetId: string) => {
    const response = await api.get<MachineDetailResponse>(`/machines/${asetId}`);
    return response.data;
  },

  // --- FIX PENTING: Menambahkan getSensors ---
  // Ini diperlukan oleh MachineHealthChart.tsx
  getSensors: async (asetId: string) => {
    // Mengambil data history sensor untuk grafik realtime
    const response = await api.get<SensorHistoryData[]>(`/machines/${asetId}/history`);
    return response.data;
  },

  // Method baru untuk mengambil data dari tabel sensor_data (realtime)
  getSensorData: async (asetId: string) => {
    const response = await api.get<SensorHistoryData[]>(`/machines/${asetId}/history`);
    return response.data;
  },

  getHistory: async (asetId: string) => {
    const response = await api.get<SensorHistoryData[]>(`/machines/${asetId}/history`);
    return response.data;
  },

  getAlerts: async () => {
    const response = await api.get<{ alerts: AlertData[] } | AlertData[]>(`/alerts`);
    const data = response.data;
    // Handle format { alerts: [...] } atau array langsung [...]
    return Array.isArray(data) ? data : data.alerts;
  },

  getAlertDetail: async (alertId: number) => {
    const response = await api.get<AlertData>(`/alerts/${alertId}`);
    return response.data;
  },

  getPredict: async (payload: PredictPayload) => {
    const response = await api.post<PredictResponseFE>(`/predict`, payload);
    return response.data;
  },

  sendMessage: async (message: string) => {
    const response = await api.post<ChatResponse>('/chat', { message });
    return response.data;
  }
};

export default api;