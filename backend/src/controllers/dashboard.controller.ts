import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
// Import tipe response agar sinkron dengan Frontend
import { DashboardSummaryResponse } from '../types'; 

const prisma = new PrismaClient();

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    // 1. Hitung Total Mesin
    const totalMachines = await prisma.machine.count();

    // 2. Hitung Mesin "Bermasalah" (CRITICAL atau WARNING)
    // Logic: Kalau ada 1 mesin warning, dashboard harus kasih sinyal.
    const criticalMachines = await prisma.machine.count({
      where: {
        status: {
          in: ['CRITICAL', 'WARNING'] 
        }
      }
    });

    // 3. Hitung Alert Hari Ini (Start of Day 00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysAlerts = await prisma.alert.count({
      where: {
        timestamp: {
          gte: today
        }
      }
    });

    // 4. Ambil 5 Alert Terakhir (Untuk List "Recent Activity")
    // Kita include 'machine' agar FE bisa tampilkan nama mesinnya
    const recentAlerts = await prisma.alert.findMany({
      take: 5,
      orderBy: {
        timestamp: 'desc'
      },
      include: {
        machine: {
          select: {
            name: true,
            asetId: true
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

export const getDashboardTrend = async (req: Request, res: Response) => {
  try {
    // Ambil 20 data prediksi terakhir dari database
    const history = await prisma.predictionResult.findMany({
      take: 20,
      orderBy: { prediction_time: 'desc' },
      select: {
        prediction_time: true,
        failure_prob: true,
        machineId: true
      }
    });

    // Format data agar mudah dibaca Recharts di frontend
    // Kita balik urutannya (reverse) agar grafik jalan dari kiri (lama) ke kanan (baru)
    const chartData = history.reverse().map(item => ({
      time: new Date(item.prediction_time).toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: "2-digit", 
        minute: "2-digit",
        second: "2-digit"
      }),
      // Konversi probabilitas gagal (0.05) menjadi health score (95)
      healthScore: Math.round(100 - ((item.failure_prob || 0) * 100)),
      machineId: item.machineId
    }));

    res.json(chartData);

  } catch (error) {
    console.error("Error fetching trend:", error);
    res.status(500).json({ error: "Failed to fetch trend data" });
  }
};

// ... import prisma dan lain-lain
