import type {
  Alert,
  DashboardSummary,
  MachineSummary,
  MachineDetails,
  SensorHistory,
  PredictRequestBodyFE,
  PredictResponseBodyFE,
  ChatResponseBody,
} from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Helper function untuk membuat API requests
 */
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * DASHBOARD ENDPOINTS
 */
export const dashboardAPI = {
  /**
   * GET /api/dashboard/summary
   * Mengambil ringkasan dashboard
   */
  getSummary: () => fetchAPI<DashboardSummary>("/dashboard/summary"),
};

/**
 * ALERTS ENDPOINTS
 */
export const alertsAPI = {
  /**
   * GET /api/alerts
   * Mengambil semua peringatan
   */
  getAll: () => fetchAPI<Alert[]>("/alerts"),

  /**
   * GET /api/alerts/:id
   * Mengambil detail peringatan tertentu
   */
  getById: (id: string) => fetchAPI<Alert>(`/alerts/${id}`),
};

/**
 * MACHINES ENDPOINTS
 */
export const machinesAPI = {
  /**
   * GET /api/machines
   * Mengambil daftar semua mesin (ringkasan)
   */
  getAll: () => fetchAPI<MachineSummary[]>("/machines"),

  /**
   * GET /api/machines/:id
   * Mengambil detail mesin tertentu
   */
  getById: (id: string) => fetchAPI<MachineDetails>(`/machines/${id}`),

  /**
   * GET /api/machines/:id/history
   * Mengambil riwayat sensor untuk mesin tertentu
   */
  getHistory: (id: string) => fetchAPI<SensorHistory>(`/machines/${id}/history`),
};

/**
 * PREDICTION ENDPOINTS
 */
export const predictAPI = {
  /**
   * POST /api/predict
   * Mengirim data sensor untuk prediksi kegagalan mesin
   */
  predict: (data: PredictRequestBodyFE) =>
    fetchAPI<PredictResponseBodyFE>("/predict", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

/**
 * CHAT ENDPOINTS
 */
export const chatAPI = {
  /**
   * GET /api/chat?q=...
   * Mengirim pertanyaan ke chatbot sederhana
   */
  chat: (query: string) =>
    fetchAPI<ChatResponseBody>(`/chat?q=${encodeURIComponent(query)}`),
};
