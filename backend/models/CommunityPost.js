import mongoose from "mongoose";

const communityPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, default: "" },
  content: { type: String, required: true },
  category: {
    type: String,
    enum: ["Recipes", "Food Tips", "Donation", "Question", "Discussion", "Success Story", "Events", "Volunteer", "Other"],
    default: "Other",
  },
  images: [{ type: String }],
  videos: [{ type: String }],
  tags: [{ type: String }],
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] },
    city: { type: String, default: "" },
    district: { type: String, default: "" },
    country: { type: String, default: "" },
    displayName: { type: String, default: "" },
  },
  pickupAvailable: { type: Boolean, default: false },
  visibility: { type: String, enum: ["public", "community"], default: "public" },
  donationId: { type: mongoose.Schema.Types.ObjectId, ref: "Donation", default: null },
  donationClaimed: { type: Boolean, default: false },
  mealPlanId: { type: mongoose.Schema.Types.ObjectId, ref: "MealPlan", default: null },
  inventoryItemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Inventory" }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  bookmarkCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

communityPostSchema.index({ userId: 1, createdAt: -1 });
communityPostSchema.index({ category: 1, createdAt: -1 });
communityPostSchema.index({ isDeleted: 1, createdAt: -1 });
communityPostSchema.index({ "location": "2dsphere" });
communityPostSchema.index({ title: "text", content: "text", tags: "text" });

export default mongoose.model("CommunityPost", communityPostSchema);
