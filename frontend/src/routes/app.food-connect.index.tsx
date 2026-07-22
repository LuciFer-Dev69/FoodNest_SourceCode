import { createFileRoute } from "@tanstack/react-router";
import { useFoodConnectListController } from "@/controllers/food-connect.controller";
import { FoodConnectList } from "@/views/FoodConnectListView";

export const Route = createFileRoute("/app/food-connect/")({
  head: () => ({ meta: [{ title: "Food Connect — FoodNest" }] }),
  component: FoodConnectIndex,
});

function FoodConnectIndex() {
  const controller = useFoodConnectListController();
  return <FoodConnectList {...controller} />;
}
