import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { PageHeader, Panel, StatCard } from "@/components/app/primitives";
import { Leaf, DollarSign, Trash2, Cloud } from "lucide-react";
import { AnalyticsController } from "@/controllers/analytics.controller";

export function AnalyticsView({
  monthly,
  donations,
  cat,
  colors,
}: AnalyticsController) {
  return (
    <>
      <PageHeader title="Analytics" subtitle="Your impact, beautifully visualised." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Food saved" value="128 kg" delta="+22%" icon={<Leaf className="h-5 w-5" />} />
        <StatCard index={1} label="Money saved" value="$486" delta="+$54" icon={<DollarSign className="h-5 w-5" />} tone="success" />
        <StatCard index={2} label="Waste reduced" value="92%" delta="vs baseline" icon={<Trash2 className="h-5 w-5" />} tone="warning" />
        <StatCard index={3} label="CO₂ avoided" value="58 kg" delta="this quarter" icon={<Cloud className="h-5 w-5" />} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <h3 className="text-lg font-bold">Saved vs wasted (monthly)</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 240)" />
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 240)" }} />
                <Legend />
                <Bar dataKey="saved" fill="oklch(0.72 0.18 145)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="wasted" fill="oklch(0.78 0.16 70)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <h3 className="text-lg font-bold">By category</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={cat} dataKey="value" innerRadius={50} outerRadius={92} paddingAngle={3}>
                  {cat.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel>
          <h3 className="text-lg font-bold">Donation trend</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <LineChart data={donations}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 240)" />
                <XAxis dataKey="w" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 240)" }} />
                <Line type="monotone" dataKey="d" stroke="oklch(0.65 0.16 160)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <h3 className="text-lg font-bold">Carbon impact</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="ca" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.18 145)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.72 0.18 145)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 240)" />
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 240)" }} />
                <Area type="monotone" dataKey="saved" stroke="oklch(0.72 0.18 145)" strokeWidth={2.5} fill="url(#ca)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </>
  );
}
