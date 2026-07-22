import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
  slotKey: { type: String, required: true },
  name: { type: String, default: "" },
  emoji: { type: String, default: "🍽️" },
  status: {
    type: String,
    enum: ["planned", "completed", "skipped", "cancelled"],
    default: "planned",
  },
}, { _id: false });

const mealPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, default: "" },
  weekStart: { type: Date },
  meals: [mealSchema],
}, { timestamps: true });

mealPlanSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("MealPlan", mealPlanSchema);
