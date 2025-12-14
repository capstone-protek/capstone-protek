// backend/src/routes/sensor.routes.ts
import { Router } from 'express';
import { getSensorData, getSensorDataByAsetId } from '../controllers/sensor.controller';

const router = Router();

// GET /api/sensor-data/:machineId (berdasarkan ID numerik)
router.get('/:machineId', getSensorData);

// GET /api/sensor-data/machine/:asetId (berdasarkan asetId seperti "M-14850")
router.get('/machine/:asetId', getSensorDataByAsetId);

export default router;