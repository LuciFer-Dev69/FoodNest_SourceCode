import { motion, AnimatePresence } from "motion/react";
import {
  Bell, AlertTriangle, HeartHandshake, CalendarDays, MessageSquare, Info,
  Clock, Trash2, CheckCheck, Search, ChevronLeft, ChevronRight,
} from "lucide-react";
import { PageHeader, Panel } from "@/components/app/primitives";
import type { NotificationsController } from "@/controllers/notifications.controller";
import type { NotificationItem } from "@/models/notification.model";
import { NOTIFICATION_FILTERS } from "@/models/notification.model";

const NOTIFICATION_ICONS: Record<string, { icon: any; color: string }> = {
  inventory_expiring: { icon: AlertTriangle, color: "bg-warning/15 text-warning" },
  inventory_expired: { icon: AlertTriangle, color: "bg-destructive/15 text-destructive" },
  donation_created: { icon: HeartHandshake, color: "bg-success/15 text-success" },
  donation_claimed: { icon: HeartHandshake, color: "bg-primary/15 text-primary" },
  donation_completed: { icon: HeartHandshake, color: "bg-success/15 text-success" },
  meal_reminder: { icon: CalendarDays, color: "bg-primary/15 text-primary" },
  meal_saved: { icon: CalendarDays, color: "bg-success/15 text-success" },
  community_like: { icon: MessageSquare, color: "bg-primary/15 text-primary" },
  community_comment: { icon: MessageSquare, color: "bg-primary/15 text-primary" },
  community_reply: { icon: MessageSquare, color: "bg-primary/15 text-primary" },
  system: { icon: Info, color: "bg-primary/15 text-primary" },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function NotificationCard({
  item, onOpen, onDelete, onMarkRead,
}: {
  item: NotificationItem; onOpen: () => void; onDelete: () => void; onMarkRead: () => void;
}) {
  const meta = NOTIFICATION_ICONS[item.type] || NOTIFICATION_ICONS.system;
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-start gap-3 border-b border-border/40 px-5 py-4 last:border-0 cursor-pointer transition ${
        !item.isRead ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-background/60"
      }`}
      onClick={onOpen}
    >
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${meta.color}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${!item.isRead ? "font-bold" : "font-medium"}`}>{item.title}</p>
        {item.message && <p className="text-xs text-muted-foreground mt-0.5">{item.message}</p>}
        <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" /> {timeAgo(item.createdAt)}
        </p>
      </div>
      <div className="flex flex-col items-center gap-1 shrink-0">
        {!item.isRead && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
        <button
          onClick={(e) => { e.stopPropagation(); onMarkRead(); }}
          className={`grid h-7 w-7 place-items-center rounded-lg hover:bg-secondary ${item.isRead ? "opacity-0" : ""}`}
          title="Mark as read"
        >
          <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="grid h-7 w-7 place-items-center rounded-lg hover:bg-destructive/10 hover:text-destructive"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export function NotificationsView({
  items, unreadCount, loading,
  filterType, setFilterType,
  filterStatus, setFilterStatus,
  filterSort, setFilterSort,
  page, totalPages,
  searchQuery, setSearchQuery,
  markAllRead,
  deleteNotification,
  clearReadNotifications,
  fetchNotifications,
  getFilteredItems,
  navigateToNotification,
}: NotificationsController) {
  const readCount = items.filter((n) => n.isRead).length;
  const filtered = getFilteredItems();

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread · ${readCount} read`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="inline-flex items-center gap-2 rounded-full bg-background/70 px-4 py-2 text-sm font-semibold border border-border hover:bg-secondary shadow-soft"
              >
                <CheckCheck className="h-4 w-4" /> Mark All Read
              </button>
            )}
            {readCount > 0 && (
              <button
                onClick={clearReadNotifications}
                className="inline-flex items-center gap-2 rounded-full bg-background/70 px-4 py-2 text-sm font-semibold border border-border hover:bg-destructive/10 hover:text-destructive shadow-soft"
              >
                <Trash2 className="h-4 w-4" /> Clear Read
              </button>
            )}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Panel className="p-0 overflow-hidden">
          {loading ? (
            <div className="space-y-4 p-5">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-10 w-10 rounded-2xl bg-secondary" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-secondary" />
                    <div className="h-3 w-1/2 rounded bg-secondary/60" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 text-emerald-500 mb-5">
                <Bell className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold">You're all caught up!</h3>
              <p className="mt-1 text-sm text-muted-foreground">No new notifications.</p>
            </div>
          ) : (
            <>
              <AnimatePresence initial={false}>
                {filtered.map((item) => (
                  <NotificationCard
                    key={item.id}
                    item={item}
                    onOpen={() => navigateToNotification(item)}
                    onMarkRead={() => {
                      if (!item.isRead) {
                        fetchNotifications(page);
                      }
                    }}
                    onDelete={() => deleteNotification(item.id)}
                  />
                ))}
              </AnimatePresence>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 border-t border-border/40 px-5 py-3">
                  <button
                    disabled={page <= 1}
                    onClick={() => fetchNotifications(page - 1)}
                    className="grid h-8 w-8 place-items-center rounded-xl hover:bg-secondary disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => fetchNotifications(page + 1)}
                    className="grid h-8 w-8 place-items-center rounded-xl hover:bg-secondary disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel>
            <h3 className="text-sm font-bold mb-3">Filters</h3>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-background/70 px-3 py-2 mb-3">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notifications..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <div className="mb-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Status</p>
              <div className="flex flex-wrap gap-1">
                {["All", "Unread", "Read"].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setFilterStatus(s); fetchNotifications(1); }}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      filterStatus === s
                        ? "bg-gradient-primary text-white"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Type</p>
              <div className="flex flex-wrap gap-1">
                {NOTIFICATION_FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFilterType(f); fetchNotifications(1); }}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      filterType === f
                        ? "bg-gradient-primary text-white"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Sort</p>
              <div className="flex gap-1">
                {[
                  { label: "Newest", value: "-createdAt" },
                  { label: "Oldest", value: "oldest" },
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => { setFilterSort(s.value); fetchNotifications(1); }}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      filterSort === s.value
                        ? "bg-gradient-primary text-white"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </Panel>

          <Panel>
            <h3 className="text-sm font-bold">Summary</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unread</span>
                <span className="font-semibold text-primary">{unreadCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Read</span>
                <span className="font-semibold">{readCount}</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
