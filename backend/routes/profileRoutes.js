import express from "express";
import {
  getFullProfile,
  updateProfile,
  changeEmail,
  changePassword,
  uploadAvatar,
  removeAvatar,
  deleteAccount,
} from "../controllers/profileController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", authenticateToken, getFullProfile);
router.put("/", authenticateToken, updateProfile);
router.put("/email", authenticateToken, changeEmail);
router.put("/password", authenticateToken, changePassword);
router.post("/avatar", authenticateToken, upload.single("avatar"), uploadAvatar);
router.delete("/avatar", authenticateToken, removeAvatar);
router.delete("/account", authenticateToken, deleteAccount);

export default router;
