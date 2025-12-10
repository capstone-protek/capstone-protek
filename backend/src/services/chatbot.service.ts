// src/services/chatbot.service.ts
import { PrismaClient } from "@prisma/client";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import 'dotenv/config';

const prisma = new PrismaClient();

// Konfigurasi BiznetGIO
const biznetBaseURL = process.env.BIZNETGIO_ENDPOINT?.replace('/chat/completions', '') || 'https://api.biznetgio.ai/v1';

const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.BIZNETGIO_API_KEY,
  modelName: process.env.BIZNETGIO_MODEL_NAME || "openai/gpt-oss-120b",
  temperature: 0,
  configuration: {
    baseURL: biznetBaseURL,
    defaultHeaders: {
        'X-Client-ID': process.env.BIZNETGIO_CLIENT_ID
    }
  }
});

class ChatbotService {
  async askChatbot(userMessage: string) {
    if (!userMessage) throw new Error("Message is required");

    // 1. Ambil Data Mesin
    const machines = await prisma.machine.findMany({
      select: { asetId: true, name: true, status: true }
    });

    // 2. Ambil Prediksi ML Terakhir (Raw Data dari Tabel prediction_results)
    // Kita ambil 10 data terakhir untuk memastikan kita dapat data terbaru semua mesin
    const rawPredictions = await prisma.predictionResult.findMany({
      take: 10,
      orderBy: { prediction_time: 'desc' }
    });

    // 3. Ambil Alerts Critical Terbaru
    const alerts = await prisma.alert.findMany({
      where: { severity: "CRITICAL" },
      take: 3,
      orderBy: { timestamp: 'desc' },
      include: { machine: { select: { name: true } } } // Include nama mesin biar AI paham
    });

    // 4. Ambil semua mesin dengan ID untuk matching
    const machinesWithId = await prisma.machine.findMany({
      select: { id: true, asetId: true, name: true, status: true }
    });

    // 5. Data Processing: Gabungkan Info Mesin dengan Prediksi ML
    // Agar AI lebih mudah membaca, kita gabungkan datanya per mesin
    const machineHealthSummary = machinesWithId.map(m => {
      // Cari prediksi yang cocok dengan ID Mesin (machineId di prediction adalah Int, bukan asetId)
      const prediction = rawPredictions.find((p: { machineId: number }) => p.machineId === m.id);
      return {
        mesin: m.name,
        kode: m.asetId,
        status_saat_ini: m.status,
        prediksi_ml: prediction ? {
          sisa_umur_rul: `${Math.round(prediction.RUL)} menit`, // Bulatkan agar mudah dibaca
          risiko_kerusakan: `${(prediction.failure_prob * 100).toFixed(1)}%` // Format persen
        } : "Belum ada data ML"
      };
    });

    // 5. Susun Context String untuk AI
    const contextData = `
    [STATUS KESEHATAN MESIN TERKINI]
    ${JSON.stringify(machineHealthSummary, null, 2)}

    [PERINGATAN (ALERTS) AKTIF]
    ${JSON.stringify(alerts.map(a => ({
      pesan: a.message,
      mesin: a.machine.name,
      waktu: a.timestamp
    })), null, 2)}
    `;

    // 6. System Prompt yang Dipertajam
    const systemPrompt = `
    Anda adalah Protek Copilot, asisten AI untuk monitoring pabrik.
    
    TUGAS:
    Jawab pertanyaan user berdasarkan data [STATUS KESEHATAN MESIN TERKINI] di atas.
    
    PEDOMAN ANALISIS:
    1. Jika field 'risiko_kerusakan' > 50%, katakan mesin BERISIKO TINGGI.
    2. Jika 'sisa_umur_rul' < 60 menit, sarankan MAINTENANCE SEGERA.
    3. Jika status 'CRITICAL', beri peringatan dengan emoji 🚨.
    4. Jawab langsung ke poin permasalahannya. Gunakan Bahasa Indonesia.

    Data Konteks:
    ${contextData}
    `;

    // 7. Eksekusi AI
    const response = await chatModel.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userMessage),
    ]);

    return {
      reply: response.content,
      // Kirim data mentah juga untuk kebutuhan debug di frontend (opsional)
      debug_context: machineHealthSummary
    };
  }
}

export const chatbotService = new ChatbotService();