import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { AuthLayout, Field } from "./login";
import { useAuthController } from "@/controllers/auth.controller";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — FoodNest" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { loading, handleRegister } = useAuthController();

  return (
    <AuthLayout
      title="Create your nest"
      subtitle="Free forever for households. 2FA-ready."
      footer={<p>Already with us? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link></p>}
    >
      <form className="space-y-4" onSubmit={handleRegister}>
        <Field name="name" icon={<User className="h-4 w-4" />} label="Full name" placeholder="Alex Carter" />
        <Field name="email" icon={<Mail className="h-4 w-4" />} label="Email" type="email" placeholder="you@kitchen.com" />
        <Field name="password" icon={<Lock className="h-4 w-4" />} label="Password" type="password" placeholder="At least 10 characters" />
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input type="checkbox" defaultChecked className="mt-0.5 accent-[color:var(--primary)]" />
          I agree to the Terms and acknowledge the Privacy policy.
        </label>
        
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:shadow-lift disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create account"} <ArrowRight className="h-4 w-4" />
        </button>

        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> JWT + bcrypt + TOTP-ready
        </p>
      </form>
    </AuthLayout>
  );
}
