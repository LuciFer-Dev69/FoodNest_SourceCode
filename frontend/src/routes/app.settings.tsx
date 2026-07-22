import { createFileRoute } from "@tanstack/react-router";
import { useSettingsController, type SettingsController } from "@/controllers/settings.controller";
import { SettingsView } from "@/views/SettingsView";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — FoodNest" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const controller = useSettingsController();
  return <SettingsView {...controller} />;
}
