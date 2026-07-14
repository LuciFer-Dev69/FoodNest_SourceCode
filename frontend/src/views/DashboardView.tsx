import { motion } from "motion/react";
import { Package, AlertTriangle, HeartHandshake, Leaf, Sparkles, ArrowUpRight } from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { PageHeader, StatCard, Panel } from "@/components/app/primitives";
import { DashboardController } from "@/controllers/dashboard.controller";

export function DashboardView({
  userName,
  stats,
  trend,
  pie,
  colors,
  activities,
  summary,
  handleGenerateWeeklyPlan,
}: DashboardController) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader
        title={`${greeting}, ${userName} 👋`}
        subtitle="Here's a calm snapshot of your kitchen today."
        action={
          <button onClick={handleGenerateWeeklyPlan} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-soft hover:shadow-lift">
            <Sparkles className="h-4 w-4" /> Generate weekly plan
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Food saved" value={stats.foodSaved} delta="+12%" icon={<Leaf className="h-5 w-5" />} />
        <StatCard index={1} label="Inventory items" value={stats.inventoryCount} delta="+4 this week" icon={<Package className="h-5 w-5" />} tone="success" />
        <StatCard index={2} label="Expiring soon" value={stats.expiringSoon} delta="use within 3 days" icon={<AlertTriangle className="h-5 w-5" />} tone="warning" />
        <StatCard index={3} label="Donations" value={stats.donationsCount} delta="9 neighbours" icon={<HeartHandshake className="h-5 w-5" />} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Weekly food saved</h3>
              <p className="text-xs text-muted-foreground">kg avoided from waste</p>
            </div>
            <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">+22% vs last week</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.18 145)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.72 0.18 145)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 240)" />
                <XAxis dataKey="d" stroke="oklch(0.55 0.03 250)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.55 0.03 250)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 240)" }} />
                <Area type="monotone" dataKey="saved" stroke="oklch(0.72 0.18 145)" strokeWidth={2.5} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <h3 className="text-lg font-bold">Inventory mix</h3>
          <p className="text-xs text-muted-foreground">by category</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie} dataKey="value" innerRadius={48} outerRadius={78} paddingAngle={3}>
                  {pie.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <h3 className="text-lg font-bold">Recent activity</h3>
          <ul className="mt-4 space-y-3">
            {activities.map((a, i) => (
              <motion.li
                key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i }}
                className="flex items-center gap-3 rounded-2xl bg-background/60 px-3 py-3"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-white">
                  <a.icon className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.t}</p>
                  <p className="text-xs text-muted-foreground">{a.w}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </motion.li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <h3 className="text-lg font-bold">This week</h3>
          <p className="text-xs text-muted-foreground">Your weekly summary</p>
          <div className="mt-4 space-y-3">
            {summary.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-2xl bg-background/60 px-3 py-2.5">
                <span className="text-sm text-muted-foreground">{k}</span>
                <span className="font-bold">{v}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
