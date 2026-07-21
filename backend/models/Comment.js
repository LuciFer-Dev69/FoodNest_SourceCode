import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "CommunityPost", required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null, index: true },
  text: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

commentSchema.index({ postId: 1, parentId: 1, createdAt: 1 });

export default mongoose.model("Comment", commentSchema);
