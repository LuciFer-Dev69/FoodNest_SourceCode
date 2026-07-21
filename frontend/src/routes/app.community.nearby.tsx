import { createFileRoute } from "@tanstack/react-router";
import { NearbyView } from "@/views/NearbyView";

export const Route = createFileRoute("/app/community/nearby")({
  head: () => ({ meta: [{ title: "Nearby — FoodNest" }] }),
  component: NearbyView,
});
