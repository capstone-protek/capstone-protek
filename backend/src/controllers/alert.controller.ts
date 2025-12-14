// src/controllers/alert.controller.ts

// (Pastikan Anda menggunakan Request, Response dari express)
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/alerts - Alert History (Table)
// Menampilkan daftar riwayat kerusakan/alert dengan limit 100
export const getAllAlerts = async (req: Request, res: Response) => {
  try {
    // Query DB: SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 100
    const alerts = await prisma.alerts.findMany({
      take: 100,
      orderBy: {
        timestamp: 'desc'
      },
      include: {
        // Include machine info agar FE bisa tampilkan nama mesinnya
        machine: {
          select: {
            id: true,
            aset_id: true,
            name: true
          }
        }
      }
    });

    // Format response sesuai contract
    const formattedAlerts = alerts.map(alert => ({
      id: alert.id,
      machine_id: alert.machine_id,
      machine_name: alert.machine?.name || 'Unknown',
      message: alert.message,
      severity: alert.severity,
      timestamp: alert.timestamp
    }));

    res.status(200).json({
      alerts: formattedAlerts
    });

  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
};

// (Buat juga controller untuk endpoint lain, misal machine.controller.ts, dll.)