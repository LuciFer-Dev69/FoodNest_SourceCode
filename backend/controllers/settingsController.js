import UserSettings from "../models/UserSettings.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Inventory from "../models/Inventory.js";
import Donation from "../models/Donation.js";
import MealPlan from "../models/MealPlan.js";

export async function getSettings(req, res) {
  try {
    let settings = await UserSettings.findOne({ userId: req.user.id }).lean();
    if (!settings) {
      settings = await UserSettings.create({ userId: req.user.id });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch settings", error: err.message });
  }
}

export async function updateSettings(req, res) {
  try {
    const allowed = [
      "language", "theme", "fontSize", "animations",
      "notifyInventory", "notifyDonations", "notifyCommunity", "notifyMeals",
      "notifyWeekly", "notifyEmail", "notifyPush",
      "privacyPublicProfile", "privacyShowDonations", "privacyAllowMessages", "privacyShowOnline",
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const doc = await UserSettings.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { upsert: true, returnDocument: 'after' },
    ).lean();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Failed to update settings", error: err.message });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword) return res.status(400).json({ message: "Current password is required" });
    if (!newPassword) return res.status(400).json({ message: "New password is required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.provider === "google") return res.status(400).json({ message: "Google accounts use Google Sign-In" });

    if (user.password !== currentPassword) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    if (newPassword.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
    if (!/[A-Z]/.test(newPassword)) return res.status(400).json({ message: "Password must contain an uppercase letter" });
    if (!/[a-z]/.test(newPassword)) return res.status(400).json({ message: "Password must contain a lowercase letter" });
    if (!/[0-9]/.test(newPassword)) return res.status(400).json({ message: "Password must contain a number" });
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return res.status(400).json({ message: "Password must contain a special character" });
    }

    user.password = newPassword;
    await user.save();

    await Notification.create({
      recipientUser: req.user.id,
      senderUser: null,
      type: "system",
      title: "Password changed successfully",
      message: "Your password was updated. Please use your new password next time you log in.",
      relatedId: null,
      isRead: false,
    });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to change password", error: err.message });
  }
}

export async function deleteAccount(req, res) {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Password is required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.provider === "local" && user.password !== password) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    user.name = "Deleted User";
    user.email = `deleted-${user._id}@foodnest.app`;
    user.password = null;
    user.provider = "deleted";
    user.deletedAt = new Date();
    await user.save();

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete account", error: err.message });
  }
}

export async function exportData(req, res) {
  try {
    const { type } = req.query;

    if (type === "inventory") {
      const items = await Inventory.find({ userId: req.user.id }).lean();
      const csv = ["foodName,category,quantity,unit,expirationDate,storageLocation,status"]
        .concat(items.map((i) => `"${i.foodName}","${i.category}",${i.quantity},"${i.unit}","${i.expirationDate || ""}","${i.storageLocation}","${i.status || ""}"`))
        .join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=inventory.csv");
      return res.send(csv);
    }

    if (type === "donations") {
      const items = await Donation.find({ userId: req.user.id }).lean();
      const csv = ["foodName,category,quantity,unit,status,city,createdAt"]
        .concat(items.map((i) => `"${i.foodName}","${i.category}",${i.quantity},"${i.unit}","${i.status}","${i.city || ""}","${i.createdAt || ""}"`))
        .join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=donations.csv");
      return res.send(csv);
    }

    if (type === "mealplans") {
      const plans = await MealPlan.find({ userId: req.user.id }).lean();
      const rows = ["name,day,slot,meal,status"];
      plans.forEach((p) => {
        (p.meals || []).forEach((m) => {
          const day = m.slotKey ? m.slotKey.split("-")[0] : "";
          const slot = m.slotKey ? m.slotKey.split("-")[1] : "";
          rows.push(`"${p.name || "Plan"}","${day}","${slot}","${m.name}","${m.status}"`);
        });
      });
      const csv = rows.join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=mealplans.csv");
      return res.send(csv);
    }

    if (type === "all") {
      const [inventory, donations, mealPlans, user] = await Promise.all([
        Inventory.find({ userId: req.user.id }).lean(),
        Donation.find({ userId: req.user.id }).lean(),
        MealPlan.find({ userId: req.user.id }).lean(),
        User.findById(req.user.id, "name email createdAt").lean(),
      ]);
      return res.json({ user, inventory, donations, mealPlans });
    }

    res.status(400).json({ message: "Invalid export type" });
  } catch (err) {
    res.status(500).json({ message: "Failed to export data", error: err.message });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id, "name email provider profilePicture createdAt").lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      provider: user.provider,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
}
