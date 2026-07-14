import { MONTHLY_IMPACT, DONATION_TREND, CATEGORY_MIX, ANALYTICS_COLORS } from "@/models/analytics.model";

export function useAnalyticsController() {
  return {
    monthly: MONTHLY_IMPACT,
    donations: DONATION_TREND,
    cat: CATEGORY_MIX,
    colors: ANALYTICS_COLORS,
  };
}

export type AnalyticsController = ReturnType<typeof useAnalyticsController>;
