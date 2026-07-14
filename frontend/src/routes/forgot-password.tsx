import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, ArrowRight } from "lucide-react";
import { AuthLayout, Field } from "./login";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — FoodNest" }] }),
  component: Forgot,
});

function Forgot() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll send a secure link to your inbox."
      footer={<p>Remembered it? <Link to="/login" className="font-semibold text-primary hover:underline">Back to sign in</Link></p>}
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <Field icon={<Mail className="h-4 w-4" />} label="Email" type="email" placeholder="you@kitchen.com" />
        <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-lift transition">
          Send reset link <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </AuthLayout>
  );
}
