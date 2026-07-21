import MealPlan from "../models/MealPlan.js";

export async function getMeals(req, res) {
  try {
    const rows = await MealPlan.find({ user_id: req.user.id }).select("slot_key name emoji uses_count");

    const map = {};
    rows.forEach((r) => {
      map[r.slot_key] = { name: r.name, emoji: r.emoji, uses: r.uses_count };
    });
    res.json(map);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch meal plans", error: err.message });
  }
}

export async function saveMeal(req, res) {
  const { slotKey, name, emoji, uses } = req.body;
  if (!slotKey || !name) {
    return res.status(400).json({ message: "Missing slotKey or meal name" });
  }

  try {
    await MealPlan.findOneAndUpdate(
      { user_id: req.user.id, slot_key: slotKey },
      { user_id: req.user.id, slot_key: slotKey, name, emoji: emoji || "🍲", uses_count: uses || 0 },
      { upsert: true }
    );

    res.json({ success: true, slotKey, meal: { name, emoji: emoji || "🍲", uses: uses || 0 } });
  } catch (err) {
    res.status(500).json({ message: "Failed to save meal plan", error: err.message });
  }
}
