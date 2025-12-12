import { Router } from "express";
import { chatbotController } from "../controllers/chatbot.controller";

const router = Router();
// POST /api/chat
router.post("/", chatbotController.askChat); // Akses: /api/chat

export default router;
