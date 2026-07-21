import { useState, useEffect, useCallback } from "react";
import { AnalyticsData, PeriodOption } from "@/models/analytics.model";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function useAnalyticsController() {
  const [period, setPeriod] = useState<PeriodOption>("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityMetric, setActivityMetric] = useState<string>("total");

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.get<AnalyticsData>(`/api/analytics?period=${period}`);
      setData(result);
    } catch (err: any) {
      toast.error(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    period,
    setPeriod,
    data,
    loading,
    activityMetric,
    setActivityMetric,
    refetch: fetchAnalytics,
  };
}

export type AnalyticsController = ReturnType<typeof useAnalyticsController>;
