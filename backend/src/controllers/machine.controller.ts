import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/machines
export const getMachines = async (req: Request, res: Response) => {
  try {
    const machinesList = await prisma.machines.findMany({
      orderBy: { name: 'asc' },
      include: {
        // Include alerts agar FE tahu status detailnya
        alerts: {
            where: { severity: 'CRITICAL' }, 
            take: 1
        }
      }
    });
    
    // Optional: Mapping ke camelCase jika Frontend Anda menggunakan 'asetId' bukan 'aset_id'
    const formatted = machinesList.map(m => ({
      id: m.id,
      asetId: m.aset_id, // Map aset_id -> asetId
      name: m.name,
      status: m.status,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
      alerts: m.alerts
    }));
    
    res.json(formatted);
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

    // LOGIC: Cek apakah inputnya Angka (Internal ID) atau String (Aset ID)
    if (!isNaN(Number(id))) {
        // Kalau angka (misal: 1), cari by internal ID
        machine = await prisma.machines.findUnique({ 
            where: { id: Number(id) } 
        });
    } else {
        // Kalau string (misal: M-14850), cari by aset_id
        machine = await prisma.machines.findUnique({ 
            where: { aset_id: String(id) } 
        });
    }

    if (!machine) return res.status(404).json({ error: "Machine not found" });
    
    // Return dengan format yang konsisten (bisa dimap jika perlu)
    res.json({
        ...machine,
        asetId: machine.aset_id // Tambahan helper field untuk FE
    });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/machines/:id/history
export const getMachineHistory = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "Machine ID is required" });

  try {
    // Variabel penampung TARGET STRING (aset_id)
    let targetAsetId: string;

    if (!isNaN(Number(id))) {
      // Skenario 1: User input Angka (ID Internal, misal: 1)
      // Kita harus cari "aset_id" string-nya (misal: "M-14850")
      const machine = await prisma.machines.findUnique({
        where: { id: Number(id) },
        select: { aset_id: true }
      });
      
      if (!machine) return res.status(404).json({ error: "Machine not found" });
      targetAsetId = machine.aset_id;

    } else {
      // Skenario 2: User input String (misal: "M-14850")
      targetAsetId = String(id);
    }

    // QUERY DATABASE
    const rows = await prisma.sensor_data.findMany({
      where: { 
        // ✅ Pasca 'npx prisma generate', ini akan menerima String tanpa error
        machine_id: targetAsetId 
      },
      take: 100,
      orderBy: { insertion_time: 'desc' }
    });

    // MAPPING DATA
    const history = rows.map((r) => ({
      id: r.id,
      machineId: r.machine_id,
      type: r.type,
      air_temperature_k: r.air_temperature_k,
      process_temperature_k: r.process_temperature_k,
      rotational_speed_rpm: r.rotational_speed_rpm,
      torque_nm: r.torque_nm,
      tool_wear_min: r.tool_wear_min,
      timestamp: r.insertion_time.toISOString(),
    })).reverse();

    res.json(history);
  } catch (error) {
    console.error("Error history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};