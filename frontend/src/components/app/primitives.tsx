import type { ReactNode } from "react";
import { motion } from "motion/react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6 flex flex-wrap items-end justify-between gap-4"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  );
}

export function StatCard({
  label, value, delta, icon, tone = "primary", index = 0,
}: {
  label: string; value: string; delta?: string; icon: ReactNode;
  tone?: "primary" | "warning" | "success" | "danger"; index?: number;
}) {
  const tones: Record<string, string> = {
    primary: "from-[oklch(0.85_0.18_145)] to-[oklch(0.78_0.18_130)]",
    warning: "from-[oklch(0.88_0.16_85)] to-[oklch(0.78_0.16_70)]",
    success: "from-[oklch(0.85_0.15_165)] to-[oklch(0.72_0.16_160)]",
    danger: "from-[oklch(0.85_0.16_30)] to-[oklch(0.7_0.2_25)]",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="glass-card hover-lift relative overflow-hidden rounded-3xl p-5"
    >
      <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${tones[tone]} opacity-30 blur-2xl`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
          {delta && (
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
              {delta}
            </p>
          )}
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${tones[tone]} text-white shadow-soft`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`glass-card rounded-3xl p-6 ${className}`}>{children}</div>;
}
