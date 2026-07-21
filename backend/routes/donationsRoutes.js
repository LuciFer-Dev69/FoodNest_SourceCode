import express from "express";
import { getDonations, createDonation, getHistory, claimDonation } from "../controllers/donationsController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getDonations);
router.post("/", authenticateToken, createDonation);
router.get("/history", authenticateToken, getHistory);
router.put("/:id/claim", authenticateToken, claimDonation);

export default router;
