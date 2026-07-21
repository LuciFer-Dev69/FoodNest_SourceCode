import { createFileRoute } from "@tanstack/react-router";
import { useCommunityController } from "@/controllers/community.controller";
import { CommunityView } from "@/views/CommunityView";

export const Route = createFileRoute("/app/community")({
  head: () => ({ meta: [{ title: "Community — FoodNest" }] }),
  component: CommunityPage,
});

function CommunityPage() {
  const controller = useCommunityController();
  return <CommunityView {...controller} />;
}
