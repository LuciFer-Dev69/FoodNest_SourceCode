import mongoose from "mongoose";
import User from "../models/User.js";
import Inventory from "../models/Inventory.js";
import Donation from "../models/Donation.js";
import MealPlan from "../models/MealPlan.js";
import Notification from "../models/Notification.js";

function getWeekBounds() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

export async function getWeeklyStats(req, res) {
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const { monday, sunday } = getWeekBounds();

  try {
    const [
      weeklyCompletedDonations,
      weeklyInventory,
      weeklyMealPlans,
      weeklyClaimed,
    ] = await Promise.all([
      Donation.find({
        userId,
        status: "Completed",
        createdAt: { $gte: monday, $lte: sunday },
      }).lean(),
      Inventory.find({
        userId,
        createdAt: { $gte: monday, $lte: sunday },
      }).lean(),
      MealPlan.find({
        userId,
        createdAt: { $gte: monday, $lte: sunday },
      }).lean(),
      Donation.find({
        claimedBy: userId,
        createdAt: { $gte: monday, $lte: sunday },
      }).lean(),
    ]);

    const foodSavedKg = weeklyCompletedDonations.reduce(
      (sum, d) => sum + (d.quantity || 0), 0
    );

    const donationsCompleted = weeklyCompletedDonations.length;
    const inventoryAdded = weeklyInventory.length;
    const mealsPlanned = weeklyMealPlans.reduce(
      (sum, p) => sum + (p.meals ? p.meals.length : 0), 0
    );
    const foodClaimed = weeklyClaimed.length;

    const weeklyGoalKg = 10;

    res.json({
      foodSavedKg,
      donationsCompleted,
      inventoryAdded,
      mealsPlanned,
      foodClaimed,
      weeklyGoalKg,
      weekStart: monday,
      weekEnd: sunday,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load weekly stats", error: err.message });
  }
}

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
    const [user, inventoryItems, myDonations, claimedDonations, mealPlans, notifications] = await Promise.all([
      User.findById(userId, "name email profilePicture provider createdAt"),
      Inventory.find({ userId }).sort({ createdAt: -1 }).lean(),
      Donation.find({ userId }).sort({ createdAt: -1 }).lean(),
      Donation.find({ claimedBy: userId, status: { $in: ["Reserved", "Completed"] } }).sort({ createdAt: -1 }).lean(),
      MealPlan.find({ user_id: userId }).select("slot_key name emoji uses_count created_at").lean(),
      Notification.find({ user_id: userId }).select("message type is_read created_at").sort({ created_at: -1 }).limit(5).lean(),
    ]);

    const allDonations = [...myDonations, ...claimedDonations];
    const activeDonations = myDonations.filter((d) => d.status === "Available");
    const completedDonations = allDonations.filter((d) => d.status === "Completed");
    const reservedDonations = allDonations.filter((d) => d.status === "Reserved");

    const inventoryCount = inventoryItems.length;
    const donationCount = activeDonations.length;
    const totalDonations = allDonations.length;
    const completedCount = completedDonations.length;
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
      if (!item.expirationDate) return false;
      const exp = new Date(item.expirationDate);
      return exp >= startOfToday && exp <= new Date(now.getTime() + 86400000);
    });

    const priorities = [];
    if (expiringToday.length > 0) {
      priorities.push({ type: "expiring", text: `${expiringToday.length} food item(s) expire today.`, icon: "AlertTriangle" });
    }
    if (activeDonations.length > 0) {
      priorities.push({ type: "donation", text: `${activeDonations.length} donation(s) waiting for pickup.`, icon: "HeartHandshake" });
    }
    if (reservedDonations.length > 0) {
      priorities.push({ type: "reserved", text: `${reservedDonations.length} donation(s) reserved and ready to complete.`, icon: "HeartHandshake" });
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
      name: i.foodName,
      quantity: i.quantity,
      unit: i.unit,
      category: i.category,
      location: i.storageLocation,
      createdAt: i.createdAt,
    }));

    const donationPreview = myDonations.slice(0, 3).map((d) => ({
      id: d._id,
      name: d.foodName,
      category: d.category,
      quantity: d.quantity,
      unit: d.unit,
      status: d.status,
      city: d.city,
      pickup: d.pickupTime,
      createdAt: d.createdAt,
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
      activityEntries.push({
        type: "inventory",
        action: "Added",
        text: `Added ${i.foodName} to Inventory`,
        createdAt: i.createdAt,
      });
    });
    allDonations.slice(0, 5).forEach((d) => {
      activityEntries.push({
        type: "donation",
        action: "Created",
        text: `${d.status === "Completed" ? "Completed" : "Created"} Donation: ${d.foodName}`,
        createdAt: d.createdAt,
      });
    });
    mealPlans.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3).forEach((m) => {
      activityEntries.push({
        type: "meal",
        action: "Planned",
        text: `Planned ${m.name} for ${m.slot_key}`,
        emoji: m.emoji || "🍳",
        createdAt: m.created_at,
      });
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
        if (!item.createdAt) return false;
        const c = new Date(item.createdAt);
        return c >= dayStart && c <= dayEnd;
      }).length;
      chartData.push({ day: dayNames[d.getDay()], count });
    }

    let completionScore = 0;
    const onboardingSteps = [
      { key: "profile", label: "Complete Profile", done: !!(user.name && user.email) },
      { key: "inventory", label: "Add Your First Inventory Item", done: inventoryCount > 0 },
      { key: "meal_plan", label: "Create Your First Meal Plan", done: mealPlanCount > 0 },
      { key: "donation", label: "List Your First Donation", done: totalDonations > 0 },
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
        donationCount: activeDonations.length,
        totalDonations,
        completedDonations: completedCount,
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
