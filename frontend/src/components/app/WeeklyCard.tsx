import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { HeartHandshake, Package, CalendarDays, Leaf } from "lucide-react";

type WeeklyStats = {
  foodSavedKg: number;
  donationsCompleted: number;
  inventoryAdded: number;
  mealsPlanned: number;
  foodClaimed: number;
  weeklyGoalKg: number;
};

function getMessage(kg: number): string {
  if (kg <= 0) return "Start saving food today 🌱";
  if (kg <= 5) return "Great start! Keep going 🌿";
  if (kg <= 20) return "Amazing work! You're reducing waste ♻️";
  return "Community Hero! 🌍";
}

export default function WeeklyCard() {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<WeeklyStats>("/api/dashboard/weekly-stats")
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mt-3 rounded-2xl bg-gradient-emerald p-4 text-white">
        <p className="text-xs/5 opacity-90">This week</p>
        <div className="mt-2 h-6 w-20 animate-pulse rounded bg-white/20" />
        <div className="mt-2 h-3 w-32 animate-pulse rounded bg-white/20" />
      </div>
    );
  }

  if (!stats) return null;

  const { foodSavedKg, donationsCompleted, inventoryAdded, mealsPlanned, foodClaimed, weeklyGoalKg } = stats;
  const goalAchieved = foodSavedKg >= weeklyGoalKg;
  const progressPct = Math.min(Math.round((foodSavedKg / weeklyGoalKg) * 100), 100);
  const displayKg = foodSavedKg % 1 === 0 ? foodSavedKg : foodSavedKg.toFixed(1);

  return (
    <div className="mt-3 rounded-2xl bg-gradient-emerald p-4 text-white">
      <p className="text-xs/5 opacity-90">This week</p>
      <p className="mt-1 text-2xl font-bold">{displayKg} kg</p>
      <p className="text-xs opacity-90">{getMessage(foodSavedKg)}</p>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] opacity-80">
          <span>Progress</span>
          <span>{progressPct}%</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] opacity-80">
          <span>{displayKg} kg saved</span>
          <span>{weeklyGoalKg} kg goal</span>
        </div>
      </div>

      {goalAchieved && (
        <p className="mt-2 text-center text-xs font-semibold">Goal achieved! 🎉</p>
      )}

      <div className="mt-3 space-y-1.5 border-t border-white/20 pt-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 opacity-80">
            <HeartHandshake className="h-3 w-3" /> Donations
          </span>
          <span className="font-semibold">{donationsCompleted}</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 opacity-80">
            <CalendarDays className="h-3 w-3" /> Meals planned
          </span>
          <span className="font-semibold">{mealsPlanned}</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 opacity-80">
            <Package className="h-3 w-3" /> Inventory added
          </span>
          <span className="font-semibold">{inventoryAdded}</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 opacity-80">
            <Leaf className="h-3 w-3" /> Food claimed
          </span>
          <span className="font-semibold">{foodClaimed}</span>
        </div>
      </div>
    </div>
  );
}
