import { Router } from "express";
import { getAllUsers,getStatus,sendRequest,acceptRequest,rejectRequest } from "../controllers/userController.js";
import protect from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getAllUsers);

router.get("/status/:id", protect, getStatus);
router.post("/request/:id", protect, sendRequest);
router.patch("/accept/:id", protect, acceptRequest);
router.patch("/reject/:id", protect, rejectRequest);


export default router;
