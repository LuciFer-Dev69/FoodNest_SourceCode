import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  slot_key: { type: String, required: true },
  name: { type: String, required: true },
  emoji: { type: String, default: "🍳" },
  uses_count: { type: Number, default: 0 },
}, { timestamps: { createdAt: "created_at" } });

mealPlanSchema.index({ user_id: 1, slot_key: 1 }, { unique: true });

export default mongoose.model("MealPlan", mealPlanSchema);
