import { Request, Response } from 'express';

// In-memory simulation state
let isSimulationRunning = false;

/**
 * GET /api/simulation/status
 * Return the current simulation status
 */
export const getSimulationStatus = async (req: Request, res: Response) => {
  try {
    return res.json({
      status: 'success',
      isRunning: isSimulationRunning,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Simulation Status Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch simulation status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST /api/simulation/control
 * Control simulation: start or pause
 * Body: { action: 'start' | 'pause' }
 */
export const controlSimulation = async (req: Request, res: Response) => {
  try {
    const { action } = req.body as { action: string };

    if (!action) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required field: action',
      });
    }

    if (action === 'start') {
      if (isSimulationRunning) {
        return res.status(400).json({
          status: 'error',
          message: 'Simulation is already running',
        });
      }
      isSimulationRunning = true;
      console.log('✅ Simulation STARTED');
      return res.json({
        status: 'success',
        message: 'Simulation started successfully',
        isRunning: isSimulationRunning,
        timestamp: new Date().toISOString(),
      });
    } else if (action === 'pause') {
      if (!isSimulationRunning) {
        return res.status(400).json({
          status: 'error',
          message: 'Simulation is not running',
        });
      }
      isSimulationRunning = false;
      console.log('⏸️  Simulation PAUSED');
      return res.json({
        status: 'success',
        message: 'Simulation paused successfully',
        isRunning: isSimulationRunning,
        timestamp: new Date().toISOString(),
      });
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid action. Must be "start" or "pause"',
      });
    }
  } catch (error) {
    console.error('❌ Simulation Control Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to control simulation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST /api/simulation/start
 * Trigger simulation start (alternative endpoint)
 */
export const startSimulation = async (req: Request, res: Response) => {
  try {
    if (isSimulationRunning) {
      return res.status(400).json({
        status: 'error',
        message: 'Simulation is already running',
      });
    }

    isSimulationRunning = true;
    console.log('✅ Simulation STARTED via /start endpoint');

    return res.json({
      status: 'success',
      message: 'Simulation started successfully',
      isRunning: isSimulationRunning,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Start Simulation Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to start simulation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/simulation/stop
 * Trigger simulation stop (alternative endpoint)
 */
export const stopSimulation = async (req: Request, res: Response) => {
  try {
    if (!isSimulationRunning) {
      return res.status(400).json({
        status: 'error',
        message: 'Simulation is not running',
      });
    }

    isSimulationRunning = false;
    console.log('⏹️  Simulation STOPPED via /stop endpoint');

    return res.json({
      status: 'success',
      message: 'Simulation stopped successfully',
      isRunning: isSimulationRunning,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Stop Simulation Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to stop simulation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
