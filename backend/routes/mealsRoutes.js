import express from "express";
import {
  getCurrentPlan,
  saveCurrentPlan,
  listPlans,
  getPlan,
  deletePlan,
  duplicatePlan,
  generateRandomPlan,
  getSuggestions,
  updateMealStatus,
  getMealSummary,
  getShoppingList,
  addFavorite,
  listFavorites,
  removeFavorite,
  searchRecipes,
  getTemplates,
} from "../controllers/mealsController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getCurrentPlan);
router.post("/", authenticateToken, saveCurrentPlan);
router.get("/templates", authenticateToken, getTemplates);
router.get("/plans", authenticateToken, listPlans);
router.get("/plans/:id", authenticateToken, getPlan);
router.delete("/plans/:id", authenticateToken, deletePlan);
router.post("/plans/:id/duplicate", authenticateToken, duplicatePlan);
router.post("/generate", authenticateToken, generateRandomPlan);
router.get("/suggestions", authenticateToken, getSuggestions);
router.put("/meals/:slotKey", authenticateToken, updateMealStatus);
router.get("/summary", authenticateToken, getMealSummary);
router.get("/shopping-list", authenticateToken, getShoppingList);
router.get("/favorites", authenticateToken, listFavorites);
router.post("/favorites", authenticateToken, addFavorite);
router.delete("/favorites/:id", authenticateToken, removeFavorite);
router.get("/search", authenticateToken, searchRecipes);

export default router;
