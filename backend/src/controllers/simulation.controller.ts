import { Request, Response } from 'express';

// Base URL untuk ML API
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

/**
 * POST /api/simulation/start
 * Memulai simulasi dengan memanggil ML API
 */
export async function startSimulation(req: Request, res: Response) {
  try {
    const response = await fetch(`${ML_API_URL}/api/start-simulation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json(data);
    } else {
      return res.status(response.status).json(data);
    }
  } catch (error: any) {
    console.error('Error starting simulation:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to start simulation',
      error: error.message,
    });
  }
}

/**
 * GET /api/simulation/stop
 * Menghentikan simulasi dengan memanggil ML API
 */
export async function stopSimulation(req: Request, res: Response) {
  try {
    const response = await fetch(`${ML_API_URL}/api/stop-simulation`, {
      method: 'GET',
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json(data);
    } else {
      return res.status(response.status).json(data);
    }
  } catch (error: any) {
    console.error('Error stopping simulation:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to stop simulation',
      error: error.message,
    });
  }
}

/**
 * GET /api/simulation/status
 * Mendapatkan status simulasi dari ML API
 */
export async function getSimulationStatus(req: Request, res: Response) {
  try {
    // Untuk saat ini, return status sederhana
    // Nanti bisa ditambahkan endpoint di ML API untuk query status
    return res.status(200).json({
      status: 'success',
      message: 'Status endpoint not yet implemented in ML API',
      note: 'Check ML API logs for simulation progress',
    });
  } catch (error: any) {
    console.error('Error getting simulation status:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get simulation status',
      error: error.message,
    });
  }
}
