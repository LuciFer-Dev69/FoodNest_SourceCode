import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: {
    type: String,
    enum: [
      "inventory_added", "donation_created", "donation_claimed", "donation_completed",
      "meal_planned", "meal_completed", "community_post", "password_changed",
      "profile_updated", "avatar_updated", "badge_unlocked", "joined",
    ],
    required: true,
  },
  description: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

activitySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Activity", activitySchema);
