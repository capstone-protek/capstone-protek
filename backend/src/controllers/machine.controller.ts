import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/machines
export const getMachines = async (req: Request, res: Response) => {
  try {
    const machines = await prisma.machine.findMany({
      orderBy: { name: 'asc' },
      include: {
        // Include alerts biar FE tau status detailnya nanti
        alerts: {
            where: { severity: 'CRITICAL' }, 
            take: 1
        }
      }
    });
    res.json(machines);
  } catch (error) {
    console.error("Error fetching machines:", error);
    res.status(500).json({ error: "Failed to fetch machines" });
  }
};

// GET /api/machines/:id
export const getMachineDetail = async (req: Request, res: Response) => {
  const { id } = req.params; 
  
  if (!id) {
    return res.status(400).json({ error: "Machine ID is required" });
  }

  try {
    let machine;

    // LOGIC PINTAR: Cek apakah inputnya Angka atau String
    if (!isNaN(Number(id))) {
        // Kalau angka (misal: 1), cari by ID (convert ke Number)
        machine = await prisma.machine.findUnique({ 
            where: { id: Number(id) } 
        });
    } else {
        // Kalau string (misal: M-001), cari by asetId
        // FIX TS ERROR: Pakai String(id) biar TypeScript yakin ini string
        machine = await prisma.machine.findUnique({ 
            where: { asetId: String(id) } 
        });
    }

    if (!machine) return res.status(404).json({ error: "Machine not found" });
    
    res.json(machine);
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/machines/:id/history
export const getMachineHistory = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: "Machine ID is required" });
  }

  try {
    let machineIdInt: number;

    // 1. CARI ID MESIN YANG BENAR (INT)
    if (!isNaN(Number(id))) {
        machineIdInt = Number(id);
    } else {
        // Kalau request pakai "M-001", kita cari dulu ID aslinya
        // FIX TS ERROR: Pakai String(id)
        const machine = await prisma.machine.findUnique({
            where: { asetId: String(id) },
            select: { id: true } 
        });

        if (!machine) return res.status(404).json({ error: "Machine for history not found" });
        machineIdInt = machine.id;
    }

    // 2. QUERY HISTORY PAKAI ID INT YANG SUDAH DITEMUKAN
    const history = await prisma.sensorHistory.findMany({
      where: { machineId: machineIdInt },
      take: 50, // Limit 50 data terakhir
      orderBy: { timestamp: 'desc' }, 
    });
    
    // Reverse biar frontend nerima urutan Lama -> Baru (Kiri ke Kanan grafik)
    res.json(history.reverse());

  } catch (error) {
    console.error("Error history:", error); 
    res.status(500).json({ error: "Failed to fetch history" });
  }
};