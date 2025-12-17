import { Router } from "express";
import { chatbotController } from "../controllers/chatbot.controller";

const router = Router();

// POST /api/chat
// Payload body: { "message": "Bagaimana kondisi mesin M-14850?" }
router.post("/", chatbotController.askChat);

export default router;