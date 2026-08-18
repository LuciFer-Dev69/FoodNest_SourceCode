import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/FoodNest";

let isConnected = false;

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully!");
    await dropStaleIndexes();
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
}

async function dropStaleIndexes() {
  try {
    const collection = mongoose.connection.db.collection("mealplans");
    const indexes = await collection.indexes();
    for (const idx of indexes) {
      if (idx.name === "user_id_1_slot_key_1") {
        await collection.dropIndex("user_id_1_slot_key_1");
        console.log("Dropped stale index user_id_1_slot_key_1 on mealplans");
      }
    }
  } catch (error) {
    console.warn("Failed to clean stale indexes:", error.message);
  }
}

export const db = mongoose.connection;
export const isMock = () => false;
