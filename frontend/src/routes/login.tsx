import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Leaf, Mail, Lock, ArrowRight, Github, Apple } from "lucide-react";
import { useAuthController } from "@/controllers/auth.controller";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — FoodNest" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { loading, handleLogin } = useAuthController();

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to keep your kitchen kind to the planet."
      footer={
        <p>New here? <Link to="/register" className="font-semibold text-primary hover:underline">Create an account</Link></p>
      }
    >
      <form className="space-y-4" onSubmit={handleLogin}>
        <Field name="email" icon={<Mail className="h-4 w-4" />} label="Email" type="email" placeholder="you@kitchen.com" />
        <Field name="password" icon={<Lock className="h-4 w-4" />} label="Password" type="password" placeholder="••••••••" />
        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-[color:var(--primary)]" /> Remember me</label>
          <Link to="/forgot-password" className="font-medium text-primary hover:underline">Forgot password?</Link>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:shadow-lift disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"} <ArrowRight className="h-4 w-4" />
        </button>

        <div className="relative my-2 text-center text-xs text-muted-foreground">
          <span className="bg-card/0 px-2">or continue with</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-background/70 px-4 py-2.5 text-sm font-semibold hover:bg-secondary">
            <Apple className="h-4 w-4" /> Apple
          </button>
          <button type="button" className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-background/70 px-4 py-2.5 text-sm font-semibold hover:bg-secondary">
            <Github className="h-4 w-4" /> GitHub
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}

export function AuthLayout({ title, subtitle, children, footer }: any) {
  return (
    <div className="relative grid min-h-dvh lg:grid-cols-2 bg-hero">
      <Link to="/" className="absolute left-6 top-6 z-10 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-primary text-white shadow-soft"><Leaf className="h-4 w-4" /></span>
        <span className="font-bold tracking-tight">FoodNest</span>
      </Link>
      <div className="flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="glass-card w-full max-w-md rounded-3xl p-8"
        >
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <div className="mt-6 border-t border-border/60 pt-4 text-center text-sm text-muted-foreground">{footer}</div>
        </motion.div>
      </div>
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-6 rounded-[2rem] bg-gradient-emerald" />
        <div className="absolute inset-6 rounded-[2rem] bg-[radial-gradient(600px_280px_at_20%_10%,rgba(255,255,255,0.35),transparent)]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <span className="glass inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live impact
          </span>
          <div>
            <h2 className="text-4xl font-extrabold leading-tight">Your kitchen,<br /> kinder to the planet.</h2>
            <p className="mt-3 max-w-md text-white/90">Track inventory, plan meals around what you own, and share surplus with neighbours.</p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[["128 kg", "saved"], ["24", "donations"], ["7", "this week"]].map(([v, l]) => (
                <div key={l} className="glass-card rounded-2xl p-3 text-foreground">
                  <p className="text-xl font-bold">{v}</p>
                  <p className="text-xs text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Field({ icon, label, ...props }: any) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <span className="flex items-center gap-2 rounded-2xl border border-border bg-background/70 px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/40">
        <span className="text-muted-foreground">{icon}</span>
        <input {...props} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </span>
    </label>
  );
}
