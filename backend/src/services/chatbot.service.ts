import axios from "axios";

export class ChatbotService {
  private endpoint = process.env.BIZNET_ENDPOINT!;
  private apiKey = process.env.BIZNET_API_KEY!;
  private model = process.env.MODEL_NAME!;

  async askChatbot(userMessage: string) {
    if (!this.endpoint) throw new Error("Missing BIZNET_ENDPOINT");
    if (!this.apiKey) throw new Error("Missing BIZNET_API_KEY");
    if (!this.model) throw new Error("Missing MODEL_NAME");

    const systemPrompt = `
ROLE: Kamu adalah "Intent Classifier" untuk sistem Predictive Maintenance. Kamu TIDAK menjadi asisten chat. Kamu HANYA mengembalikan JSON.

TUGAS: Ambil input user dan terjemahkan menjadi satu perintah JSON terstruktur.

ATURAN KERAS:
- Balas HANYA JSON valid. Jangan menambahkan penjelasan.
- Jangan gunakan markdown.
- Tidak boleh membuat asumsi di luar input.
- Jika user menyebut mesin apa pun, ekstrak sebagai "entity".
- Jika user meminta hal lain di luar predictive maintenance, kembalikan intent "UNKNOWN".

DAFTAR INTENT:
1. GET_MACHINE_STATUS
2. GET_RECENT_ALERTS
3. COUNT_CRITICAL
4. UNKNOWN

OUTPUT FORMAT:
{
  "intent": "NAMA_INTENT",
  "entity": "IDENTIFIER_MESIN" atau null,
  "response_text": "kalimat singkat jika UNKNOWN, selain itu null"
}
`;

    const payload = {
      model: this.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ]
    };

    const response = await axios.post(this.endpoint, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      }
    });

    return response.data;
  }
}

export const chatbotService = new ChatbotService();
