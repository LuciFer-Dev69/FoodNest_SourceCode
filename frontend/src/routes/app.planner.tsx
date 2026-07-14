import { createFileRoute } from "@tanstack/react-router";
import { usePlannerController } from "@/controllers/planner.controller";
import { PlannerView } from "@/views/PlannerView";

export const Route = createFileRoute("/app/planner")({
  head: () => ({ meta: [{ title: "Meal planner — FoodNest" }] }),
  component: PlannerPage,
});

function PlannerPage() {
  const controller = usePlannerController();
  return <PlannerView {...controller} />;
}
