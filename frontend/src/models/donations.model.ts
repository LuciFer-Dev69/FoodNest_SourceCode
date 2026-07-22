export type DonationStatus = "Available" | "Reserved" | "Completed" | "Expired" | "Cancelled";

export type PickupLocation = {
  latitude: number | null;
  longitude: number | null;
  address: string;
  country: string;
  city: string;
};

export type Donor = {
  id: string;
  name: string;
  email: string;
};

export type Claimant = {
  id: string;
  name: string;
  email: string;
};

export type Donation = {
  id: string;
  foodName: string;
  category: string;
  quantity: number;
  unit: string;
  description: string;
  expirationDate: string | null;
  pickupDate: string | null;
  pickupTime: string;
  address: string;
  city: string;
  landmark: string;
  image: string | null;
  status: DonationStatus;
  claimedBy: string | null;
  claimant: Claimant | null;
  donor: Donor;
  isOwner: boolean;
  isClaimant: boolean;
  pickupLocation: PickupLocation;
  deliveryMethod: "self_pickup" | "third_party";
  claimedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DonationFormData = {
  foodName: string;
  category: string;
  quantity: number;
  unit: string;
  description: string;
  expirationDate: string;
  pickupDate: string;
  pickupTime: string;
  address: string;
  city: string;
  landmark: string;
  image: File | null;
  shareToCommunity: boolean;
};

export type SortOption = {
  label: string;
  value: string;
};

export const CATEGORIES = ["All", "Produce", "Dairy", "Bakery", "Pantry", "Meat", "Other"] as const;

export const STATUS_FILTERS = ["All", "Available", "Reserved", "Completed", "Cancelled"] as const;

export const SORT_OPTIONS: SortOption[] = [
  { label: "Newest first", value: "-createdAt" },
  { label: "Oldest first", value: "createdAt" },
  { label: "Name A-Z", value: "foodName" },
  { label: "Name Z-A", value: "-foodName" },
  { label: "Expiring soonest", value: "expirationDate" },
  { label: "Expiring latest", value: "-expirationDate" },
  { label: "Quantity ↑", value: "quantity" },
  { label: "Quantity ↓", value: "-quantity" },
];

export const STATUS_LABELS: Record<DonationStatus, string> = {
  Available: "Available",
  Reserved: "Reserved",
  Completed: "Completed",
  Expired: "Expired",
  Cancelled: "Cancelled",
};

export const STATUS_BADGES: Record<DonationStatus, string> = {
  Available: "bg-green-500/15 text-green-600 dark:text-green-400",
  Reserved: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Completed: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  Expired: "bg-red-500/15 text-red-600 dark:text-red-400",
  Cancelled: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
};

export const PLACEHOLDER_IMAGE = null;
