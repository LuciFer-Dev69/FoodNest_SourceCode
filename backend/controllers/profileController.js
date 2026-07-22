import jwt from "jsonwebtoken";
import User from "../models/User.js";
import UserSettings from "../models/UserSettings.js";
import Inventory from "../models/Inventory.js";
import Donation from "../models/Donation.js";
import MealPlan from "../models/MealPlan.js";
import CommunityPost from "../models/CommunityPost.js";
import Notification from "../models/Notification.js";
import Achievement from "../models/Achievement.js";
import Activity from "../models/Activity.js";
import Comment from "../models/Comment.js";
import Bookmark from "../models/Bookmark.js";
import Like from "../models/Like.js";
import Report from "../models/Report.js";
import FavoriteRecipe from "../models/FavoriteRecipe.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key";

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      provider: user.provider,
      profilePicture: user.profilePicture || null,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

async function checkAndUnlockBadges(userId) {
  const unlocked = [];

  const [donations, completedDonations, mealPlans, inventoryItems, posts, existingBadges] = await Promise.all([
    Donation.countDocuments({ userId }),
    Donation.countDocuments({ userId, status: "Completed" }),
    MealPlan.countDocuments({ userId }),
    Inventory.countDocuments({ userId }),
    CommunityPost.countDocuments({ userId, isDeleted: false }),
    Achievement.find({ userId }).lean(),
  ]);

  const savedWeight = await Donation.aggregate([
    { $match: { userId: userId, status: "Completed" } },
    { $group: { _id: null, total: { $sum: "$quantity" } } },
  ]);
  const totalKg = savedWeight.length > 0 ? savedWeight[0].total : 0;

  const ownedBadges = new Set(existingBadges.map((a) => a.badge));

  const badgeChecks = [
    { badge: "First Donation", condition: completedDonations >= 1 },
    { badge: "First Meal Plan", condition: mealPlans >= 1 },
    { badge: "Inventory Starter", condition: inventoryItems >= 1 },
    { badge: "Community Helper", condition: posts >= 1 },
    { badge: "50 Donations", condition: completedDonations >= 50 },
    { badge: "100kg Saved", condition: totalKg >= 100 },
  ];

  for (const check of badgeChecks) {
    if (check.condition && !ownedBadges.has(check.badge)) {
      await Achievement.create({ userId, badge: check.badge });
      await Notification.create({
        recipientUser: userId,
        senderUser: null,
        type: "system",
        title: `Badge Unlocked: ${check.badge}`,
        message: `Congratulations! You've earned the "${check.badge}" badge.`,
        relatedId: null,
        isRead: false,
      });
      await Activity.create({
        userId,
        type: "badge_unlocked",
        description: `Unlocked badge: ${check.badge}`,
        metadata: { badge: check.badge },
      });
      unlocked.push(check.badge);
    }
  }

  return unlocked;
}

