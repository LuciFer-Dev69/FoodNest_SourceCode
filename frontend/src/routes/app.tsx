import { createFileRoute, redirect } from "@tanstack/react-router";
import AppShell from "@/components/app/AppShell";

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      throw redirect({ to: "/login", replace: true });
    }
  },
  component: AppShell,
});
