import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import {
  Package,
  HeartHandshake,
  CalendarDays,
  Bell,
  AlertTriangle,
  CheckCircle,
  Plus,
  ArrowRight,
  Clock,
  ChefHat,
  Users,
  TrendingUp,
  MessageSquare,
  ListTodo,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { PageHeader, Panel } from "@/components/app/primitives";
import { DashboardController } from "@/controllers/dashboard.controller";
import type { DashboardData, Priority, ActivityEntry } from "@/models/dashboard.model";

const PRIORITY_ICONS: Record<string, React.ReactNode> = {
  AlertTriangle: <AlertTriangle className="h-4 w-4" />,
  HeartHandshake: <HeartHandshake className="h-4 w-4" />,
  Package: <Package className="h-4 w-4" />,
  CalendarDays: <CalendarDays className="h-4 w-4" />,
  Bell: <Bell className="h-4 w-4" />,
  CheckCircle: <CheckCircle className="h-4 w-4" />,
};

const ACTIVITY_EMOJIS: Record<string, string> = {
  inventory: "📦",
  donation: "❤️",
  meal: "🍳",
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-foreground/5 ${className}`} />;
}

function EmptyState({ icon, title, description, action }: { icon: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-foreground/5 text-foreground/30">{icon}</div>
      <p className="text-base font-semibold">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function QuickActionButton({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm font-semibold transition hover:bg-secondary hover:shadow-soft"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-white">{icon}</span>
      {label}
    </Link>
  );
}

export function DashboardView({ data, loading, error, refresh, greeting, userName, profilePicture, today }: DashboardController) {
  if (loading && !data) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-10 w-72" />
        <SkeletonBlock className="h-5 w-96" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <SkeletonBlock key={i} className="h-28" />)}
        </div>
        <SkeletonBlock className="mt-4 h-80" />
      </div>
    );
  }

  if (error) {
    return (
      <Panel>
        <EmptyState
          icon={<AlertTriangle className="h-6 w-6" />}
          title="Could not load dashboard"
          description={error}
          action={
            <button onClick={refresh} className="rounded-full bg-gradient-primary px-5 py-2 text-sm font-semibold text-white shadow-soft hover:shadow-lift">
              Try again
            </button>
          }
        />
      </Panel>
    );
  }

  if (!data) return null;

  const d = data as DashboardData;
  const isNewUser = d.onboardingSteps.every((s) => !s.done) || d.completionScore === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {profilePicture ? (
            <img src={profilePicture} alt={userName} className="h-14 w-14 rounded-full object-cover shadow-soft" />
          ) : (
            <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-primary text-xl font-bold text-white shadow-soft">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {greeting}, {userName}!
            </h1>
            <p className="text-sm text-muted-foreground">{today}</p>
          </div>
        </div>
        <p className="hidden text-sm italic text-muted-foreground md:block">
          Let's reduce food waste together today.
        </p>
      </div>

      {isNewUser ? (
        <Panel>
          <EmptyState
            icon={<ListTodo className="h-6 w-6" />}
            title="Welcome to FoodNest!"
            description="Complete the steps below to get started."
          />
          <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {d.onboardingSteps.map((step, i) => (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-2xl border p-4 text-center ${
                  step.done ? "border-success/30 bg-success/5" : "border-border bg-background/50"
                }`}
              >
                <div className={`mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl text-lg font-bold ${
                  step.done ? "bg-success/15 text-success" : "bg-foreground/5 text-foreground/30"
                }`}>
                  {step.done ? "✓" : i + 1}
                </div>
                <p className={`text-sm font-semibold ${step.done ? "text-success" : "text-foreground/60"}`}>{step.label}</p>
              </motion.div>
            ))}
          </div>
        </Panel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <QuickActionButton to="/app/inventory" icon={<Package className="h-4 w-4" />} label="Add Inventory" />
          <QuickActionButton to="/app/donations" icon={<HeartHandshake className="h-4 w-4" />} label="List Donation" />
          <QuickActionButton to="/app/planner" icon={<CalendarDays className="h-4 w-4" />} label="Create Meal Plan" />
          <QuickActionButton to="/app/community" icon={<Users className="h-4 w-4" />} label="Community Post" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {([
          { label: "Inventory Items", value: d.stats.inventoryCount, icon: <Package className="h-5 w-5" />, tone: "primary" },
          { label: "Active Donations", value: d.stats.donationCount, icon: <HeartHandshake className="h-5 w-5" />, tone: "success" },
          { label: "Meals Planned", value: d.stats.mealPlanCount, icon: <CalendarDays className="h-5 w-5" />, tone: "warning" },
          { label: "Unread", value: d.stats.unreadCount, icon: <Bell className="h-5 w-5" />, tone: "danger" },
          { label: "Profile", value: `${d.completionScore}%`, icon: <TrendingUp className="h-5 w-5" />, tone: "primary" },
        ] as const).map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="glass-card rounded-3xl p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-primary/10 text-primary">
                {s.icon}
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{String(s.value)}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <h3 className="text-base font-bold">Today's Priorities</h3>
          <div className="mt-3 space-y-2">
            {d.priorities.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                  p.type === "all_good" ? "bg-success/5" : "bg-background/60"
                }`}
              >
                <span className={`grid h-8 w-8 place-items-center rounded-xl ${
                  p.type === "all_good" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                }`}>
                  {PRIORITY_ICONS[p.icon] || <Bell className="h-4 w-4" />}
                </span>
                <p className="flex-1 text-sm font-medium">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </Panel>

        <Panel>
          <h3 className="text-base font-bold">Today's Meals</h3>
          {d.todayMeals && (d.todayMeals.Breakfast || d.todayMeals.Lunch || d.todayMeals.Dinner) ? (
            <div className="mt-3 space-y-2">
              {["Breakfast", "Lunch", "Dinner"].map((slot) => {
                const meal = d.todayMeals[slot as keyof typeof d.todayMeals];
                return (
                  <div key={slot} className="flex items-center gap-3 rounded-2xl bg-background/60 px-4 py-3">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-primary/10 text-base">
                      {meal?.emoji || "🍽️"}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">{slot}</p>
                      <p className="text-sm font-semibold">{meal?.name || "Not planned"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<ChefHat className="h-6 w-6" />}
              title="No meals planned today"
              action={
                <Link to="/app/planner" className="inline-flex items-center gap-1 rounded-full bg-gradient-primary px-4 py-2 text-xs font-semibold text-white shadow-soft hover:shadow-lift">
                  Create Meal Plan <ArrowRight className="h-3 w-3" />
                </Link>
              }
            />
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold">Recent Activity</h3>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          {d.recentActivity.length > 0 ? (
            <div className="space-y-1">
              {d.recentActivity.map((a, i) => (
                <motion.div
                  key={`${a.type}-${a.createdAt}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-background/40"
                >
                  <span className="text-lg">{a.emoji || ACTIVITY_EMOJIS[a.type] || "📌"}</span>
                  <p className="flex-1 text-sm font-medium">{a.text}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Clock className="h-6 w-6" />} title="No recent activity" description="Your actions will appear here." />
          )}
        </Panel>

        <Panel>
          <h3 className="text-base font-bold">Activity (7 Days)</h3>
          <p className="text-xs text-muted-foreground">Items added to inventory</p>
          {d.activityChart.some((p) => p.count > 0) ? (
            <div className="mt-2 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.activityChart} margin={{ top: 6, right: 4, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gChart" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.72 0.18 145)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.72 0.18 145)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 240)" />
                  <XAxis dataKey="day" stroke="oklch(0.55 0.03 250)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.55 0.03 250)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 240)" }} />
                  <Area type="monotone" dataKey="count" stroke="oklch(0.72 0.18 145)" strokeWidth={2} fill="url(#gChart)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-6 flex items-center justify-center text-xs text-muted-foreground">No data yet</div>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold">Inventory Preview</h3>
            <Link to="/app/inventory" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {d.inventoryPreview.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                    <th className="pb-2 pr-4">Food</th>
                    <th className="pb-2 pr-4">Qty</th>
                    <th className="pb-2 pr-4">Expires</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {d.inventoryPreview.slice(0, 5).map((item) => {
                    const expiresIn = item.expires;
                    const expiringSoon = expiresIn <= 3;
                    return (
                      <tr key={item.id} className="border-b border-border/50">
                        <td className="py-3 pr-4">
                          <span className="flex items-center gap-2 font-medium">
                            <span>{item.emoji}</span> {item.name}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{item.qty}</td>
                        <td className="py-3 pr-4">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            expiresIn <= 1 ? "bg-destructive/15 text-destructive" :
                            expiringSoon ? "bg-warning/15 text-warning" :
                            "bg-success/15 text-success"
                          }`}>
                            {expiresIn === 0 ? "Today" : `${expiresIn}d`}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            expiringSoon ? "bg-warning/15 text-warning" : "bg-success/15 text-success"
                          }`}>
                            {expiringSoon ? "Expiring" : "Fresh"}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link to="/app/inventory" className="text-xs font-semibold text-primary hover:underline">View</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={<Package className="h-6 w-6" />} title="No inventory items" description="Add your first food item to get started." />
          )}
        </Panel>

        <Panel>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold">Notifications</h3>
            <Link to="/app/notifications" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {d.notifications.length > 0 ? (
            <div className="space-y-1">
              {d.notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                    !n.isRead ? "bg-primary/5" : ""
                  }`}
                >
                  <span className={`grid h-7 w-7 place-items-center rounded-xl text-xs ${
                    !n.isRead ? "bg-primary/15 text-primary" : "bg-foreground/5 text-foreground/40"
                  }`}>
                    <Bell className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`truncate text-sm ${!n.isRead ? "font-semibold" : "text-muted-foreground"}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Bell className="h-6 w-6" />} title="No notifications" description="You're all caught up." />
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold">Donation Preview</h3>
            <Link to="/app/donations" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              View Marketplace <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {d.donationPreview.length > 0 ? (
            <div className="space-y-2">
              {d.donationPreview.slice(0, 3).map((don) => (
                <div key={don.id} className="flex items-center gap-3 rounded-2xl bg-background/60 px-4 py-3">
                  <span className="text-2xl">{don.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{don.name}</p>
                    <p className="text-xs text-muted-foreground">{don.qty} · {don.cat} · {don.pickup}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    don.status === "Available" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                  }`}>{don.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<HeartHandshake className="h-6 w-6" />} title="No donations yet" description="List surplus food to help your community." />
          )}
        </Panel>

        <Panel>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold">Completion Score</h3>
            <span className="text-2xl font-bold">{d.completionScore}%</span>
          </div>
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-foreground/10">
            <div
              className="h-full rounded-full bg-gradient-primary transition-all duration-500"
              style={{ width: `${d.completionScore}%` }}
            />
          </div>
          <div className="space-y-2">
            {d.onboardingSteps.map((step) => (
              <div key={step.key} className="flex items-center gap-3 rounded-2xl bg-background/60 px-4 py-2.5">
                <span className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-bold ${
                  step.done ? "bg-success/15 text-success" : "bg-foreground/5 text-foreground/30"
                }`}>
                  {step.done ? "✓" : step.key === "profile" ? "1" : step.key === "inventory" ? "2" : step.key === "meal_plan" ? "3" : "4"}
                </span>
                <p className={`flex-1 text-sm ${step.done ? "text-success line-through" : "text-foreground/60"}`}>{step.label}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
