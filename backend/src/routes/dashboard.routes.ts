import { Router } from 'express';
import { getDashboardSummary, getDashboardStats } from '../controllers/dashboard.controller';

const router = Router();

// GET /api/dashboard/stats - Dashboard Statistics (4 Cards)
router.get('/stats', getDashboardStats);

// GET /api/dashboard/summary
// Endpoint ini akan dipanggil saat Ulil (FE) pertama kali buka halaman Home
router.get('/summary', getDashboardSummary);

export default router;