import { Router } from "express";
import { getConversation, markAsRead } from "../controllers/messageController.js";
import protect from "../middleware/auth.js";

const router = Router();

router.get("/:userId",          protect, getConversation);
router.patch("/read/:senderId", protect, markAsRead);

export default router;
