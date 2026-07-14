import { createFileRoute } from "@tanstack/react-router";
import { useInventoryController } from "@/controllers/inventory.controller";
import { InventoryView } from "@/views/InventoryView";

export const Route = createFileRoute("/app/inventory")({
  head: () => ({ meta: [{ title: "Inventory — FoodNest" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const controller = useInventoryController();
  return <InventoryView {...controller} />;
}
