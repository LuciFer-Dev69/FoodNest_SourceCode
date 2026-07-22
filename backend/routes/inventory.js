import express from "express";
import Inventory from "../models/Inventory.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const items = await Inventory.find({ user_id: req.user.id })
      .select("name emoji qty cat loc expires_in_days");
    const result = items.map((i) => ({
      id: i._id,
      name: i.name,
      emoji: i.emoji,
      qty: i.qty,
      cat: i.cat,
      loc: i.loc,
      expires: i.expires_in_days,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch inventory", error: err.message });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  const { name, emoji, qty, cat, loc, expires } = req.body;
  if (!name || !qty || !cat || !loc) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const item = await Inventory.create({
      user_id: req.user.id,
      name,
      emoji: emoji || "🍲",
      qty,
      cat,
      loc,
      expires_in_days: expires || 3,
    });
    res.status(201).json({
      id: item._id,
      name,
      emoji: emoji || "🍲",
      qty,
      cat,
      loc,
      expires: expires || 3,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to save inventory item", error: err.message });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const result = await Inventory.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    if (!result) {
      return res.status(404).json({ message: "Item not found or unauthorized" });
    }
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete item", error: err.message });
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
  const { name, emoji, qty, cat, loc, expires } = req.body;
  if (!name || !qty || !cat || !loc) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const item = await Inventory.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { name, emoji: emoji || "🍲", qty, cat, loc, expires_in_days: expires || 3 },
      { returnDocument: 'after' }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found or unauthorized" });
    }

    res.json({
      id: item._id,
      name,
      emoji: emoji || "🍲",
      qty,
      cat,
      loc,
      expires: expires || 3,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update inventory item", error: err.message });
  }
});

export default router;
