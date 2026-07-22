import express from "express";
import { getDashboard, getWeeklyStats } from "../controllers/dashboardController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getDashboard);
router.get("/weekly-stats", authenticateToken, getWeeklyStats);

export default router;
