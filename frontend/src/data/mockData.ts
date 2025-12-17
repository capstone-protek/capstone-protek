/**
 * Mock Data untuk Frontend
 *
 * File ini digunakan untuk development/testing
 * Pada production, data akan diambil dari API Backend
 */
import type {
  AlertData,
  DashboardSummaryResponse,
  MachineDetailResponse,
  MachineStatus,
} from "@/types";

export const mockAlerts: AlertData[] = [
  {
    id: "alert-001",
    asetId: "M-14850",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    diagnosis: "Tool Wear Failure",
    probabilitas: 0.95,
    priority: "KRITIS",
    sensorDataTerkait: {
      airTemp: 35.2,
      processTemp: 52.1,
      rpm: 1500,
      torque: 42.5,
      toolWear: 240.8,
    },
  },
  {
    alertId: "alert-002",
    asetId: "M-15200",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    diagnosis: "Overheat",
    probabilitas: 0.78,
    priority: "TINGGI",
    sensorDataTerkait: {
      airTemp: 38.5,
      processTemp: 65.3,
      rpm: 1800,
      torque: 38.2,
      toolWear: 120.5,
    },
  },
  {
    id: "alert-003",
    asetId: "M-14900",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    diagnosis: "Power Loss",
    probabilitas: 0.45,
    priority: "SEDANG",
    sensorDataTerkait: {
      airTemp: 32.1,
      processTemp: 48.5,
      rpm: 1200,
      torque: 35.8,
      toolWear: 98.3,
    },
  },
];

export const mockDashboardSummary: DashboardSummaryResponse = {
  totalMachines: 25,
  criticalAlertsCount: 3,
  offlineMachinesCount: 1,
  recentCriticalAlerts: mockAlerts.filter((a) => a.priority === "KRITIS"),
};

export const mockMachines: mach[] = [
  {
    asetId: "M-14850",
    name: "CNC Grinder 01",
    status: "CRITICAL",
  },
  {
    asetId: "M-15200",
    name: "Lathe Machine 02",
    status: "WARNING",
  },
  {
    asetId: "M-14900",
    name: "Drill Press 03",
    status: "HEALTHY",
  },
  {
    asetId: "M-15500",
    name: "Milling Machine 04",
    status: "HEALTHY",
  },
  {
    asetId: "M-16100",
    name: "Assembly Robot 05",
    status: "OFFLINE",
  },
];

export const mockMachineDetails: Record<string, MachineDetails> = {
  "M-14850": {
    asetId: "M-14850",
    name: "CNC Grinder 01",
    status: "CRITICAL",
    lastReading: {
      timestamp: new Date().toISOString(),
      airTemp: 35.2,
      processTemp: 52.1,
      rpm: 1500,
      torque: 42.5,
      toolWear: 240.8,
    },
  },
  "M-15200": {
    asetId: "M-15200",
    name: "Lathe Machine 02",
    status: "WARNING",
    lastReading: {
      timestamp: new Date().toISOString(),
      airTemp: 38.5,
      processTemp: 65.3,
      rpm: 1800,
      torque: 38.2,
      toolWear: 120.5,
    },
  },
};

// Simple health trend data for charts
export const healthTrendData = [
  { time: '00:00', value: 80 },
  { time: '04:00', value: 78 },
  { time: '08:00', value: 75 },
  { time: '12:00', value: 70 },
  { time: '16:00', value: 65 },
  { time: '20:00', value: 60 },
];

// Maintenance history (sample)
export const maintenanceHistory: { id: string; machineId: string; date: string; type: string; description: string }[] = [];

// Export untuk backward compatibility
export const alerts = mockAlerts;
export const dashboardStats = mockDashboardSummary;
export const machines = mockMachines;

export type { Alert, DashboardSummary, MachineSummary, MachineDetails };
