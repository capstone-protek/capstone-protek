// backend/src/controllers/machine.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/machines
export const getMachines = async (req: Request, res: Response) => {
  try {
    const machines = await prisma.machine.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(machines);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch machines" });
  }
};

// GET /api/machines/:id
export const getMachineDetail = async (req: Request, res: Response) => {
  const { id } = req.params; 
  try {
    const machine = await prisma.machine.findUnique({
      where: { id: Number(id) }, // Convert string ID dari URL ke Integer
    });
    if (!machine) return res.status(404).json({ error: "Machine not found" });
    res.json(machine);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/machines/:id/history
export const getMachineHistory = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const history = await prisma.sensorHistory.findMany({
      where: { machineId: Number(id) },
      take: 100, // Limit 100 data terakhir biar ringan
      orderBy: { timestamp: 'desc' }, // Ambil yang paling baru dulu
    });
    
    // Reverse biar frontend nerima urutan Lama -> Baru (Kiri ke Kanan grafik)
    res.json(history.reverse());
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
};