export type Meal = { name: string; emoji: string; uses: number };

export const PLANNER_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const PLANNER_SLOTS = ["Breakfast", "Lunch", "Dinner"] as const;

export const INITIAL_PLAN: Record<string, Meal | undefined> = {
  "Mon-Breakfast": { name: "Banana oat pancakes", emoji: "🥞", uses: 3 },
  "Mon-Lunch": { name: "Spinach feta wrap", emoji: "🌯", uses: 4 },
  "Tue-Dinner": { name: "Tomato pasta", emoji: "🍝", uses: 3 },
  "Wed-Lunch": { name: "Greek salad", emoji: "🥗", uses: 5 },
  "Thu-Dinner": { name: "Veggie stir-fry", emoji: "🥢", uses: 6 },
  "Sat-Breakfast": { name: "Avocado toast", emoji: "🥑", uses: 2 },
};

export const SMART_SUGGESTIONS: Meal[] = [
  { name: "Tomato soup", emoji: "🍲", uses: 4 },
  { name: "Mushroom risotto", emoji: "🍚", uses: 3 },
  { name: "Spinach quiche", emoji: "🥧", uses: 5 },
  { name: "Lentil curry", emoji: "🍛", uses: 4 },
];
