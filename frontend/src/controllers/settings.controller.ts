import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { setLocale, getLocale } from "@/lib/i18n";
import type { UserSettings, UserProfile } from "@/models/settings.model";

export function useSettingsController() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [passwordModal, setPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const [settingsData, profileData] = await Promise.all([
        api.get<UserSettings>("/api/settings"),
        api.get<UserProfile>("/api/settings/profile"),
      ]);
      setSettings(settingsData);
      setProfile(profileData);
      if (settingsData.language && settingsData.language !== getLocale()) {
        setLocale(settingsData.language);
      }
      if (settingsData.theme) {
        const root = document.documentElement;
        root.classList.toggle("dark", settingsData.theme === "dark");
        root.style.colorScheme = settingsData.theme;
        try { localStorage.setItem("foodnest-theme", settingsData.theme); } catch {}
      }
      if (settingsData.fontSize) {
        const root = document.documentElement;
        root.classList.remove("text-sm", "text-base", "text-lg");
        if (settingsData.fontSize === "small") root.classList.add("text-sm");
        else if (settingsData.fontSize === "large") root.classList.add("text-lg");
        else root.classList.add("text-base");
      }
      if (settingsData.animations === false) {
        document.documentElement.classList.add("reduce-motion");
      } else {
        document.documentElement.classList.remove("reduce-motion");
      }
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updateSetting = useCallback(async (key: string, value: any) => {
    try {
      setSaving(true);
      const data = await api.put<UserSettings>("/api/settings", { [key]: value });
      setSettings(data);
      if (key === "language") setLocale(value);
      if (key === "theme") {
        const root = document.documentElement;
        root.classList.toggle("dark", value === "dark");
        root.style.colorScheme = value;
        try { localStorage.setItem("foodnest-theme", value); } catch {}
      }
      if (key === "fontSize") {
        const root = document.documentElement;
        root.classList.remove("text-sm", "text-base", "text-lg");
        if (value === "small") root.classList.add("text-sm");
        else if (value === "large") root.classList.add("text-lg");
        else root.classList.add("text-base");
      }
      if (key === "animations") {
        if (value === false) document.documentElement.classList.add("reduce-motion");
        else document.documentElement.classList.remove("reduce-motion");
      }
      toast.success("Settings saved successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to save setting");
    } finally {
      setSaving(false);
    }
  }, []);

  const validatePassword = useCallback((pw: string): string[] => {
    const errors: string[] = [];
    if (pw.length < 8) errors.push("Minimum 8 characters");
    if (!/[A-Z]/.test(pw)) errors.push("Uppercase letter required");
    if (!/[a-z]/.test(pw)) errors.push("Lowercase letter required");
    if (!/[0-9]/.test(pw)) errors.push("Number required");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) errors.push("Special character required");
    return errors;
  }, []);

  const handleChangePassword = useCallback(async () => {
    const errors: string[] = [];
    if (!currentPassword) errors.push("Current password is required");
    const pwErrors = validatePassword(newPassword);
    errors.push(...pwErrors);
    if (newPassword !== confirmPassword) errors.push("Passwords do not match");
    setPasswordErrors(errors);
    if (errors.length > 0) return;

    try {
      await api.post("/api/settings/change-password", { currentPassword, newPassword });
      toast.success("Password changed successfully");
      setPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors([]);
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    }
  }, [currentPassword, newPassword, confirmPassword, validatePassword]);

  const handleDeleteAccount = useCallback(async () => {
    setDeleteError("");
    if (!deletePassword) { setDeleteError("Password is required"); return; }
    try {
      await api.post("/api/settings/delete-account", { password: deletePassword });
      toast.success("Account deleted successfully");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete account");
    }
  }, [deletePassword]);

  const handleExport = useCallback(async (type: string) => {
    try {
      const response = await fetch(`/api/settings/export?type=${type}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}.${type === "all" ? "json" : "csv"}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${type} exported`);
    } catch {
      toast.error("Failed to export data");
    }
  }, []);

  return {
    settings, profile, loading, saving,
    passwordModal, setPasswordModal,
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    showCurrent, setShowCurrent,
    showNew, setShowNew,
    showConfirm, setShowConfirm,
    passwordErrors,
    deleteModal, setDeleteModal,
    deletePassword, setDeletePassword,
    deleteError,

    fetchSettings,
    updateSetting,
    handleChangePassword,
    handleDeleteAccount,
    handleExport,
  };
}

export type SettingsController = ReturnType<typeof useSettingsController>;
