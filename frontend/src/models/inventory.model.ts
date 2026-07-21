export type Item = {
  id: string;
  foodName: string;
  category: string;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expirationDate: string;
  storageLocation: string;
  notes: string;
  image: string | null;
  status: string;
  statusDays: number;
  badge: string;
  createdAt: string;
  updatedAt: string;
};

export type ItemFormData = {
  foodName: string;
  category: string;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expirationDate: string;
  storageLocation: string;
  notes: string;
  image: File | null;
};

export type SortOption = {
  label: string;
  value: string;
};

export const CATEGORIES = ["All", "Produce", "Dairy", "Bakery", "Pantry", "Meat", "Other"] as const;
export const STORAGE_LOCATIONS = ["All", "Fridge", "Freezer", "Pantry", "Counter", "Other"] as const;
export const STATUS_FILTERS = ["All", "Fresh", "Expiring Soon", "Expired"] as const;

export const SORT_OPTIONS: SortOption[] = [
  { label: "Newest first", value: "-createdAt" },
  { label: "Oldest first", value: "createdAt" },
  { label: "Name A-Z", value: "foodName" },
  { label: "Name Z-A", value: "-foodName" },
  { label: "Expiring soonest", value: "expirationDate" },
  { label: "Expiring latest", value: "-expirationDate" },
  { label: "Category A-Z", value: "category" },
  { label: "Category Z-A", value: "-category" },
  { label: "Quantity ↑", value: "quantity" },
  { label: "Quantity ↓", value: "-quantity" },
];
