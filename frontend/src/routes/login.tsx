import { createFileRoute, Link, useSearch, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Leaf, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useAuthController } from "@/controllers/auth.controller";
import { HeroCarousel, type HeroSlide } from "@/components/auth/HeroCarousel";
import { GoogleSignIn } from "@/components/auth/GoogleSignIn";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — FoodNest" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search.mode as string) || "login",
  }),
  component: LoginPage,
});

const HERO_SLIDES: HeroSlide[] = [
  {
    image: "/images/login/fresh-ingredients.jpg",
    title: "Reduce Food Waste",
    description: "Track your food inventory and prevent unnecessary waste with FoodNest.",
  },
  {
    image: "/images/login/sharing-meal.jpg",
    title: "Share With Your Community",
    description: "Donate surplus food and help people nearby while reducing waste.",
  },
  {
    image: "/images/login/cooking-together.jpg",
    title: "Plan Smarter Meals",
    description: "Organize breakfast, lunch, and dinner while making the most of your inventory.",
  },
  {
    image: "/images/hero-kitchen.jpg",
    title: "Monitor Your Progress",
    description: "Track food saved, donations, sustainability impact, and personal achievements.",
  },
  {
    image: "/images/login/community-cooking.jpg",
    title: "Build Sustainable Habits",
    description: "Small daily actions create a healthier planet and a stronger community.",
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const { mode } = useSearch({ from: Route.id });
  const { loading, fieldErrors, handleLogin, handleRegister } = useAuthController();
  const isRegister = mode === "register";

  const switchMode = (newMode: "login" | "register") => {
    navigate({ to: "/login", search: { mode: newMode }, replace: true });
  };

  const handleSubmit = isRegister ? handleRegister : handleLogin;

  const onGoogleSuccess = () => {
    navigate({ to: "/app/dashboard" });
  };

  return (
    <div className="relative grid min-h-dvh lg:grid-cols-2 bg-hero">
      <Link to="/" className="absolute left-6 top-6 z-10 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-primary text-white shadow-soft">
          <Leaf className="h-4 w-4" />
        </span>
        <span className="font-bold tracking-tight">FoodNest</span>
      </Link>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="glass-card w-full max-w-md rounded-3xl p-8"
          >
            {isRegister ? (
              <>
                <h1 className="text-3xl font-extrabold tracking-tight">Create your nest</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Free forever for households. Start reducing food waste today.
                </p>
                <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                  <Field
                    name="name"
                    icon={<User className="h-4 w-4" />}
                    label="Full name"
                    placeholder="Alex Carter"
                    error={fieldErrors.name}
                  />
                  <Field
                    name="email"
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    type="email"
                    placeholder="you@kitchen.com"
                    error={fieldErrors.email}
                  />
                  <Field
                    name="password"
                    icon={<Lock className="h-4 w-4" />}
                    label="Password"
                    type="password"
                    placeholder="Enter a strong password"
                    error={fieldErrors.password}
                  />
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
                </form>
                <div className="relative my-4 text-center text-xs text-muted-foreground">
                  <span className="bg-card px-2">OR</span>
                </div>
                <GoogleSignIn onSuccess={onGoogleSuccess} />
                <div className="mt-6 border-t border-border/60 pt-4 text-center text-sm text-muted-foreground">
                  <p>
                    Already with us?{" "}
                    <button onClick={() => switchMode("login")} className="font-semibold text-primary hover:underline">
                      Sign in
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign in to keep your kitchen kind to the planet.
                </p>
                <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                  <Field
                    name="email"
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    type="email"
                    placeholder="you@kitchen.com"
                    error={fieldErrors.email}
                  />
                  <Field
                    name="password"
                    icon={<Lock className="h-4 w-4" />}
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    error={fieldErrors.password}
                  />
                  {fieldErrors.email?.includes("create a new account") && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => switchMode("register")}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        Create Account
                      </button>
                    </div>
                  )}
                  {fieldErrors.email?.includes("Google Sign-In") && (
                    <GoogleSignIn onSuccess={onGoogleSuccess} />
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" className="accent-[color:var(--primary)]" /> Remember me
                    </label>
                    <Link to="/forgot-password" className="font-medium text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:shadow-lift disabled:opacity-50"
                  >
                    {loading ? "Signing in..." : "Sign in"} <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
                <div className="relative my-4 text-center text-xs text-muted-foreground">
                  <span className="bg-card px-2">OR</span>
                </div>
                <GoogleSignIn onSuccess={onGoogleSuccess} />
                <div className="mt-6 border-t border-border/60 pt-4 text-center text-sm text-muted-foreground">
                  <p>
                    New here?{" "}
                    <button onClick={() => switchMode("register")} className="font-semibold text-primary hover:underline">
                      Create an account
                    </button>
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-6">
          <HeroCarousel slides={HERO_SLIDES} />
        </div>
      </div>
    </div>
  );
}

export function Field({ icon, label, error, ...props }: { icon: React.ReactNode; label: string; error?: string; [key: string]: any }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <span className={`flex items-center gap-2 rounded-2xl border bg-background/70 px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/40 ${
        error ? "border-red-400" : "border-border"
      }`}>
        <span className={error ? "text-red-400" : "text-muted-foreground"}>{icon}</span>
        <input {...props} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </span>
      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </label>
  );
}
