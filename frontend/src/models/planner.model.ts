export type Meal = { name: string; emoji: string; uses?: number };

export type MealSlot = {
  slotKey: string;
  name: string;
  emoji: string;
  status: "planned" | "completed" | "skipped" | "cancelled";
};

export type SavedPlan = {
  id: string;
  name: string;
  weekStart?: string;
  meals: MealSlot[];
  createdAt: string;
  updatedAt: string;
};

export type RecipeSuggestion = {
  name: string;
  emoji: string;
  ingredients: string[];
  ingredientsUsed: number;
  ingredientsTotal: number;
  itemsMissing: string[];
  availableCount: number;
  missingCount: number;
  difficulty: string;
  time: string;
  category: string;
  matchPercent: number;
};

export type ShoppingListItem = {
  name: string;
  count: number;
};

export type WeeklySummary = {
  mealsPlanned: number;
  mealsCompleted: number;
  mealsSkipped: number;
  recipesUsed: number;
  ingredientsConsumed: number;
};

export type FavoriteRecipe = {
  id: string;
  name: string;
  emoji: string;
};

export const PLANNER_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const PLANNER_SLOTS = ["Breakfast", "Lunch", "Dinner"] as const;

export const FILTER_OPTIONS = [
  "All", "Breakfast", "Lunch", "Quick & Easy", "Vegetarian", "Healthy", "High Protein", "Budget",
] as const;
