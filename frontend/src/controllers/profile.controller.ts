import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { clearToken } from "@/lib/auth-storage";

function notifyTokenChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth-changed"));
  }
}
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import type {
  ProfileData,
  ProfileUser,
  ProfileStats,
  ProfileUpdatePayload,
} from "@/models/profile.model";

export function useProfileController() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<ProfileUpdatePayload>({});

  const [emailModal, setEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");

  const [passwordModal, setPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<ProfileData>("/api/profile");
      setProfile(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const openEdit = useCallback(() => {
    if (!profile) return;
    setEditForm({
      name: profile.user.name,
      username: profile.user.username || "",
      country: profile.user.country,
      city: profile.user.city,
      phone: profile.user.phone,
      bio: profile.user.bio,
    });
    setEditing(true);
  }, [profile]);

  const handleSaveProfile = useCallback(async () => {
    if (!editForm.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await api.put<{ token: string; user: ProfileUser }>("/api/profile", editForm);
      if (res.token) {
        localStorage.setItem("token", res.token);
      }
      setProfile((prev) => prev ? { ...prev, user: res.user } : prev);
      toast.success("Profile updated!");
      setEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }, [editForm]);

  const handleCancelEdit = useCallback(() => {
    setEditing(false);
    setEditForm({});
  }, []);

  const handleChangeEmail = useCallback(async () => {
    if (!newEmail.trim()) { toast.error("New email is required"); return; }
    if (!emailPassword) { toast.error("Password confirmation required"); return; }
    setSaving(true);
    try {
      const res = await api.put<{ token: string; email: string }>("/api/profile/email", {
        newEmail,
        password: emailPassword,
      });
      if (res.token) {
        localStorage.setItem("token", res.token);
      }
      setProfile((prev) => prev ? { ...prev, user: { ...prev.user, email: res.email } } : prev);
      toast.success("Email updated successfully!");
      setEmailModal(false);
      setNewEmail("");
      setEmailPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change email");
    } finally {
      setSaving(false);
    }
  }, [newEmail, emailPassword]);

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

    setSaving(true);
    try {
      await api.put("/api/profile/password", { currentPassword, newPassword, confirmPassword });
      toast.success("Password changed successfully");
      setPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors([]);
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  }, [currentPassword, newPassword, confirmPassword, validatePassword]);

  const handleUploadAvatar = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    setSaving(true);
    try {
      const res = await api.postFormData<{ token: string; profilePicture: string }>("/api/profile/avatar", formData);
      if (res.token) {
        localStorage.setItem("token", res.token);
        notifyTokenChange();
      }
      setProfile((prev) => prev ? {
        ...prev,
        user: { ...prev.user, profilePicture: res.profilePicture },
      } : prev);
      toast.success("Profile picture uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload picture");
    } finally {
      setSaving(false);
    }
  }, []);

  const handleRemoveAvatar = useCallback(async () => {
    setSaving(true);
    try {
      const res = await api.delete<{ token: string }>("/api/profile/avatar");
      if (res.token) {
        localStorage.setItem("token", res.token);
        notifyTokenChange();
      }
      setProfile((prev) => prev ? {
        ...prev,
        user: { ...prev.user, profilePicture: null },
      } : prev);
      toast.success("Profile picture removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove picture");
    } finally {
      setSaving(false);
    }
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    setDeleteError("");
    if (!deletePassword) { setDeleteError("Password is required"); return; }
    setSaving(true);
    try {
      await api.delete("/api/profile/account", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      } as any);
      toast.success("Account deleted successfully");
      clearToken();
      window.location.href = "/";
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete account");
    } finally {
      setSaving(false);
    }
  }, [deletePassword]);

  const isGoogleUser = profile?.user?.provider === "google" || authUser?.provider === "google";

  return {
    profile,
    loading,
    saving,
    editing,
    editForm,
    setEditForm,
    emailModal,
    setEmailModal,
    newEmail,
    setNewEmail,
    emailPassword,
    setEmailPassword,
    passwordModal,
    setPasswordModal,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordErrors,
    deleteModal,
    setDeleteModal,
    deletePassword,
    setDeletePassword,
    deleteError,
    isGoogleUser,

    refresh: fetchProfile,
    openEdit,
    handleSaveProfile,
    handleCancelEdit,
    handleChangeEmail,
    handleChangePassword,
    handleUploadAvatar,
    handleRemoveAvatar,
    handleDeleteAccount,
  };
}

export type ProfileController = ReturnType<typeof useProfileController>;
