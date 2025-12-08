import { Router } from 'express';
import { predictMaintenance } from '../controllers/predict.controller';

const router = Router();

// POST /api/predict
router.post('/', predictMaintenance);

export default router;