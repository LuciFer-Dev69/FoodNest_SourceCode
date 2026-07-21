import { useState } from "react";
import { api } from "@/lib/api";
import { AuthResponse } from "@/models/auth.model";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

export function useAuthController() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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

    let token: string | undefined;
    let userName: string | undefined;

    try {
      setLoading(true);
      const res = await api.post<AuthResponse>("/api/auth/register", { name, email, password });
      token = res.token;
      userName = res.user?.name || name;
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

    if (token) {
      localStorage.setItem("token", token);
      toast.success(`Welcome to FoodNest, ${userName}!`);
      setLoading(false);
      navigate({ to: "/app/dashboard" });
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
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
      localStorage.setItem("token", token);
      toast.success(`Welcome back, ${userName}!`);
      setLoading(false);
      navigate({ to: "/app/dashboard" });
    }
  };

  return {
    loading,
    fieldErrors,
    clearErrors,
    handleRegister,
    handleLogin,
  };
}

export type AuthController = ReturnType<typeof useAuthController>;
