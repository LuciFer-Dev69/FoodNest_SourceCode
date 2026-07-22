import express from "express";
import {
  getSettings, updateSettings,
  changePassword, deleteAccount,
  exportData, getProfile,
} from "../controllers/settingsController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getSettings);
router.put("/", authenticateToken, updateSettings);
router.post("/change-password", authenticateToken, changePassword);
router.post("/delete-account", authenticateToken, deleteAccount);
router.get("/export", authenticateToken, exportData);
router.get("/profile", authenticateToken, getProfile);

export default router;
