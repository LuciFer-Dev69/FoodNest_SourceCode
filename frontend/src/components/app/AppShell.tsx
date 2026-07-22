import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  HeartHandshake,
  BarChart3,
  CalendarDays,
  Bell,
  Settings,
  User as UserIcon,
  Leaf,
  Search,
  Plus,
  LifeBuoy,
  Moon,
  Sun,
  LogOut,
  Clock,
  MessageSquare,
  Bookmark,
  MapPin,
  AlertTriangle,
  Info,
  CheckCheck,
} from "lucide-react";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useHistoryController } from "@/controllers/history.controller";
import { api } from "@/lib/api";
import { useLocale } from "@/lib/i18n";
import type { NotificationItem } from "@/models/notification.model";

const NOTIF_ICON: Record<string, any> = {
  inventory_expiring: AlertTriangle,
  inventory_expired: AlertTriangle,
  donation_created: HeartHandshake,
  donation_claimed: HeartHandshake,
  donation_completed: HeartHandshake,
  meal_saved: CalendarDays,
  meal_reminder: CalendarDays,
  community_like: MessageSquare,
  community_comment: MessageSquare,
  community_reply: MessageSquare,
  system: Info,
};

const NOTIF_COLOR: Record<string, string> = {
  inventory_expiring: "text-warning",
  inventory_expired: "text-destructive",
  donation_created: "text-success",
  donation_claimed: "text-primary",
  donation_completed: "text-success",
  meal_saved: "text-success",
  meal_reminder: "text-primary",
  community_like: "text-primary",
  community_comment: "text-primary",
  community_reply: "text-primary",
  system: "text-primary",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const nav = [
  { to: "/app/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/app/inventory", labelKey: "nav.inventory", icon: Package },
  { to: "/app/donations", labelKey: "nav.donations", icon: HeartHandshake },
  { to: "/app/community", labelKey: "nav.community", icon: MessageSquare },
  { to: "/app/analytics", labelKey: "nav.analytics", icon: BarChart3 },
  { to: "/app/planner", labelKey: "nav.planner", icon: CalendarDays },
  { to: "/app/notifications", labelKey: "nav.notifications", icon: Bell },
  { to: "/app/settings", labelKey: "nav.settings", icon: Settings },
  { to: "/app/profile", labelKey: "nav.profile", icon: UserIcon },
] as const;

export default function AppShell() {
  const loc = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { isDark, toggle } = useTheme();
  const { getInitials, logout, user } = useAuth();
  const { t } = useLocale();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifItems, setNotifItems] = useState<NotificationItem[]>([]);
  const [notifCount, setNotifCount] = useState(0);

  const fetchNotifs = useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        api.get<{ items: NotificationItem[]; unreadCount: number }>("/api/notifications?limit=5"),
        api.get<{ unreadCount: number }>("/api/notifications/unread"),
      ]);
      setNotifItems(listRes.items);
      setNotifCount(listRes.unreadCount);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    if (user) fetchNotifs();
  }, [user, fetchNotifs]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user, fetchNotifs]);

  useEffect(() => {
    if (!notifOpen) return;
    fetchNotifs();
  }, [notifOpen, fetchNotifs]);

  const handleNotifClick = useCallback((item: NotificationItem) => {
    setNotifOpen(false);
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
    };
    const path = routes[item.type] || "/app/notifications";
    if (!item.isRead) {
      api.patch(`/api/notifications/${item.id}/read`).catch(() => {});
      setNotifCount((prev) => Math.max(0, prev - 1));
    }
    window.location.href = path;
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await api.patch("/api/notifications/read-all");
      setNotifCount(0);
      setNotifItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <div className="min-h-dvh bg-hero">
      {/* Sidebar */}
      <aside className="fixed inset-y-3 left-3 z-40 hidden w-64 lg:block">
        <div className="glass-card flex h-full flex-col rounded-3xl p-4">
          <Link to="/" className="mb-6 flex items-center gap-2 px-2">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-primary text-white shadow-soft">
              <Leaf className="h-4 w-4" />
            </span>
            <span className="text-lg font-bold tracking-tight">FoodNest</span>
          </Link>
          <nav className="flex-1 space-y-1">
            {nav.map((n) => {
              const active = loc.pathname.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-gradient-primary text-white shadow-soft"
                      : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{t(n.labelKey)}</span>
                  {active && (
                    <motion.span
                      layoutId="active-pill"
                      className="absolute inset-0 -z-10 rounded-2xl"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          <Link
            to="/app/help"
            className="mt-2 flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
          >
            <LifeBuoy className="h-4 w-4" />
            Help & resources
          </Link>
          <button
            onClick={logout}
            className="mt-1 flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          <div className="mt-3 rounded-2xl bg-gradient-emerald p-4 text-white">
            <p className="text-xs/5 opacity-90">This week</p>
            <p className="text-2xl font-bold">8.4 kg</p>
            <p className="text-xs opacity-90">food saved · keep going 🌱</p>
          </div>

          {/* History */}
          {(() => {
            const { loading, items } = useHistoryController();
            return (
              <div className="mt-3 rounded-2xl p-4">
                <p className="text-sm font-semibold">History</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your claimed donations & notifications
                </p>
                <ul className="mt-3 space-y-2 max-h-44 overflow-auto pr-1">
                  {loading && <li className="text-xs text-muted-foreground">Loading…</li>}
                  {!loading && items.length === 0 && (
                    <li className="text-xs text-muted-foreground">No activity yet</li>
                  )}
                  {!loading &&
                    items.map((h, idx) => (
                      <li
                        key={h.id ?? idx}
                        className="flex items-start gap-3 rounded-xl bg-background/40 px-3 py-2"
                      >
                        <span className="grid h-8 w-8 place-items-center rounded-2xl bg-secondary">
                          {h.kind === "donation" ? (
                            <HeartHandshake className="h-4 w-4" />
                          ) : (
                            <Bell className="h-4 w-4" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold">{h.title}</p>
                          {h.subtitle && (
                            <p className="truncate text-[11px] text-muted-foreground">
                              {h.subtitle}
                            </p>
                          )}
                        </div>
                        {h.createdAt && (
                          <Clock className="mt-1 h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            );
          })()}
        </div>
      </aside>

      {/* Topbar */}
      <header className="sticky top-3 z-30 mx-3 lg:ml-[17.5rem]">
        <div className="glass flex items-center gap-2 rounded-2xl px-3 py-2">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex flex-1 items-center gap-2 rounded-xl bg-background/60 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-background"
          >
            <Search className="h-4 w-4" />
            {t("nav.search")}
            <kbd className="ml-auto rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-semibold text-foreground/70">
              ⌘K
            </kbd>
          </button>
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-xl bg-background/60 hover:bg-background"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative grid h-9 w-9 place-items-center rounded-xl bg-background/60 hover:bg-background"
            >
              <Bell className="h-4 w-4" />
              {notifCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 grid min-w-[18px] px-1 h-[18px] place-items-center rounded-full bg-destructive text-[9px] font-bold text-white"
                >
                  {notifCount > 99 ? "99+" : notifCount}
                </motion.span>
              )}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-[380px] glass-card rounded-3xl overflow-hidden shadow-lift z-50"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
                    <h3 className="text-sm font-bold">Notifications</h3>
                    {notifCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifItems.length === 0 ? (
                      <div className="flex flex-col items-center py-8 text-sm text-muted-foreground">
                        <Bell className="h-8 w-8 mb-2 opacity-50" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifItems.map((item) => {
                        const Icon = NOTIF_ICON[item.type] || Info;
                        const color = NOTIF_COLOR[item.type] || "text-primary";
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNotifClick(item)}
                            className={`flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition hover:bg-background/60 border-b border-border/30 last:border-0 ${
                              !item.isRead ? "bg-primary/5" : ""
                            }`}
                          >
                            <span
                              className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-background/80 ${color}`}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`truncate ${!item.isRead ? "font-bold" : "font-medium"}`}
                              >
                                {item.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {timeAgo(item.createdAt)}
                              </p>
                            </div>
                            {!item.isRead && (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                  <Link
                    to="/app/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="flex items-center justify-center gap-2 border-t border-border/40 px-4 py-3 text-sm font-semibold text-primary hover:bg-background/60"
                  >
                    View All Notifications
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link
            to="/app/profile"
            className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-sm font-bold text-white"
          >
            {getInitials()}
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="px-3 pb-24 pt-4 lg:ml-[17.5rem]">
        <Outlet />
      </main>

      {/* FAB */}
      <button className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-primary text-white shadow-lift transition hover:scale-105">
        <Plus className="h-6 w-6" />
      </button>

      {/* Command Palette */}
      <AnimatePresence>
        {paletteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-start justify-center bg-foreground/30 backdrop-blur-sm pt-32"
            onClick={() => setPaletteOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-[92vw] max-w-xl overflow-hidden rounded-2xl"
            >
              <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  autoFocus
                  placeholder={t("nav.searchPlaceholder")}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-semibold">
                  ESC
                </kbd>
              </div>
              <ul className="max-h-80 overflow-y-auto p-2 text-sm">
                {nav.map((n) => {
                  const Icon = n.icon;
                  return (
                    <li key={n.to}>
                      <Link
                        to={n.to}
                        onClick={() => setPaletteOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-secondary"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {t("nav.goTo")} {t(n.labelKey)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
