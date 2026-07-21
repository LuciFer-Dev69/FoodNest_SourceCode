import { createFileRoute } from "@tanstack/react-router";
import { DonationMapView } from "@/views/DonationMapView";

export const Route = createFileRoute("/app/community/donation-map")({
  head: () => ({ meta: [{ title: "Donation Map — FoodNest" }] }),
  component: DonationMapView,
});
