import Notification from "../models/Notification.js";

export async function getNotifications(req, res) {
  try {
    const rows = await Notification.find({ user_id: req.user.id })
      .select("message type is_read created_at")
      .sort({ created_at: -1 });
    const result = rows.map((r) => ({
      id: r._id,
      message: r.message,
      type: r.type,
      isRead: r.is_read,
      createdAt: r.created_at,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications", error: err.message });
  }
}

export async function markAllRead(req, res) {
  try {
    await Notification.updateMany(
      { user_id: req.user.id, is_read: false },
      { is_read: true }
    );
    res.json({ success: true, message: "Notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notifications", error: err.message });
  }
}

export async function createNotification(req, res) {
  const { message, type } = req.body;
  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  try {
    const notification = await Notification.create({
      user_id: req.user.id,
      message,
      type: type || "info",
    });
    res.status(201).json({
      id: notification._id,
      message,
      type: type || "info",
      isRead: false,
      createdAt: new Date(),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to trigger notification", error: err.message });
  }
}
