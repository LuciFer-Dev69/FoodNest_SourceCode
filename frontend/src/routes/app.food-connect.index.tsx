import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/app/food-connect/")({
  head: () => ({ meta: [{ title: "Food Connect — FoodNest" }] }),
  component: FoodConnectIndex,
});

function FoodConnectIndex() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-4">
      <HeartHandshake className="h-16 w-16 text-primary/40" />
      <h2 className="text-xl font-bold">Food Connect</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        Open a Reserved or Completed donation to access the Food Connect coordination page.
      </p>
      <Link
        to="/app/donations"
        className="rounded-2xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:shadow-lift"
      >
        Go to Donations
      </Link>
    </div>
  );
}
