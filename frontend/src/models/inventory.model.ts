export type Item = {
  id: string;
  name: string;
  emoji: string;
  qty: string;
  cat: string;
  loc: string;
  expires: number;
};

export const SEED_INVENTORY: Item[] = [
  { id: "1", name: "Greek yogurt", emoji: "🥛", qty: "500 g", cat: "Dairy", loc: "Fridge", expires: 2 },
  { id: "2", name: "Spinach", emoji: "🥬", qty: "1 bunch", cat: "Produce", loc: "Fridge", expires: 1 },
  { id: "3", name: "Sourdough", emoji: "🍞", qty: "1 loaf", cat: "Bakery", loc: "Pantry", expires: 3 },
  { id: "4", name: "Cherry tomatoes", emoji: "🍅", qty: "300 g", cat: "Produce", loc: "Fridge", expires: 5 },
  { id: "5", name: "Pasta", emoji: "🍝", qty: "500 g", cat: "Pantry", loc: "Pantry", expires: 120 },
  { id: "6", name: "Almond milk", emoji: "🥛", qty: "1 L", cat: "Dairy", loc: "Fridge", expires: 8 },
  { id: "7", name: "Bananas", emoji: "🍌", qty: "6 pcs", cat: "Produce", loc: "Counter", expires: 4 },
  { id: "8", name: "Feta", emoji: "🧀", qty: "200 g", cat: "Dairy", loc: "Fridge", expires: 9 },
  { id: "9", name: "Eggs", emoji: "🥚", qty: "12 pcs", cat: "Dairy", loc: "Fridge", expires: 14 },
  { id: "10", name: "Olive oil", emoji: "🫒", qty: "750 ml", cat: "Pantry", loc: "Pantry", expires: 220 },
];

export function getExpiryTone(days: number) {
  if (days <= 1) return "bg-destructive/15 text-destructive";
  if (days <= 3) return "bg-warning/15 text-warning";
  if (days <= 7) return "bg-[oklch(0.85_0.16_85)]/20 text-[oklch(0.55_0.16_60)]";
  return "bg-success/15 text-success";
}
