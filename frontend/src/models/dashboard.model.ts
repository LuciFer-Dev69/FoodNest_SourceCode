import { Package, AlertTriangle, HeartHandshake, CalendarDays, Sparkles, type LucideIcon } from "lucide-react";

export type TrendData = {
  d: string;
  saved: number;
};

export type PieData = {
  name: string;
  value: number;
};

export type ActivityItem = {
  t: string;
  w: string;
  icon: LucideIcon;
};

export const TREND_DATA: TrendData[] = [
  { d: "Mon", saved: 1.2 }, { d: "Tue", saved: 2.1 }, { d: "Wed", saved: 1.6 },
  { d: "Thu", saved: 2.8 }, { d: "Fri", saved: 2.2 }, { d: "Sat", saved: 3.4 }, { d: "Sun", saved: 3.9 },
];

export const PIE_DATA: PieData[] = [
  { name: "Produce", value: 38 }, { name: "Dairy", value: 22 },
  { name: "Pantry", value: 18 }, { name: "Bakery", value: 12 }, { name: "Other", value: 10 },
];

export const PIE_COLORS = ["oklch(0.72 0.18 145)", "oklch(0.78 0.16 130)", "oklch(0.78 0.16 70)", "oklch(0.65 0.16 160)", "oklch(0.6 0.15 220)"];

export const RECENT_ACTIVITIES: ActivityItem[] = [
  { t: "You donated Sourdough loaves", w: "2h ago", icon: HeartHandshake },
  { t: "Spinach added to inventory", w: "5h ago", icon: Package },
  { t: "Meal plan: Tomato soup tomorrow", w: "Yesterday", icon: CalendarDays },
  { t: "Reminder: Yogurt expires in 2 days", w: "Yesterday", icon: AlertTriangle },
  { t: "AI suggested 3 new recipes", w: "2 days ago", icon: Sparkles },
];

export const WEEKLY_SUMMARY = [
  ["CO₂ avoided", "14.2 kg"],
  ["Money saved", "$48"],
  ["Meals planned", "12"],
  ["Items rescued", "9"],
];
