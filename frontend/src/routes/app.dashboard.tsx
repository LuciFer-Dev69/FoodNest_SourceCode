import { createFileRoute } from "@tanstack/react-router";
import { useDashboardController } from "@/controllers/dashboard.controller";
import { DashboardView } from "@/views/DashboardView";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — FoodNest" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const controller = useDashboardController();
  return <DashboardView {...controller} />;
}
