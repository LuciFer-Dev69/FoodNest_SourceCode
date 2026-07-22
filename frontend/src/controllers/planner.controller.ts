import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type {
  Meal, MealSlot, SavedPlan, RecipeSuggestion, ShoppingListItem, WeeklySummary, FavoriteRecipe,
} from "@/models/planner.model";
import { PLANNER_DAYS, PLANNER_SLOTS } from "@/models/planner.model";

export function usePlannerController() {
  const [plan, setPlan] = useState<MealSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [currentPlanName, setCurrentPlanName] = useState("");

  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [plansPage, setPlansPage] = useState(1);
  const [plansTotalPages, setPlansTotalPages] = useState(1);
  const [plansLoading, setPlansLoading] = useState(false);

  const [suggestions, setSuggestions] = useState<RecipeSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  const [summary, setSummary] = useState<WeeklySummary | null>(null);

  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [shoppingLoading, setShoppingLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("All");
  const [searchResults, setSearchResults] = useState<Meal[]>([]);
  const [searching, setSearching] = useState(false);

  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [showSavedPlans, setShowSavedPlans] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  const [quickAddOpen, setQuickAddOpen] = useState<string | null>(null);

  function getSlot(slotKey: string): MealSlot | undefined {
    return plan.find((m) => m.slotKey === slotKey);
  }

  function setSlot(slotKey: string, data: Partial<MealSlot>) {
    setPlan((prev) => {
      const idx = prev.findIndex((m) => m.slotKey === slotKey);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...data };
        return next;
      }
      return [...prev, { slotKey, name: "", emoji: "🍽️", status: "planned", ...data }];
    });
  }

  function removeSlot(slotKey: string) {
    setPlan((prev) => prev.filter((m) => m.slotKey !== slotKey));
  }

  const loadCurrentPlan = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<{ id?: string; name?: string; meals: MealSlot[] }>("/api/meals");
      setPlan(data.meals || []);
      if (data.id) setCurrentPlanId(data.id);
      if (data.name) setCurrentPlanName(data.name);
    } catch {
      setPlan([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCurrentPlan(); }, [loadCurrentPlan]);

  const savePlan = useCallback(async () => {
    try {
      setSaving(true);
      const validMeals = plan.filter((m) => m.name);
      const data = await api.post<{ id: string; name: string }>("/api/meals", { meals: validMeals });
      setCurrentPlanId(data.id);
      setCurrentPlanName(data.name || "");
      toast.success("✓ Meal plan saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save meal plan");
    } finally {
      setSaving(false);
    }
  }, [plan]);

  const loadSavedPlans = useCallback(async (page = 1) => {
    try {
      setPlansLoading(true);
      const data = await api.get<{ plans: SavedPlan[]; pagination: { page: number; pages: number } }>(
        `/api/meals/plans?page=${page}&limit=10`
      );
      setSavedPlans(data.plans);
      setPlansPage(data.pagination.page);
      setPlansTotalPages(data.pagination.pages);
    } catch {
      toast.error("Failed to load saved plans");
    } finally {
      setPlansLoading(false);
    }
  }, []);

  const loadPlanById = useCallback(async (id: string) => {
    try {
      const data = await api.get<SavedPlan>(`/api/meals/plans/${id}`);
      setPlan(data.meals);
      setCurrentPlanId(data.id);
      setCurrentPlanName(data.name || "");
      toast.success("Plan loaded");
    } catch (err: any) {
      toast.error(err.message || "Failed to load plan");
    }
  }, []);

  const deleteSavedPlan = useCallback(async (id: string) => {
    try {
      await api.delete(`/api/meals/plans/${id}`);
      setSavedPlans((prev) => prev.filter((p) => p.id !== id));
      toast.success("Plan deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete plan");
    }
  }, []);

  const duplicateSavedPlan = useCallback(async (id: string) => {
    try {
      const data = await api.post<SavedPlan>(`/api/meals/plans/${id}/duplicate`);
      setSavedPlans((prev) => [data, ...prev]);
      toast.success("Plan duplicated");
    } catch (err: any) {
      toast.error(err.message || "Failed to duplicate plan");
    }
  }, []);

  const handleAddMeal = useCallback((slotKey: string, meal: { name: string; emoji: string }) => {
    setSlot(slotKey, { name: meal.name, emoji: meal.emoji, status: "planned" });
    setQuickAddOpen(null);
    toast.success(`Meal added for ${slotKey}`);
  }, []);

  const handleEditMeal = useCallback((slotKey: string) => {
    const meal = getSlot(slotKey);
    setEditingSlot(slotKey);
    setEditName(meal?.name || "");
    setEditEmoji(meal?.emoji || "🍽️");
  }, [plan]);

  const handleSaveEdit = useCallback(() => {
    if (!editingSlot) return;
    if (!editName.trim()) {
      toast.error("Meal name is required");
      return;
    }
    setSlot(editingSlot, { name: editName.trim(), emoji: editEmoji || "🍽️" });
    setEditingSlot(null);
    toast.success("Meal updated");
  }, [editingSlot, editName, editEmoji]);

  const handleDeleteMeal = useCallback((slotKey: string) => {
    removeSlot(slotKey);
    toast.success("Meal deleted");
  }, []);

  const handleDuplicateMeal = useCallback((sourceKey: string) => {
    const meal = getSlot(sourceKey);
    if (!meal || !meal.name) return;
    const emptySlot = plan.find((m) => !m.name) || PLANNER_DAYS.flatMap((d) =>
      PLANNER_SLOTS.map((s) => `${d}-${s}`)
    ).find((k) => !plan.some((m) => m.slotKey === k));

    if (!emptySlot) {
      toast.error("No empty slots available");
      return;
    }
    const targetKey = typeof emptySlot === "string" ? emptySlot : emptySlot.slotKey;
    setSlot(targetKey, { name: meal.name, emoji: meal.emoji, status: "planned" });
    toast.success("Meal duplicated");
  }, [plan]);

  const handleClearMeal = useCallback((slotKey: string) => {
    setSlot(slotKey, { name: "", emoji: "🍽️", status: "planned" });
    toast.success("Meal cleared");
  }, []);

  const handleMoveMeal = useCallback((fromKey: string, toKey: string) => {
    if (fromKey === toKey) return;
    const meal = getSlot(fromKey);
    if (!meal || !meal.name) return;
    const targetMeal = getSlot(toKey);
    setSlot(toKey, { name: meal.name, emoji: meal.emoji, status: "planned" });
    if (targetMeal?.name) {
      setSlot(fromKey, { name: targetMeal.name, emoji: targetMeal.emoji, status: "planned" });
    } else {
      removeSlot(fromKey);
    }
    toast.success("Meal moved");
  }, [plan]);

  const handleStatusChange = useCallback((slotKey: string, status: MealSlot["status"]) => {
    setSlot(slotKey, { status });
    const label = { completed: "completed", skipped: "skipped", cancelled: "cancelled" }[status];
    toast.success(`Meal ${label}`);
  }, []);

  const generateRandomPlan = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.post<SavedPlan>("/api/meals/generate");
      setPlan(data.meals);
      setCurrentPlanId(data.id);
      setCurrentPlanName(data.name || "");
      toast.success(`Generated: ${data.name || "Random Plan"}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSuggestions = useCallback(async () => {
    try {
      setSuggestionsLoading(true);
      const data = await api.get<{ suggestions: RecipeSuggestion[] }>("/api/meals/suggestions");
      setSuggestions(data.suggestions);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  useEffect(() => { loadSuggestions(); }, [loadSuggestions]);

  const loadSummary = useCallback(async () => {
    try {
      const data = await api.get<WeeklySummary>("/api/meals/summary");
      setSummary(data);
    } catch {
      setSummary(null);
    }
  }, []);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  const loadShoppingList = useCallback(async () => {
    try {
      setShoppingLoading(true);
      const data = await api.get<{ items: ShoppingListItem[] }>("/api/meals/shopping-list");
      setShoppingList(data.items);
    } catch {
      setShoppingList([]);
    } finally {
      setShoppingLoading(false);
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    try {
      setFavoritesLoading(true);
      const data = await api.get<{ favorites: FavoriteRecipe[] }>("/api/meals/favorites");
      setFavorites(data.favorites);
    } catch {
      setFavorites([]);
    } finally {
      setFavoritesLoading(false);
    }
  }, []);

  useEffect(() => { loadFavorites(); }, [loadFavorites]);

  const toggleFavorite = useCallback(async (name: string, emoji: string) => {
    const existing = favorites.find((f) => f.name === name);
    if (existing) {
      try {
        await api.delete(`/api/meals/favorites/${existing.id}`);
        setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
        toast.success("Removed from favorites");
      } catch (err: any) {
        toast.error(err.message || "Failed to remove favorite");
      }
    } else {
      try {
        const data = await api.post<{ id: string }>("/api/meals/favorites", { name, emoji });
        setFavorites((prev) => [{ id: data.id, name, emoji }, ...prev]);
        toast.success("Added to favorites");
      } catch (err: any) {
        toast.error(err.message || "Failed to add favorite");
      }
    }
  }, [favorites]);

  const searchRecipes = useCallback(async (q: string, filter: string) => {
    if (!q.trim() && filter === "All") {
      setSearchResults([]);
      return;
    }
    try {
      setSearching(true);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (filter !== "All") params.set("filter", filter);
      const data = await api.get<{ recipes: Meal[] }>(`/api/meals/search?${params}`);
      setSearchResults(data.recipes);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const isFavorite = useCallback((name: string) => {
    return favorites.some((f) => f.name === name);
  }, [favorites]);

  return {
    plan, loading, saving,
    currentPlanId, currentPlanName,
    savedPlans, plansPage, plansTotalPages, plansLoading,
    suggestions, suggestionsLoading,
    favorites, favoritesLoading,
    summary,
    shoppingList, shoppingLoading,
    searchQuery, setSearchQuery,
    searchFilter, setSearchFilter,
    searchResults, searching,
    editingSlot, setEditingSlot,
    editName, setEditName,
    editEmoji, setEditEmoji,
    showSavedPlans, setShowSavedPlans,
    showShoppingList, setShowShoppingList,
    showFavorites, setShowFavorites,
    quickAddOpen, setQuickAddOpen,

    days: PLANNER_DAYS,
    slots: PLANNER_SLOTS,

    getSlot,
    savePlan,
    loadSavedPlans,
    loadPlanById,
    deleteSavedPlan,
    duplicateSavedPlan,
    handleAddMeal,
    handleEditMeal,
    handleSaveEdit,
    handleDeleteMeal,
    handleDuplicateMeal,
    handleClearMeal,
    handleMoveMeal,
    handleStatusChange,
    generateRandomPlan,
    loadSuggestions,
    loadShoppingList,
    toggleFavorite,
    searchRecipes,
    isFavorite,
  };
}

export type PlannerController = ReturnType<typeof usePlannerController>;
