import Inventory from "../models/Inventory.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";

const VALID_SORT_FIELDS = ["foodName", "category", "quantity", "expirationDate", "createdAt", "-foodName", "-category", "-quantity", "-expirationDate", "-createdAt"];

function getExpirationStatus(expirationDate) {
  const now = new Date();
  const exp = new Date(expirationDate);
  const diff = exp - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return { status: "Expired", days: days, badge: "bg-destructive/15 text-destructive" };
  if (days <= 3) return { status: "Expiring Soon", days, badge: "bg-warning/15 text-warning" };
  if (days <= 7) return { status: "Fresh", days, badge: "bg-[oklch(0.85_0.16_85)]/20 text-[oklch(0.55_0.16_60)]" };
  return { status: "Fresh", days, badge: "bg-success/15 text-success" };
}

async function createNotification(userId, message, type = "info") {
  try {
    await Notification.create({
      recipientUser: userId,
      senderUser: null,
      type: type === "warning" ? "inventory_expiring" : type === "success" ? "system" : "system",
      title: message,
      message: "",
      relatedId: null,
      isRead: false,
    });
  } catch {
    // silently fail
  }
}

function formatItem(doc) {
  const expStatus = getExpirationStatus(doc.expirationDate);
  return {
    id: doc._id,
    foodName: doc.foodName,
    category: doc.category,
    quantity: doc.quantity,
    unit: doc.unit,
    purchaseDate: doc.purchaseDate,
    expirationDate: doc.expirationDate,
    storageLocation: doc.storageLocation,
    notes: doc.notes,
    image: doc.image,
    status: expStatus.status,
    statusDays: expStatus.days,
    badge: expStatus.badge,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function getItems(req, res) {
  try {
    const { search, category, status, storageLocation, sort, page = "1", limit = "50" } = req.query;
    const query = { userId: new mongoose.Types.ObjectId(req.user.id) };

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [
        { foodName: regex },
        { category: regex },
        { storageLocation: regex },
        { notes: regex },
      ];
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (storageLocation && storageLocation !== "All") {
      query.storageLocation = storageLocation;
    }

    let sortOption = { createdAt: -1 };
    if (sort && VALID_SORT_FIELDS.includes(sort)) {
      const desc = sort.startsWith("-");
      const field = desc ? sort.slice(1) : sort;
      sortOption = { [field]: desc ? -1 : 1 };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [docs, total] = await Promise.all([
      Inventory.find(query).sort(sortOption).skip(skip).limit(limitNum).lean(),
      Inventory.countDocuments(query),
    ]);

    let items = docs.map(formatItem);

    if (status && status !== "All") {
      items = items.filter((i) => i.status === status);
    }

    res.json({
      items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch inventory", error: err.message });
  }
}

export async function getItem(req, res) {
  try {
    const doc = await Inventory.findOne({ _id: req.params.id, userId: req.user.id }).lean();
    if (!doc) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(formatItem(doc));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch item", error: err.message });
  }
}

export async function createItem(req, res) {
  const { foodName, category, quantity, unit, purchaseDate, expirationDate, storageLocation, notes } = req.body;

  if (!foodName) {
    return res.status(400).json({ message: "Food name is required." });
  }
  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be greater than zero." });
  }
  if (!expirationDate) {
    return res.status(400).json({ message: "Expiration date is required." });
  }

  const expDate = new Date(expirationDate);
  if (isNaN(expDate.getTime())) {
    return res.status(400).json({ message: "Invalid expiration date." });
  }

  const purDate = purchaseDate ? new Date(purchaseDate) : new Date();
  if (expDate < purDate) {
    return res.status(400).json({ message: "Expiration date cannot be before purchase date." });
  }

  try {
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const doc = await Inventory.create({
      userId: req.user.id,
      foodName,
      category: category || "Other",
      quantity: parseFloat(quantity),
      unit: unit || "unit",
      purchaseDate: purDate,
      expirationDate: expDate,
      storageLocation: storageLocation || "Fridge",
      notes: notes || "",
      image,
    });

    const expStatus = getExpirationStatus(expDate);
    if (expStatus.status === "Expiring Soon" || expStatus.status === "Expired") {
      createNotification(req.user.id, `${foodName} is ${expStatus.status.toLowerCase()} in your inventory.`, "warning");
    }

    createNotification(req.user.id, `${foodName} added to inventory.`, "info");

    res.status(201).json(formatItem(doc));
  } catch (err) {
    res.status(500).json({ message: "Failed to save inventory item", error: err.message });
  }
}

export async function updateItem(req, res) {
  const { foodName, category, quantity, unit, purchaseDate, expirationDate, storageLocation, notes } = req.body;

  try {
    const existing = await Inventory.findOne({ _id: req.params.id, userId: req.user.id });
    if (!existing) {
      return res.status(404).json({ message: "Item not found or unauthorized." });
    }

    if (foodName !== undefined && !foodName) {
      return res.status(400).json({ message: "Food name is required." });
    }

    if (quantity !== undefined && (quantity === "" || parseFloat(quantity) <= 0)) {
      return res.status(400).json({ message: "Quantity must be greater than zero." });
    }

    const updates = {};
    if (foodName !== undefined) updates.foodName = foodName;
    if (category !== undefined) updates.category = category;
    if (quantity !== undefined) updates.quantity = parseFloat(quantity);
    if (unit !== undefined) updates.unit = unit;
    if (storageLocation !== undefined) updates.storageLocation = storageLocation;
    if (notes !== undefined) updates.notes = notes;

    if (purchaseDate !== undefined) {
      updates.purchaseDate = new Date(purchaseDate);
    }

    if (expirationDate !== undefined) {
      const newExp = new Date(expirationDate);
      const pur = updates.purchaseDate || existing.purchaseDate;
      if (newExp < pur) {
        return res.status(400).json({ message: "Expiration date cannot be before purchase date." });
      }
      updates.expirationDate = newExp;
    } else if (purchaseDate !== undefined) {
      const pur = new Date(purchaseDate);
      if (existing.expirationDate < pur) {
        return res.status(400).json({ message: "Expiration date cannot be before purchase date." });
      }
    }

    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    const doc = await Inventory.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updates },
      { returnDocument: 'after', runValidators: true },
    ).lean();

    createNotification(req.user.id, `${doc.foodName} updated in inventory.`, "info");

    res.json(formatItem(doc));
  } catch (err) {
    res.status(500).json({ message: "Failed to update inventory item", error: err.message });
  }
}

export async function deleteItem(req, res) {
  try {
    const doc = await Inventory.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!doc) {
      return res.status(404).json({ message: "Item not found or unauthorized." });
    }

    createNotification(req.user.id, `${doc.foodName} removed from inventory.`, "info");

    res.json({ message: "Item deleted successfully", foodName: doc.foodName });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete item", error: err.message });
  }
}
