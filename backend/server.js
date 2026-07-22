import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import donationsRoutes from "./routes/donationsRoutes.js";
import mealsRoutes from "./routes/mealsRoutes.js";
import notificationsRoutes from "./routes/notificationsRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import foodConnectRoutes from "./routes/foodConnectRoutes.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/donations", donationsRoutes);
app.use("/api/meals", mealsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/food-connect", foodConnectRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ message: err.message || "Internal server error" });
});

let server;
if (process.env.NODE_ENV !== "test") {
  const startServer = (retries = 5) => {
    server = app.listen(PORT, () => {
      console.log(`Express server is online and listening on port ${PORT}`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE" && retries > 0) {
        console.warn(`Port ${PORT} busy (TIME_WAIT), retrying in 3s... (${retries} retries left)`);
        server.close();
        setTimeout(() => startServer(retries - 1), 3000);
      } else {
        console.error("Server error:", err.message);
        process.exit(1);
      }
    });
  };

  connectDB().then(() => startServer());
}

export default app;
export { server };
