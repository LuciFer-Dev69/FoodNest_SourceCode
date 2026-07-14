import { createFileRoute } from "@tanstack/react-router";
import { Bell, Clock, HeartHandshake, Utensils, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { PageHeader, Panel } from "@/components/app/primitives";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — FoodNest" }] }),
  component: Notifications,
});

const items = [
  { i: AlertTriangle, t: "Yogurt expires in 2 days", w: "5m ago", tone: "warning", unread: true },
  { i: HeartHandshake, t: "Mia accepted your sourdough donation", w: "1h ago", tone: "success", unread: true },
  { i: Utensils, t: "Dinner reminder: Tomato pasta at 7pm", w: "3h ago", tone: "primary", unread: true },
  { i: Bell, t: "Weekly summary is ready", w: "Yesterday", tone: "primary" },
  { i: AlertTriangle, t: "Spinach expires tomorrow", w: "Yesterday", tone: "danger" },
  { i: HeartHandshake, t: "New donation nearby: heirloom carrots", w: "2d ago", tone: "success" },
];
const toneClass: Record<string, string> = {
  warning: "bg-warning/15 text-warning",
  success: "bg-success/15 text-success",
  primary: "bg-primary/15 text-primary",
  danger: "bg-destructive/15 text-destructive",
};

function Notifications() {
  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Calm, real-time updates about your kitchen."
        action={<button className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary">Mark all read</button>}
      />
      <Panel className="p-0">
        <ul>
          {items.map((n, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 border-b border-border/40 px-5 py-4 last:border-0 hover:bg-background/60"
            >
              <span className={`grid h-10 w-10 place-items-center rounded-2xl ${toneClass[n.tone]}`}>
                <n.i className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium">{n.t}</p>
                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {n.w}
                </p>
              </div>
              {n.unread && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
            </motion.li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
