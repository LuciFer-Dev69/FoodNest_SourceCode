import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, default: null },
  provider: { type: String, enum: ["local", "google"], default: "local" },
  googleId: { type: String, default: null },
  profilePicture: { type: String, default: null },
  username: { type: String, default: null },
  country: { type: String, default: "" },
  city: { type: String, default: "" },
  phone: { type: String, default: "" },
  bio: { type: String, default: "" },
  lastLogin: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
