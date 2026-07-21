import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  badge: {
    type: String,
    enum: ["First Post", "First Donation", "Top Donor", "Helpful Member", "Recipe Expert", "Eco Champion"],
    required: true,
  },
}, { timestamps: true });

achievementSchema.index({ userId: 1, badge: 1 }, { unique: true });

export default mongoose.model("Achievement", achievementSchema);
