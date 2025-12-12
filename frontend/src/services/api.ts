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

// Tambahkan Interface untuk Response Simulasi
interface SimulationResponse {
  status: "success" | "error";
  message: string;
  is_running?: boolean; // Opsional, tergantung response backend
}

export const simulationService = {
  // 1. Start Simulasi
  start: async () => {
    const response = await api.post<SimulationResponse>("/simulation/start");
    return response.data;
  },

  // 2. Stop Simulasi
  stop: async () => {
    // Note: Di dokumentasi backend pakai GET, tapi kalau nanti diubah ke POST sesuaikan saja
    const response = await api.get<SimulationResponse>("/simulation/stop");
    return response.data;
  },

  // 3. Cek Status (PENTING: Agar tombol tahu harus warna Merah atau Hijau)
  getStatus: async () => {
    const response = await api.get<{ is_running: boolean }>("/simulation/status");
    return response.data;
  }
};

export const dashboardService = {
  getSummary: async () => {
    // Sesuai Swagger: GET /api/dashboard/summary
    const response = await api.get<DashboardSummaryResponse>("/dashboard/summary");
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

  getHistory: async (asetId: string) => {
    const response = await api.get<SensorHistoryData[]>(`/machines/${asetId}/history`);
    return response.data;
  },

  getAlerts: async () => {
    const response = await api.get<{ alerts: AlertData[] } | AlertData[]>(`/alerts`);
    // Backend mengembalikan { alerts: [...] } atau array langsung
    const data = response.data;
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

};

export default api;