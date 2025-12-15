import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const prisma = new PrismaClient();

// Konfigurasi BiznetGIO / OpenAI
const biznetBaseURL = process.env.BIZNETGIO_ENDPOINT?.replace('/chat/completions', '') || 'https://api.biznetgio.ai/v1';

const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: process.env.BIZNETGIO_MODEL_NAME || "openai/gpt-oss-120b",
  temperature: 0.1, // Turunkan temperature agar jawaban lebih konsisten/fakta
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

    // 1. Ambil Data (Sama seperti sebelumnya)
    const machines = await prisma.machines.findMany({
      select: { id: true, aset_id: true, name: true, status: true }
    });

    const rawPredictions = await prisma.prediction_results.findMany({
      take: 20, 
      orderBy: { prediction_time: 'desc' }
    });

    const alerts = await prisma.alerts.findMany({
      where: { severity: "CRITICAL" },
      take: 3,
      orderBy: { timestamp: 'desc' },
      include: { machine: { select: { name: true } } }
    });

    // 2. Data Processing (LOGIC DIPINDAH KE SINI)
    // Kita "mengunyah" data dulu sebelum dikasih ke AI biar AI gak salah hitung
    const machineHealthSummary = machines.map(m => {
      const prediction = rawPredictions.find(p => p.machine_id === m.aset_id);

      let mlInfo = null;
      let kondisiTeknis = "DATA TIDAK TERSEDIA";
      let rekomendasiSistem = "Periksa koneksi sensor.";

      if (prediction) {
        const rul = Math.round(prediction.rul_minutes_val);
        // Asumsi risk_probability formatnya 0-100 atau 0-1. Sesuaikan logic ini:
        // Jika format di DB 0.3 artinya 0.3%, maka aman. Jika 0.3 artinya 30%, sesuaikan threshold.
        // Di sini saya asumsikan angka db adalah persentase langsung (misal 0.3).
        const risk = prediction.risk_probability; 

        // LOGIC PENENTUAN STATUS (Pre-calculated)
        const isCriticalRul = rul < 60;
        const isHighRisk = risk > "50%";

        if (isCriticalRul || isHighRisk) {
            kondisiTeknis = "⚠️ KRITIS / BERISIKO TINGGI";
            rekomendasiSistem = "Jadwalkan maintenance SEGERA. Cek komponen kritis.";
        } else if (rul < 120) {
            kondisiTeknis = "⚠️ PERLU PANTAUAN (WARNING)";
            rekomendasiSistem = "Siapkan sparepart, monitor getaran.";
        } else {
            kondisiTeknis = "✅ NORMAL (SEHAT)";
            rekomendasiSistem = "Lanjutkan operasi normal. Tidak perlu tindakan.";
        }

        mlInfo = {
          sisa_umur: `${rul} menit`,
          risiko: `${risk}%`,
          status_prediksi: prediction.pred_status
        };
      }

      return {
        nama_mesin: m.name,
        kode: m.aset_id,
        status_dashboard: m.status, // Status dari tabel mesin (Healthy/Offline)
        analisa_ml: mlInfo,
        kesimpulan_sistem: kondisiTeknis, // Ini yang akan dibaca AI
        rekomendasi: rekomendasiSistem
      };
    });

    // 3. Susun Context String yang Lebih Bersih
    // Kita format string-nya biar enak dibaca AI, bukan JSON mentah yang ruwet
    const formattedContext = machineHealthSummary.map(m => {
        let details = `   - Status Dashboard: ${m.status_dashboard}`;
        if (m.analisa_ml) {
            details += `\n   - Sisa Umur (RUL): ${m.analisa_ml.sisa_umur}`;
            details += `\n   - Risiko Kerusakan: ${m.analisa_ml.risiko}`;
            details += `\n   - KESIMPULAN: ${m.kesimpulan_sistem}`;
            details += `\n   - REKOMENDASI: ${m.rekomendasi}`;
        } else {
            details += `\n   - Info: Belum ada data sensor/ML.`;
        }
        return `MESIN: ${m.nama_mesin} (${m.kode})\n${details}`;
    }).join('\n\n');

    const alertContext = alerts.length > 0 
        ? alerts.map(a => `[BAHAYA] ${a.machine.name}: ${a.message} (${new Date(a.timestamp).toLocaleString()})`).join('\n')
        : "Tidak ada alert kritis aktif.";

    // 4. System Prompt yang Lebih Terstruktur
    const systemPrompt = `
    Anda adalah "Protek Copilot", asisten Senior Reliability Engineer di sebuah pabrik pintar.
    Tugas Anda adalah memberikan laporan status mesin yang profesional, berbasis data, dan langsung ke poin permasalahan.

    DATA REAL-TIME PABRIK:
    ======================
    ALERT KRITIS:
    ${alertContext}

    DETAIL KONDISI MESIN:
    ${formattedContext}
    ======================

    ATURAN MENJAWAB (PENTING):
    1. GAYA BAHASA: Gunakan bahasa Indonesia formal, teknis, dan tegas. Hindari kata-kata basa-basi seperti "Berdasarkan data di atas". Langsung ke poin.
    2. STRUKTUR JAWABAN:
       - Jika user bertanya tentang SEMUA mesin: Buat ringkasan per mesin menggunakan Bullet Points.
       - Jika user bertanya mesin SPESIFIK: Fokus detail pada mesin itu saja.
    3. FORMATTING: 
       - Gunakan Huruf Tebal (Bold) untuk Nama Mesin dan Status Penting (misal: **NORMAL**, **KRITIS**).
       - Gunakan emoji indikator: ✅ untuk Sehat, ⚠️ untuk Warning, ❌ untuk Kritis/Offline.
    4. LOGIKA:
       - Selalu utamakan data 'KESIMPULAN' yang sudah disediakan di konteks. Jangan membuat asumsi sendiri.
       - Jika data ML tidak ada, sarankan user untuk memeriksa koneksi sensor.

    CONTOH OUTPUT YANG DIHARAPKAN:
    "Berikut kondisi terkini **CNC Milling Machine A1**:
    • Status: ✅ **NORMAL**
    • Sisa Umur (RUL): 107 Menit
    • Rekomendasi: Lanjutkan operasi, tidak ada tindakan diperlukan."
    `;

    // 5. Eksekusi AI
    try {
        const response = await chatModel.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(userMessage),
        ]);

        return {
            reply: response.content,
            // Debugging data dikirim ke frontend jika butuh visualisasi JSON raw
            debug_match: machineHealthSummary.slice(0, 3) 
        };
    } catch (error) {
        console.error("AI Error:", error);
        return {
            reply: "Maaf, saya mengalami kendala saat menganalisis data mesin. Mohon coba lagi.",
            debug_match: []
        }
    }
  }
}

export const chatbotService = new ChatbotService();