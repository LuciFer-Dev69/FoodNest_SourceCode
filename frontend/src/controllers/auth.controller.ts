import { useState } from "react";
import { api } from "@/lib/api";
import { AuthResponse } from "@/models/auth.model";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export function useAuthController() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId2FA, setUserId2FA] = useState<number | null>(null);
  const [totpCode, setTotpCode] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post<AuthResponse>("/api/auth/register", { name, email, password });
      if (res.token) {
        localStorage.setItem("token", res.token);
        toast.success(`Welcome to FoodNest, ${name}!`);
        navigate({ to: "/app/dashboard" });
      } else {
        toast.success("Registration successful! Please login.");
        navigate({ to: "/login" });
      }
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post<AuthResponse>("/api/auth/login", { email, password });
      
      if (res.requires2FA) {
        setRequires2FA(true);
        setUserId2FA(res.userId || null);
        toast.info("2FA is enabled. Please enter verification code.");
      } else if (res.token) {
        localStorage.setItem("token", res.token);
        toast.success(`Welcome back, ${res.user?.name}!`);
        navigate({ to: "/app/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!totpCode || !userId2FA) {
      toast.error("Please enter the 2FA code");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post<AuthResponse>("/api/auth/verify-2fa", {
        userId: userId2FA,
        code: totpCode
      });

      if (res.token) {
        localStorage.setItem("token", res.token);
        toast.success(`Welcome back, ${res.user?.name}!`);
        navigate({ to: "/app/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid 2FA code");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    requires2FA,
    totpCode,
    setTotpCode,
    handleRegister,
    handleLogin,
    handleVerify2FA,
  };
}
export type AuthController = ReturnType<typeof useAuthController>;
