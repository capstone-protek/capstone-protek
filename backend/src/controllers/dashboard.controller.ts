import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
// Import tipe response agar sinkron dengan Frontend
import { DashboardSummaryResponse } from '../types'; 

const prisma = new PrismaClient();

// GET /api/dashboard/stats - Dashboard Statistics (4 Cards)
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. Total Machines - COUNT(*) dari tabel machines
    const totalMachines = await prisma.machines.count();

    // 2. Today's Alerts - COUNT(*) dari tabel alerts dimana created_at = hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysAlerts = await prisma.alerts.count({
      where: {
        timestamp: {
          gte: today
        }
      }
    });

    // 3. Critical Machines - COUNT(*) dari tabel prediction_results 
    // (ambil row terbaru tiap mesin) dimana pred_status = 'Potential Failure'
    // Logic: Ambil latest prediction per machine_id yang memiliki status 'Potential Failure'
    const criticalPredictions = await prisma.prediction_results.findMany({
      // Ambil semua predictions
      select: {
        machine_id: true,
        pred_status: true,
        prediction_time: true
      },
      orderBy: {
        prediction_time: 'desc'
      }
    });

    // Group by machine_id dan ambil yang terbaru (sudah sorted desc)
    const latestPredictionPerMachine = new Map();
    criticalPredictions.forEach(pred => {
      if (!latestPredictionPerMachine.has(pred.machine_id)) {
        latestPredictionPerMachine.set(pred.machine_id, pred);
      }
    });

    // Hitung mesin yang critical (pred_status contains 'Potential Failure')
    const criticalMachines = Array.from(latestPredictionPerMachine.values()).filter(
      pred => pred.pred_status?.includes('Potential Failure')
    ).length;

    // 4. System Health - (Total Mesin - Critical Mesin) / Total Mesin * 100%
    const systemHealth = totalMachines > 0 
      ? Math.round(((totalMachines - criticalMachines) / totalMachines) * 100)
      : 100;

    res.json({
      total_machines: totalMachines,
      todays_alerts: todaysAlerts,
      critical_machines: criticalMachines,
      system_health: systemHealth
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    // 1. Hitung Total Mesin
    const totalMachines = await prisma.machines.count();

    // 2. Hitung Mesin "Bermasalah" (CRITICAL atau WARNING)
    // Logic: Kalau ada 1 mesin warning, dashboard harus kasih sinyal.
    const criticalMachines = await prisma.machines.count({
      where: {
        status: {
          in: ['CRITICAL', 'WARNING'] 
        }
      }
    });

    // 3. Hitung Alert Hari Ini (Start of Day 00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysAlerts = await prisma.alerts.count({
      where: {
        timestamp: {
          gte: today
        }
      }
    });

    // 4. Ambil 5 Alert Terakhir (Untuk List "Recent Activity")
    // Kita include 'machine' agar FE bisa tampilkan nama mesinnya
    const recentAlerts = await prisma.alerts.findMany({
      take: 5,
      orderBy: {
        timestamp: 'desc'
      },
      include: {
        machine: {
          select: {
            name: true,
            aset_id: true
          }
        }
      }
    });

    // 5. Kalkulasi Health Score (0 - 100%)
    // Rumus MVP: 100% dikurangi (15% per mesin yang bermasalah)
    // Contoh: 2 mesin rusak = 100 - 30 = 70% Health
    const systemHealth = Math.max(0, 100 - (criticalMachines * 15));

    // 6. Susun Response sesuai Kontrak 'DashboardSummaryResponse'
    const responseData: DashboardSummaryResponse = {
      summary: {
        totalMachines,
        criticalMachines,
        todaysAlerts,
        systemHealth
      },
      // Casting any diperlukan sedikit karena Prisma return Date object, 
      // sedangkan Interface kita bisa string ISO. Tapi ini aman untuk JSON.
      recentAlerts: recentAlerts as any 
    };

    res.json(responseData);

  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
};