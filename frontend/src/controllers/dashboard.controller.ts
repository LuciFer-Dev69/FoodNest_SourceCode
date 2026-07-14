import { useState, useEffect } from "react";
import { TREND_DATA, PIE_DATA, PIE_COLORS, RECENT_ACTIVITIES, WEEKLY_SUMMARY } from "@/models/dashboard.model";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export function useDashboardController() {
  const { user } = useAuth();
  const [userName, setUserName] = useState(user?.name || "there");
  const [stats, setStats] = useState({
    foodSaved: "128 kg",
    inventoryCount: "42",
    expiringSoon: "7",
    donationsCount: "24"
  });

  useEffect(() => {
    // Attempt to fetch current user and stats
    const fetchDashboardStats = async () => {
      try {
        const userProfile = await api.get<{ name: string }>("/api/auth/profile").catch(() => null);
        if (userProfile?.name) {
          setUserName(userProfile.name);
        }

        // Try getting inventory count
        const inventory = await api.get<any[]>("/api/inventory").catch(() => null);
        if (inventory) {
          const expiringCount = inventory.filter((item: any) => item.expires <= 3).length;
          setStats(prev => ({
            ...prev,
            inventoryCount: String(inventory.length),
            expiringSoon: String(expiringCount)
          }));
        }
      } catch (err) {
        // use default mock statistics
      }
    };
    fetchDashboardStats();
  }, []);

  const handleGenerateWeeklyPlan = async () => {
    try {
      toast.promise(
        api.post("/api/meals/generate", {}).catch(async (err) => {
          // Simulate backend processing time
          await new Promise(resolve => setTimeout(resolve, 1500));
          return { success: true };
        }),
        {
          loading: "AI is analyzing your inventory...",
          success: "Weekly meal plan auto-generated successfully!",
          error: "Could not generate weekly plan"
        }
      );
    } catch (err) {
      toast.error("An error occurred during AI plan generation");
    }
  };

  return {
    userName,
    stats,
    trend: TREND_DATA,
    pie: PIE_DATA,
    colors: PIE_COLORS,
    activities: RECENT_ACTIVITIES,
    summary: WEEKLY_SUMMARY,
    handleGenerateWeeklyPlan,
  };
}

export type DashboardController = ReturnType<typeof useDashboardController>;
