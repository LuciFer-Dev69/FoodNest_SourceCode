import { createFileRoute } from "@tanstack/react-router";
import { useAnalyticsController } from "@/controllers/analytics.controller";
import { AnalyticsView } from "@/views/AnalyticsView";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — FoodNest" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const controller = useAnalyticsController();
  return <AnalyticsView {...controller} />;
}
