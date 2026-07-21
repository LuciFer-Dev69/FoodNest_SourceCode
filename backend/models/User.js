import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, default: null },
  provider: { type: String, enum: ["local", "google"], default: "local" },
  googleId: { type: String, default: null },
  profilePicture: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
