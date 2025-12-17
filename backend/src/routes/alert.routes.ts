import { Router } from 'express';
import { getAllAlerts, getAlertsByMachine } from '../controllers/alert.controller';

const router = Router();

// URL: /api/alerts
router.get('/', getAllAlerts);

// URL: /api/alerts/machine/M-14850
// Untuk menampilkan history alert di halaman detail mesin
router.get('/machine/:machineId', getAlertsByMachine);

export default router;