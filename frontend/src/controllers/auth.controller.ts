import { useState } from "react";
import { api } from "@/lib/api";
import { AuthResponse } from "@/models/auth.model";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export function useAuthController() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
      
      if (res.token) {
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

  return {
    loading,
    handleRegister,
    handleLogin,
  };
}
export type AuthController = ReturnType<typeof useAuthController>;
