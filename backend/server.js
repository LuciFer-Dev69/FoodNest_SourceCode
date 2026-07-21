import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import donationsRoutes from "./routes/donationsRoutes.js";
import mealsRoutes from "./routes/mealsRoutes.js";
import notificationsRoutes from "./routes/notificationsRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Start Express server only when run directly (prevents port collisions in tests)
let server;
if (process.env.NODE_ENV !== "test") {
  connectDB().then(() => {
    server = app.listen(PORT, () => {
      console.log(`Express server is online and listening on port ${PORT}`);
    });
  });
}

export default app;
export { server };
