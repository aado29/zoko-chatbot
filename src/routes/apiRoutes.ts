import { Router } from "express";
import chatController from "../controllers/chatController";

const router = Router();

router.post("/chatbot/zoko", chatController.zokoWebhook);
router.post("/chatbot/:sessionId", chatController.assistant);

export default router;
