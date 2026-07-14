import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import inventoryRoutes from "./routes/inventory.js";
import donationsRoutes from "./routes/donations.js";
import mealsRoutes from "./routes/meals.js";
import notificationsRoutes from "./routes/notifications.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes mapping
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/donations", donationsRoutes);
app.use("/api/meals", mealsRoutes);
app.use("/api/notifications", notificationsRoutes);

// General status route
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`📡 Express server is online and listening on port ${PORT}`);
});

export default server;
