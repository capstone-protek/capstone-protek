// src/data/mockData.ts

// 1. IMPORT TIPE DARI SUMBER KEBENARAN TUNGGAL KITA
import { Alert, DashboardSummary, MachineSummary } from '../types';

// 2. BUAT DATA PALSU UNTUK ALERTS
export const MOCK_ALERTS: Alert[] = [
  {
    id: "alert-uuid-1",
    asetId: "M-14850",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 menit lalu
    diagnosis: "Tool Wear Failure",
    probabilitas: 0.95,
    priority: "KRITIS",
    sensorDataTerkait: {
      airTemp: 305.1, processTemp: 312.8, rpm: 1400, torque: 45.2, toolWear: 200,
    }
  },
  {
    id: "alert-uuid-2",
    asetId: "M-14851",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 menit lalu
    diagnosis: "Overheat Failure",
    probabilitas: 0.82,
    priority: "TINGGI",
    sensorDataTerkait: {
      airTemp: 307.4, processTemp: 315.5, rpm: 1350, torque: 50.1, toolWear: 15,
    }
  }
];

// 3. BUAT DATA PALSU UNTUK DASHBOARD
export const MOCK_DASHBOARD: DashboardSummary = {
  totalMachines: 50,
  criticalAlertsCount: 1, // Sesuai MOCK_ALERTS di atas
  offlineMachinesCount: 3,
  recentCriticalAlerts: [ MOCK_ALERTS[0] as Alert ] // Ambil data kritis dari atas
};

// 4. BUAT DATA PALSU UNTUK DAFTAR MESIN
export const MOCK_MACHINES: MachineSummary[] = [
  { asetId: "M-14850", name: "CNC Grinder 01", status: "CRITICAL" },
  { asetId: "M-14851", name: "CNC Grinder 02", status: "WARNING" },
  { asetId: "M-14852", name: "Drill Press 04", status: "HEALTHY" },
  { asetId: "M-14853", name: "Lathe 01", status: "OFFLINE" },
];