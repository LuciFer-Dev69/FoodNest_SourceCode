export type MonthlyImpact = {
  m: string;
  saved: number;
  wasted: number;
};

export type DonationTrend = {
  w: string;
  d: number;
};

export type CategoryMix = {
  name: string;
  value: number;
};

export const MONTHLY_IMPACT: MonthlyImpact[] = [
  { m: "Jan", saved: 8, wasted: 5 }, { m: "Feb", saved: 12, wasted: 4 },
  { m: "Mar", saved: 14, wasted: 3 }, { m: "Apr", saved: 16, wasted: 3 },
  { m: "May", saved: 22, wasted: 2 }, { m: "Jun", saved: 28, wasted: 2 },
];

export const DONATION_TREND: DonationTrend[] = [
  { w: "W1", d: 2 }, { w: "W2", d: 5 }, { w: "W3", d: 4 }, { w: "W4", d: 7 },
  { w: "W5", d: 9 }, { w: "W6", d: 8 }, { w: "W7", d: 12 },
];

export const CATEGORY_MIX: CategoryMix[] = [
  { name: "Produce", value: 42 }, { name: "Dairy", value: 21 },
  { name: "Pantry", value: 17 }, { name: "Bakery", value: 12 }, { name: "Other", value: 8 },
];

export const ANALYTICS_COLORS = ["oklch(0.72 0.18 145)", "oklch(0.78 0.16 130)", "oklch(0.78 0.16 70)", "oklch(0.65 0.16 160)", "oklch(0.6 0.15 220)"];