export async function getFullProfile(req, res) {
  try {
    const userId = req.user.id;

    const [user, settings] = await Promise.all([
      User.findById(userId).lean(),
      UserSettings.findOne({ userId }).lean(),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [
      donationDocs,
      completedDonations,
      claimedDonations,
      mealPlanDocs,
      inventoryDocs,
      postDocs,
      badges,
      recentActivities,
    ] = await Promise.all([
      Donation.find({ userId }).lean(),
      Donation.countDocuments({ userId, status: "Completed" }),
      Donation.countDocuments({ claimedBy: userId }),
      MealPlan.find({ userId }).lean(),
      Inventory.find({ userId }).lean(),
      CommunityPost.find({ userId, isDeleted: false }).lean(),
      Achievement.find({ userId }).sort({ unlockedAt: -1 }).lean(),
      Activity.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    const lifetimeSaved = donationDocs
      .filter((d) => d.status === "Completed")
      .reduce((sum, d) => sum + (d.quantity || 0), 0);

    const mealsPlanned = mealPlanDocs.reduce((sum, p) => sum + (p.meals ? p.meals.length : 0), 0);

    const itemsTracked = inventoryDocs.length;

    const currentInventory = inventoryDocs.length;

    const activeDonations = donationDocs.filter((d) => d.status === "Available").length;

    const wastePrevented = lifetimeSaved;

    const derivedActivities = [];

    inventoryDocs.slice(0, 5).forEach((i) => {
      derivedActivities.push({
        type: "inventory_added",
        description: `Added ${i.foodName} to Inventory`,
        createdAt: i.createdAt,
      });
    });

    donationDocs.slice(0, 5).forEach((d) => {
      derivedActivities.push({
        type: d.status === "Completed" ? "donation_completed" : "donation_created",
        description: d.status === "Completed" ? `Completed Donation: ${d.foodName}` : `Created Donation: ${d.foodName}`,
        createdAt: d.createdAt,
      });
    });

    const claimedDonationDocs = await Donation.find({ claimedBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    claimedDonationDocs.forEach((d) => {
      derivedActivities.push({
        type: "donation_claimed",
        description: `Claimed Donation: ${d.foodName}`,
        createdAt: d.createdAt,
      });
    });

    mealPlanDocs.slice(0, 5).forEach((p) => {
      (p.meals || []).forEach((m) => {
        if (m.status === "completed") {
          derivedActivities.push({
            type: "meal_completed",
            description: `Completed Meal: ${m.name || "Meal"}`,
            createdAt: p.createdAt,
          });
        }
      });
    });

    postDocs.forEach((p) => {
      derivedActivities.push({
        type: "community_post",
        description: `Created community post: ${p.title || "Untitled"}`,
        createdAt: p.createdAt,
      });
    });

    const allActivities = [...derivedActivities, ...recentActivities.map((a) => ({
      type: a.type,
      description: a.description,
      createdAt: a.createdAt,
    }))];

    allActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const timeline = allActivities.slice(0, 20);

    const badgeDefinitions = [
      { key: "First Donation", emoji: "🌱", label: "First Donation", desc: "Complete your first donation" },
      { key: "First Meal Plan", emoji: "🍲", label: "First Meal Plan", desc: "Create your first meal plan" },
      { key: "Inventory Starter", emoji: "📦", label: "Inventory Starter", desc: "Add your first inventory item" },
      { key: "Community Helper", emoji: "❤️", label: "Community Helper", desc: "Make your first community post" },
      { key: "50 Donations", emoji: "🏆", label: "50 Donations", desc: "Complete 50 donations" },
      { key: "100kg Saved", emoji: "♻️", label: "100kg Saved", desc: "Save 100kg of food" },
    ];

    const ownedBadges = new Set(badges.map((b) => b.badge));

    await checkAndUnlockBadges(userId);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        profilePicture: user.profilePicture,
        username: user.username,
        country: user.country,
        city: user.city,
        phone: user.phone,
        bio: user.bio,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
      settings: settings || { language: "en", theme: "light" },
      stats: {
        lifetimeSaved,
        donations: completedDonations,
        mealsPlanned,
        itemsTracked,
        currentInventory,
        activeDonations,
        foodClaimed: claimedDonations,
        wastePrevented,
        communityPosts: postDocs.length,
        recipesCreated: 0,
      },
      timeline,
      badges: badgeDefinitions.map((b) => ({
        ...b,
        unlocked: ownedBadges.has(b.key),
        unlockedAt: badges.find((bb) => bb.badge === b.key)?.unlockedAt || null,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, username, country, city, phone, bio } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (username !== undefined) updates.username = username;
    if (country !== undefined) updates.country = country;
    if (city !== undefined) updates.city = city;
    if (phone !== undefined) updates.phone = phone;
    if (bio !== undefined) updates.bio = bio;

    if (username) {
      const existing = await User.findOne({ username, _id: { $ne: userId } });
      if (existing) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true }).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Activity.create({
      userId,
      type: "profile_updated",
      description: "Profile information updated",
    });

    await checkAndUnlockBadges(userId);

    const token = generateToken(user);

    res.json({
      message: "Profile updated successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        profilePicture: user.profilePicture,
        username: user.username,
        country: user.country,
        city: user.city,
        phone: user.phone,
        bio: user.bio,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
}

export async function changeEmail(req, res) {
  try {
    const { newEmail, password } = req.body;

    if (!newEmail) return res.status(400).json({ message: "New email is required" });
    if (!password) return res.status(400).json({ message: "Password confirmation required" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.provider === "local" && user.password !== password) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    const existing = await User.findOne({ email: newEmail, _id: { $ne: req.user.id } });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    user.email = newEmail;
    await user.save();

    await Notification.create({
      recipientUser: req.user.id,
      senderUser: null,
      type: "system",
      title: "Email changed successfully",
      message: `Your email has been updated to ${newEmail}.`,
      relatedId: null,
      isRead: false,
    });

    await Activity.create({
      userId: req.user.id,
      type: "profile_updated",
      description: "Email address changed",
    });

    const token = generateToken(user);

    res.json({ message: "Email updated successfully", token, email: newEmail });
  } catch (err) {
    res.status(500).json({ message: "Failed to change email", error: err.message });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword) return res.status(400).json({ message: "Current password is required" });
    if (!newPassword) return res.status(400).json({ message: "New password is required" });
    if (newPassword !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.provider === "google") {
      return res.status(400).json({ message: "Google accounts use Google Sign-In" });
    }

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

    await Activity.create({
      userId: req.user.id,
      type: "password_changed",
      description: "Password changed",
    });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to change password", error: err.message });
  }
}

export async function uploadAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const profilePicture = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture },
      { new: true },
    ).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Activity.create({
      userId: req.user.id,
      type: "avatar_updated",
      description: "Profile picture updated",
    });

    const token = generateToken(user);

    res.json({
      message: "Profile picture uploaded successfully",
      token,
      profilePicture,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to upload avatar", error: err.message });
  }
}

export async function removeAvatar(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.profilePicture) {
      const fileName = path.basename(user.profilePicture);
      const oldPath = path.join(__dirname, "..", "uploads", fileName);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    user.profilePicture = null;
    await user.save();

    await Activity.create({
      userId: req.user.id,
      type: "avatar_updated",
      description: "Profile picture removed",
    });

    const token = generateToken(user);

    res.json({ message: "Profile picture removed", token, profilePicture: null });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove avatar", error: err.message });
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

    const userId = user._id;

    await Promise.all([
      Inventory.deleteMany({ userId }),
      Donation.deleteMany({ userId }),
      Donation.updateMany({ claimedBy: userId }, { $set: { claimedBy: null } }),
      MealPlan.deleteMany({ userId }),
      Notification.deleteMany({ recipientUser: userId }),
      Achievement.deleteMany({ userId }),
      Activity.deleteMany({ userId }),
      CommunityPost.deleteMany({ userId }),
      Comment.deleteMany({ userId }),
      Bookmark.deleteMany({ userId }),
      Like.deleteMany({ userId }),
      Report.deleteMany({ userId }),
      FavoriteRecipe.deleteMany({ userId }),
      UserSettings.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);

    res.json({ message: "Account and all associated data deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete account", error: err.message });
  }
}
