import { createFileRoute } from "@tanstack/react-router";
import { useDonationsController } from "@/controllers/donations.controller";
import { DonationsView } from "@/views/DonationsView";

export const Route = createFileRoute("/app/donations")({
  head: () => ({ meta: [{ title: "Donations — FoodNest" }] }),
  component: DonationsPage,
});

function DonationsPage() {
  const controller = useDonationsController();
  return <DonationsView {...controller} />;
}
