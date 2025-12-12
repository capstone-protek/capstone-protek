import 'dotenv/config';

import { PrismaClient } from "@prisma/client";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

console.log("DEBUG ENV CHECK:");
console.log("API Key exist?", !!process.env.OPENAI_API_KEY); // Harusnya true
console.log("Model Name:", process.env.BIZNETGIO_MODEL_NAME);

const prisma = new PrismaClient();

// Konfigurasi BiznetGIO
const biznetBaseURL = process.env.BIZNETGIO_ENDPOINT?.replace('/chat/completions', '') || 'https://api.biznetgio.ai/v1';

const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
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
      select: { id: true, asetId: true, name: true, status: true }
    });

    // 2. Ambil Prediksi ML Terakhir
    // ✅ PERBAIKAN 1: Gunakan 'predictionResult' (camelCase), bukan 'prediction_results'
    // Error message TS2551 tadi menyarankan ini.
    const rawPredictions = await prisma.prediction_results.findMany({
      take: 20, 
      orderBy: { prediction_time: 'desc' }
    });

    // 3. Ambil Alerts Critical Terbaru
    const alerts = await prisma.alert.findMany({
      where: { severity: "CRITICAL" },
      take: 3,
      orderBy: { timestamp: 'desc' },
      include: { machine: { select: { name: true } } }
    });

    // 4. Data Processing: Gabungkan Info Mesin dengan Prediksi ML
    const machineHealthSummary = machines.map(m => {
      // ✅ PERBAIKAN 2: Typo variabel di .find()
      // Sebelumnya: .find(m => p.machine_id ...) <- 'p' tidak dikenal
      // Sekarang:   .find(p => p.machine_id ...) <- 'p' didefinisikan sebagai parameter
      const prediction = rawPredictions.find(p => p.machine_id === m.asetId);

      let mlData = "Belum ada data ML";
      
      if (prediction) {
        mlData = {
          sisa_umur_rul: `${Math.round(prediction.rul_minutes_val)} menit`, 
          risiko_kerusakan: prediction.risk_probability, 
          status_prediksi: prediction.pred_status
        } as any;
      }

      return {
        mesin: m.name,
        kode: m.asetId,
        status_saat_ini: m.status,
        prediksi_ml: mlData
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

    // 6. System Prompt
    const systemPrompt = `
    Anda adalah Protek Copilot, asisten AI untuk monitoring pabrik.
    
    TUGAS:
    Jawab pertanyaan user secara singkat dan padat berdasarkan data [STATUS KESEHATAN MESIN TERKINI].
    
    PEDOMAN ANALISIS:
    1. Jika 'risiko_kerusakan' > 50%, katakan mesin BERISIKO TINGGI.
    2. Jika 'sisa_umur_rul' < 60 menit, sarankan MAINTENANCE SEGERA.
    3. Jika status 'CRITICAL', beri peringatan 🚨.
    4. Gunakan Bahasa Indonesia.

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
      debug_match: machineHealthSummary.slice(0, 2) 
    };
  }
}

export const chatbotService = new ChatbotService();