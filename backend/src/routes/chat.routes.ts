import { Router } from "express";
import { chatbotController } from "../controllers/chatbot.controller";

const router = Router();

router.post("/", chatbotController.askChat);

export default router;
