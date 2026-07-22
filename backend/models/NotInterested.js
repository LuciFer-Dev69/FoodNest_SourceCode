import mongoose from "mongoose";

const notInterestedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "CommunityPost", required: true },
}, { timestamps: true });

notInterestedSchema.index({ userId: 1, postId: 1 }, { unique: true });
notInterestedSchema.index({ postId: 1 });

export default mongoose.model("NotInterested", notInterestedSchema);
