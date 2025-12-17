import { Router } from 'express';
// Import kedua fungsi yang baru kita buat di controller
import { getDashboardStats, getDashboardMachines } from '../controllers/dashboard.controller';

const router = Router();

// 1. Endpoint untuk Kartu Statistik (Total, Healthy, Critical, dll)
// URL: /api/dashboard/stats
router.get('/stats', getDashboardStats);

// 2. Endpoint untuk Tabel Daftar Mesin
// URL: /api/dashboard/machines
router.get('/machines', getDashboardMachines);

export default router;