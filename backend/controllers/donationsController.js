import Donation from "../models/Donation.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";

const VALID_SORT = ["createdAt", "-createdAt", "foodName", "-foodName", "quantity", "-quantity", "expirationDate", "-expirationDate"];

async function notify(userId, message, type = "info") {
  try {
    let notifType = "system";
    let title = message;
    if (type === "success" && message.includes("claimed")) notifType = "donation_claimed";
    else if (message.includes("published") || message.includes("created")) notifType = "donation_created";
    else if (message.includes("completed") || message.includes("Completed")) notifType = "donation_completed";
    await Notification.create({
      recipientUser: userId,
      senderUser: null,
      type: notifType,
      title,
      message: "",
      relatedId: null,
      isRead: false,
    });
  } catch {
    // silently fail
  }
}

function formatDonation(doc, currentUserId) {
  const idStr = doc._id.toString();
  const ownerId = doc.userId?._id ? doc.userId._id.toString() : doc.userId?.toString();
  const donorName = doc.userId?.name || "Unknown";
  const donorEmail = doc.userId?.email || "";

  return {
    id: idStr,
    foodName: doc.foodName,
    category: doc.category,
    quantity: doc.quantity,
    unit: doc.unit,
    description: doc.description,
    expirationDate: doc.expirationDate,
    pickupDate: doc.pickupDate,
    pickupTime: doc.pickupTime,
    address: doc.address,
    city: doc.city,
    landmark: doc.landmark,
    image: doc.image,
    status: doc.status,
    claimedBy: doc.claimedBy?.toString() || null,
    donor: { id: ownerId, name: donorName, email: donorEmail },
    isOwner: ownerId === currentUserId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function getDonations(req, res) {
  try {
    const { search, category, status, city, sort = "-createdAt", page = "1", limit = "50" } = req.query;
    const query = { status: "Available" };

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [
        { foodName: regex },
        { category: regex },
        { city: regex },
      ];
    }
    if (category && category !== "All") query.category = category;
    if (status && status !== "All") query.status = status;
    if (city && city !== "All") {
      const cityRegex = new RegExp(city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.city = cityRegex;
    }

    let sortOption = { createdAt: -1 };
    if (sort && VALID_SORT.includes(sort)) {
      const desc = sort.startsWith("-");
      const field = desc ? sort.slice(1) : sort;
      sortOption = { [field]: desc ? -1 : 1 };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [docs, total] = await Promise.all([
      Donation.find(query)
        .populate("userId", "name email")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Donation.countDocuments(query),
    ]);

    const items = docs.map((d) => formatDonation(d, req.user.id));

    res.json({
      items,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch donations", error: err.message });
  }
}

export async function getMyDonations(req, res) {
  try {
    const { search, category, status, sort = "-createdAt", page = "1", limit = "50" } = req.query;
    const query = { userId: new mongoose.Types.ObjectId(req.user.id) };

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [{ foodName: regex }, { category: regex }, { city: regex }];
    }
    if (category && category !== "All") query.category = category;
    if (status && status !== "All") query.status = status;

    let sortOption = { createdAt: -1 };
    if (sort && VALID_SORT.includes(sort)) {
      const desc = sort.startsWith("-");
      const field = desc ? sort.slice(1) : sort;
      sortOption = { [field]: desc ? -1 : 1 };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [docs, total] = await Promise.all([
      Donation.find(query)
        .populate("userId", "name email")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Donation.countDocuments(query),
    ]);

    const items = docs.map((d) => formatDonation(d, req.user.id));

    res.json({
      items,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your donations", error: err.message });
  }
}

export async function getDonationById(req, res) {
  try {
    const doc = await Donation.findById(req.params.id)
      .populate("userId", "name email")
      .populate("claimedBy", "name email")
      .lean();

    if (!doc) return res.status(404).json({ message: "Donation not found" });

    res.json(formatDonation(doc, req.user.id));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch donation", error: err.message });
  }
}

export async function createDonation(req, res) {
  const { foodName, category, quantity, unit, description, expirationDate, pickupDate, pickupTime, address, city, landmark } = req.body;

  if (!foodName) return res.status(400).json({ message: "Food name is required." });
  if (!quantity || parseFloat(quantity) <= 0) return res.status(400).json({ message: "Quantity must be greater than zero." });

  if (pickupDate) {
    const pDate = new Date(pickupDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (pDate < today) return res.status(400).json({ message: "Pickup date cannot be in the past." });
  }

  try {
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const doc = await Donation.create({
      userId: req.user.id,
      foodName,
      category: category || "Other",
      quantity: parseFloat(quantity),
      unit: unit || "unit",
      description: description || "",
      expirationDate: expirationDate || null,
      pickupDate: pickupDate || null,
      pickupTime: pickupTime || "",
      address: address || "",
      city: city || "",
      landmark: landmark || "",
      image,
      status: "Available",
    });

    const populated = await Donation.findById(doc._id)
      .populate("userId", "name email")
      .lean();

    notify(req.user.id, `Donation "${foodName}" published successfully.`, "success");

    res.status(201).json(formatDonation(populated, req.user.id));
  } catch (err) {
    res.status(500).json({ message: "Failed to create donation", error: err.message });
  }
}

export async function updateDonation(req, res) {
  try {
    const doc = await Donation.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Donation not found." });
    if (doc.userId.toString() !== req.user.id) return res.status(403).json({ message: "You can only edit your own donations." });
    if (doc.status !== "Available") return res.status(400).json({ message: "Only available donations can be edited." });

    const { foodName, category, quantity, unit, description, expirationDate, pickupDate, pickupTime, address, city, landmark } = req.body;

    if (foodName !== undefined && !foodName) return res.status(400).json({ message: "Food name is required." });

    const updates = {};
    if (foodName !== undefined) updates.foodName = foodName;
    if (category !== undefined) updates.category = category;
    if (quantity !== undefined) {
      const q = parseFloat(quantity);
      if (q <= 0) return res.status(400).json({ message: "Quantity must be greater than zero." });
      updates.quantity = q;
    }
    if (unit !== undefined) updates.unit = unit;
    if (description !== undefined) updates.description = description;
    if (expirationDate !== undefined) updates.expirationDate = expirationDate || null;
    if (pickupDate !== undefined) {
      const pDate = new Date(pickupDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (pDate < today) return res.status(400).json({ message: "Pickup date cannot be in the past." });
      updates.pickupDate = pDate;
    }
    if (pickupTime !== undefined) updates.pickupTime = pickupTime;
    if (address !== undefined) updates.address = address;
    if (city !== undefined) updates.city = city;
    if (landmark !== undefined) updates.landmark = landmark;

    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    const updated = await Donation.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true })
      .populate("userId", "name email")
      .lean();

    notify(req.user.id, `Donation "${updated.foodName}" updated.`, "info");

    res.json(formatDonation(updated, req.user.id));
  } catch (err) {
    res.status(500).json({ message: "Failed to update donation", error: err.message });
  }
}

export async function claimDonation(req, res) {
  try {
    const doc = await Donation.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Donation not found." });
    if (doc.status !== "Available") return res.status(400).json({ message: "This donation is no longer available." });
    if (doc.userId.toString() === req.user.id) return res.status(400).json({ message: "You cannot claim your own donation." });

    doc.status = "Reserved";
    doc.claimedBy = new mongoose.Types.ObjectId(req.user.id);
    await doc.save();

    const populated = await Donation.findById(doc._id)
      .populate("userId", "name email")
      .populate("claimedBy", "name email")
      .lean();

    notify(doc.userId.toString(), `Your donation "${doc.foodName}" has been claimed.`, "info");

    res.json(formatDonation(populated, req.user.id));
  } catch (err) {
    res.status(500).json({ message: "Failed to claim donation", error: err.message });
  }
}

export async function completeDonation(req, res) {
  try {
    const doc = await Donation.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Donation not found." });
    if (doc.userId.toString() !== req.user.id) return res.status(403).json({ message: "You can only complete your own donations." });
    if (doc.status !== "Reserved") return res.status(400).json({ message: "Only reserved donations can be marked as completed." });

    doc.status = "Completed";
    await doc.save();

    notify(req.user.id, `Donation "${doc.foodName}" marked as completed.`, "success");

    res.json({ message: "Donation completed successfully", id: doc._id });
  } catch (err) {
    res.status(500).json({ message: "Failed to complete donation", error: err.message });
  }
}

export async function deleteDonation(req, res) {
  try {
    const doc = await Donation.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Donation not found." });
    if (doc.userId.toString() !== req.user.id) return res.status(403).json({ message: "You can only delete your own donations." });
    if (doc.status === "Completed") return res.status(400).json({ message: "Completed donations cannot be deleted." });

    await Donation.findByIdAndDelete(req.params.id);

    notify(req.user.id, `Donation "${doc.foodName}" deleted.`, "info");

    res.json({ message: "Donation deleted successfully", foodName: doc.foodName });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete donation", error: err.message });
  }
}

export async function getHistory(req, res) {
  try {
    const docs = await Donation.find({ claimedBy: req.user.id, status: { $in: ["Reserved", "Completed"] } })
      .populate("userId", "name")
      .select("foodName category quantity pickupDate pickupTime status createdAt")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const history = docs.map((r) => ({
      id: r._id,
      kind: "donation",
      title: r.foodName,
      subtitle: `${r.category} · ${r.pickupTime || "No pickup time"}`,
      createdAt: r.createdAt,
    }));

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Failed to load donation history", error: err.message });
  }
}
