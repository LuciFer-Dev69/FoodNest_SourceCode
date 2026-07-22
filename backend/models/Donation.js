import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  foodName: { type: String, required: true },
  category: {
    type: String,
    enum: ["Produce", "Dairy", "Bakery", "Pantry", "Meat", "Other"],
    default: "Other",
  },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, default: "unit" },
  description: { type: String, default: "" },
  expirationDate: { type: Date },
  pickupDate: { type: Date },
  pickupTime: { type: String, default: "" },
  address: { type: String, default: "" },
  city: { type: String, default: "" },
  landmark: { type: String, default: "" },
  image: { type: String, default: null },
  status: {
    type: String,
    enum: ["Available", "Reserved", "Completed", "Expired", "Cancelled"],
    default: "Available",
  },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  pickupLocation: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    address: { type: String, default: "" },
    country: { type: String, default: "" },
    city: { type: String, default: "" },
  },
  deliveryMethod: { type: String, enum: ["self_pickup", "third_party"], default: "self_pickup" },
  claimedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

donationSchema.index({ userId: 1, createdAt: -1 });
donationSchema.index({ status: 1, createdAt: -1 });
donationSchema.index({ category: 1, status: 1 });
donationSchema.index({ city: 1, status: 1 });
donationSchema.index({ foodName: "text", city: "text" });

export default mongoose.model("Donation", donationSchema);
