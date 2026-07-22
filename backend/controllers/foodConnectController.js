import Donation from "../models/Donation.js";
import Notification from "../models/Notification.js";

async function notify(userId, message, type = "info", relatedId = null) {
  try {
    let notifType = "system";
    if (message.includes("confirmed") || message.includes("Pickup")) notifType = "donation_claimed";
    else if (message.includes("completed")) notifType = "donation_completed";
    else if (message.includes("cancelled")) notifType = "donation_completed";
    await Notification.create({
      recipientUser: userId,
      senderUser: null,
      type: notifType,
      title: message,
      message: "",
      relatedId,
      isRead: false,
    });
  } catch {}
}

export async function listFoodConnects(req, res) {
  try {
    const userId = req.user.id;
    const docs = await Donation.find({
      $or: [
        { userId },
        { claimedBy: userId },
      ],
      status: { $in: ["Reserved", "Completed", "Cancelled"] },
    })
      .populate("userId", "name email profilePicture")
      .populate("claimedBy", "name email profilePicture")
      .sort({ createdAt: -1 })
      .lean();

    const items = docs.map((doc) => ({
      id: doc._id,
      foodName: doc.foodName,
      category: doc.category,
      quantity: doc.quantity,
      unit: doc.unit,
      image: doc.image,
      status: doc.status,
      deliveryMethod: doc.deliveryMethod || "self_pickup",
      donor: { id: doc.userId._id, name: doc.userId.name, email: doc.userId.email, profilePicture: doc.userId.profilePicture },
      claimant: doc.claimedBy ? { id: doc.claimedBy._id, name: doc.claimedBy.name, email: doc.claimedBy.email, profilePicture: doc.claimedBy.profilePicture } : null,
      claimedAt: doc.claimedAt,
      completedAt: doc.completedAt,
      createdAt: doc.createdAt,
    }));

    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: "Failed to list food connects", error: err.message });
  }
}

export async function getFoodConnect(req, res) {
  try {
    const doc = await Donation.findById(req.params.donationId)
      .populate("userId", "name email profilePicture")
      .populate("claimedBy", "name email profilePicture")
      .lean();

    if (!doc) return res.status(404).json({ message: "Food connect not found" });

    const isDonor = doc.userId._id.toString() === req.user.id;
    const isClaimant = doc.claimedBy?._id?.toString() === req.user.id;

    if (!isDonor && !isClaimant) return res.status(403).json({ message: "Not authorized" });

    res.json({
      id: doc._id,
      foodName: doc.foodName,
      category: doc.category,
      quantity: doc.quantity,
      unit: doc.unit,
      description: doc.description,
      expirationDate: doc.expirationDate,
      pickupDate: doc.pickupDate,
      pickupTime: doc.pickupTime,
      image: doc.image,
      status: doc.status,
      pickupLocation: doc.pickupLocation || { latitude: null, longitude: null, address: "", country: "", city: "" },
      deliveryMethod: doc.deliveryMethod || "self_pickup",
      claimedAt: doc.claimedAt,
      completedAt: doc.completedAt,
      donor: { id: doc.userId._id, name: doc.userId.name, email: doc.userId.email, profilePicture: doc.userId.profilePicture },
      claimant: doc.claimedBy ? { id: doc.claimedBy._id, name: doc.claimedBy.name, email: doc.claimedBy.email, profilePicture: doc.claimedBy.profilePicture } : null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load food connect", error: err.message });
  }
}

export async function completeDelivery(req, res) {
  try {
    const doc = await Donation.findById(req.params.donationId);
    if (!doc) return res.status(404).json({ message: "Donation not found" });
    if (doc.userId.toString() !== req.user.id) return res.status(403).json({ message: "Only the donor can complete" });
    if (doc.status !== "Reserved") return res.status(400).json({ message: "Donation must be reserved first" });

    doc.status = "Completed";
    doc.completedAt = new Date();
    await doc.save();

    if (doc.claimedBy) {
      notify(doc.claimedBy.toString(), `"${doc.foodName}" donation completed. Thank you!`, "info", doc._id);
    }

    res.json({ message: "Donation completed", status: "Completed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to complete", error: err.message });
  }
}

export async function cancelFoodConnect(req, res) {
  try {
    const doc = await Donation.findById(req.params.donationId);
    if (!doc) return res.status(404).json({ message: "Donation not found" });
    if (doc.userId.toString() !== req.user.id) return res.status(403).json({ message: "Only the donor can cancel" });
    if (doc.status === "Completed") return res.status(400).json({ message: "Cannot cancel completed donation" });

    const wasClaimed = doc.claimedBy;

    doc.status = "Cancelled";
    doc.claimedBy = null;
    doc.claimedAt = null;
    await doc.save();

    if (wasClaimed) {
      notify(wasClaimed.toString(), `"${doc.foodName}" donation was cancelled.`, "info", doc._id);
    }

    res.json({ message: "Donation cancelled", status: "Cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel", error: err.message });
  }
}
