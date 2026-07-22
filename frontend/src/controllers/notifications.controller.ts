import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { NotificationItem, NotificationsResponse } from "@/models/notification.model";

export function useNotificationsController() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSort, setFilterSort] = useState("-createdAt");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toastQueue, setToastQueue] = useState<NotificationItem[]>([]);

  const fetchNotifications = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== "All") {
        let typeParam = filterType;
        if (filterType === "Inventory") typeParam = "inventory_expiring";
        else if (filterType === "Donation") typeParam = "donation_created";
        else if (filterType === "Meal Planner") typeParam = "meal_saved";
        else if (filterType === "Community") typeParam = "community_like";
        params.set("type", typeParam);
      }
      if (filterStatus === "unread" || filterStatus === "read") params.set("status", filterStatus);
      params.set("sort", filterSort);
      params.set("page", String(p));
      params.set("limit", "20");

      const data = await api.get<NotificationsResponse>(`/api/notifications?${params}`);
      setItems(data.items);
      setUnreadCount(data.unreadCount);
      setPage(data.pagination.page);
      setTotalPages(data.pagination.pages);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, filterSort]);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const pollUnread = useCallback(async () => {
    try {
      const data = await api.get<{ unreadCount: number }>("/api/notifications/unread");
      setUnreadCount(data.unreadCount);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(pollUnread, 30000);
    return () => clearInterval(interval);
  }, [pollUnread]);

  const checkExpiryNotifications = useCallback(async () => {
    try {
      await api.post("/api/notifications/check-expiry");
      pollUnread();
    } catch {
      // silent
    }
  }, [pollUnread]);

  useEffect(() => {
    checkExpiryNotifications();
  }, [checkExpiryNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.patch("/api/notifications/read-all");
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err: any) {
      toast.error(err.message || "Failed to mark all as read");
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setItems((prev) => prev.filter((n) => n.id !== id));
      const deleted = items.find((n) => n.id === id);
      if (deleted && !deleted.isRead) setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success("Notification deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete notification");
    }
  }, [items]);

  const clearReadNotifications = useCallback(async () => {
    try {
      await api.delete("/api/notifications/read");
      setItems((prev) => prev.filter((n) => !n.isRead));
      toast.success("Read notifications cleared");
    } catch (err: any) {
      toast.error(err.message || "Failed to clear notifications");
    }
  }, []);

  const getFilteredItems = useCallback(() => {
    let filtered = items;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          n.type.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [items, searchQuery]);

  const navigateToNotification = useCallback((item: NotificationItem) => {
    if (!item.isRead) markAsRead(item.id);
    const routes: Record<string, string> = {
      inventory_expiring: "/app/inventory",
      inventory_expired: "/app/inventory",
      donation_created: "/app/donations",
      donation_claimed: "/app/donations",
      donation_completed: "/app/donations",
      meal_saved: "/app/planner",
      meal_reminder: "/app/planner",
      community_like: "/app/community",
      community_comment: "/app/community",
      community_reply: "/app/community",
      system: "/app/notifications",
    };
    const path = routes[item.type] || "/app/notifications";
    window.location.href = path;
  }, [markAsRead]);

  return {
    items,
    unreadCount,
    loading,
    filterType, setFilterType,
    filterStatus, setFilterStatus,
    filterSort, setFilterSort,
    page, totalPages,
    searchQuery, setSearchQuery,
    dropdownOpen, setDropdownOpen,
    toastQueue, setToastQueue,

    fetchNotifications,
    markAsRead,
    markAllRead,
    deleteNotification,
    clearReadNotifications,
    getFilteredItems,
    navigateToNotification,
    checkExpiryNotifications,
    pollUnread,
  };
}

export type NotificationsController = ReturnType<typeof useNotificationsController>;
