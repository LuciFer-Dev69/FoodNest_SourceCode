import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipientUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  senderUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  type: {
    type: String,
    enum: [
      "inventory_expiring", "inventory_expired",
      "donation_created", "donation_claimed", "donation_completed",
      "meal_reminder", "meal_saved",
      "community_like", "community_comment", "community_reply",
      "system",
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, default: "" },
  relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
  isRead: { type: Boolean, default: false, index: true },
  expiresAt: { type: Date, default: null },
}, { timestamps: true });

notificationSchema.index({ recipientUser: 1, createdAt: -1 });
notificationSchema.index({ recipientUser: 1, isRead: 1 });

export default mongoose.model("Notification", notificationSchema);
