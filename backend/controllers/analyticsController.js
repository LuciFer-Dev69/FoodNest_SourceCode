import mongoose from "mongoose";
import Inventory from "../models/Inventory.js";
import Donation from "../models/Donation.js";
import MealPlan from "../models/MealPlan.js";
import CommunityPost from "../models/CommunityPost.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

export async function getAnalytics(req, res) {
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const now = new Date();

  const period = req.query.period || "30d";
  let startDate;
  switch (period) {
    case "7d": startDate = new Date(now.getTime() - 7 * 86400000); break;
    case "30d": startDate = new Date(now.getTime() - 30 * 86400000); break;
    case "90d": startDate = new Date(now.getTime() - 90 * 86400000); break;
    case "year": startDate = new Date(now.getFullYear(), 0, 1); break;
    case "custom":
      startDate = req.query.start ? new Date(req.query.start) : new Date(now.getTime() - 30 * 86400000);
      break;
    default: startDate = new Date(now.getTime() - 30 * 86400000);
  }

  try {
    const [
      user,
      inventoryItems,
      donations,
      mealPlans,
      communityPosts,
      notifications,
    ] = await Promise.all([
      User.findById(userId, "name email profilePicture createdAt").lean(),
      Inventory.find({ userId }).sort({ expirationDate: 1 }).lean(),
      Donation.find({ userId }).sort({ createdAt: -1 }).lean(),
      MealPlan.find({ user_id: userId }).lean(),
      CommunityPost.find({ userId }).sort({ createdAt: -1 }).lean(),
      Notification.find({ user_id: userId }).lean(),
    ]);

    // ── Dashboard Summary ──
    const inventoryCount = inventoryItems.length;
    const activeDonations = donations.filter((d) => d.status === "Available").length;
    const completedDonations = donations.filter((d) => d.status === "Completed").length;
    const reservedDonations = donations.filter((d) => d.status === "Reserved").length;
    const expiredDonations = donations.filter((d) => d.status === "Expired").length;
    const mealPlanCount = mealPlans.length;
    const communityPostCount = communityPosts.length;
    const unreadNotifications = notifications.filter((n) => !n.is_read).length;

    const dashboardSummary = {
      inventoryItems: inventoryCount,
      activeDonations,
      completedDonations,
      mealsPlanned: mealPlanCount,
      communityPosts: communityPostCount,
      unreadNotifications,
    };

    // ── Food Waste Analysis ──
    const nowMs = now.getTime();
    const dayMs = 86400000;
    const threeDaysMs = 3 * dayMs;

    const fresh = [];
    const expiringSoon = [];
    const expired = [];

    for (const item of inventoryItems) {
      if (!item.expirationDate) { fresh.push(item.quantity); continue; }
      const expMs = new Date(item.expirationDate).getTime();
      const diff = expMs - nowMs;
      if (diff < 0) expired.push(item.quantity);
      else if (diff <= threeDaysMs) expiringSoon.push(item.quantity);
      else fresh.push(item.quantity);
    }

    const freshTotal = fresh.reduce((a, b) => a + b, 0);
    const expiringTotal = expiringSoon.reduce((a, b) => a + b, 0);
    const expiredTotal = expired.reduce((a, b) => a + b, 0);
    const wasteTotal = freshTotal + expiringTotal + expiredTotal;
    const wastePercentage = wasteTotal > 0 ? Math.round((expiredTotal / wasteTotal) * 100) : 0;

    const foodWasteAnalysis = {
      fresh: freshTotal,
      expiringSoon: expiringTotal,
      expired: expiredTotal,
      wastePercentage,
      pieData: [
        { name: "Fresh", value: freshTotal, color: "oklch(0.72 0.18 145)" },
        { name: "Expiring Soon", value: expiringTotal, color: "oklch(0.78 0.16 70)" },
        { name: "Expired", value: expiredTotal, color: "oklch(0.6 0.18 35)" },
      ],
    };

    // ── Inventory Breakdown (Doughnut) ──
    const categoryMap = {};
    for (const item of inventoryItems) {
      const cat = item.category || "Other";
      categoryMap[cat] = (categoryMap[cat] || 0) + item.quantity;
    }
    const categoryList = Object.entries(categoryMap).map(([name, value], i) => ({
      name,
      value,
      color: [
        "oklch(0.72 0.18 145)", "oklch(0.78 0.16 130)", "oklch(0.78 0.16 70)",
        "oklch(0.65 0.16 160)", "oklch(0.6 0.15 220)", "oklch(0.7 0.15 280)",
        "oklch(0.65 0.12 30)",
      ][i % 7],
    }));

    // ── Donation Statistics ──
    const totalDonations = donations.length;
    const claimRate = totalDonations > 0
      ? Math.round(((reservedDonations + completedDonations) / totalDonations) * 100)
      : 0;
    const completionRate = (reservedDonations + completedDonations) > 0
      ? Math.round((completedDonations / (reservedDonations + completedDonations)) * 100)
      : 0;

    // Monthly donations bar chart
    const monthlyDonations = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (const d of donations) {
      if (!d.createdAt) continue;
      const created = new Date(d.createdAt);
      const key = `${monthNames[created.getMonth()]} ${created.getFullYear()}`;
      monthlyDonations[key] = (monthlyDonations[key] || 0) + 1;
    }
    const monthlyDonationsChart = Object.entries(monthlyDonations)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => {
        const months = Object.keys(monthlyDonations);
        return months.indexOf(a.month) - months.indexOf(b.month);
      });

    const donationStats = {
      total: totalDonations,
      completed: completedDonations,
      active: activeDonations,
      reserved: reservedDonations,
      expired: expiredDonations,
      claimRate,
      completionRate,
      monthlyChart: monthlyDonationsChart,
    };

    // ── Meal Planner Statistics ──
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const mealPlansByWeek = {};
    for (const mp of mealPlans) {
      const key = mp.slot_key?.split("-")[0];
      if (!key) continue;
      const dayIdx = dayNames.indexOf(key);
      if (dayIdx === -1) continue;
      const date = new Date(now);
      date.setDate(date.getDate() - ((date.getDay() - dayIdx + 7) % 7));
      const weekKey = `${date.getFullYear()}-W${Math.ceil((date.getDate() + new Date(date.getFullYear(), 0, 1).getDay()) / 7)}`;
      if (!mealPlansByWeek[weekKey]) mealPlansByWeek[weekKey] = 0;
      mealPlansByWeek[weekKey]++;
    }

    const weeksWithData = Object.keys(mealPlansByWeek).length;
    const mealPlanned = mealPlanCount;
    const mealCompleted = Math.round(mealPlanned * 0.7); // estimated 70% completion
    const mealMissed = mealPlanned - mealCompleted;
    const weeklyCompletion = weeksWithData > 0
      ? Math.round((mealCompleted / mealPlanned) * 100)
      : 0;

    // Weekly line chart
    const weeklyMealChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayName = dayNames[d.getDay()];
      const count = mealPlans.filter((mp) => mp.slot_key?.startsWith(dayName)).length;
      weeklyMealChart.push({ day: dayName, completed: Math.round(count * 0.7), planned: count });
    }

    const mealStats = {
      mealsPlanned: mealPlanned,
      mealsCompleted: mealCompleted,
      missedMeals: mealMissed,
      weeklyCompletionPercent: weeklyCompletion,
      weeklyChart: weeklyMealChart,
    };

    // ── Community Statistics ──
    let totalLikes = 0;
    let totalComments = 0;
    for (const post of communityPosts) {
      totalLikes += (post.likes?.length || 0);
      totalComments += (post.commentCount || 0);
    }
    const engagementScore = communityPostCount > 0
      ? Math.min(100, Math.round(((totalLikes + totalComments * 2) / communityPostCount) * 10))
      : 0;

    const communityStats = {
      postsCreated: communityPostCount,
      comments: totalComments,
      likesReceived: totalLikes,
      engagementScore,
    };

    // ── Weekly Activity Line Chart ──
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const inventoryAdded = inventoryItems.filter((item) => {
        if (!item.createdAt) return false;
        const c = new Date(item.createdAt);
        return c >= dayStart && c <= dayEnd;
      }).length;

      const donationsCreated = donations.filter((d) => {
        if (!d.createdAt) return false;
        const c = new Date(d.createdAt);
        return c >= dayStart && c <= dayEnd;
      }).length;

      const mealsPlanned = mealPlans.filter((mp) => {
        if (!mp.created_at) return false;
        const c = new Date(mp.created_at);
        return c >= dayStart && c <= dayEnd;
      }).length;

      const postsCreated = communityPosts.filter((p) => {
        if (!p.createdAt) return false;
        const c = new Date(p.createdAt);
        return c >= dayStart && c <= dayEnd;
      }).length;

      weeklyActivity.push({
        day: dayNames[d.getDay()],
        inventory: inventoryAdded,
        donations: donationsCreated,
        meals: mealsPlanned,
        posts: postsCreated,
        total: inventoryAdded + donationsCreated + mealsPlanned + postsCreated,
      });
    }

    // ── Monthly Overview ──
    const periodStart = startDate;
    const periodItems = inventoryItems.filter((i) => i.createdAt && new Date(i.createdAt) >= periodStart);
    const periodDonations = donations.filter((d) => d.createdAt && new Date(d.createdAt) >= periodStart);
    const foodAdded = periodItems.reduce((s, i) => s + (i.quantity || 0), 0);
    const foodDonated = periodDonations.filter((d) => d.status === "Completed")
      .reduce((s, d) => s + (d.quantity || 0), 0);
    const foodExpired = expired.reduce((a, b) => a + b, 0);

    const monthlyOverview = {
      foodAdded: Math.round(foodAdded * 10) / 10,
      foodDonated: Math.round(foodDonated * 10) / 10,
      foodExpired: Math.round(foodExpired * 10) / 10,
      mealsPlanned: mealPlanCount,
      communityActivity: communityPostCount,
    };

    // ── Sustainability Estimates ──
    // 1 kg food saved ≈ 2.5 kg CO₂ equivalent
    // 1 meal ≈ 0.5 kg food
    const totalCompletedQty = donations
      .filter((d) => d.status === "Completed")
      .reduce((s, d) => s + (d.quantity || 0), 0);
    const foodSavedKg = Math.round(totalCompletedQty * 10) / 10;
    const mealsShared = Math.round(foodSavedKg / 0.5);
    const wastePrevented = Math.round(foodSavedKg * 10) / 10;
    const co2Reduction = Math.round(foodSavedKg * 2.5 * 10) / 10;

    const sustainability = {
      foodSaved: `${foodSavedKg} kg`,
      mealsShared,
      wastePrevented: `${wastePrevented} kg`,
      co2Reduction: `${co2Reduction} kg`,
      note: "Values are estimated based on completed donations and inventory usage.",
    };

    // ── Smart Insights (Rule-based) ──
    const insights = [];

    const expiredLastMonth = inventoryItems.filter((item) => {
      if (!item.expirationDate) return false;
      const exp = new Date(item.expirationDate);
      return exp < now && exp >= new Date(now.getTime() - 30 * dayMs);
    }).length;
    if (expiredLastMonth > 5) {
      insights.push({
        category: "Inventory",
        problem: `${expiredLastMonth} items have expired this month.`,
        recommendation: "Buy smaller quantities or donate surplus food earlier.",
      });
    }

    const noDonationDays = totalDonations === 0 ? 999 : 0;
    if (noDonationDays > 30 || totalDonations === 0) {
      insights.push({
        category: "Donations",
        problem: "You haven't donated recently.",
        recommendation: "Consider donating surplus food before it expires.",
      });
    }

    if (mealPlanCount === 0) {
      insights.push({
        category: "Meal Planner",
        problem: "No meal plans this week.",
        recommendation: "Generate a weekly meal plan to reduce food waste.",
      });
    }

    const expiringSoonCount = inventoryItems.filter((item) => {
      if (!item.expirationDate) return false;
      const diff = new Date(item.expirationDate).getTime() - nowMs;
      return diff > 0 && diff <= 2 * dayMs;
    }).length;
    if (expiringSoonCount >= 5) {
      insights.push({
        category: "Inventory",
        problem: `${expiringSoonCount} foods are close to expiring.`,
        recommendation: "Cook these foods first or donate them.",
      });
    }

    if (communityPostCount === 0) {
      insights.push({
        category: "Community",
        problem: "No posts created yet.",
        recommendation: "Share recipes or sustainability tips with the community.",
      });
    }

    // ── Health Score ──
    const inventoryScore = inventoryCount > 0 ? Math.min(100, inventoryCount * 10 + (expiredTotal === 0 ? 20 : 0)) : 0;
    const donationScore = totalDonations > 0 ? Math.min(100, claimRate + completionRate) : 0;
    const mealScore = mealPlanCount > 0 ? Math.min(100, weeklyCompletion) : 0;
    const communityScore = communityPostCount > 0 ? Math.min(100, engagementScore) : 0;
    const profileScore = user.name && user.email ? 100 : 50;
    const overallScore = Math.round((inventoryScore + donationScore + mealScore + communityScore + profileScore) / 5);

    const healthScore = {
      overall: overallScore,
      breakdown: [
        { category: "Inventory", score: inventoryScore },
        { category: "Donations", score: donationScore },
        { category: "Meal Planning", score: mealScore },
        { category: "Community", score: communityScore },
        { category: "Profile", score: profileScore },
      ],
      explanation: overallScore >= 80 ? "Great job! You're actively managing your kitchen and community."
        : overallScore >= 50 ? "Good progress! Keep building your food-saving habits."
        : "You're just getting started. Try adding inventory and creating a meal plan.",
    };

    // ── Problem Detection ──
    const problems = [];

    if (expiredTotal > 0) {
      problems.push({
        problem: `Food waste detected: ${expiredTotal} units expired.`,
        reason: "Purchased more than consumed.",
        impact: "Food waste increased.",
        recommendation: "Reduce purchase quantity or donate earlier.",
        priority: expiredTotal > 10 ? "High" : "Medium",
      });
    }

    if (mealPlanCount === 0) {
      problems.push({
        problem: "No meal planning activity.",
        reason: "Meals not planned in advance.",
        impact: "Higher risk of food waste.",
        recommendation: "Start planning meals weekly.",
        priority: "Medium",
      });
    }

    if (totalDonations === 0 && inventoryCount > 10) {
      problems.push({
        problem: "No donations despite having surplus inventory.",
        reason: "Donation not yet utilized.",
        impact: "Potential food waste.",
        recommendation: "List surplus food as donations.",
        priority: "Low",
      });
    }

    if (inventoryCount === 0) {
      problems.push({
        problem: "Very low inventory.",
        reason: "No food items tracked.",
        impact: "Cannot optimize food usage.",
        recommendation: "Add items to your inventory.",
        priority: "Low",
      });
    }

    // ── Heatmap (GitHub-style 7x7 grid) ──
    const heatmap = [];
    for (let w = 41; w >= 0; w--) {
      for (let d = 6; d >= 0; d--) {
        const cellDate = new Date(now);
        cellDate.setDate(cellDate.getDate() - (w * 7 + d));
        const dayStart = new Date(cellDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(cellDate);
        dayEnd.setHours(23, 59, 59, 999);

        const count = [
          ...inventoryItems.filter((i) => i.createdAt && new Date(i.createdAt) >= dayStart && new Date(i.createdAt) <= dayEnd),
          ...donations.filter((d) => d.createdAt && new Date(d.createdAt) >= dayStart && new Date(d.createdAt) <= dayEnd),
          ...mealPlans.filter((mp) => mp.created_at && new Date(mp.created_at) >= dayStart && new Date(mp.created_at) <= dayEnd),
          ...communityPosts.filter((p) => p.createdAt && new Date(p.createdAt) >= dayStart && new Date(p.createdAt) <= dayEnd),
        ].length;

        let level = 0;
        if (count > 0) level = 1;
        if (count > 2) level = 2;
        if (count > 5) level = 3;
        if (count > 10) level = 4;

        heatmap.push({
          date: cellDate.toISOString().split("T")[0],
          count,
          level,
        });
      }
    }

    // ── Recent Activity Timeline ──
    const timelineEntries = [];
    inventoryItems.slice(0, 10).forEach((i) => {
      timelineEntries.push({
        type: "inventory",
        action: "Added",
        text: `Added ${i.foodName} to inventory`,
        createdAt: i.createdAt,
      });
    });
    donations.slice(0, 10).forEach((d) => {
      timelineEntries.push({
        type: "donation",
        action: d.status === "Completed" ? "Completed" : "Created",
        text: `${d.status === "Completed" ? "Completed donation" : "Created donation"}: ${d.foodName}`,
        createdAt: d.createdAt,
      });
    });
    mealPlans.slice(0, 10).forEach((mp) => {
      timelineEntries.push({
        type: "meal",
        action: "Planned",
        text: `Planned ${mp.name} for ${mp.slot_key}`,
        createdAt: mp.created_at,
      });
    });
    communityPosts.slice(0, 10).forEach((p) => {
      timelineEntries.push({
        type: "community",
        action: "Posted",
        text: p.content?.slice(0, 80) || "Community post",
        createdAt: p.createdAt,
      });
    });
    timelineEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentActivity = timelineEntries.slice(0, 20);

    const donationSuccessRate = totalDonations > 0
      ? Math.round((completedDonations / totalDonations) * 100)
      : 0;

    // ── Response ──
    res.json({
      period,
      hasData: true,
      dashboardSummary,
      foodWasteAnalysis,
      inventoryBreakdown: categoryList,
      donationStats,
      mealStats,
      communityStats,
      weeklyActivity,
      heatmap,
      recentActivity,
      monthlyOverview,
      sustainability: {
        ...sustainability,
        donationSuccessRate,
      },
      insights,
      healthScore,
      problems,
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to load analytics", error: err.message });
  }
}
