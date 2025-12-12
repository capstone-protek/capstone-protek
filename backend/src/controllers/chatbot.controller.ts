import { Request, Response } from "express";
import { chatbotService } from "../services/chatbot.service";

class ChatbotController {
  async askChat(req: Request, res: Response) {
    try {
      const { message } = req.body;

      // Panggil service yang baru kita perbaiki
      const result = await chatbotService.askChatbot(message);

      res.json(result);
    } catch (err) {
      console.error("Chatbot Error:", err); // Tambahkan log biar gampang debug
      res.status(500).json({
        error: "chatbot error",
        details: err instanceof Error ? err.message : err
      });
    }
  }
}

export const chatbotController = new ChatbotController();