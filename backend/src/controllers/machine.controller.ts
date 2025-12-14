import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/machines/list-lite - Untuk dropdown di dashboard
export const getMachinesLite = async (req: Request, res: Response) => {
  try {
    const machinesList = await prisma.machines.findMany({
      select: {
        aset_id: true,
        name: true
      },
      orderBy: { name: 'asc' }
    });

    // Map ke format yang diinginkan FE (id, name)
    const formattedList = machinesList.map(machine => ({
      id: machine.aset_id,
      name: machine.name
    }));

    res.json(formattedList);
  } catch (error) {
    console.error("Error fetching machines list:", error);
    res.status(500).json({ error: "Failed to fetch machines list" });
  }
};

// GET /api/machines
export const getMachines = async (req: Request, res: Response) => {
  try {
    const machinesList = await prisma.machines.findMany({
      orderBy: { name: 'asc' },
      include: {
        // Include alerts biar FE tau status detailnya nanti
        alerts: {
            where: { severity: 'CRITICAL' }, 
            take: 1
        }
      }
    });
    res.json(machinesList);
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
        machine = await prisma.machines.findUnique({ 
            where: { id: Number(id) } 
        });
    } else {
        // Kalau string (misal: M-001), cari by aset_id
        // FIX TS ERROR: Pakai String(id) biar TypeScript yakin ini string
        machine = await prisma.machines.findUnique({ 
            where: { aset_id: String(id) } 
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
// GET /api/machines/:id/history -> gunakan sensor_data
export const getMachineHistory = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Machine ID is required" });
  }

  try {
    let machineId: number;

    if (!isNaN(Number(id))) {
      // If numeric ID, use directly
      machineId = Number(id);
    } else {
      // If string (e.g., M-14850), lookup numeric ID from aset_id
      const machine = await prisma.machines.findUnique({
        where: { aset_id: String(id) },
        select: { id: true }
      });
      if (!machine) return res.status(404).json({ error: "Machine not found" });
      machineId = machine.id;
    }

    const rows = await prisma.sensor_data.findMany({
      where: { machine_id: machineId },
      take: 100,
      orderBy: { insertion_time: 'desc' }
    });

    // Map ke format FE SensorHistoryData lama jika diperlukan
    const history = rows.map((r: typeof rows[0]) => ({
      machineId: r.machine_id,
      timestamp: r.insertion_time as unknown as string,
      air_temperature_k: r.air_temperature_k,
      process_temperature_k: r.process_temperature_k,
      rotational_speed_rpm: r.rotational_speed_rpm,
      torque_nm: r.torque_nm,
      tool_wear_min: r.tool_wear_min,
      type: r.type,
    })).reverse();

    res.json(history);
  } catch (error) {
    console.error("Error history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};