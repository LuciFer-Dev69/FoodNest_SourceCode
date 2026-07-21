import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { DashboardData } from "@/models/dashboard.model";

export function useDashboardController() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<DashboardData>("/api/dashboard");
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const userName = data?.user?.name || user?.name || "there";
  const profilePicture = data?.user?.profilePicture || user?.profilePicture;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    data,
    loading,
    error,
    refresh: fetchDashboard,
    greeting,
    userName,
    profilePicture,
    today,
  };
}

export type DashboardController = ReturnType<typeof useDashboardController>;
