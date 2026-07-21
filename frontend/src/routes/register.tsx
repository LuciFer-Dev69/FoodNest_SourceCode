import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — FoodNest" }] }),
  component: RegisterRedirect,
});

function RegisterRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/login", search: { mode: "register" }, replace: true });
  }, [navigate]);

  return null;
}
