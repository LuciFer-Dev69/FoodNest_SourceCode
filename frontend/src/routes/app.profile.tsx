import { createFileRoute } from "@tanstack/react-router";
import { ProfileView } from "@/views/ProfileView";
import { useProfileController } from "@/controllers/profile.controller";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — FoodNest" }] }),
  component: Profile,
});

function Profile() {
  const ctrl = useProfileController();
  return <ProfileView ctrl={ctrl} />;
}
