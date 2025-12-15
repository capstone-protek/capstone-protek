import axios from "axios";

// --- INTERFACES (Definisi Tipe Data) ---

// 1. Definisikan bentuk Alert agar tidak perlu pakai 'any'
export interface Alert {
  id: number;
  message: string;
  severity: "CRITICAL" | "WARNING" | "INFO" | string;
  timestamp: string;
  machine?: {
    name: string;
    asetId?: string;
  };
}

export interface DashboardSummaryResponse {
  summary: {
    totalMachines: number;
    todaysAlerts: number;
    criticalMachines: number;
    systemHealth: number;
  };
  // ✅ FIX: Ganti 'any[]' dengan 'Alert[]'
  recentAlerts: Alert[]; 
}

export interface ChatResponse {
  reply: string;
}

// --- CONFIG ---
const API_URL = "https://capstone-protek-production-cabc.up.railway.app/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// --- SERVICES ---
export const dashboardService = {
  // Get Dashboard Summary
  getSummary: async () => {
    try {
      const response = await api.get<DashboardSummaryResponse>("/dashboard/summary");
      return response.data;
    } catch (error) {
      console.error("API Error [Summary]:", error);
      throw error;
    }
  },

  // Get Machine History (Chart)
  // Gunakan unknown[] atau interface spesifik jika ada, hindari any[]
  getHistory: async (asetId: string) => {
    try {
      const response = await api.get(`/machines/${asetId}/history`);
      return response.data;
    } catch (error) {
      console.error("API Error [History]:", error);
      return []; 
    }
  },

  // Chatbot
  sendMessage: async (message: string) => {
    try {
      const response = await api.post<ChatResponse>("/chat", { message });
      return response.data;
    } catch (error) {
      console.error("API Error [Chat]:", error);
      throw error;
    }
  }
};

export const simulationService = {
  // Simulation Status
  getStatus: async () => {
    try {
      const response = await api.get("/simulation/status");
      return response.data;
    } catch {
      return { is_running: false };
    }
  },
  
  start: async () => api.post("/simulation/start"),
  stop: async () => api.get("/simulation/stop"),
};

export default api;