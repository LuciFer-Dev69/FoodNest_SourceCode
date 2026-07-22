import express from "express";
import Donation from "../models/Donation.js";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const rows = await Donation.find({ status: "Available" })
      .populate("donor_id", "name")
      .select("name emoji qty cat pickup_time status km donor_id");
    const result = rows.map((d) => ({
      id: d._id,
      t: d.name,
      emoji: d.emoji,
      qty: d.qty,
      cat: d.cat,
      pickup: d.pickup_time,
      status: d.status,
      km: d.km,
      who: d.donor_id?.name || "Unknown",
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to load donations", error: err.message });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  const { name, emoji, qty, cat, pickup } = req.body;
  if (!name || !qty || !cat || !pickup) {
    return res.status(400).json({ message: "Missing donation details" });
  }

  try {
    if (cat.toLowerCase() === "meat") {
      const users = await User.find({}, "_id name");
      if (!users || users.length === 0) {
        return res.status(400).json({ message: "No users found to fan-out Meat donations" });
      }

      const existing = await Donation.find({ cat, name, pickup_time: pickup }, "donor_id");
      const existingDonors = new Set(existing.map((r) => r.donor_id.toString()));

      const missingUsers = users.filter((u) => !existingDonors.has(u._id.toString()));

      let lastInsertId = null;
      for (const u of missingUsers) {
        const km = parseFloat((Math.random() * 2).toFixed(1)) || 0.5;
        const donation = await Donation.create({
          donor_id: u._id,
          name,
          emoji,
          qty,
          cat,
          pickup_time: pickup,
          km,
          status: "Available",
        });
        lastInsertId = donation._id;
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

    const km = parseFloat((Math.random() * 2).toFixed(1)) || 0.5;
    const donation = await Donation.create({
      donor_id: req.user.id,
      name,
      emoji,
      qty,
      cat,
      pickup_time: pickup,
      km,
      status: "Available",
    });

    res.status(201).json({
      id: donation._id,
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

router.get("/history", authenticateToken, async (req, res) => {
  try {
    const rows = await Donation.find({ claimant_id: req.user.id, status: "Claimed" })
      .select("name emoji qty cat pickup_time status km created_at claimant_id")
      .sort({ created_at: -1 });

    const history = rows.map((r) => ({
      id: r._id,
      kind: "donation",
      emoji: r.emoji,
      title: r.name,
      subtitle: `${r.cat} · ${r.pickup_time}`,
      createdAt: r.created_at,
    }));

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Failed to load donation history", error: err.message });
  }
});

router.put("/:id/claim", authenticateToken, async (req, res) => {
  try {
    const result = await Donation.findOneAndUpdate(
      { _id: req.params.id, status: "Available" },
      { status: "Claimed", claimant_id: req.user.id },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(400).json({ message: "Item unavailable for claiming" });
    }

    res.json({ message: "Donation claimed successfully", status: "Claimed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to claim donation", error: err.message });
  }
});

export default router;
