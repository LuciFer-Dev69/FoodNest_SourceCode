import { createFileRoute, redirect } from "@tanstack/react-router";
import AppShell from "@/components/app/AppShell";
import { getStoredToken } from "@/lib/auth-storage";

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    const token =
      typeof window !== "undefined" ? getStoredToken() : null;
    if (!token) {
      throw redirect({ to: "/login", replace: true });
    }
  },
  component: AppShell,
});
