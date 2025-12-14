import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { PredictPayload, MLResponse } from '../types';

const prisma = new PrismaClient();

// Use ML API URL from env (fall back to production). Keep no trailing slash.
const ML_API_BASE = process.env.ML_API_URL || 'https://capstone-protek-production.up.railway.app';
const ML_API_URL = ML_API_BASE.endsWith('/predict') ? ML_API_BASE : `${ML_API_BASE.replace(/\/$/, '')}/predict`;

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
    console.log(`   📡 Sending to ML API at ${ML_API_URL}...`);
    
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
    
    const mlResponse = await axios.post(ML_API_URL, mlPayload, {
        headers: { 
            'Content-Type': 'application/json'
        },
        timeout: 10000
    });

    // Parse ML JSON (log raw response for debugging)
    const rawResult = mlResponse.data;
    console.log("   ✅ ML Prediction received (raw):", rawResult);

        // Normalize/compatibility helper to read either PascalCase or snake_case
        const f = (obj: any, pascal: string, snake: string) => {
            if (!obj) return undefined;
            if (Object.prototype.hasOwnProperty.call(obj, pascal)) return obj[pascal];
            if (Object.prototype.hasOwnProperty.call(obj, snake)) return obj[snake];
            return undefined;
        };

        const result = rawResult as any; // keep using typed shape afterwards

        // 4. LOGIC HAKIM (String Matching)
        const rulStatus = f(result, 'RUL_Status', 'rul_status') || '';
        const statusText = f(result, 'Status', 'status') || '';
        const isCritical = (String(rulStatus).includes('CRITICAL')) || (String(statusText).includes('FAILURE'));
    
    let alertCreated = false;

    // 5. BUAT ALERT (Hanya jika Kritis & Mesin Ada)
    if (isCritical && machine) {
        
        // KONSTRUKSI PESAN ALERT YANG AMAN
        // Karena field 'Message' bisa hilang saat failure, kita rakit pesan sendiri
        let alertMessage = f(result, 'Message', 'message') || "Critical Anomaly Detected";
        const failureType = f(result, 'Failure_Type', 'failure_type');
        const actionText = f(result, 'Action', 'action');
        const urgencyText = f(result, 'Urgency', 'urgency');

        if ((!f(result, 'Message', 'message') || String(f(result, 'Message', 'message')).trim() === '') && failureType) {
            alertMessage = `${failureType}: ${actionText || 'Check Machine Immediately'}`;
            if (urgencyText) {
                alertMessage += ` (${urgencyText})`;
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Predict Error:', errorMessage);
    console.error('❌ Full Error:', error);
    res.status(500).json({ 
      error: "Failed to process prediction request",
      details: errorMessage
    });
  }
};