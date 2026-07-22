import Notification from "../models/Notification.js";
import mongoose from "mongoose";

async function createNotification(recipientUser, senderUser, type, title, message, relatedId) {
  try {
    const doc = await Notification.create({
      recipientUser,
      senderUser: senderUser || null,
      type,
      title,
      message: message || "",
      relatedId: relatedId || null,
      isRead: false,
    });
    return doc;
  } catch {
    return null;
  }
}

async function checkInventoryExpiry(userId) {
  try {
    const Inventory = mongoose.model("Inventory");
    const now = new Date();
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    const twoDays = new Date(now);
    twoDays.setDate(twoDays.getDate() + 2);
    twoDays.setHours(23, 59, 59, 999);

    const expired = await Inventory.find({ userId, expirationDate: { $lt: now } }).lean();
    for (const item of expired) {
      const existing = await Notification.findOne({
        recipientUser: userId,
        type: "inventory_expired",
        relatedId: item._id,
        title: { $regex: item.foodName, $options: "i" },
      }).lean();
      if (!existing) {
        await createNotification(
          userId, null, "inventory_expired",
          `${item.foodName} has expired`,
          `Your ${item.foodName} expired. Please check and remove it from inventory.`,
          item._id,
        );
      }
    }

    const expiringToday = await Inventory.find({
      userId,
      expirationDate: { $gte: now, $lte: todayEnd },
    }).lean();
    for (const item of expiringToday) {
      const existing = await Notification.findOne({
        recipientUser: userId,
        type: "inventory_expiring",
        relatedId: item._id,
        title: { $regex: item.foodName, $options: "i" },
      }).lean();
      if (!existing) {
        await createNotification(
          userId, null, "inventory_expiring",
          `${item.foodName} expires today`,
          `Use or donate ${item.foodName} before it goes bad.`,
          item._id,
        );
      }
    }

    const expiringSoon = await Inventory.find({
      userId,
      expirationDate: { $gt: todayEnd, $lte: twoDays },
    }).lean();
    for (const item of expiringSoon) {
      const existing = await Notification.findOne({
        recipientUser: userId,
        type: "inventory_expiring",
        relatedId: item._id,
        title: { $regex: item.foodName, $options: "i" },
      }).lean();
      if (!existing) {
        const daysLeft = Math.ceil((item.expirationDate - now) / (1000 * 60 * 60 * 24));
        await createNotification(
          userId, null, "inventory_expiring",
          `${item.foodName} expires in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`,
          `Your ${item.foodName} will expire soon. Plan to use it.`,
          item._id,
        );
      }
    }
  } catch {
    // silently fail
  }
}

export async function getNotifications(req, res) {
  try {
    const { type, status, sort = "-createdAt", page = "1", limit = "50" } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { recipientUser: req.user.id };

    if (type && type !== "All") {
      if (["inventory_expiring", "inventory_expired"].includes(type)) {
        filter.type = { $in: ["inventory_expiring", "inventory_expired"] };
      } else if (["donation_created", "donation_claimed", "donation_completed"].includes(type)) {
        filter.type = { $in: ["donation_created", "donation_claimed", "donation_completed"] };
      } else if (["meal_reminder", "meal_saved"].includes(type)) {
        filter.type = { $in: ["meal_reminder", "meal_saved"] };
      } else if (["community_like", "community_comment", "community_reply"].includes(type)) {
        filter.type = { $in: ["community_like", "community_comment", "community_reply"] };
      } else if (type === "system") {
        filter.type = "system";
      }
    }

    if (status === "unread") filter.isRead = false;
    if (status === "read") filter.isRead = true;

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };

    const [docs, total] = await Promise.all([
      Notification.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(filter),
    ]);

    const items = docs.map((d) => ({
      id: d._id,
      type: d.type,
      title: d.title,
      message: d.message,
      relatedId: d.relatedId,
      isRead: d.isRead,
      senderUser: d.senderUser,
      createdAt: d.createdAt,
    }));

    const unreadCount = await Notification.countDocuments({ recipientUser: req.user.id, isRead: false });

    res.json({
      items,
      unreadCount,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications", error: err.message });
  }
}

export async function getUnreadCount(req, res) {
  try {
    const count = await Notification.countDocuments({ recipientUser: req.user.id, isRead: false });
    res.json({ unreadCount: count });
  } catch (err) {
    res.status(500).json({ message: "Failed to get unread count", error: err.message });
  }
}

export async function markAsRead(req, res) {
  try {
    const doc = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientUser: req.user.id },
      { isRead: true },
      { new: true },
    ).lean();
    if (!doc) return res.status(404).json({ message: "Notification not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark as read", error: err.message });
  }
}

export async function markAllRead(req, res) {
  try {
    await Notification.updateMany(
      { recipientUser: req.user.id, isRead: false },
      { isRead: true },
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark all as read", error: err.message });
  }
}

export async function deleteNotification(req, res) {
  try {
    const doc = await Notification.findOneAndDelete({ _id: req.params.id, recipientUser: req.user.id });
    if (!doc) return res.status(404).json({ message: "Notification not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete notification", error: err.message });
  }
}

export async function deleteReadNotifications(req, res) {
  try {
    await Notification.deleteMany({ recipientUser: req.user.id, isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete read notifications", error: err.message });
  }
}

export async function checkExpiryNotifications(req, res) {
  try {
    await checkInventoryExpiry(req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to check expiry", error: err.message });
  }
}

export { createNotification, checkInventoryExpiry };
