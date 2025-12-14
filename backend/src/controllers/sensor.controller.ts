// backend/src/controllers/sensor.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/sensor-data/:machineId
export const getSensorData = async (req: Request, res: Response) => {
  try {
    const { machineId } = req.params;
    
    if (!machineId) {
      return res.status(400).json({ error: "Machine ID is required" });
    }
    
    // Ambil data sensor_data berdasarkan machine_id
    // Limit 50 data terakhir dan urutkan berdasarkan insertion_time
    const sensorData = await prisma.sensor_data.findMany({
      where: { 
        machine_id: parseInt(machineId) 
      },
      orderBy: { 
        insertion_time: 'desc' 
      },
      take: 50
    });

    // Reverse agar data lama ke baru (untuk chart dari kiri ke kanan)
    res.json(sensorData.reverse());

  } catch (error) {
    console.error("Error fetching sensor data:", error);
    res.status(500).json({ error: "Failed to fetch sensor data" });
  }
};

// GET /api/sensor-data/machine/:asetId (berdasarkan asetId seperti "M-14850")
export const getSensorDataByAsetId = async (req: Request, res: Response) => {
  try {
    const { asetId } = req.params;
    
    if (!asetId) {
      return res.status(400).json({ error: "Asset ID is required" });
    }
    
    // Cari machine berdasarkan asetId untuk mendapatkan ID numerik
    const machine = await prisma.machine.findUnique({
      where: { 
        asetId: asetId 
      }
    });

    if (!machine) {
      return res.status(404).json({ error: "Machine not found" });
    }

    // Ambil data sensor_data berdasarkan machine_id
    const sensorData = await prisma.sensor_data.findMany({
      where: { 
        machine_id: machine.id 
      },
      orderBy: { 
        insertion_time: 'desc' 
      },
      take: 50
    });

    // Reverse agar data lama ke baru (untuk chart dari kiri ke kanan)
    res.json(sensorData.reverse());

  } catch (error) {
    console.error("Error fetching sensor data by asetId:", error);
    res.status(500).json({ error: "Failed to fetch sensor data" });
  }
};