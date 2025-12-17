import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Opsi include yang reusable (agar kodingan rapi)
const machineInclude = {
    sensor_data: {
        take: 1,
        orderBy: { insertion_time: 'desc' as const }
    },
    prediction_results: {
        take: 1,
        orderBy: { prediction_time: 'desc' as const }
    },
    alerts: {
        take: 5,
        orderBy: { timestamp: 'desc' as const }
    }
};

// GET /api/machines
export const getMachines = async (req: Request, res: Response) => {
  try {
    const machinesList = await prisma.machines.findMany({
      orderBy: { name: 'asc' },
      include: {
        alerts: {
            where: { severity: 'CRITICAL' }, 
            take: 1
        },
        prediction_results: {
            take: 1,
            orderBy: { prediction_time: 'desc' }
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
// Bisa menerima ID (Int: 1) atau Machine ID (String: "M-14850")
export const getMachineDetail = async (req: Request, res: Response) => {
  const { id } = req.params; 
  
  if (!id) return res.status(400).json({ error: "Machine identifier is required" });

  try {
    // Tentukan tipe pencarian untuk TypeScript
    const whereInput: Prisma.machinesWhereUniqueInput = !isNaN(Number(id))
        ? { id: Number(id) }              // Cari pakai Primary Key (Int)
        : { machine_id: String(id) };     // Cari pakai machine_id (String) -> DULU ASET_ID

    const machine = await prisma.machines.findUnique({ 
        where: whereInput,
        include: machineInclude
    });

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

  if (!id) return res.status(400).json({ error: "Machine identifier is required" });

  try {
    let targetMachineStringId: string;

    // Logic: Kita butuh String "M-14850" untuk query ke tabel sensor_data
    // (Karena di schema baru, relasinya pakai String)
    
    if (!isNaN(Number(id))) {
      // Jika user kirim angka (1), kita cari dulu string "M-14850"-nya
      const machine = await prisma.machines.findUnique({
        where: { id: Number(id) },
        select: { machine_id: true } // Ambil kolom machine_id
      });
      
      if (!machine) return res.status(404).json({ error: "Machine not found" });
      targetMachineStringId = machine.machine_id;
    } else {
      // Jika user sudah kirim string ("M-14850"), langsung pakai
      targetMachineStringId = String(id);
    }

    const rows = await prisma.sensor_data.findMany({
      where: { 
        machine_id: targetMachineStringId // Sekarang where-nya String
      },
      take: 100,
      orderBy: { insertion_time: 'desc' }
    });

    // Format Data untuk Frontend
    const history = rows.map(r => ({
      id: r.id,
      machineId: r.machine_id,
      timestamp: r.insertion_time, 
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