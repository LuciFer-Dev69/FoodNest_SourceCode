import express from "express";
import { register, verifyRegister2FA, login, googleAuth, getProfile, forgotPassword, resetPassword } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/register/verify-2fa", verifyRegister2FA);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/profile", authenticateToken, getProfile);

export default router;
