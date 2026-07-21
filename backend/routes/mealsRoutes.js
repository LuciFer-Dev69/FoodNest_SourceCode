import express from "express";
import { getMeals, saveMeal } from "../controllers/mealsController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getMeals);
router.post("/", authenticateToken, saveMeal);

export default router;
