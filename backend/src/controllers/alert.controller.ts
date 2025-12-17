import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/alerts
// Mengambil semua alert (biasanya untuk halaman notifikasi global)
export const getAllAlerts = async (req: Request, res: Response) => {
  try {
    const alerts = await prisma.alerts.findMany({
      orderBy: {
        timestamp: 'desc', // Alert terbaru paling atas
      },
      take: 50, // Batasi 50 terakhir agar tidak berat
      include: {
        machine: {
          select: {
            name: true,
            machine_id: true, // Supaya FE tau alert ini milik mesin mana
          },
        },
      },
    });

    res.status(200).json({ alerts });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ error: "Gagal mengambil data alerts" });
  }
};

// GET /api/alerts/machine/:machineId
// Mengambil alert spesifik untuk satu mesin (tampilan detail mesin)
export const getAlertsByMachine = async (req: Request, res: Response) => {
  const { machineId } = req.params;

  try {
    // Logic pencarian fleksibel (ID Int atau Machine ID String)
    let whereClause: any = { machine_id: String(machineId) }; // Default cari string "M-14850"

    // Jika frontend mengirim ID Integer (misal: 1), kita cari dulu string machine_id nya
    if (!isNaN(Number(machineId))) {
       const machine = await prisma.machines.findUnique({
           where: { id: Number(machineId) }
       });
       if(machine) {
           whereClause = { machine_id: machine.machine_id };
       }
    }

    const alerts = await prisma.alerts.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: 20
    });

    res.json(alerts);
  } catch (error) {
    console.error("Error fetching machine alerts:", error);
    res.status(500).json({ error: "Gagal mengambil alert mesin" });
  }
};