import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  emoji: { type: String, default: "🍲" },
  qty: { type: String, required: true },
  cat: { type: String, required: true },
  loc: { type: String, required: true },
  expires_in_days: { type: Number, default: 3 },
}, { timestamps: { createdAt: "created_at" } });

export default mongoose.model("Inventory", inventorySchema);
