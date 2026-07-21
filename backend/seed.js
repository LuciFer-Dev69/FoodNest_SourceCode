import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";
import Inventory from "./models/Inventory.js";
import Donation from "./models/Donation.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/FoodNest";

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Seed test user if not existing
    let user = await User.findOne({ email: "demo@foodnest.com" });
    if (!user) {
      const password_hash = await bcrypt.hash("password123", 10);
      user = await User.create({
        name: "Demo User",
        email: "demo@foodnest.com",
        password_hash,
      });
      console.log("Created demo user: demo@foodnest.com / password123");
    }

    // Seed inventory items if empty for this user
    const invCount = await Inventory.countDocuments({ user_id: user._id });
    if (invCount === 0) {
      await Inventory.create([
        { user_id: user._id, name: "Organic Milk", emoji: "🥛", qty: "1 Gallon", cat: "Dairy", loc: "Fridge", expires_in_days: 2 },
        { user_id: user._id, name: "Sourdough Bread", emoji: "🍞", qty: "1 Loaf", cat: "Bakery", loc: "Pantry", expires_in_days: 3 },
        { user_id: user._id, name: "Fresh Apples", emoji: "🍎", qty: "6 pcs", cat: "Produce", loc: "Counter", expires_in_days: 5 },
      ]);
      console.log("Seeded initial inventory items.");
    }

    // Seed sample donations if empty
    const donCount = await Donation.countDocuments();
    if (donCount === 0) {
      await Donation.create([
        { donor_id: user._id, name: "Canned Tomatoes", emoji: "🥫", qty: "3 Cans", cat: "Pantry", pickup_time: "Today 5 - 7 PM", km: 0.8, status: "Available" },
        { donor_id: user._id, name: "Fresh Bagels", emoji: "🥯", qty: "4 pcs", cat: "Bakery", pickup_time: "Tomorrow Morning", km: 1.2, status: "Available" },
      ]);
      console.log("Seeded initial community donations.");
    }

    console.log("Seeding complete!");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
