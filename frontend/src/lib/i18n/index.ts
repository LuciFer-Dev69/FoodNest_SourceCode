import { useState, useEffect, useCallback } from "react";
import en from "./en.json";
import ne from "./ne.json";
import ms from "./ms.json";

const LOCALE_KEY = "foodnest-locale";
const translations: Record<string, Record<string, string>> = { en, ne, ms };

type Locale = "en" | "ne" | "ms";

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LOCALE_KEY) as Locale | null;
  if (stored && ["en", "ne", "ms"].includes(stored)) return stored;
  const browserLang = navigator.language?.slice(0, 2);
  if (browserLang && ["en", "ne", "ms"].includes(browserLang)) return browserLang as Locale;
  return "en";
}

let currentLocale: Locale = "en";
let listeners: Array<() => void> = [];

function notifyListeners() {
  for (const fn of listeners) fn();
}

export function t(key: string, fallback?: string): string {
  const dict = translations[currentLocale];
  return dict?.[key] || fallback || key;
}

export function setLocale(locale: Locale) {
  currentLocale = locale;
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(LOCALE_KEY, locale); } catch {}
  }
  notifyListeners();
  document.documentElement.lang = locale === "ne" ? "ne" : locale === "ms" ? "ms" : "en";
}

export function getLocale(): Locale {
  return currentLocale;
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    currentLocale = locale;
    document.documentElement.lang = locale === "ne" ? "ne" : locale === "ms" ? "ms" : "en";
    const handler = () => setLocaleState(currentLocale);
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((fn) => fn !== handler);
    };
  }, [locale]);

  const changeLocale = useCallback((l: Locale) => {
    setLocale(l);
    setLocaleState(l);
  }, []);

  return { locale, changeLocale, t };
}
