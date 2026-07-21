import { createFileRoute } from "@tanstack/react-router";
import { SavedPostsView } from "@/views/SavedPostsView";

export const Route = createFileRoute("/app/community/saved")({
  head: () => ({ meta: [{ title: "Saved Posts — FoodNest" }] }),
  component: SavedPostsView,
});
