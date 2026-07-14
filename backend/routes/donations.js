import express from "express";
import { db } from "../config/db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get active donations
router.get("/", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT d.id, d.name as t, d.emoji, d.qty, d.cat, d.pickup_time as pickup, d.status, d.km, u.name as who " +
      "FROM donations d JOIN users u ON d.donor_id = u.id"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to load donations", error: err.message });
  }
});

// Post donation
router.post("/", authenticateToken, async (req, res) => {
  const { name, emoji, qty, cat, pickup } = req.body;
  if (!name || !qty || !cat || !pickup) {
    return res.status(400).json({ message: "Missing donation details" });
  }

  try {
    const km = parseFloat((Math.random() * 2).toFixed(1)) || 0.5; // Simulated proximity
    const [result] = await db.execute(
      "INSERT INTO donations (donor_id, name, emoji, qty, cat, pickup_time, km, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Available')",
      [req.user.id, name, emoji || "🍞", qty, cat, pickup, km]
    );

    res.status(201).json({
      id: result.insertId,
      t: name,
      emoji: emoji || "🍞",
      qty,
      cat,
      pickup,
      km,
      status: "Available",
      who: req.user.name
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to post donation", error: err.message });
  }
});

// Claim donation
router.put("/:id/claim", authenticateToken, async (req, res) => {
  try {
    const [result] = await db.execute(
      "UPDATE donations SET status = 'Claimed', claimant_id = ? WHERE id = ? AND status = 'Available'",
      [req.user.id, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Item unavailable for claiming" });
    }

    res.json({ message: "Donation claimed successfully", status: "Claimed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to claim donation", error: err.message });
  }
});

export default router;
