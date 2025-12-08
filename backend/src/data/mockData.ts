import { AlertData, MachineStatus } from '../types';

// =========================================================================
// MOCK DATA (LEGACY SUPPORT)
// File ini disesuaikan agar kompatibel dengan tipe data baru (types/index.ts)
// supaya tidak menyebabkan error kompilasi.
// =========================================================================

export const MOCK_ALERTS: AlertData[] = [
  {
    id: 101, // ID Int sesuai Prisma
    message: "Potential Tool Wear Failure Detected",
    severity: "CRITICAL",
    timestamp: new Date().toISOString(),
    machine: {
      name: "CNC Milling Machine 01",
      asetId: "M-001"
    }
  },
  {
    id: 102,
    message: "Overheating Warning",
    severity: "WARNING",
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 jam lalu
    machine: {
      name: "Hydraulic Press 50T",
      asetId: "M-002"
    }
  },
  {
    id: 103,
    message: "Vibration Anomaly detected",
    severity: "INFO",
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 hari lalu
    machine: {
      name: "CNC Lathe 03",
      asetId: "M-003"
    }
  }
];

// Data Dummy Sederhana untuk keperluan testing jika DB kosong
export const MOCK_MACHINES = [
    {
        id: 1,
        asetId: "M-001",
        name: "CNC Milling Machine 01",
        status: "HEALTHY" as MachineStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 2,
        asetId: "M-002",
        name: "Hydraulic Press 50T",
        status: "WARNING" as MachineStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];