import express from "express";
import { db } from "../config/db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get weekly meal plans
router.get("/", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT slot_key, name, emoji, uses_count as uses FROM meal_plans WHERE user_id = ?",
      [req.user.id]
    );
    
    // Convert flat array back to Record mapping
    const map = {};
    rows.forEach((r) => {
      map[r.slot_key] = { name: r.name, emoji: r.emoji, uses: r.uses };
    });
    res.json(map);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch meal plans", error: err.message });
  }
});

// Update slot meal
router.post("/", authenticateToken, async (req, res) => {
  const { slotKey, name, emoji, uses } = req.body;
  if (!slotKey || !name) {
    return res.status(400).json({ message: "Missing slotKey or meal name" });
  }

  try {
    // Replace to avoid unique constraint collisions
    await db.execute(
      "REPLACE INTO meal_plans (user_id, slot_key, name, emoji, uses_count) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, slotKey, name, emoji || "🍲", uses || 0]
    );

    res.json({ success: true, slotKey, meal: { name, emoji: emoji || "🍲", uses: uses || 0 } });
  } catch (err) {
    res.status(500).json({ message: "Failed to save meal plan", error: err.message });
  }
});

export default router;
