import { Router } from 'express';
import { createPrediction, getLatestPrediction } from '../controllers/predict.controller';

const router = Router();


router.post('/', createPrediction);

// Endpoint untuk mengambil prediksi terakhir
// Hasil URL: http://localhost:4000/api/predict/latest/M-14850
router.get('/latest/:machineId', getLatestPrediction);

export default router;