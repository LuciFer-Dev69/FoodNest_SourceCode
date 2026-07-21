import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  foodName: { type: String, required: true },
  category: {
    type: String,
    enum: ["Produce", "Dairy", "Bakery", "Pantry", "Meat", "Other"],
    default: "Other",
  },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, default: "unit" },
  purchaseDate: { type: Date, default: Date.now },
  expirationDate: { type: Date, required: true },
  storageLocation: {
    type: String,
    enum: ["Fridge", "Freezer", "Pantry", "Counter", "Other"],
    default: "Fridge",
  },
  notes: { type: String, default: "" },
  image: { type: String, default: null },
}, { timestamps: true });

inventorySchema.index({ userId: 1, foodName: 1 });
inventorySchema.index({ userId: 1, category: 1 });
inventorySchema.index({ userId: 1, expirationDate: 1 });

export default mongoose.model("Inventory", inventorySchema);
