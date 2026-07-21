import express from "express";
import { getItems, getItem, createItem, updateItem, deleteItem } from "../controllers/inventoryController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", authenticateToken, getItems);
router.get("/:id", authenticateToken, getItem);
router.post("/", authenticateToken, upload.single("image"), createItem);
router.put("/:id", authenticateToken, upload.single("image"), updateItem);
router.delete("/:id", authenticateToken, deleteItem);

export default router;
