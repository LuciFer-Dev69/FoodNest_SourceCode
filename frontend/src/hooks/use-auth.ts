/**
 * useAuth – centralised auth state hook.
 *
 * Reads the JWT from localStorage, decodes the payload (no verification –
 * that happens on the server), and exposes helpers for the whole app.
 */
import { useMemo, useCallback } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
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
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

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
    localStorage.removeItem("token");
    window.location.href = "/login";
  }, []);

  return { user, isAuthenticated, getInitials, logout, token };
}
