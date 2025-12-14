import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PredictPayload, MLResponse } from '../types';

const prisma = new PrismaClient();

// URL ML API Railway (Sesuai yang sudah dites dan valid)
const ML_API_URL = 'https://capstone-protek-production.up.railway.app/predict';

export const predictMaintenance = async (req: Request, res: Response) => {
  try {
    // 1. Terima Data dari Frontend
    const data: PredictPayload = req.body;
    
    // Validasi: Machine_ID wajib ada
    if (!data.Machine_ID) {
      return res.status(400).json({ error: "Invalid payload. Machine_ID is required." });
    }

    console.log(`[Predict] Processing data for ${data.Machine_ID}...`);

    // 2. Cek Apakah Mesin Ada di DB Lokal? (SANGAT PENTING)
    const machine = await prisma.machines.findUnique({
      where: { aset_id: data.Machine_ID }
    });

    // Sensor history dihapus (tidak digunakan)
    if (!machine) {
        console.warn(`   ⚠️ Machine ${data.Machine_ID} not found in DB. Alert cannot be saved.`);
    }

    // 3. Kirim Data ke ML API (Railway)
    console.log(`   📡 Sending to ML API...`);
    
    // Transform data to snake_case format expected by ML API
    const mlPayload = {
        machine_id: data.Machine_ID,
        type: data.Type,
        air_temp: data.Air_Temp,
        process_temp: data.Process_Temp,
        rpm: data.RPM,
        torque: data.Torque,
        tool_wear: data.Tool_Wear
    };
    
    const mlResponse = await fetch(ML_API_URL, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(mlPayload)
    });

    if (!mlResponse.ok) {
        throw new Error(`ML API Error: ${mlResponse.status} ${mlResponse.statusText}`);
    }

    // Casting ke MLResponse (Tipe data yang baru kita update)
    const result = await mlResponse.json() as MLResponse;
    console.log("   ✅ ML Prediction received:", result);

    // 4. LOGIC HAKIM (String Matching)
    // Cek apakah ada kata "CRITICAL" di RUL_Status atau "FAILURE" di Status
    // Kita gunakan optional chaining (?.) jaga-jaga kalau field null
    const isCritical = (result.RUL_Status?.includes('CRITICAL')) || 
                       (result.Status?.includes('FAILURE'));
    
    let alertCreated = false;

    // 5. BUAT ALERT (Hanya jika Kritis & Mesin Ada)
    if (isCritical && machine) {
        
        // KONSTRUKSI PESAN ALERT YANG AMAN
        // Karena field 'Message' bisa hilang saat failure, kita rakit pesan sendiri
        let alertMessage = result.Message || "Critical Anomaly Detected"; // Default

        if (!result.Message && result.Failure_Type) {
            // Jika Message kosong tapi ada Failure_Type (Kasus Power Failure)
            alertMessage = `${result.Failure_Type}: ${result.Action || 'Check Machine Immediately'}`;
            if (result.Urgency) {
                alertMessage += ` (${result.Urgency})`;
            }
        }
        // Simpan ke Tabel Alert
        await prisma.alerts.create({
            data: {
                machine_id: machine.id,
                message: alertMessage,
                severity: 'CRITICAL',
                timestamp: new Date()
            }
        });
        
        // Update Status Mesin jadi 'CRITICAL' (Biar merah di dashboard)
        await prisma.machines.update({
            where: { id: machine.id },
            data: { status: 'CRITICAL' }
        });

        alertCreated = true;
        console.log("   🚨 CRITICAL ALERT CREATED!");
    } else if (isCritical && !machine) {
        console.error("   ❌ CRITICAL DETECTED BUT NO MACHINE IN DB.");
    }

    // 6. Response Final ke Frontend
    res.json({
        status: 'success',
        input_saved: !!machine, 
        ml_result: result,
        alert_created: alertCreated
    });

  } catch (error) {
    console.error('❌ Predict Error:', error);
    res.status(500).json({ error: "Failed to process prediction request" });
  }
};