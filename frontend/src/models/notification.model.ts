export type NotificationType =
  | "inventory_expiring"
  | "inventory_expired"
  | "donation_created"
  | "donation_claimed"
  | "donation_completed"
  | "meal_reminder"
  | "meal_saved"
  | "community_like"
  | "community_comment"
  | "community_reply"
  | "system";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId: string | null;
  isRead: boolean;
  senderUser: string | null;
  createdAt: string;
};

export type NotificationsResponse = {
  items: NotificationItem[];
  unreadCount: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

export const NOTIFICATION_FILTERS = [
  "All", "Unread", "Read", "Inventory", "Donation", "Meal Planner", "Community", "System",
] as const;

export function getNotificationTypeFilter(type: string): string {
  switch (type) {
    case "Inventory": return "inventory_expiring";
    case "Donation": return "donation_created";
    case "Meal Planner": return "meal_saved";
    case "Community": return "community_like";
    case "System": return "system";
    default: return "All";
  }
}
