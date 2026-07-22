import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  deleteNotification,
  deleteReadNotifications,
  checkExpiryNotifications,
} from "../controllers/notificationsController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getNotifications);
router.get("/unread", authenticateToken, getUnreadCount);
router.patch("/:id/read", authenticateToken, markAsRead);
router.patch("/read-all", authenticateToken, markAllRead);
router.delete("/:id", authenticateToken, deleteNotification);
router.delete("/read", authenticateToken, deleteReadNotifications);
router.post("/check-expiry", authenticateToken, checkExpiryNotifications);

export default router;
