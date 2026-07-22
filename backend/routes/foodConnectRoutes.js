import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { listFoodConnects, getFoodConnect, completeDelivery, cancelFoodConnect, proposeDelivery, respondDelivery } from "../controllers/foodConnectController.js";

const router = express.Router();

router.get("/", authenticateToken, listFoodConnects);
router.post("/:donationId/propose-delivery", authenticateToken, proposeDelivery);
router.post("/:donationId/respond-delivery", authenticateToken, respondDelivery);
router.get("/:donationId", authenticateToken, getFoodConnect);
router.put("/:donationId/complete", authenticateToken, completeDelivery);
router.put("/:donationId/cancel", authenticateToken, cancelFoodConnect);

export default router;
