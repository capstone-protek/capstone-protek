import { Request, Response } from 'express';

// Base URL ML dari env atau default
// Pastikan tidak ada trailing slash '/' di sini untuk konsistensi
const ML_API_URL =
  process.env.ML_API_URL || 'https://api-protek-production.up.railway.app';

/**
 * POST /api/simulation/start
 * Memulai simulasi.
 */
export async function startSimulation(req: Request, res: Response) {
  try {
    const targetUrl = `${ML_API_URL}/api/simulation/start`;
    console.log(`[Simulation] Starting... Target: ${targetUrl}`);

    // --- FIX: SAFE BODY CHECK ---
    const bodyData = req.body || {};
    const payload = Object.keys(bodyData).length > 0 ? bodyData : {};

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Cek jika response bukan JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error(`[Simulation] Non-JSON response: ${text}`);
      throw new Error(`ML API error (non-json): ${text.substring(0, 100)}...`);
    }

    // --- FIX TYPE ERROR: Gunakan ': any' agar TypeScript tidak rewel ---
    const data: any = await response.json();

    if (response.ok) {
      return res.status(200).json(data);
    } else {
      // Logic khusus: Jika 400 (Simulasi sudah jalan), log biasa saja
      if (response.status === 400) {
        // Karena 'data' sudah 'any', kita bisa akses .message dengan aman
        console.log(`[Simulation] Info: ${data.message || 'Simulasi sudah berjalan.'}`);
      } else {
        console.warn(`[Simulation] ML API returned error status: ${response.status}`);
      }
      return res.status(response.status).json(data);
    }
  } catch (error: any) {
    console.error('[Simulation] Error starting simulation:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to trigger simulation start',
      error: error.message,
      hint: 'Ensure ML_API_URL is correct and the Python endpoint exists.'
    });
  }
}

/**
 * GET /api/simulation/stop
 * Menghentikan simulasi.
 */
export async function stopSimulation(req: Request, res: Response) {
  try {
    const targetUrl = `${ML_API_URL}/api/simulation/stop`;
    console.log(`[Simulation] Stopping... Target: ${targetUrl}`);

    const response = await fetch(targetUrl, { method: 'GET' });

    // Cek Content Type
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      return res.status(response.status).json({ message: text });
    }

    // --- FIX DI SINI: Gunakan ': any' ---
    const data: any = await response.json(); 

    if (response.ok) {
      return res.status(200).json(data);
    } else {
      // Handling 400 (Sudah stop)
      if (response.status === 400) {
         // Sekarang aman mengakses .message karena tipe data 'any'
         console.log(`[Simulation] Info: ${data.message || 'Simulasi sudah berhenti.'}`);
      } else {
         console.warn(`[Simulation] Error Stop: ${response.status}`);
      }
      return res.status(response.status).json(data);
    }
  } catch (error: any) {
    console.error('[Simulation] Error stopping simulation:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to trigger simulation stop',
      error: error.message,
    });
  }
}

/**
 * GET /api/simulation/status
 * Proxy Realtime ke Python API
 */
export async function getSimulationStatus(req: Request, res: Response) {
  try {
    const targetUrl = `${ML_API_URL}/api/simulation/status`;
    
    // Timeout 5 detik agar tidak hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(targetUrl, { 
        method: 'GET',
        signal: controller.signal
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        return res.status(200).json({ is_running: false, message: "ML API not returning JSON" });
    }

    // --- FIX TYPE ERROR: Gunakan ': any' ---
    const data: any = await response.json();
    
    return res.status(response.status).json(data);

  } catch (error: any) {
    // Jika koneksi ke Python gagal, return is_running: false (Safe Mode)
    return res.status(200).json({
      status: 'success', 
      is_running: false, 
      message: 'ML API unreachable',
      error: error.message,
    });
  }
}