export const TOKEN_KEY = "token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth-changed"));
  }
}

export function storeToken(token: string, rememberMe: boolean): void {
  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
  notify();
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  notify();
}

export function isRemembered(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}
