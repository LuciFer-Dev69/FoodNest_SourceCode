import { useMemo, useCallback, useState, useEffect } from "react";
import { getStoredToken, clearToken, isRemembered } from "@/lib/auth-storage";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  provider?: string;
  profilePicture?: string | null;
}

function parseJwt(token: string): AuthUser | null {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as AuthUser;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handler = () => forceUpdate((v) => v + 1);
    window.addEventListener("auth-changed", handler);
    return () => window.removeEventListener("auth-changed", handler);
  }, []);

  const token =
    typeof window !== "undefined" ? getStoredToken() : null;

  const user = useMemo<AuthUser | null>(() => {
    if (!token) return null;
    return parseJwt(token);
  }, [token]);

  const isAuthenticated = !!user;

  const getInitials = useCallback(() => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const logout = useCallback(() => {
    clearToken();
    window.location.href = "/login";
  }, []);

  return { user, isAuthenticated, getInitials, logout, token, isRemembered: isRemembered() };
}
