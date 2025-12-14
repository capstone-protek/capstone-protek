import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/dashboard/chart-history
 * Fetch the last 50 data points for the main chart (sensor_data + prediction_results)
 */
export const getChartHistory = async (req: Request, res: Response) => {
  try {
    const machineAsetId = (req.query.machineId as string) || 'M-14850';

    // Lookup numeric machine_id from aset_id
    const machine = await prisma.machines.findUnique({
      where: { aset_id: machineAsetId },
      select: { id: true }
    });

    if (!machine) {
      return res.status(404).json({
        status: 'error',
        message: 'Machine not found',
      });
    }

    const machineId = machine.id;

    // Use $queryRaw to JOIN sensor_data and prediction_results
    // ON s.machine_id = p.machine_id AND s.insertion_time = p.prediction_time
    const results = await prisma.$queryRaw<
      Array<{
        time: Date;
        val_torque: number;
        val_rpm: number;
        val_temp: number;
        status: string;
        risk: string;
      }>
    >`
      SELECT
        s.insertion_time AS time,
        s.torque_nm AS val_torque,
        s.rotational_speed_rpm AS val_rpm,
        s.air_temperature_k AS val_temp,
        COALESCE(p.pred_status, 'NORMAL') AS status,
        COALESCE(p.risk_probability, '0%') AS risk
      FROM sensor_data s
      LEFT JOIN prediction_results p
        ON s.machine_id = p.machine_id
        AND s.insertion_time = p.prediction_time
      WHERE s.machine_id = ${machineId}
      ORDER BY s.insertion_time DESC
      LIMIT 50
    `;

    // Reverse to get chronological order
    const reversed = results.reverse();

    return res.json({
      status: 'success',
      machine_id: machineAsetId,
      count: reversed.length,
      data: reversed,
    });
  } catch (error) {
    console.error('❌ Dashboard Chart History Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch chart history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/dashboard/chart-latest
 * Fetch the latest data point for realtime polling (every 1s)
 */
export const getChartLatest = async (req: Request, res: Response) => {
  try {
    const machineAsetId = (req.query.machineId as string) || 'M-14850';

    // Lookup numeric machine_id from aset_id
    const machine = await prisma.machines.findUnique({
      where: { aset_id: machineAsetId },
      select: { id: true }
    });

    if (!machine) {
      return res.status(404).json({
        status: 'error',
        message: 'Machine not found',
      });
    }

    const machineId = machine.id;

    // Same JOIN logic but LIMIT 1, ORDER DESC to get the latest
    const results = await prisma.$queryRaw<
      Array<{
        time: Date;
        val_torque: number;
        val_rpm: number;
        val_temp: number;
        status: string;
        risk: string;
      }>
    >`
      SELECT
        s.insertion_time AS time,
        s.torque_nm AS val_torque,
        s.rotational_speed_rpm AS val_rpm,
        s.air_temperature_k AS val_temp,
        COALESCE(p.pred_status, 'NORMAL') AS status,
        COALESCE(p.risk_probability, '0%') AS risk
      FROM sensor_data s
      LEFT JOIN prediction_results p
        ON s.machine_id = p.machine_id
        AND s.insertion_time = p.prediction_time
      WHERE s.machine_id = ${machineId}
      ORDER BY s.insertion_time DESC
      LIMIT 1
    `;

    const latest = results.length > 0 ? results[0] : null;

    return res.json({
      status: 'success',
      machine_id: machineAsetId,
      data: latest,
    });
  } catch (error) {
    console.error('❌ Dashboard Chart Latest Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch latest chart data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/dashboard/stats
 * Return counts and metrics for dashboard cards
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. Count total machines
    const totalMachines = await prisma.machines.count();

    // 2. Count alerts from today (00:00:00 UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todaysAlerts = await prisma.alerts.count({
      where: {
        timestamp: {
          gte: today,
        },
      },
    });

    // 3. Count critical machines
    const criticalMachines = await prisma.machines.count({
      where: {
        status: 'CRITICAL',
      },
    });

    // 4. Calculate system health percentage
    const systemHealth =
      totalMachines > 0
        ? ((totalMachines - criticalMachines) / totalMachines) * 100
        : 100;

    return res.json({
      status: 'success',
      summary: {
        totalMachines,
        criticalMachines,
        todaysAlerts,
        systemHealth: Math.round(systemHealth * 100) / 100, // Round to 2 decimals
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Dashboard Stats Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/dashboard/alerts
 * Fetch recent alerts with machine information
 */
export const getRecentAlerts = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const alerts = await prisma.alerts.findMany({
      include: {
        machine: {
          select: {
            aset_id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    return res.json({
      status: 'success',
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    console.error('❌ Fetch Recent Alerts Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch recent alerts',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};