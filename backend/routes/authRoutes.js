import express from "express";
import { register, login, googleAuth, getProfile } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.get("/profile", authenticateToken, getProfile);

export default router;
