import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import {
  Leaf, Trash2, Cloud, HeartHandshake, CalendarDays, Bell,
  Package, TrendingUp, Users, AlertTriangle,
  CheckCircle, Activity, BarChart3, Download, FileText, RefreshCw,
} from "lucide-react";
import { PageHeader, Panel } from "@/components/app/primitives";
import { AnalyticsController } from "@/controllers/analytics.controller";
import { AnalyticsData, PERIOD_OPTIONS, PeriodOption, HEATMAP_LEVELS } from "@/models/analytics.model";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function PeriodFilter({ current, onChange }: { current: PeriodOption; onChange: (v: PeriodOption) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-2xl border border-border bg-background/70 p-1">
      {PERIOD_OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
            current === o.value ? "bg-gradient-primary text-white shadow-soft" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Trend({ value, positive = true }: { value: string; positive?: boolean }) {
  return (
    <span className={`text-[11px] font-medium ${positive ? "text-green-600" : "text-red-500"}`}>
      {positive ? "↑" : "↓"} {value}
    </span>
  );
}

function StatCard({ label, value, trend, icon, color }: { label: string; value: string; trend?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="glass-card rounded-2xl p-4 hover-lift">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {trend ? <p className="mt-0.5 text-[11px] text-muted-foreground">{trend}</p> : <p className="mt-0.5 text-[11px] text-muted-foreground">No trend yet</p>}
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ backgroundColor: `${color}20`, color }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function CircularProgress({ value, size = 120, strokeWidth = 10 }: { value: number; size?: number; strokeWidth?: number }) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 80 ? "oklch(0.72 0.18 145)" : value >= 50 ? "oklch(0.78 0.16 70)" : "oklch(0.6 0.18 35)";
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(0.92 0.01 240)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" fontSize={28} fontWeight={700} fill={color} transform="rotate(90, 60, 60)">{value}</text>
    </svg>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-soft">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

function HeatmapCell({ level, title }: { level: number; title: string }) {
  return (
    <div
      title={title}
      className={`h-3 w-3 rounded-sm ${HEATMAP_LEVELS[level] || HEATMAP_LEVELS[0]}`}
    />
  );
}

function downloadCSV(data: AnalyticsData) {
  const rows = [["Metric", "Value", "Period"]];
  const add = (m: string, v: string | number) => rows.push([m, String(v), data.period]);
  add("Inventory Items", data.dashboardSummary.inventoryItems);
  add("Active Donations", data.dashboardSummary.activeDonations);
  add("Completed Donations", data.dashboardSummary.completedDonations);
  add("Meals Planned", data.dashboardSummary.mealsPlanned);
  add("Community Posts", data.dashboardSummary.communityPosts);
  add("Food Waste %", data.foodWasteAnalysis.wastePercentage);
  add("Fresh Food", data.foodWasteAnalysis.fresh);
  add("Expiring Soon", data.foodWasteAnalysis.expiringSoon);
  add("Expired Food", data.foodWasteAnalysis.expired);
  add("Total Donations", data.donationStats.total);
  add("Completed Donations", data.donationStats.completed);
  add("Claim Rate %", data.donationStats.claimRate);
  add("Completion Rate %", data.donationStats.completionRate);
  add("Donation Success Rate %", data.sustainability.donationSuccessRate);
  add("Food Saved", data.sustainability.foodSaved);
  add("Meals Shared", data.sustainability.mealsShared);
  add("CO₂ Reduction", data.sustainability.co2Reduction);
  add("Health Score", data.healthScore.overall);
  add("Items Saved", data.monthlyOverview.foodDonated);
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `foodnest-analytics-${data.period}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

export function AnalyticsView({
  period, setPeriod, data, loading, activityMetric, setActivityMetric, refetch,
}: AnalyticsController) {
  const ad = data;

  if (loading) {
    return (
      <>
        <PageHeader title="Analytics" subtitle="Business intelligence for your kitchen." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 animate-pulse">
              <div className="h-3 w-16 rounded bg-secondary mb-3" />
              <div className="h-7 w-12 rounded bg-secondary mb-2" />
              <div className="h-3 w-20 rounded bg-secondary" />
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="glass-card rounded-3xl p-5 animate-pulse lg:col-span-2">
            <div className="h-5 w-36 rounded bg-secondary mb-4" />
            <div className="h-72 rounded bg-secondary" />
          </div>
          <div className="glass-card rounded-3xl p-5 animate-pulse">
            <div className="h-5 w-28 rounded bg-secondary mb-4" />
            <div className="h-72 rounded bg-secondary" />
          </div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="glass-card rounded-3xl p-5 animate-pulse">
            <div className="h-5 w-32 rounded bg-secondary mb-4" />
            <div className="h-64 rounded bg-secondary" />
          </div>
          <div className="glass-card rounded-3xl p-5 animate-pulse">
            <div className="h-5 w-24 rounded bg-secondary mb-4" />
            <div className="h-64 rounded bg-secondary" />
          </div>
        </div>
      </>
    );
  }

  if (!ad) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <p className="text-lg font-semibold">Could not load analytics</p>
        <p className="text-sm text-muted-foreground">The data may be temporarily unavailable.</p>
        <button onClick={refetch} className="mt-2 flex items-center gap-2 rounded-2xl bg-gradient-primary px-5 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  const wastePct = ad.foodWasteAnalysis.wastePercentage ?? 0;

  return (
    <>
      {/* Top Bar */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Business intelligence for your kitchen.</p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodFilter current={period} onChange={setPeriod} />
          <button onClick={() => downloadCSV(ad)} className="flex items-center gap-1.5 rounded-2xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
          <button onClick={() => downloadCSV(ad)} className="flex items-center gap-1.5 rounded-2xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <FileText className="h-3.5 w-3.5" /> PDF
          </button>
          <button onClick={() => downloadCSV(ad)} className="flex items-center gap-1.5 rounded-2xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <FileText className="h-3.5 w-3.5" /> Excel
          </button>
        </div>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Inventory Items" value={String(ad.dashboardSummary.inventoryItems)} icon={<Package className="h-4 w-4" />} color="oklch(0.72 0.18 145)" />
        <StatCard label="Active Donations" value={String(ad.dashboardSummary.activeDonations)} icon={<HeartHandshake className="h-4 w-4" />} color="oklch(0.65 0.16 160)" />
        <StatCard label="Completed Donations" value={String(ad.dashboardSummary.completedDonations)} icon={<CheckCircle className="h-4 w-4" />} color="oklch(0.6 0.15 220)" />
        <StatCard label="Meals Planned" value={String(ad.dashboardSummary.mealsPlanned)} icon={<CalendarDays className="h-4 w-4" />} color="oklch(0.78 0.16 70)" />
        <StatCard label="Community Posts" value={String(ad.dashboardSummary.communityPosts)} icon={<Users className="h-4 w-4" />} color="oklch(0.7 0.15 280)" />
        <StatCard label={`Food Waste`} value={`${wastePct}%`} icon={<Trash2 className="h-4 w-4" />} color="oklch(0.6 0.18 35)" />
      </div>

      {/* Row 2: Line Chart (70%) + Doughnut (30%) */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Weekly Activity</h3>
            <div className="flex items-center gap-0.5 rounded-lg border border-border bg-background/70 p-0.5">
              {["total", "inventory", "donations", "meals", "posts"].map((m) => (
                <button key={m} onClick={() => setActivityMetric(m)}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-semibold transition ${activityMetric === m ? "bg-gradient-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>
                  {m === "total" ? "All" : m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 h-72">
            <ResponsiveContainer>
              <LineChart data={ad.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 240)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <Tooltip content={ChartTooltip} />
                {activityMetric === "total" && <Line type="monotone" dataKey="total" stroke="oklch(0.65 0.16 160)" strokeWidth={2.5} dot={{ r: 3 }} name="Total" />}
                {activityMetric === "inventory" && <Line type="monotone" dataKey="inventory" stroke="oklch(0.72 0.18 145)" strokeWidth={2.5} dot={{ r: 3 }} name="Inventory" />}
                {activityMetric === "donations" && <Line type="monotone" dataKey="donations" stroke="oklch(0.65 0.16 160)" strokeWidth={2.5} dot={{ r: 3 }} name="Donations" />}
                {activityMetric === "meals" && <Line type="monotone" dataKey="meals" stroke="oklch(0.78 0.16 70)" strokeWidth={2.5} dot={{ r: 3 }} name="Meals" />}
                {activityMetric === "posts" && <Line type="monotone" dataKey="posts" stroke="oklch(0.6 0.15 220)" strokeWidth={2.5} dot={{ r: 3 }} name="Posts" />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <h3 className="text-base font-bold">Inventory Categories</h3>
          {ad.inventoryBreakdown.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-xs text-muted-foreground">No inventory yet</div>
          ) : (
            <>
              <div className="mt-3 h-60">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={ad.inventoryBreakdown} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={2}>
                      {ad.inventoryBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={ChartTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                {ad.inventoryBreakdown.map((c) => (
                  <span key={c.name} className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name} <span className="font-semibold text-foreground">{c.value}</span>
                  </span>
                ))}
              </div>
            </>
          )}
        </Panel>
      </div>

      {/* Row 3: Bar Chart (Monthly Donations) + Pie (Food Status) */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel>
          <h3 className="text-base font-bold">Monthly Donations</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer>
              <BarChart data={ad.donationStats.monthlyChart.length > 0 ? ad.donationStats.monthlyChart : [{ month: "No data", count: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 240)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                <Tooltip content={ChartTooltip} />
                <Bar dataKey="count" fill="oklch(0.65 0.16 160)" radius={[6, 6, 0, 0]} name="Donations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <h3 className="text-base font-bold">Food Status</h3>
          {ad.foodWasteAnalysis.pieData.every((p) => p.value === 0) ? (
            <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">No data</div>
          ) : (
            <>
              <div className="mt-3 h-52">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={ad.foodWasteAnalysis.pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3}>
                      {ad.foodWasteAnalysis.pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={ChartTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 text-xs">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: "oklch(0.72 0.18 145)" }} /> Fresh <strong>{ad.foodWasteAnalysis.fresh}</strong></span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: "oklch(0.78 0.16 70)" }} /> Expiring <strong>{ad.foodWasteAnalysis.expiringSoon}</strong></span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: "oklch(0.6 0.18 35)" }} /> Expired <strong>{ad.foodWasteAnalysis.expired}</strong></span>
              </div>
            </>
          )}
        </Panel>
      </div>

      {/* Row 4: Heatmap */}
      <div className="mt-4">
        <Panel>
          <h3 className="text-base font-bold">Activity Calendar</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Last 6 weeks &middot; GitHub-style contribution heatmap</p>
          <div className="mt-3 overflow-x-auto">
            <div className="flex gap-0.5" style={{ minWidth: 700 }}>
              {Array.from({ length: 7 }).map((_, dayIdx) => (
                <div key={dayIdx} className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-muted-foreground h-3 mb-0.5">{DAYS[dayIdx]}</span>
                  {Array.from({ length: 6 }).map((_, weekIdx) => {
                    const cell = ad.heatmap[weekIdx * 7 + dayIdx];
                    if (!cell) return <div key={weekIdx} className="h-3 w-3 rounded-sm bg-gray-100 dark:bg-gray-800" />;
                    return (
                      <HeatmapCell
                        key={weekIdx}
                        level={cell.level}
                        title={`${cell.date}: ${cell.count} activities`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
            <span>Less</span>
            {HEATMAP_LEVELS.map((cls, i) => (
              <div key={i} className={`h-3 w-3 rounded-sm ${cls}`} />
            ))}
            <span>More</span>
          </div>
        </Panel>
      </div>

      {/* Row 5: Insights */}
      <div className="mt-4">
        <Panel>
          <h3 className="text-base font-bold">Smart Insights</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ad.insights.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full">No insights available. Data will generate insights as you use FoodNest.</p>
            ) : (
              ad.insights.map((insight, i) => (
                <div key={i} className="rounded-2xl bg-secondary/40 p-4 border border-border/40">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">{insight.category}</p>
                      <p className="text-sm mt-0.5 font-medium">{insight.problem}</p>
                      <p className="text-xs text-muted-foreground mt-1">{insight.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      {/* Row 6: Food Waste Analysis */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="glass-card rounded-2xl p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Waste %</p>
          <p className="mt-1 text-2xl font-bold">{wastePct}%</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-red-500" style={{ width: `${Math.min(wastePct, 100)}%` }} />
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Expired Items</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{ad.foodWasteAnalysis.expired}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Items Saved</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{ad.monthlyOverview.foodDonated}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Donation Success</p>
          <p className="mt-1 text-2xl font-bold">{ad.sustainability.donationSuccessRate}%</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">CO₂ Saved</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{ad.sustainability.co2Reduction}</p>
        </div>
      </div>

      {/* Row 7: Top Categories Horizontal Bar */}
      <div className="mt-4">
        <Panel>
          <h3 className="text-base font-bold">Top Categories</h3>
          {ad.inventoryBreakdown.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No inventory categories yet</p>
          ) : (
            <div className="mt-3 space-y-2.5">
              {ad.inventoryBreakdown.sort((a, b) => b.value - a.value).map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="w-24 text-xs font-medium text-muted-foreground">{cat.name}</span>
                  <div className="flex-1 h-5 rounded-lg bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all"
                      style={{
                        width: `${Math.min((cat.value / Math.max(...ad.inventoryBreakdown.map((c) => c.value))) * 100, 100)}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs font-semibold">{cat.value}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* Row 8: Recent Activity Timeline */}
      <div className="mt-4">
        <Panel>
          <h3 className="text-base font-bold">Recent Activity</h3>
          <div className="mt-3 space-y-0 max-h-80 overflow-y-auto">
            {ad.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No recent activity</p>
            ) : (
              ad.recentActivity.map((entry, i) => (
                <div key={i} className="flex items-start gap-3 border-b border-border/30 py-2.5 last:border-0">
                  <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
                    entry.type === "inventory" ? "bg-green-500/10 text-green-600" :
                    entry.type === "donation" ? "bg-blue-500/10 text-blue-600" :
                    entry.type === "meal" ? "bg-amber-500/10 text-amber-600" :
                    "bg-purple-500/10 text-purple-600"
                  }`}>
                    {entry.type === "inventory" ? <Package className="h-3.5 w-3.5" /> :
                     entry.type === "donation" ? <HeartHandshake className="h-3.5 w-3.5" /> :
                     entry.type === "meal" ? <CalendarDays className="h-3.5 w-3.5" /> :
                     <Users className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{entry.text}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      {/* Row 9: Problem Detection */}
      {ad.problems.length > 0 && (
        <div className="mt-4">
          <Panel>
            <h3 className="text-base font-bold">Problem Detection</h3>
            <div className="mt-3 space-y-3">
              {ad.problems.map((p, i) => (
                <div key={i} className={`rounded-2xl border p-4 ${
                  p.priority === "High" ? "border-red-500/20 bg-red-500/5" :
                  p.priority === "Medium" ? "border-amber-500/20 bg-amber-500/5" : "border-blue-500/20 bg-blue-500/5"
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${
                          p.priority === "High" ? "text-red-500" :
                          p.priority === "Medium" ? "text-amber-500" : "text-blue-500"
                        }`} />
                        <p className="text-sm font-semibold">{p.problem}</p>
                      </div>
                      <div className="mt-2 grid gap-2 text-xs sm:grid-cols-3">
                        <div><span className="text-muted-foreground">Reason:</span> {p.reason}</div>
                        <div><span className="text-muted-foreground">Impact:</span> {p.impact}</div>
                        <div><span className="text-muted-foreground">Recommendation:</span> {p.recommendation}</div>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      p.priority === "High" ? "bg-red-500/15 text-red-600" :
                      p.priority === "Medium" ? "bg-amber-500/15 text-amber-600" : "bg-blue-500/15 text-blue-600"
                    }`}>{p.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* Row 10: Performance Score */}
      <div className="mt-4">
        <Panel>
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <CircularProgress value={ad.healthScore.overall} size={130} strokeWidth={12} />
              <p className="text-xs font-semibold text-muted-foreground">FoodNest Score</p>
            </div>
            <div className="flex-1 space-y-3 min-w-[200px]">
              {ad.healthScore.breakdown.map((b) => (
                <div key={b.category}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{b.category}</span>
                    <span className="font-semibold">{b.score}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all" style={{ width: `${b.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">{ad.healthScore.explanation}</p>
        </Panel>
      </div>
    </>
  );
}
