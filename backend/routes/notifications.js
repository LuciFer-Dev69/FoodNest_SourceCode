import express from "express";
import { db } from "../config/db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user notifications
router.get("/", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, message, type, is_read as isRead, created_at as createdAt FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications", error: err.message });
  }
});

// Mark all as read
router.post("/read-all", authenticateToken, async (req, res) => {
  try {
    await db.execute(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = ?",
      [req.user.id]
    );
    res.json({ success: true, message: "Notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notifications", error: err.message });
  }
});

// Post mock notification trigger (for reminder simulations)
router.post("/trigger", authenticateToken, async (req, res) => {
  const { message, type } = req.body;
  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
      [req.user.id, message, type || "info"]
    );
    res.status(201).json({
      id: result.insertId,
      message,
      type: type || "info",
      isRead: false,
      createdAt: new Date()
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to trigger notification", error: err.message });
  }
});

export default router;
