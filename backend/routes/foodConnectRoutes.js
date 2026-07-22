import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { getFoodConnect, completeDelivery, cancelFoodConnect } from "../controllers/foodConnectController.js";

const router = express.Router();

router.get("/:donationId", authenticateToken, getFoodConnect);
router.put("/:donationId/complete", authenticateToken, completeDelivery);
router.put("/:donationId/cancel", authenticateToken, cancelFoodConnect);

export default router;
