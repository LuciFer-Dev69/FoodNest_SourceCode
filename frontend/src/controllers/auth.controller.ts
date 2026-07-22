import { useState } from "react";
import { api } from "@/lib/api";
import { AuthResponse } from "@/models/auth.model";
import { storeToken } from "@/lib/auth-storage";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  code?: string;
  otp?: string;
}

export function useAuthController() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [forgotEmail, setForgotEmail] = useState<string>("");
  const [forgotOtp, setForgotOtp] = useState<string | null>(null);

  const clearErrors = () => setFieldErrors({});

  const validateEmail = (email: string): string | null => {
    if (!email) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address.";
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return "Password is required.";
    return null;
  };

  const validateName = (name: string): string | null => {
    if (!name) return "Name is required.";
    return null;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearErrors();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const errors: FieldErrors = {};
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    if (nameErr) errors.name = nameErr;
    if (emailErr) errors.email = emailErr;
    if (passwordErr) errors.password = passwordErr;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);
      const res = await api.post<AuthResponse>("/api/auth/register", { name, email, password });
      if (res.requires2FA && res.userId) {
        setPendingUserId(res.userId);
        setPendingCode(res.code || null);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      const msg = err.message || "Something went wrong. Please try again later.";
      if (msg.toLowerCase().includes("email already exists")) {
        setFieldErrors({ email: "An account with this email already exists." });
      } else {
        toast.error(msg);
      }
      setLoading(false);
      return;
    }
  };

  const handleVerify2FA = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearErrors();

    const formData = new FormData(e.currentTarget);
    const code = formData.get("code") as string;

    if (!code) {
      setFieldErrors({ code: "Verification code is required." });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post<AuthResponse>("/api/auth/register/verify-2fa", {
        userId: pendingUserId,
        code,
      });
      if (res.token) {
        storeToken(res.token, true);
        toast.success("Welcome to FoodNest!");
        setPendingUserId(null);
        setPendingCode(null);
        setLoading(false);
        navigate({ to: "/app/dashboard" });
      }
    } catch (err: any) {
      setFieldErrors({ code: err.message || "Invalid verification code" });
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>, rememberMe?: boolean) => {
    e.preventDefault();
    clearErrors();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const errors: FieldErrors = {};
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    if (emailErr) errors.email = emailErr;
    if (passwordErr) errors.password = passwordErr;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    let token: string | undefined;
    let userName: string | undefined;

    try {
      setLoading(true);
      const res = await api.post<AuthResponse>("/api/auth/login", { email, password });
      token = res.token;
      userName = res.user?.name;
    } catch (err: any) {
      const msg = (err.message || "").toLowerCase();
      if (msg.includes("user not found") || msg.includes("account not found")) {
        setFieldErrors({ email: "Account not found. We couldn't find an account with this email. Please create a new account." });
      } else if (msg.includes("invalid email or password") || msg.includes("incorrect password")) {
        setFieldErrors({ password: "Incorrect password. Please try again." });
      } else if (msg.includes("google sign-in") || msg.includes("google")) {
        setFieldErrors({ email: "This account uses Google Sign-In. Please continue with Google." });
      } else {
        toast.error(msg || "Something went wrong. Please try again later.");
      }
      setLoading(false);
      return;
    }

    if (token) {
      storeToken(token, rememberMe ?? false);
      toast.success(`Welcome back, ${userName}!`);
      setLoading(false);
      navigate({ to: "/app/dashboard" });
    }
  };

  const handleForgotPassword = async (email: string): Promise<boolean> => {
    clearErrors();
    const emailErr = validateEmail(email);
    if (emailErr) {
      setFieldErrors({ email: emailErr });
      return false;
    }

    try {
      setLoading(true);
      const res = await api.post<AuthResponse>("/api/auth/forgot-password", { email });
      setForgotEmail(email);
      setForgotOtp(res.otp || null);
      toast.success("Reset code generated!");
      setLoading(false);
      return true;
    } catch (err: any) {
      const msg = (err.message || "").toLowerCase();
      if (msg.includes("no account found")) {
        toast.warning("No account found with this email address.");
      } else {
        toast.error(err.message || "Something went wrong");
      }
      setLoading(false);
      return false;
    }
  };

  const handleResetPassword = async (otp: string, password: string) => {
    clearErrors();
    if (!otp) {
      setFieldErrors({ otp: "OTP code is required." });
      return;
    }
    if (!password) {
      setFieldErrors({ password: "New password is required." });
      return;
    }

    try {
      setLoading(true);
      await api.post<AuthResponse>("/api/auth/reset-password", {
        email: forgotEmail,
        otp,
        password,
      });
      toast.success("Password reset successful! You can now login.");
      setForgotEmail("");
      setForgotOtp(null);
      setLoading(false);
      navigate({ to: "/login", search: { mode: "login" } });
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
      setLoading(false);
    }
  };

  const reset2FA = () => {
    setPendingUserId(null);
    setPendingCode(null);
    clearErrors();
  };

  const resetForgot = () => {
    setForgotEmail("");
    setForgotOtp(null);
    clearErrors();
  };

  return {
    loading,
    fieldErrors,
    pendingUserId,
    pendingCode,
    forgotEmail,
    forgotOtp,
    clearErrors,
    handleRegister,
    handleVerify2FA,
    handleLogin,
    handleForgotPassword,
    handleResetPassword,
    reset2FA,
    resetForgot,
  };
}

export type AuthController = ReturnType<typeof useAuthController>;
