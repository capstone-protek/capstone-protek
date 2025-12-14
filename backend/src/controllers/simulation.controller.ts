import { Request, Response } from 'express';

// ============================================================
// ML SERVICE CONFIGURATION
// ============================================================
// LOCAL: http://localhost:8000 (untuk development & testing)
// PROD:  https://capstone-protek-production.up.railway.app (production)

const ML_SERVICE_ENV = process.env.ML_SERVICE_ENV || 'local';
const LOCAL_ML_URL = 'http://localhost:8000';
const PRODUCTION_ML_URL = 'https://capstone-protek-production.up.railway.app';

// Default ke local jika tidak ada env var
const ML_API_URL = process.env.ML_API_URL || LOCAL_ML_URL;

console.log(`[Simulation Controller] Initialized with ML_SERVICE_ENV=${ML_SERVICE_ENV}, ML_API_URL=${ML_API_URL}`);

/**
 * POST /api/simulation/start
 * Memulai simulasi.
 * Bertindak sebagai TRIGGER. Body opsional.
 */
export async function startSimulation(req: Request, res: Response) {
  try {
    const targetUrl = `${ML_API_URL}/api/simulation/start`;
    console.log(`[Simulation] Starting... Target: ${targetUrl}`);

    // --- FIX: SAFE BODY CHECK ---
    // Mencegah "Cannot convert undefined or null to object"
    const bodyData = req.body || {};
    const payload = Object.keys(bodyData).length > 0 ? bodyData : {};

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Cek jika response bukan JSON (misal HTML error)
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error(`[Simulation] Non-JSON response from ML API: ${text}`);
      throw new Error(`ML API error (non-json): ${text.substring(0, 100)}...`);
    }

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json(data);
    } else {
      console.warn(`[Simulation] ML API returned error status: ${response.status}`);
      return res.status(response.status).json(data);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Simulation] Error starting simulation:', errorMessage);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to trigger simulation start',
      error: errorMessage,
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

    // Cek content type
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error(`[Simulation] Non-JSON response from ML API: ${text}`);
      return res.status(response.status).json({ message: text });
    }

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json(data);
    } else {
      return res.status(response.status).json(data);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Simulation] Error stopping simulation:', errorMessage);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to trigger simulation stop',
      error: errorMessage,
    });
  }
}

/**
 * GET /api/simulation/status
 * Mendapatkan status simulasi
 */
export async function getSimulationStatus(req: Request, res: Response) {
  try {
    return res.status(200).json({
      status: 'success',
      message: 'Simulation functionality is ready (Trigger Mode)',
      note: 'Ensure Python backend has /api/start-simulation endpoint'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error getting simulation status:', errorMessage);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get simulation status',
      error: errorMessage,
    });
  }
}
