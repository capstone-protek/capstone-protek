// backend/src/routes/machine.routes.ts
import { Router } from 'express';
import { getMachines, getMachineDetail, getMachineHistory } from '../controllers/machine.controller';

const router = Router();

router.get('/', getMachines);           // Akses: /api/machines
router.get('/:id', getMachineDetail);   // Akses: /api/machines/1
router.get('/:id/history', getMachineHistory);

export default router;