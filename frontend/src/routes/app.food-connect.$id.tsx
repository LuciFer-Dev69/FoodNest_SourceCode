import { createFileRoute } from "@tanstack/react-router";
import { useFoodConnectController } from "@/controllers/food-connect.controller";
import { FoodConnectView } from "@/views/FoodConnectView";

export const Route = createFileRoute("/app/food-connect/$id")({
  head: () => ({ meta: [{ title: "Food Connect — FoodNest" }] }),
  component: FoodConnectPage,
});

function FoodConnectPage() {
  const { id } = Route.useParams();
  const controller = useFoodConnectController(id);
  return <FoodConnectView {...controller} />;
}
