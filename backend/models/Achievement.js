import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  badge: {
    type: String,
    enum: [
      "First Donation", "First Meal Plan", "Inventory Starter",
      "Community Helper", "50 Donations", "100kg Saved",
      "First Post", "Top Donor", "Helpful Member", "Recipe Expert", "Eco Champion",
    ],
    required: true,
  },
  unlockedAt: { type: Date, default: Date.now },
}, { timestamps: true });

achievementSchema.index({ userId: 1, badge: 1 }, { unique: true });

export default mongoose.model("Achievement", achievementSchema);
