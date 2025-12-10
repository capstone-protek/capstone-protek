import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller';

const router = Router();

// GET /api/dashboard/summary
// Endpoint ini akan dipanggil saat Ulil (FE) pertama kali buka halaman Home
router.get('/summary', getDashboardSummary);

export default router;