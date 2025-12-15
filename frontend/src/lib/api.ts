// src/lib/api.ts

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper sederhana untuk fetch
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!response.ok) {
      console.warn(`API Error [${endpoint}]: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Network Error [${endpoint}]:`, error);
    return null;
  }
}

export const api = {
  // --- DASHBOARD ---
  getStats: () => fetchAPI<any>('/dashboard/stats'),
  getDashboardAlerts: () => fetchAPI<any[]>('/dashboard/alerts'),
  getChartHistory: (machineId: string) => fetchAPI<any[]>(`/dashboard/chart-history?machineId=${machineId}`),
  getChartLatest: (machineId: string) => fetchAPI<any>(`/dashboard/chart-latest?machineId=${machineId}`),

  // --- MACHINES ---
  getMachines: () => fetchAPI<any[]>('/machines'),
  
  // --- ALERTS ---
  getAlerts: () => fetchAPI<any[]>('/alerts'),

  // --- PREDICTION ---
  predict: (data: any) => fetchAPI<any>('/predict', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),

  // --- SIMULATION ---
  startSimulation: () => fetchAPI('/simulation/start', { method: 'POST' }),
  stopSimulation: () => fetchAPI('/simulation/stop'), 
  getSimulationStatus: () => fetchAPI<any>('/simulation/status'),
};