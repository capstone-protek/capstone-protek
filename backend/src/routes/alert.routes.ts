// src/routes/alert.routes.ts

import { Router } from 'express';
import { getAllAlerts } from '../controllers/alert.controller';

const router = Router();

// URL: /api/alerts/
// Method: GET
// Action: panggil controller getAllAlerts
router.get('/', getAllAlerts);

// (Nanti Anda bisa tambahkan router.get('/:id', getAlertById), dll.)

export default router;