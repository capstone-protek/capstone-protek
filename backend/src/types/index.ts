/*
 * ==========================================================
 * KONTRAK API v2 (VALID) - Proyek A25-CS050
 * ==========================================================
 * Ini adalah satu-satunya sumber kebenaran.
 * Tim Backend WAJIB mengembalikan data sesuai interface ini.
 * Tim Frontend WAJIB membaca data sesuai interface ini.
 *
 * File ini HARUS disalin-tempel ke:
 * 1. /backend/src/types/index.ts
 * 2. /frontend/src/types/index.ts
 * ==========================================================
 */

// ==========================================================
// 1. TIPE DATA & ENUM BERSAMA
// ==========================================================

/**
 * Prioritas Peringatan.
 * Dihitung oleh logika bisnis di Backend berdasarkan probabilitas ML.
 */
export type AlertPriority = 'KRITIS' | 'TINGGI' | 'SEDANG' | 'RENDAH';

/**
 * Status Kesehatan Mesin.
 * Dihitung oleh logika bisnis di Backend.
 */
export type MachineStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OFFLINE';

// ==========================================================
// 2. KONTRAK INTERNAL (ML-KE-BE)
// ==========================================================
// Ini adalah kontrak yang DIKONSUMSI oleh Backend dari API ML (FastAPI)

/**
 * Body request yang dikirim BE ke ML API (POST /predict)
 */
export interface PredictRequestML {
  asetId: string;
  airTemp: number;
  processTemp: number;
  rpm: number;
  torque: number;
  toolWear: number;
}

/**
 * Body response yang diterima BE dari ML API (POST /predict)
 */
export interface PredictResponseML {
  asetId: string;
  failureType: string; // Misal: "No Failure", "Tool Wear Failure", "Overheat"
  probability: number; // Angka 0.0 - 1.0
}

// ==========================================================
// 3. KONTRAK UTAMA (BE-KE-FE)
// ==========================================================
// Ini adalah kontrak yang DISEDIAKAN oleh Backend (Express) untuk Frontend (React)

/**
 * Struktur data utama untuk sebuah Peringatan (Alert).
 *
 * Digunakan di:
 * - GET /api/alerts (sebagai array: Alert[])
 * - GET /api/alerts/:id (sebagai objek tunggal: Alert)
 * - Sebagai bagian dari DashboardSummary
 */
export interface Alert {
  id: string; // ID unik untuk peringatan (dibuat oleh BE, misal: UUID)
  asetId: string; // ID mesin, misal: "M-14850"
  timestamp: string; // Kapan peringatan ini dibuat (ISO 8601 String)

  // Data Inti dari Model ML
  diagnosis: string; // Nama kegagalan, misal: "Tool Wear Failure"
  probabilitas: number; // Angka 0.0 - 1.0 (misal: 0.95)

  // Data yang Diturunkan oleh BE
  priority: AlertPriority; // Misal: "KRITIS" (jika probabilitas > 0.9)

  // Data pendukung untuk ditampilkan di "Lihat Detail"
  // Ini adalah "snapshot" sensor saat kegagalan diprediksi
  sensorDataTerkait: {
    airTemp: number;
    processTemp: number;
    rpm: number;
    torque: number;
    toolWear: number;
  };
}

/**
 * Ringkasan untuk halaman Dashboard.
 *
 * Digunakan di:
 * - GET /api/dashboard/summary
 */
export interface DashboardSummary {
  totalMachines: number;
  criticalAlertsCount: number;
  offlineMachinesCount: number;
  recentCriticalAlerts: Alert[]; // Array dari 3-5 peringatan KRITIS terbaru
}

/**
 * Ringkasan untuk satu mesin (untuk daftar mesin).
 *
 * Digunakan di:
 * - GET /api/machines (sebagai array: MachineSummary[])
 */
export interface MachineSummary {
  asetId: string;
  name: string; // Nama mesin yang mudah dibaca, misal: "CNC Grinder 01"
  status: MachineStatus;
}

/**
 * Data detail untuk satu mesin (untuk halaman detail mesin).
 *
 * Digunakan di:
 * - GET /api/machines/:id
 */
export interface MachineDetails {
  asetId: string;
  name: string;
  status: MachineStatus;
  lastReading: {
    timestamp: string; // ISO 8601 String
    airTemp: number;
    processTemp: number;
    rpm: number;
    torque: number;
    toolWear: number;
  };
}

/**
 * Struktur data untuk riwayat sensor (untuk grafik).
 *
 * Digunakan di:
 * - GET /api/machines/:id/history
 */
export interface SensorHistory {
  asetId: string;
  readings: {
    timestamp: string; // ISO 8601 String
    torque: number;
    toolWear: number;
    rpm: number;
    processTemp: number;
    airTemp: number;
  }[]; // Array dari data time-series historis
}

/**
 * Body request untuk endpoint prediksi (simulasi data real-time).
 *
 * Digunakan di:
 * - POST /api/predict
 */
export interface PredictRequestBodyFE {
  asetId: string;
  airTemp: number;
  processTemp: number;
  rpm: number;
  torque: number;
  toolWear: number;
}

/**
 * Body response dari endpoint prediksi.
 *
 * Digunakan di:
 * - POST /api/predict
 */
export interface PredictResponseBodyFE {
  status: 'OK' | 'ALERT_CREATED'; // 'OK' jika tidak ada kegagalan, 'ALERT_CREATED' jika peringatan baru dibuat
  alert?: Alert; // Jika status ALERT_CREATED, kembalikan data peringatan baru
}

/**
 * Body response dari Chatbot Sederhana.
 *
 * Dig"unakan di:
 * - GET /api/chat?q=...
 */
export interface ChatResponseBody {
  query: string; // Pertanyaan asli dari user
  response: string; // Jawaban dalam bentuk teks sederhana
  
  // Opsional: Data terstruktur agar FE bisa render link/card
  relatedData?: {
    type: 'machine' | 'alert';
    id: string; // asetId or alert.id
  };
}