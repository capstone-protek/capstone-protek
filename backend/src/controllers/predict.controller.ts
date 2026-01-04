import { Request, Response } from 'express';
import { PrismaClient, MachineStatus } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/predict/result
// Endpoint ini menerima data hasil prediksi dari Python/ML
export const createPrediction = async (req: Request, res: Response) => {
  try {
    const { 
      machine_id,       // String: "M-14850"
      risk_probability, // Float: 0.85
      rul_estimate,     // String: "2 Jam"
      rul_minutes_val,  // Float: 120.0
      pred_status,      // String: "CRITICAL"
      failure_type,     // String: "Overheating"
      action,           // String: "Check Coolant"
      urgency           // String: "High"
    } = req.body;

    // 1. Validasi Input Dasar
    if (!machine_id) {
      return res.status(400).json({ error: "machine_id is required" });
    }

    // 2. Cek apakah mesin ada di Database Master
    // FIX TS2353: Ganti 'aset_id' menjadi 'machine_id'
    const machine = await prisma.machines.findUnique({
      where: { 
        machine_id: String(machine_id) 
      }
    });

    if (!machine) {
      return res.status(404).json({ error: `Machine with ID ${machine_id} not found` });
    }

    // 3. Simpan Hasil Prediksi ke Database
    // FIX TS2322: Pastikan tipe data sesuai schema (String ke String, Float ke Float)
    const newPrediction = await prisma.prediction_results.create({
      data: {
        machine_id: machine.machine_id, // String (Foreign Key merujuk ke machine_id)
        risk_probability: Number(risk_probability), // Ensure Float
        rul_estimate: String(rul_estimate || '-'),
        rul_status: String(pred_status), // Biasanya status RUL sama dengan status prediksi
        rul_minutes_val: Number(rul_minutes_val || 0),
        pred_status: String(pred_status),
        failure_type: String(failure_type || 'None'),
        action: String(action || 'Monitor'),
        urgency: String(urgency || 'Low'),
        prediction_time: new Date()
      }
    });

    // 4. Update Status Mesin di Table Master (Sync Realtime)
    // Jika prediksi bilang CRITICAL, status mesin juga harus jadi CRITICAL
    let newStatus: MachineStatus = MachineStatus.HEALTHY;

    // Mapping string dari Python ke Enum Prisma
    const statusUpper = String(pred_status).toUpperCase();
    if (statusUpper.includes('CRITICAL')) {
      newStatus = MachineStatus.CRITICAL;
    } else if (statusUpper.includes('WARNING')) {
      newStatus = MachineStatus.WARNING;
    } else if (statusUpper.includes('OFFLINE')) {
        newStatus = MachineStatus.OFFLINE;
    }

    await prisma.machines.update({
      where: { machine_id: machine.machine_id },
      data: { 
        status: newStatus,
        updated_at: new Date()
      }
    });

    // 5. Buat Alert Otomatis Jika Critical (Opsional tapi bagus untuk dashboard)
    if (newStatus === MachineStatus.CRITICAL) {
      await prisma.alerts.create({
        data: {
          machine_id: machine.machine_id,
          message: `Deteksi Bahaya: ${failure_type}. Tindakan: ${action}`,
          severity: 'HIGH',
          timestamp: new Date()
        }
      });
    }

    res.status(201).json({
      message: "Prediction saved and machine status updated",
      data: newPrediction
    });

  } catch (error) {
    console.error("Error saving prediction:", error);
    res.status(500).json({ error: "Failed to save prediction" });
  }
};

// GET /api/predict/latest/:machineId
// Mengambil prediksi terakhir untuk mesin tertentu
export const getLatestPrediction = async (req: Request, res: Response) => {
    const { machineId } = req.params;

    try {
        const prediction = await prisma.prediction_results.findFirst({
            where: {
                machine_id: String(machineId) // FIX: Pakai machine_id (String)
            },
            orderBy: {
                prediction_time: 'desc'
            }
        });

        if (!prediction) {
            return res.status(404).json({ message: "No prediction history found" });
        }

        res.json(prediction);
    } catch (error) {
        console.error("Error fetching prediction:", error);
        res.status(500).json({ error: "Server error" });
    }
};