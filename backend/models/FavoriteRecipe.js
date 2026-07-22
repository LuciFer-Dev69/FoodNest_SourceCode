import mongoose from "mongoose";

const favoriteRecipeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  emoji: { type: String, default: "🍽️" },
}, { timestamps: true });

favoriteRecipeSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model("FavoriteRecipe", favoriteRecipeSchema);
