import express from "express";
import {
  getDonations,
  getMyDonations,
  getDonationById,
  createDonation,
  updateDonation,
  claimDonation,
  completeDonation,
  deleteDonation,
  getHistory,
} from "../controllers/donationsController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", authenticateToken, getDonations);
router.get("/my", authenticateToken, getMyDonations);
router.get("/history", authenticateToken, getHistory);
router.get("/:id", authenticateToken, getDonationById);
router.post("/", authenticateToken, upload.single("image"), createDonation);
router.put("/:id", authenticateToken, upload.single("image"), updateDonation);
router.put("/:id/claim", authenticateToken, claimDonation);
router.put("/:id/complete", authenticateToken, completeDonation);
router.delete("/:id", authenticateToken, deleteDonation);

export default router;
