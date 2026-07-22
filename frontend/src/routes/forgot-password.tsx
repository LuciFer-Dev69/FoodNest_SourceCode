import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, ArrowRight, CheckCheck } from "lucide-react";
import { useAuthController } from "@/controllers/auth.controller";
import { Field } from "./login";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — FoodNest" }] }),
  component: Forgot,
});

function Forgot() {
  const {
    loading, fieldErrors, forgotOtp, forgotEmail,
    handleForgotPassword, handleResetPassword, resetForgot,
  } = useAuthController();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [emailInput, setEmailInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [newPass, setNewPass] = useState("");

  const onSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    const ok = await handleForgotPassword(emailInput);
    if (ok) setStep("otp");
  };

  const onReset = (e: React.FormEvent) => {
    e.preventDefault();
    handleResetPassword(otpInput, newPass);
  };

  return (
    <div className="relative grid min-h-dvh bg-hero">
      <Link to="/" className="absolute left-6 top-6 z-10 flex items-center gap-2">
        <img src="/images/logo.png" alt="FoodNest" className="h-9 w-9 shrink-0 rounded-2xl object-cover" />
        <span className="font-bold tracking-tight">FoodNest</span>
      </Link>
      <div className="flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
              className="glass-card w-full max-w-md rounded-3xl p-8"
            >
              <h1 className="text-3xl font-extrabold tracking-tight">Reset your password</h1>
              <p className="mt-1 text-sm text-muted-foreground">Enter your email to receive a reset code.</p>
              <form className="mt-6 space-y-4" onSubmit={onSendCode}>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">Email</span>
                  <span className={`flex items-center gap-2 rounded-2xl border bg-background/70 px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/40 ${
                    fieldErrors.email ? "border-red-400" : "border-border"
                  }`}>
                    <Mail className={`h-4 w-4 ${fieldErrors.email ? "text-red-400" : "text-muted-foreground"}`} />
                    <input
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      type="email"
                      placeholder="you@kitchen.com"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </span>
                  {fieldErrors.email && <p className="mt-1.5 text-xs text-red-500">{fieldErrors.email}</p>}
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-lift transition disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send reset code"} <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              <div className="mt-6 border-t border-border/60 pt-4 text-center text-sm text-muted-foreground">
                <p>Remembered it? <Link to="/login" search={{ mode: "login" }} className="font-semibold text-primary hover:underline">Back to sign in</Link></p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
              className="glass-card w-full max-w-md rounded-3xl p-8"
            >
              <h1 className="text-3xl font-extrabold tracking-tight">Enter reset code</h1>
              <p className="mt-1 text-sm text-muted-foreground">A 6-digit code was sent to <strong>{forgotEmail}</strong>.</p>

              <div data-testid="otp-code" className="mt-4 rounded-2xl bg-primary/10 px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">Your OTP code (testing):</p>
                <p className="text-2xl font-bold tracking-widest text-primary">
                  {forgotOtp || "------"}
                </p>
              </div>

              <form className="mt-6 space-y-4" onSubmit={onReset}>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">OTP Code</span>
                  <span className={`flex items-center gap-2 rounded-2xl border bg-background/70 px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/40 ${
                    fieldErrors.otp ? "border-red-400" : "border-border"
                  }`}>
                    <Lock className={`h-4 w-4 ${fieldErrors.otp ? "text-red-400" : "text-muted-foreground"}`} />
                    <input
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="000000"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </span>
                  {fieldErrors.otp && <p className="mt-1.5 text-xs text-red-500">{fieldErrors.otp}</p>}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">New Password</span>
                  <span className={`flex items-center gap-2 rounded-2xl border bg-background/70 px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/40 ${
                    fieldErrors.password ? "border-red-400" : "border-border"
                  }`}>
                    <Lock className={`h-4 w-4 ${fieldErrors.password ? "text-red-400" : "text-muted-foreground"}`} />
                    <input
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      type="password"
                      placeholder="New password"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </span>
                  {fieldErrors.password && <p className="mt-1.5 text-xs text-red-500">{fieldErrors.password}</p>}
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-lift transition disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Reset password"} <CheckCheck className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-6 border-t border-border/60 pt-4 text-center text-sm text-muted-foreground">
                <p>
                  <button onClick={resetForgot} className="font-semibold text-primary hover:underline">Start over</button>
                  {" or "}
                  <Link to="/login" search={{ mode: "login" }} className="font-semibold text-primary hover:underline">Back to sign in</Link>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
