import express from "express";
import { db } from "../config/db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user inventory
router.get("/", authenticateToken, async (req, res) => {
  try {
    const [items] = await db.execute(
      "SELECT id, name, emoji, qty, cat, loc, expires_in_days as expires FROM inventory WHERE user_id = ?",
      [req.user.id]
    );
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch inventory", error: err.message });
  }
});

// Add item
router.post("/", authenticateToken, async (req, res) => {
  const { name, emoji, qty, cat, loc, expires } = req.body;
  if (!name || !qty || !cat || !loc) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO inventory (user_id, name, emoji, qty, cat, loc, expires_in_days) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [req.user.id, name, emoji || "🍲", qty, cat, loc, expires || 3]
    );
    res.status(201).json({
      id: result.insertId,
      name,
      emoji: emoji || "🍲",
      qty,
      cat,
      loc,
      expires: expires || 3
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to save inventory item", error: err.message });
  }
});

// Delete item
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const [result] = await db.execute(
      "DELETE FROM inventory WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found or unauthorized" });
    }
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete item", error: err.message });
  }
});

// Edit item
router.put("/:id", authenticateToken, async (req, res) => {
  const { name, emoji, qty, cat, loc, expires } = req.body;
  if (!name || !qty || !cat || !loc) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const [result] = await db.execute(
      "UPDATE inventory SET name = ?, emoji = ?, qty = ?, cat = ?, loc = ?, expires_in_days = ? WHERE id = ? AND user_id = ?",
      [name, emoji || "🍲", qty, cat, loc, expires || 3, req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found or unauthorized" });
    }

    res.json({
      id: req.params.id,
      name,
      emoji: emoji || "🍲",
      qty,
      cat,
      loc,
      expires: expires || 3
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update inventory item", error: err.message });
  }
});

export default router;
