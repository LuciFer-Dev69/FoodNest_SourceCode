import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "CommunityPost", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: {
    type: String,
    enum: ["Spam", "Harassment", "Fake Donation", "Other"],
    required: true,
  },
  description: { type: String, default: "" },
}, { timestamps: true });

reportSchema.index({ postId: 1 });
reportSchema.index({ userId: 1 });

export default mongoose.model("Report", reportSchema);
