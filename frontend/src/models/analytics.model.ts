export type PieData = {
  name: string;
  value: number;
  color: string;
};

export type BarData = {
  month: string;
  count: number;
};

export type LineData = {
  day: string;
  inventory: number;
  donations: number;
  meals: number;
  posts: number;
  total: number;
};

export type WeeklyMealData = {
  day: string;
  completed: number;
  planned: number;
};

export type HeatmapCell = {
  date: string;
  count: number;
  level: number;
};

export type TimelineEntry = {
  type: string;
  action: string;
  text: string;
  createdAt: string;
};

export type DashboardSummary = {
  inventoryItems: number;
  activeDonations: number;
  completedDonations: number;
  mealsPlanned: number;
  communityPosts: number;
  unreadNotifications: number;
};

export type FoodWasteAnalysis = {
  fresh: number;
  expiringSoon: number;
  expired: number;
  wastePercentage: number;
  pieData: PieData[];
};

export type InventoryBreakdown = PieData[];

export type DonationStats = {
  total: number;
  completed: number;
  active: number;
  reserved: number;
  expired: number;
  claimRate: number;
  completionRate: number;
  monthlyChart: BarData[];
};

export type MealStats = {
  mealsPlanned: number;
  mealsCompleted: number;
  missedMeals: number;
  weeklyCompletionPercent: number;
  weeklyChart: WeeklyMealData[];
};

export type CommunityStats = {
  postsCreated: number;
  comments: number;
  likesReceived: number;
  engagementScore: number;
};

export type MonthlyOverview = {
  foodAdded: number;
  foodDonated: number;
  foodExpired: number;
  mealsPlanned: number;
  communityActivity: number;
};

export type Sustainability = {
  foodSaved: string;
  mealsShared: number;
  wastePrevented: string;
  co2Reduction: string;
  donationSuccessRate: number;
  note: string;
};

export type Insight = {
  category: string;
  problem: string;
  recommendation: string;
};

export type HealthBreakdown = {
  category: string;
  score: number;
};

export type HealthScore = {
  overall: number;
  breakdown: HealthBreakdown[];
  explanation: string;
};

export type Problem = {
  problem: string;
  reason: string;
  impact: string;
  recommendation: string;
  priority: string;
};

export type AnalyticsData = {
  period: string;
  dashboardSummary: DashboardSummary;
  foodWasteAnalysis: FoodWasteAnalysis;
  inventoryBreakdown: InventoryBreakdown;
  donationStats: DonationStats;
  mealStats: MealStats;
  communityStats: CommunityStats;
  weeklyActivity: LineData[];
  heatmap: HeatmapCell[];
  recentActivity: TimelineEntry[];
  monthlyOverview: MonthlyOverview;
  sustainability: Sustainability;
  insights: Insight[];
  healthScore: HealthScore;
  problems: Problem[];
};

export type PeriodOption = "7d" | "30d" | "90d" | "year";

export const PERIOD_OPTIONS: { label: string; value: PeriodOption }[] = [
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
  { label: "This Year", value: "year" },
];

export const COLORS = [
  "oklch(0.72 0.18 145)", "oklch(0.78 0.16 130)", "oklch(0.78 0.16 70)",
  "oklch(0.65 0.16 160)", "oklch(0.6 0.15 220)", "oklch(0.7 0.15 280)",
  "oklch(0.65 0.12 30)",
];

export const WASTE_COLORS = {
  Fresh: "oklch(0.72 0.18 145)",
  "Expiring Soon": "oklch(0.78 0.16 70)",
  Expired: "oklch(0.6 0.18 35)",
};

export const HEATMAP_LEVELS = [
  "bg-gray-100 dark:bg-gray-800",
  "bg-green-200 dark:bg-green-900",
  "bg-green-400 dark:bg-green-700",
  "bg-green-500 dark:bg-green-600",
  "bg-green-700 dark:bg-green-500",
];
