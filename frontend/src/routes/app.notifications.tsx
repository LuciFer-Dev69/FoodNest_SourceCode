import { createFileRoute } from "@tanstack/react-router";
import { useNotificationsController } from "@/controllers/notifications.controller";
import { NotificationsView } from "@/views/NotificationsView";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — FoodNest" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const controller = useNotificationsController();
  return <NotificationsView {...controller} />;
}
