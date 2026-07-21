export interface DashboardUser {
  name: string;
  email: string;
  profilePicture?: string | null;
  createdAt: string;
}

export interface DashboardStats {
  inventoryCount: number;
  donationCount: number;
  mealPlanCount: number;
  unreadCount: number;
}

export interface Priority {
  type: string;
  text: string;
  icon: string;
}

export interface ActivityEntry {
  type: string;
  action: string;
  text: string;
  emoji: string;
  createdAt: string;
}

export interface InventoryPreviewItem {
  id: string;
  name: string;
  emoji: string;
  qty: string;
  cat: string;
  loc: string;
  expires: number;
  createdAt: string;
}

export interface DonationPreviewItem {
  id: string;
  name: string;
  emoji: string;
  qty: string;
  cat: string;
  status: string;
  pickup: string;
  km: number;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface OnboardingStep {
  key: string;
  label: string;
  done: boolean;
}

export interface ChartDataPoint {
  day: string;
  count: number;
}

export interface TodayMeals {
  Breakfast?: { name: string; emoji: string; uses: number } | null;
  Lunch?: { name: string; emoji: string; uses: number } | null;
  Dinner?: { name: string; emoji: string; uses: number } | null;
}

export interface DashboardData {
  user: DashboardUser;
  stats: DashboardStats;
  todayMeals: TodayMeals;
  priorities: Priority[];
  recentActivity: ActivityEntry[];
  inventoryPreview: InventoryPreviewItem[];
  donationPreview: DonationPreviewItem[];
  notifications: NotificationItem[];
  completionScore: number;
  onboardingSteps: OnboardingStep[];
  activityChart: ChartDataPoint[];
}
