import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Leaf, Mail, ArrowRight } from "lucide-react";
import { Field } from "./login";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — FoodNest" }] }),
  component: Forgot,
});

function Forgot() {
  return (
    <div className="relative grid min-h-dvh bg-hero">
      <Link to="/" className="absolute left-6 top-6 z-10 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-primary text-white shadow-soft"><Leaf className="h-4 w-4" /></span>
        <span className="font-bold tracking-tight">FoodNest</span>
      </Link>
      <div className="flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="glass-card w-full max-w-md rounded-3xl p-8"
        >
          <h1 className="text-3xl font-extrabold tracking-tight">Reset your password</h1>
          <p className="mt-1 text-sm text-muted-foreground">We'll send a secure link to your inbox.</p>
          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Field icon={<Mail className="h-4 w-4" />} label="Email" type="email" placeholder="you@kitchen.com" />
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-lift transition">
              Send reset link <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-6 border-t border-border/60 pt-4 text-center text-sm text-muted-foreground">
            <p>Remembered it? <Link to="/login" className="font-semibold text-primary hover:underline">Back to sign in</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
