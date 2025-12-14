import { Router } from 'express';
import {
  getChartHistory,
  getChartLatest,
  getDashboardStats,
  getRecentAlerts,
} from '../controllers/dashboard.controller';

const router = Router();

/**
 * GET /api/dashboard/chart-history
 * Fetch the last 50 data points for the main chart
 * Query params: ?machineId=M-14850 (optional, defaults to M-14850)
 */
router.get('/chart-history', getChartHistory);

/**
 * GET /api/dashboard/chart-latest
 * Fetch the latest data point for realtime polling
 * Query params: ?machineId=M-14850 (optional, defaults to M-14850)
 */
router.get('/chart-latest', getChartLatest);

/**
 * GET /api/dashboard/stats
 * Fetch dashboard statistics (total machines, critical machines, today's alerts, system health)
 */
router.get('/stats', getDashboardStats);

/**
 * GET /api/dashboard/alerts
 * Fetch recent alerts
 * Query params: ?limit=10 (optional, defaults to 10)
 */
router.get('/alerts', getRecentAlerts);

export default router;