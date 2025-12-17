import { Request, Response } from 'express';
import { PrismaClient, MachineStatus } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/dashboard/stats
// Mengambil ringkasan jumlah mesin berdasarkan status
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Hitung total mesin
    const totalMachines = await prisma.machines.count();

    // Hitung berdasarkan status (Group By)
    const statusCounts = await prisma.machines.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    // Format data agar mudah dibaca Frontend
    // Default 0 jika tidak ada data
    const stats = {
      total: totalMachines,
      healthy: 0,
      warning: 0,
      critical: 0,
      offline: 0,
    };

    statusCounts.forEach((item) => {
      if (item.status === MachineStatus.HEALTHY) stats.healthy = item._count.status;
      if (item.status === MachineStatus.WARNING) stats.warning = item._count.status;
      if (item.status === MachineStatus.CRITICAL) stats.critical = item._count.status;
      if (item.status === MachineStatus.OFFLINE) stats.offline = item._count.status;
    });

    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

// GET /api/dashboard/machines
// List mesin untuk tabel dashboard utama
export const getDashboardMachines = async (req: Request, res: Response) => {
  try {
    const machines = await prisma.machines.findMany({
      orderBy: {
        // Urutkan: Critical paling atas, lalu Warning, dst.
        status: 'asc', 
      },
      select: {
        id: true,
        machine_id: true, // PERBAIKAN UTAMA: Ganti aset_id jadi machine_id
        name: true,
        status: true,
        updated_at: true,
        
        // Ambil prediksi terakhir untuk ditampilkan di tabel (Opsional)
        prediction_results: {
          take: 1,
          orderBy: { prediction_time: 'desc' },
          select: {
            risk_probability: true,
            rul_estimate: true,
          }
        }
      }
    });

    res.json(machines);
  } catch (error) {
    console.error("Error fetching dashboard machines:", error);
    res.status(500).json({ error: "Failed to fetch machines list" });
  }
};