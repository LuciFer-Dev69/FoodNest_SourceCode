import express from "express";
import { getItems, createItem, updateItem, deleteItem } from "../controllers/inventoryController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getItems);
router.post("/", authenticateToken, createItem);
router.put("/:id", authenticateToken, updateItem);
router.delete("/:id", authenticateToken, deleteItem);

export default router;
