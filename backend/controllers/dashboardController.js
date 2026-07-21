import mongoose from "mongoose";
import User from "../models/User.js";
import Inventory from "../models/Inventory.js";
import Donation from "../models/Donation.js";
import MealPlan from "../models/MealPlan.js";
import Notification from "../models/Notification.js";

export async function getDashboard(req, res) {
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  try {
    const [
      user,
      inventoryItems,
      activeDonations,
      mealPlans,
      notifications,
    ] = await Promise.all([
      User.findById(userId, "name email profilePicture provider createdAt"),
      Inventory.find({ user_id: userId }).select("name emoji qty cat loc expires_in_days created_at").sort({ created_at: -1 }).lean(),
      Donation.find({ donor_id: userId, status: "Available" }).select("name emoji qty cat pickup_time status created_at km").sort({ created_at: -1 }).lean(),
      MealPlan.find({ user_id: userId }).select("slot_key name emoji uses_count created_at").lean(),
      Notification.find({ user_id: userId }).select("message type is_read created_at").sort({ created_at: -1 }).limit(5).lean(),
    ]);

    const inventoryCount = inventoryItems.length;
    const donationCount = activeDonations.length;
    const mealPlanCount = mealPlans.length;
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const todayKey = now.toLocaleDateString("en-US", { weekday: "short" });
    const todaySlots = mealPlans.filter((m) => m.slot_key.startsWith(todayKey));
    const todayMeals = {};
    ["Breakfast", "Lunch", "Dinner"].forEach((slot) => {
      const meal = todaySlots.find((m) => m.slot_key === `${todayKey}-${slot}`);
      todayMeals[slot] = meal ? { name: meal.name, emoji: meal.emoji, uses: meal.uses_count } : null;
    });

    const expiringToday = inventoryItems.filter((item) => {
      if (!item.created_at) return false;
      const created = new Date(item.created_at);
      const expiresAt = new Date(created);
      expiresAt.setDate(expiresAt.getDate() + (item.expires_in_days || 0));
      return expiresAt <= now && expiresAt >= startOfToday;
    });

    const priorities = [];
    if (expiringToday.length > 0) {
      priorities.push({ type: "expiring", text: `${expiringToday.length} food item(s) expire today.`, icon: "AlertTriangle" });
    }
    if (donationCount > 0) {
      priorities.push({ type: "donation", text: `${donationCount} donation(s) waiting for pickup.`, icon: "HeartHandshake" });
    }
    if (inventoryCount < 5) {
      priorities.push({ type: "low_inventory", text: "Your inventory is running low. Add more items.", icon: "Package" });
    }
    if (todaySlots.length === 0) {
      priorities.push({ type: "no_meal_plan", text: "No meals planned for today.", icon: "CalendarDays" });
    }
    if (unreadCount > 0) {
      priorities.push({ type: "notifications", text: `${unreadCount} unread notification(s).`, icon: "Bell" });
    }
    if (priorities.length === 0) {
      priorities.push({ type: "all_good", text: "You're all caught up for today.", icon: "CheckCircle" });
    }

    const recentInventory = inventoryItems.slice(0, 5).map((i) => ({
      id: i._id,
      name: i.name,
      emoji: i.emoji,
      qty: i.qty,
      cat: i.cat,
      loc: i.loc,
      expires: i.expires_in_days,
      createdAt: i.created_at,
    }));

    const donationPreview = activeDonations.slice(0, 3).map((d) => ({
      id: d._id,
      name: d.name,
      emoji: d.emoji,
      qty: d.qty,
      cat: d.cat,
      status: d.status,
      pickup: d.pickup_time,
      km: d.km,
      createdAt: d.created_at,
    }));

    const latestNotifications = notifications.map((n) => ({
      id: n._id,
      message: n.message,
      type: n.type,
      isRead: n.is_read,
      createdAt: n.created_at,
    }));

    const activityEntries = [];
    inventoryItems.slice(0, 5).forEach((i) => {
      activityEntries.push({ type: "inventory", action: "Added", text: `Added ${i.name} to Inventory`, emoji: i.emoji || "📦", createdAt: i.created_at });
    });
    activeDonations.slice(0, 3).forEach((d) => {
      activityEntries.push({ type: "donation", action: "Created", text: `Created Donation: ${d.name}`, emoji: d.emoji || "❤️", createdAt: d.created_at });
    });
    mealPlans.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3).forEach((m) => {
      activityEntries.push({ type: "meal", action: "Planned", text: `Planned ${m.name} for ${m.slot_key}`, emoji: m.emoji || "🍳", createdAt: m.created_at });
    });
    activityEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentActivity = activityEntries.slice(0, 10);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);
      const count = inventoryItems.filter((item) => {
        if (!item.created_at) return false;
        const c = new Date(item.created_at);
        return c >= dayStart && c <= dayEnd;
      }).length;
      chartData.push({ day: dayNames[d.getDay()], count });
    }

    let completionScore = 0;
    const onboardingSteps = [
      { key: "profile", label: "Complete Profile", done: !!(user.name && user.email) },
      { key: "inventory", label: "Add Your First Inventory Item", done: inventoryCount > 0 },
      { key: "meal_plan", label: "Create Your First Meal Plan", done: mealPlanCount > 0 },
      { key: "donation", label: "List Your First Donation", done: donationCount > 0 },
    ];
    onboardingSteps.forEach((step) => { if (step.done) completionScore += 25; });

    res.json({
      user: {
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
      stats: {
        inventoryCount,
        donationCount,
        mealPlanCount,
        unreadCount,
      },
      todayMeals,
      priorities,
      recentActivity,
      inventoryPreview: recentInventory,
      donationPreview,
      notifications: latestNotifications,
      completionScore,
      onboardingSteps,
      activityChart: chartData,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load dashboard", error: err.message });
  }
}
