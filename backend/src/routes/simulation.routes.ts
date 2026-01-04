import { Router } from 'express';
import {
  startSimulation,
  stopSimulation,
  getSimulationStatus,
} from '../controllers/simulation.controller';

const router = Router();

// POST /api/simulation/start
router.post('/start', startSimulation);

// POST /api/simulation/stop
router.post("/stop", stopSimulation);

// GET /api/simulation/status
router.get('/status', getSimulationStatus);

export default router;
