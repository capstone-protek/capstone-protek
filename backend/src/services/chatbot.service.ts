import 'dotenv/config';

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// Konfigurasi Environment Check
console.log("DEBUG ENV CHECK:");
console.log("API Key exist?", !!process.env.OPENAI_API_KEY); 
console.log("Model Name:", process.env.BIZNETGIO_MODEL_NAME);

// Konfigurasi BiznetGIO / OpenAI
const biznetBaseURL = process.env.BIZNETGIO_ENDPOINT?.replace('/chat/completions', '') || 'https://api.biznetgio.ai/v1';

const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: process.env.BIZNETGIO_MODEL_NAME || "openai/gpt-oss-120b",
  temperature: 0.3, // Sedikit kreatif tapi tetap faktual
  configuration: {
    baseURL: biznetBaseURL,
    defaultHeaders: {
        'X-Client-ID': process.env.BIZNETGIO_CLIENT_ID
    }
  }
});

class ChatbotService {
  /**
   * Fungsi ini menerima pesan final yang sudah diproses oleh Controller.
   * Controller mungkin sudah menyisipkan [SYSTEM CONTEXT] berisi data mesin.
   */
  async askChatbot(finalMessage: string) {
    if (!finalMessage) throw new Error("Message is required");

    // 1. Definisikan Persona AI
    const systemPrompt = `
    Anda adalah Protek Copilot, asisten AI cerdas untuk monitoring pabrik manufaktur.
    
    TUGAS UTAMA:
    Jawab pertanyaan user berdasarkan data konteks yang diberikan di dalam pesan (jika ada).
    
    PEDOMAN GAYA BICARA:
    1. Profesional, singkat, dan berorientasi pada data.
    2. Jika ada data 'risiko_kerusakan' > 70%, gunakan nada peringatan (⚠️).
    3. Jika user bertanya hal di luar konteks pabrik, jawab dengan sopan bahwa Anda hanya fokus pada monitoring mesin.
    4. Gunakan Bahasa Indonesia yang baik.
    `;

    try {
        // 2. Eksekusi ke LLM
        const response = await chatModel.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(finalMessage),
        ]);

        // 3. Kembalikan Jawaban
        return {
            reply: response.content,
            // Debugging info (opsional)
            timestamp: new Date()
        };

    } catch (error) {
        console.error("LLM Error:", error);
        return {
            reply: "Maaf, saat ini saya mengalami kendala koneksi ke otak AI. Mohon coba lagi nanti.",
            error: true
        };
    }
  }
}

export const chatbotService = new ChatbotService();