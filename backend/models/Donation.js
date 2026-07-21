import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  donor_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  claimant_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  name: { type: String, required: true },
  emoji: { type: String, default: "🍞" },
  qty: { type: String, required: true },
  cat: { type: String, required: true },
  pickup_time: { type: String, required: true },
  status: { type: String, enum: ["Available", "Reserved", "Claimed", "Expired"], default: "Available" },
  km: { type: Number, default: 0.0 },
}, { timestamps: { createdAt: "created_at" } });

export default mongoose.model("Donation", donationSchema);
