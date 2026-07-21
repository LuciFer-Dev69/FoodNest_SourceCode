import express from "express";
import { getNotifications, markAllRead, createNotification } from "../controllers/notificationsController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getNotifications);
router.post("/read-all", authenticateToken, markAllRead);
router.post("/trigger", authenticateToken, createNotification);

export default router;
