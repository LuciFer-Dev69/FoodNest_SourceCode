import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { AuthResponse } from "@/models/auth.model";
import { toast } from "sonner";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

type GoogleSignInProps = {
  onSuccess?: (res: AuthResponse) => void;
  text?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: Record<string, any>) => void;
          }) => {
            requestAccessToken: (config?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

export function GoogleSignIn({ onSuccess, text = "Continue with Google" }: GoogleSignInProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const tokenClientRef = useRef<ReturnType<Window["google"]["accounts"]["oauth2"]["initTokenClient"]> | null>(null);

  useEffect(() => {
    if (typeof window.google !== "undefined") {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  const handleGoogleResponse = useCallback(async (response: Record<string, any>) => {
    if (response.error) {
      if (response.error === "user_cancelled" || response.error === "access_denied" || response.error === "popup_closed") {
        toast.error("Google sign-in was cancelled.");
      } else {
        toast.error("Unable to sign in with Google. Please try again.");
      }
      setLoading(false);
      return;
    }

    const idToken = response.id_token;

    if (!idToken) {
      toast.error("Unable to sign in with Google. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post<AuthResponse>("/api/auth/google", { credential: idToken });

      if (res.token) {
        localStorage.setItem("token", res.token);
        toast.success(res.message || "Welcome to FoodNest!");
        setLoading(false);
        if (onSuccess) {
          onSuccess(res);
        }
      }
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.toLowerCase().includes("not configured")) {
        toast.error("Google Sign-In is not configured on the server.");
      } else {
        toast.error("Unable to sign in with Google. Please try again.");
      }
      setLoading(false);
    }
  }, [onSuccess]);

  const handleClick = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID") {
      toast.error("Google Sign-In is not configured. Please set VITE_GOOGLE_CLIENT_ID in .env");
      return;
    }

    if (!scriptLoaded || !window.google?.accounts?.oauth2) {
      toast.error("Google Sign-In is loading. Please try again.");
      return;
    }

    setLoading(true);

    if (!tokenClientRef.current) {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "openid profile email",
        callback: handleGoogleResponse,
      });
    }

    try {
      tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
    } catch {
      setLoading(false);
      toast.error("Unable to sign in with Google. Please try again.");
    }
  }, [scriptLoaded, handleGoogleResponse]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-soft transition hover:shadow-lift hover:bg-gray-50 disabled:opacity-50"
    >
      {loading ? (
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
      ) : (
        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC04" d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.97-5.97z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z" />
          <path fill="none" d="M0 0h48v48H0z" />
        </svg>
      )}
      {loading ? "Authenticating..." : text}
    </button>
  );
}
