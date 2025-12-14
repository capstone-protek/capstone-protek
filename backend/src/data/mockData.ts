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
    machine_id: 1,
    machine: {
      id: 1,
      name: "CNC Milling Machine 01",
      aset_id: "M-001",
      status: "HEALTHY" as MachineStatus
    }
  },
  {
    id: 102,
    message: "Overheating Warning",
    severity: "WARNING",
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 jam lalu
    machine_id: 2,
    machine: {
      id: 2,
      name: "Hydraulic Press 50T",
      aset_id: "M-002",
      status: "WARNING" as MachineStatus
    }
  },
  {
    id: 103,
    message: "Vibration Anomaly detected",
    severity: "INFO",
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 hari lalu
    machine_id: 3,
    machine: {
      id: 3,
      name: "CNC Lathe 03",
      aset_id: "M-003",
      status: "HEALTHY" as MachineStatus
    }
  }
];

// Data Dummy Sederhana untuk keperluan testing jika DB kosong
export const MOCK_MACHINES = [
    {
        id: 1,
        aset_id: "M-001",
        name: "CNC Milling Machine 01",
        status: "HEALTHY" as MachineStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 2,
        aset_id: "M-002",
        name: "Hydraulic Press 50T",
        status: "WARNING" as MachineStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 3,
        aset_id: "M-003",
        name: "CNC Lathe 03",
        status: "HEALTHY" as MachineStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];