import express from "express";
import { db } from "../config/db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get active donations
router.get("/", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT d.id, d.name as t, d.emoji, d.qty, d.cat, d.pickup_time as pickup, d.status, d.km, u.name as who " +
      "FROM donations d JOIN users u ON d.donor_id = u.id " +
      "WHERE d.status = 'Available'"
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
    // Special case: Meat donations are fanned out to all users
    if (cat.toLowerCase() === "meat") {
      // create one per user (donor_id) for this (name+cat+pickup) if not already present
      const [users] = await db.execute("SELECT id, name FROM users");

      if (!users || users.length === 0) {
        return res.status(400).json({ message: "No users found to fan-out Meat donations" });
      }

      const donationKeySql =
        "SELECT donor_id FROM donations WHERE cat = ? AND name = ? AND pickup_time = ?";
      const [existing] = await db.execute(donationKeySql, [cat, name, pickup]);
      const existingDonors = new Set((existing || []).map((r) => r.donor_id));

      const missingUsers = users.filter((u) => !existingDonors.has(u.id));

      let lastInsertId = null;
      for (const u of missingUsers) {
        const km = parseFloat((Math.random() * 2).toFixed(1)) || 0.5;
        const [result] = await db.execute(
          "INSERT INTO donations (donor_id, name, emoji, qty, cat, pickup_time, km, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Available')",
          [u.id, name, emoji, qty, cat, pickup, km]
        );
        lastInsertId = result.insertId;
      }

      return res.status(201).json({
        id: lastInsertId,
        t: name,
        emoji,
        qty,
        cat,
        pickup,
        km: null,
        status: "Available",
        who: "All users",
        insertedCount: missingUsers.length,
      });
    }

    const km = parseFloat((Math.random() * 2).toFixed(1)) || 0.5; // Simulated proximity
    const [result] = await db.execute(
      "INSERT INTO donations (donor_id, name, emoji, qty, cat, pickup_time, km, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Available')",
      [req.user.id, name, emoji, qty, cat, pickup, km]
    );

    res.status(201).json({
      id: result.insertId,
      t: name,
      emoji,
      qty,
      cat,
      pickup,
      km,
      status: "Available",
      who: req.user.name,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to post donation", error: err.message });
  }
});

// Get logged-in user's donation claim history
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, name, emoji, qty, cat, pickup_time as pickup, status, km, created_at as createdAt, claimant_id FROM donations WHERE claimant_id = ? AND status = 'Claimed' ORDER BY created_at DESC",
      [req.user.id]
    );

    const history = (rows || []).map((r) => ({
      id: r.id,
      kind: "donation",
      emoji: r.emoji,
      title: r.name,
      subtitle: `${r.cat} · ${r.pickup}`,
      createdAt: r.createdAt,
    }));

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Failed to load donation history", error: err.message });
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
