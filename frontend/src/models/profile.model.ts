export type ProfileUser = {
  id: string;
  name: string;
  email: string;
  provider: string;
  profilePicture: string | null;
  username: string | null;
  country: string;
  city: string;
  phone: string;
  bio: string;
  createdAt: string;
  lastLogin: string | null;
};

export type ProfileStats = {
  lifetimeSaved: number;
  donations: number;
  mealsPlanned: number;
  itemsTracked: number;
  currentInventory: number;
  activeDonations: number;
  foodClaimed: number;
  wastePrevented: number;
  communityPosts: number;
  recipesCreated: number;
};

export type TimelineEntry = {
  type: string;
  description: string;
  createdAt: string;
};

export type BadgeInfo = {
  key: string;
  emoji: string;
  label: string;
  desc: string;
  unlocked: boolean;
  unlockedAt: string | null;
};

export type ProfileSettings = {
  language: string;
  theme: string;
};

export type ProfileData = {
  user: ProfileUser;
  settings: ProfileSettings;
  stats: ProfileStats;
  timeline: TimelineEntry[];
  badges: BadgeInfo[];
};

export type ProfileUpdatePayload = {
  name?: string;
  username?: string;
  country?: string;
  city?: string;
  phone?: string;
  bio?: string;
};

export type EmailChangePayload = {
  newEmail: string;
  password: string;
};

export type PasswordChangePayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const TIMELINE_ICONS: Record<string, string> = {
  inventory_added: "📦",
  donation_created: "❤️",
  donation_claimed: "🤝",
  donation_completed: "✅",
  meal_planned: "🍽️",
  meal_completed: "🍳",
  community_post: "💬",
  password_changed: "🔐",
  profile_updated: "✏️",
  avatar_updated: "🖼️",
  badge_unlocked: "🏅",
  joined: "👋",
};
