export type UserSettings = {
  _id: string;
  userId: string;
  language: "en" | "ne" | "ms";
  theme: "light" | "dark";
  fontSize: "small" | "medium" | "large";
  animations: boolean;
  notifyInventory: boolean;
  notifyDonations: boolean;
  notifyCommunity: boolean;
  notifyMeals: boolean;
  notifyWeekly: boolean;
  notifyEmail: boolean;
  notifyPush: boolean;
  privacyPublicProfile: boolean;
  privacyShowDonations: boolean;
  privacyAllowMessages: boolean;
  privacyShowOnline: boolean;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  provider: string;
  profilePicture: string | null;
  createdAt: string;
};

export const FONT_OPTIONS = ["small", "medium", "large"] as const;

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "lang.en" },
  { code: "ne", label: "lang.ne" },
  { code: "ms", label: "lang.ms" },
] as const;
