import mongoose from "mongoose";

const userSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  language: { type: String, enum: ["en", "ne", "ms"], default: "en" },
  theme: { type: String, enum: ["light", "dark"], default: "light" },
  fontSize: { type: String, enum: ["small", "medium", "large"], default: "medium" },
  animations: { type: Boolean, default: true },
  notifyInventory: { type: Boolean, default: true },
  notifyDonations: { type: Boolean, default: true },
  notifyCommunity: { type: Boolean, default: true },
  notifyMeals: { type: Boolean, default: true },
  notifyWeekly: { type: Boolean, default: true },
  notifyEmail: { type: Boolean, default: false },
  notifyPush: { type: Boolean, default: false },
  privacyPublicProfile: { type: Boolean, default: true },
  privacyShowDonations: { type: Boolean, default: true },
  privacyAllowMessages: { type: Boolean, default: true },
  privacyShowOnline: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("UserSettings", userSettingsSchema);
