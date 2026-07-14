import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, StatCard } from "@/components/app/primitives";
import { Leaf, HeartHandshake, Utensils, Package, Edit2, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — FoodNest" }] }),
  component: Profile,
});

function Profile() {
  const { user, getInitials } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<{
    twoFactorEnabled?: boolean;
    email?: string;
    createdAt?: string;
  }>({});

  useEffect(() => {
    api
      .get<{ twoFactorEnabled: boolean; email: string; createdAt: string }>(
        "/api/auth/profile"
      )
      .then((data) => {
        setProfileData(data);
        setName(data.email ? name || user?.name || "" : user?.name || "");
      })
      .catch(() => {
        // fallback to JWT data
      });
  }, []);

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.put("/api/auth/profile", { name });
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Failed to update name");
    } finally {
      setSaving(false);
    }
  };

  const joinedYear = profileData.createdAt
    ? new Date(profileData.createdAt).getFullYear()
    : new Date().getFullYear();

  return (
    <>
      <PageHeader title="Your profile" subtitle="Personal details and lifetime impact." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-1 text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-primary text-3xl font-bold text-white shadow-lift">
            {getInitials()}
          </div>

          {editing ? (
            <div className="mt-3 flex items-center gap-2 justify-center">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-border bg-background/70 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 w-40 text-center"
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="grid h-8 w-8 place-items-center rounded-xl bg-success/15 text-success hover:bg-success/25"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => { setEditing(false); setName(user?.name || ""); }}
                className="grid h-8 w-8 place-items-center rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="mt-3 flex items-center justify-center gap-2">
              <h3 className="text-xl font-bold">{user?.name || name}</h3>
              <button
                onClick={() => setEditing(true)}
                className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            {user?.email || profileData.email} · joined {joinedYear}
          </p>

          <div className="mt-4 flex justify-center gap-2">
            <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
              Verified
            </span>
            {profileData.twoFactorEnabled && (
              <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
                2FA on
              </span>
            )}
          </div>
        </Panel>

        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          <StatCard index={0} label="Lifetime saved" value="312 kg" icon={<Leaf className="h-5 w-5" />} />
          <StatCard index={1} label="Donations" value="58" icon={<HeartHandshake className="h-5 w-5" />} tone="success" />
          <StatCard index={2} label="Meals planned" value="184" icon={<Utensils className="h-5 w-5" />} tone="warning" />
          <StatCard index={3} label="Items tracked" value="624" icon={<Package className="h-5 w-5" />} />
        </div>
      </div>
    </>
  );
}
