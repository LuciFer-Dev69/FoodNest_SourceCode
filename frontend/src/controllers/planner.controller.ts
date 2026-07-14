import { useState, useEffect } from "react";
import { Meal, INITIAL_PLAN, PLANNER_DAYS, PLANNER_SLOTS, SMART_SUGGESTIONS } from "@/models/planner.model";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function usePlannerController() {
  const [plan, setPlan] = useState<Record<string, Meal | undefined>>({});
  const [drag, setDrag] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);

  // Load weekly plan from backend
  const loadMealPlan = async () => {
    try {
      setLoading(true);
      const data = await api.get<Record<string, Meal | undefined>>("/api/meals");
      // If backend returned empty map, use initial mock suggestions for presentation
      if (Object.keys(data).length === 0) {
        setPlan(INITIAL_PLAN);
      } else {
        setPlan(data);
      }
    } catch (err) {
      console.warn("Could not connect to database backend. Using mock planner seed.", err.message);
      setPlan(INITIAL_PLAN);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMealPlan();
  }, []);

  const handleDrop = async (key: string) => {
    if (!drag) return;
    
    // Optimistic UI update
    setPlan((p) => ({ ...p, [key]: drag }));
    
    try {
      await api.post("/api/meals", {
        slotKey: key,
        name: drag.name,
        emoji: drag.emoji,
        uses: drag.uses
      });
      toast.success(`Planned ${drag.name} for ${key}`);
    } catch (err) {
      toast.success(`Planned ${drag.name} locally (offline mode)`);
    }
    
    setDrag(null);
  };

  const handleAutofillWeek = async () => {
    const updatedPlan = { ...plan };
    let savedCount = 0;
    
    PLANNER_DAYS.forEach((day) => {
      PLANNER_SLOTS.forEach((slot) => {
        const key = `${day}-${slot}`;
        if (!updatedPlan[key]) {
          const randomIndex = Math.floor(Math.random() * SMART_SUGGESTIONS.length);
          const meal = SMART_SUGGESTIONS[randomIndex];
          updatedPlan[key] = meal;
          savedCount++;
        }
      });
    });

    setPlan(updatedPlan);
    toast.success(`Auto-filled ${savedCount} empty slots!`);

    // Optionally batch persist if backend is connected
    try {
      for (const [key, meal] of Object.entries(updatedPlan)) {
        if (meal) {
          await api.post("/api/meals", {
            slotKey: key,
            name: meal.name,
            emoji: meal.emoji,
            uses: meal.uses
          });
        }
      }
    } catch (err) {
      // offline silent fallback
    }
  };

  return {
    plan,
    setDrag,
    drag,
    days: PLANNER_DAYS,
    slots: PLANNER_SLOTS,
    suggestions: SMART_SUGGESTIONS,
    loading,
    handleDrop,
    handleAutofillWeek,
  };
}

export type PlannerController = ReturnType<typeof usePlannerController>;
