export type DonationStatus = "Available" | "Reserved" | "Claimed" | "Expired";

export type DonationCard = {
  id?: number;
  emoji: string;
  t: string;
  who: string;
  km: number;
  cat: string;
  pickup: string;
  status: DonationStatus;
};

export const DONATION_CARDS: DonationCard[] = [
  { emoji: "🍞", t: "Sourdough loaves (2)", who: "Mia", km: 0.4, cat: "Bakery", pickup: "Today · 5–7pm", status: "Available" },
  { emoji: "🥬", t: "Organic spinach (300g)", who: "Lucas", km: 1.2, cat: "Produce", pickup: "Tomorrow · 9–11am", status: "Reserved" },
  { emoji: "🥛", t: "Almond milk x3", who: "Priya", km: 0.8, cat: "Dairy alt.", pickup: "Today · 6–8pm", status: "Available" },
  { emoji: "🍎", t: "Apples (1 kg)", who: "Noah", km: 2.0, cat: "Produce", pickup: "Today · 7–9pm", status: "Available" },
  { emoji: "🍝", t: "Pasta (sealed)", who: "Sofia", km: 1.6, cat: "Pantry", pickup: "Closed", status: "Claimed" },
  { emoji: "🥕", t: "Heirloom carrots", who: "Aida", km: 0.9, cat: "Produce", pickup: "Tomorrow · 12–2pm", status: "Available" },
  { emoji: "🧀", t: "Cheddar block", who: "Owen", km: 1.5, cat: "Dairy", pickup: "Tomorrow · 4–6pm", status: "Available" },
  { emoji: "🥑", t: "Avocados (4)", who: "Lea", km: 0.6, cat: "Produce", pickup: "Today · 8–9pm", status: "Reserved" },
];

export const DONATION_TONES: Record<DonationStatus, string> = {
  Available: "bg-success/15 text-success",
  Reserved: "bg-warning/15 text-warning",
  Claimed: "bg-muted text-muted-foreground",
  Expired: "bg-destructive/15 text-destructive",
};
