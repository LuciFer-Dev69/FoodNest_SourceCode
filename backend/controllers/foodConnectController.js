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
      deliveryMethod: doc.deliveryMethod || null,
      deliveryStatus: doc.deliveryStatus || "none",
      deliveryPartner: doc.deliveryPartner || null,
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
      deliveryMethod: doc.deliveryMethod || null,
      deliveryStatus: doc.deliveryStatus || "none",
      deliveryPartner: doc.deliveryPartner || null,
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
    doc.deliveryMethod = null;
    doc.deliveryStatus = "none";
    doc.deliveryPartner = null;
    await doc.save();

    if (wasClaimed) {
      notify(wasClaimed.toString(), `"${doc.foodName}" donation was cancelled.`, "info", doc._id);
    }

    res.json({ message: "Donation cancelled", status: "Cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel", error: err.message });
  }
}

export async function proposeDelivery(req, res) {
  try {
    const doc = await Donation.findById(req.params.donationId);
    if (!doc) return res.status(404).json({ message: "Donation not found" });
    if (doc.status !== "Reserved") return res.status(400).json({ message: "Donation must be reserved first" });
    if (!doc.claimedBy || doc.claimedBy.toString() !== req.user.id) return res.status(403).json({ message: "Only the claimant can propose delivery" });
    if (doc.deliveryStatus !== "none") return res.status(400).json({ message: "Delivery method already proposed" });

    const { deliveryMethod, deliveryPartner } = req.body;
    if (!deliveryMethod || !["self_pickup", "third_party"].includes(deliveryMethod)) {
      return res.status(400).json({ message: "Invalid delivery method" });
    }

    const country = doc.pickupLocation?.country || "";
    const PARTNERS = {
      Nepal: ["Yango", "InDrive", "Pathao"],
      Malaysia: ["Grab", "InDrive", "Maxim", "Air Asia Ride"],
    };
    const validPartners = PARTNERS[country] || [];

    if (deliveryMethod === "third_party" && (!deliveryPartner || !validPartners.includes(deliveryPartner))) {
      return res.status(400).json({ message: "Please select a valid delivery partner" });
    }

    doc.deliveryMethod = deliveryMethod;
    doc.deliveryPartner = deliveryPartner || null;

    if (deliveryMethod === "self_pickup") {
      doc.deliveryStatus = "accepted";
    } else {
      doc.deliveryStatus = "proposed";
      notify(doc.userId.toString(), `"${doc.foodName}" - Claimant proposes delivery via ${deliveryPartner}. Please review.`, "info", doc._id);
    }

    await doc.save();

    const populated = await Donation.findById(doc._id)
      .populate("userId", "name email profilePicture")
      .populate("claimedBy", "name email profilePicture")
      .lean();

    res.json({
      id: populated._id,
      foodName: populated.foodName,
      category: populated.category,
      quantity: populated.quantity,
      unit: populated.unit,
      description: populated.description,
      expirationDate: populated.expirationDate,
      pickupDate: populated.pickupDate,
      pickupTime: populated.pickupTime,
      image: populated.image,
      status: populated.status,
      pickupLocation: populated.pickupLocation || { latitude: null, longitude: null, address: "", country: "", city: "" },
      deliveryMethod: populated.deliveryMethod || null,
      deliveryStatus: populated.deliveryStatus || "none",
      deliveryPartner: populated.deliveryPartner || null,
      claimedAt: populated.claimedAt,
      completedAt: populated.completedAt,
      donor: { id: populated.userId._id, name: populated.userId.name, email: populated.userId.email, profilePicture: populated.userId.profilePicture },
      claimant: populated.claimedBy ? { id: populated.claimedBy._id, name: populated.claimedBy.name, email: populated.claimedBy.email, profilePicture: populated.claimedBy.profilePicture } : null,
      createdAt: populated.createdAt,
      updatedAt: populated.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to propose delivery", error: err.message });
  }
}

export async function respondDelivery(req, res) {
  try {
    const doc = await Donation.findById(req.params.donationId);
    if (!doc) return res.status(404).json({ message: "Donation not found" });
    if (doc.userId.toString() !== req.user.id) return res.status(403).json({ message: "Only the donor can respond" });
    if (doc.status !== "Reserved") return res.status(400).json({ message: "Donation must be reserved first" });
    if (doc.deliveryStatus !== "proposed") return res.status(400).json({ message: "No pending delivery proposal" });

    const { accept } = req.body;

    if (accept) {
      doc.deliveryStatus = "accepted";
      await doc.save();
      if (doc.claimedBy) {
        const partner = doc.deliveryPartner ? ` via ${doc.deliveryPartner}` : "";
        notify(doc.claimedBy.toString(), `"${doc.foodName}" - Donor accepted delivery${partner}.`, "info", doc._id);
      }
      res.json({ message: "Delivery accepted", deliveryStatus: "accepted" });
    } else {
      const claimantId = doc.claimedBy?.toString();
      doc.status = "Cancelled";
      doc.claimedBy = null;
      doc.claimedAt = null;
      doc.deliveryMethod = null;
      doc.deliveryStatus = "none";
      doc.deliveryPartner = null;
      await doc.save();
      if (claimantId) {
        notify(claimantId, `"${doc.foodName}" - Donor rejected third-party delivery. Claim cancelled.`, "info", doc._id);
      }
      res.json({ message: "Delivery rejected, claim cancelled", status: "Cancelled" });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to respond to delivery", error: err.message });
  }
}
