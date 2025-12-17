import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { chatbotService } from "../services/chatbot.service";

const prisma = new PrismaClient();

class ChatbotController {
  
  // Helper: Deteksi pola ID mesin dalam chat (misal: "M-14850")
  private extractMachineId(text: string): string | null {
    // Regex mencari pola "M-" diikuti angka
    const match = text.match(/(M-\d+)/i);
    return match ? match[0].toUpperCase() : null;
  }

  // Helper: Bangun Context Data untuk LLM
  private async buildContext(machineId: string): Promise<string> {
    const data = await prisma.machines.findUnique({
      where: { machine_id: machineId }, // Pastikan schema machine_id @unique
      include: {
        sensor_data: { take: 1, orderBy: { insertion_time: 'desc' } },
        prediction_results: { take: 1, orderBy: { prediction_time: 'desc' } },
        alerts: { take: 1, orderBy: { timestamp: 'desc' } }
      }
    });

    if (!data) return "";

    const sensor = data.sensor_data[0];
    const pred = data.prediction_results[0];
    const alert = data.alerts[0];

    // Format data ini agar LLM mengerti kondisi mesin saat ini
    return `
    [SYSTEM CONTEXT - DATA REALTIME]
    Informasi Mesin: ${data.name} (ID: ${data.machine_id})
    Status: ${data.status}
    
    Data Sensor Terakhir:
    - Suhu: ${sensor?.air_temperature_k || '-'} K
    - Rotasi: ${sensor?.rotational_speed_rpm || '-'} RPM
    - Torsi: ${sensor?.torque_nm || '-'} Nm
    
    Analisis AI (Prediksi Kerusakan):
    - Risiko: ${pred ? (pred.risk_probability * 100).toFixed(1) : 0}%
    - Estimasi RUL: ${pred?.rul_estimate || '-'}
    - Status Prediksi: ${pred?.pred_status || '-'}
    
    Alert Terakhir: ${alert?.message || 'Tidak ada alert baru'}
    -----------------------------------
    Gunakan data di atas untuk menjawab pertanyaan user.
    `;
  }

  // Handler Utama
  askChat = async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      let finalMessage = message;

      // 1. Coba deteksi apakah user ngomongin mesin tertentu
      const detectedId = this.extractMachineId(message);

      if (detectedId) {
        // 2. Jika ada ID mesin, ambil datanya dari DB
        console.log(`🤖 Chatbot mendeteksi ID mesin: ${detectedId}`);
        const context = await this.buildContext(detectedId);
        
        // 3. Gabungkan Data DB + Pertanyaan User
        if (context) {
            finalMessage = `${context}\n\nUser Question: ${message}`;
        }
      }

      // 4. Kirim ke Service LLM (Langchain/OpenAI/Groq)
      const result = await chatbotService.askChatbot(finalMessage);

      res.json(result);
    } catch (err) {
      console.error("Chatbot Error:", err);
      res.status(500).json({
        error: "chatbot error",
        details: err instanceof Error ? err.message : err
      });
    }
  }
}

export const chatbotController = new ChatbotController();