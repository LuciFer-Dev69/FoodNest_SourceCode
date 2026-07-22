import { motion } from "motion/react";
import {
  Leaf, HeartHandshake, Utensils, Package,
  Edit2, X, Mail, Lock, Camera, Trash2,
  AlertTriangle, Clock, User as UserIcon,
  Phone, Globe, Bell, Sun, Fingerprint, LogOut,
} from "lucide-react";
import { clearToken } from "@/lib/auth-storage";
import { Panel, StatCard } from "@/components/app/primitives";
import { TIMELINE_ICONS } from "@/models/profile.model";
import type { ProfileController } from "@/controllers/profile.controller";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

function getInitials(name: string): string {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function EditModal({ ctrl }: { ctrl: ProfileController }) {
  if (!ctrl.editing || !ctrl.profile) return null;
  const { editForm, setEditForm } = ctrl;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 backdrop-blur-sm p-4"
      onClick={ctrl.handleCancelEdit}
    >
      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-lg overflow-hidden rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
          <h3 className="text-lg font-bold">Edit Profile</h3>
          <button onClick={ctrl.handleCancelEdit} className="grid h-8 w-8 place-items-center rounded-xl hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Full Name</label>
            <input value={editForm.name || ""} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className="mt-1 w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Username</label>
            <input value={editForm.username || ""} onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))} className="mt-1 w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Country</label>
              <input value={editForm.country || ""} onChange={(e) => setEditForm((f) => ({ ...f, country: e.target.value }))} className="mt-1 w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">City</label>
              <input value={editForm.city || ""} onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))} className="mt-1 w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Phone (optional)</label>
            <input value={editForm.phone || ""} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} className="mt-1 w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Bio (optional)</label>
            <textarea value={editForm.bio || ""} onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))} rows={3} className="mt-1 w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-border/40 px-6 py-4">
          <button onClick={ctrl.handleCancelEdit} className="rounded-xl px-4 py-2 text-sm font-medium hover:bg-secondary">Cancel</button>
          <button onClick={ctrl.handleSaveProfile} disabled={ctrl.saving} className="flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90 disabled:opacity-50">
            {ctrl.saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EmailModal({ ctrl }: { ctrl: ProfileController }) {
  if (!ctrl.emailModal) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 backdrop-blur-sm p-4"
      onClick={() => ctrl.setEmailModal(false)}
    >
      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-md overflow-hidden rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
          <h3 className="text-lg font-bold">Change Email</h3>
          <button onClick={() => ctrl.setEmailModal(false)} className="grid h-8 w-8 place-items-center rounded-xl hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4 p-6">
          {ctrl.profile && (
            <p className="text-sm text-muted-foreground">
              Current email: <span className="font-semibold text-foreground">{ctrl.profile.user.email}</span>
            </p>
          )}
          <div>
            <label className="text-xs font-medium text-muted-foreground">New Email</label>
            <input type="email" value={ctrl.newEmail} onChange={(e) => ctrl.setNewEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" placeholder="new@email.com" />
          </div>
          {ctrl.isGoogleUser ? null : (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Confirm Password</label>
              <input type="password" value={ctrl.emailPassword} onChange={(e) => ctrl.setEmailPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" placeholder="Enter your password" />
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-border/40 px-6 py-4">
          <button onClick={() => ctrl.setEmailModal(false)} className="rounded-xl px-4 py-2 text-sm font-medium hover:bg-secondary">Cancel</button>
          <button onClick={ctrl.handleChangeEmail} disabled={ctrl.saving} className="flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90 disabled:opacity-50">
            {ctrl.saving ? "Updating..." : "Update Email"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PasswordModal({ ctrl }: { ctrl: ProfileController }) {
  if (!ctrl.passwordModal) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 backdrop-blur-sm p-4"
      onClick={() => ctrl.setPasswordModal(false)}
    >
      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-md overflow-hidden rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
          <h3 className="text-lg font-bold">Change Password</h3>
          <button onClick={() => ctrl.setPasswordModal(false)} className="grid h-8 w-8 place-items-center rounded-xl hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Current Password</label>
            <input type="password" value={ctrl.currentPassword} onChange={(e) => ctrl.setCurrentPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">New Password</label>
            <input type="password" value={ctrl.newPassword} onChange={(e) => ctrl.setNewPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Confirm New Password</label>
            <input type="password" value={ctrl.confirmPassword} onChange={(e) => ctrl.setConfirmPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          {ctrl.passwordErrors.length > 0 && (
            <div className="rounded-xl bg-destructive/10 p-3">
              <ul className="list-inside list-disc space-y-1 text-xs text-destructive">
                {ctrl.passwordErrors.map((err, i) => (<li key={i}>{err}</li>))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-border/40 px-6 py-4">
          <button onClick={() => ctrl.setPasswordModal(false)} className="rounded-xl px-4 py-2 text-sm font-medium hover:bg-secondary">Cancel</button>
          <button onClick={ctrl.handleChangePassword} disabled={ctrl.saving} className="flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90 disabled:opacity-50">
            {ctrl.saving ? "Changing..." : "Change Password"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DeleteModal({ ctrl }: { ctrl: ProfileController }) {
  if (!ctrl.deleteModal) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 backdrop-blur-sm p-4"
      onClick={() => ctrl.setDeleteModal(false)}
    >
      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-md overflow-hidden rounded-3xl"
      >
        <div className="flex items-center gap-3 border-b border-border/40 px-6 py-4">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-destructive/15 text-destructive"><AlertTriangle className="h-5 w-5" /></span>
          <div>
            <h3 className="text-lg font-bold">Delete Account</h3>
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          </div>
        </div>
        <div className="space-y-3 p-6">
          <div className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
            <p className="font-semibold">What will be deleted:</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              <li>Your profile and personal information</li>
              <li>All inventory items and meal plans</li>
              <li>All donations and community posts</li>
              <li>Comments, bookmarks, likes, and notifications</li>
              <li>All achievements and activity history</li>
            </ul>
          </div>
          {ctrl.isGoogleUser ? null : (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Enter your password to confirm</label>
              <input type="password" value={ctrl.deletePassword} onChange={(e) => ctrl.setDeletePassword(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-destructive/40" placeholder="Your password" />
            </div>
          )}
          {ctrl.deleteError && <p className="text-xs text-destructive">{ctrl.deleteError}</p>}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-border/40 px-6 py-4">
          <button onClick={() => ctrl.setDeleteModal(false)} className="rounded-xl px-4 py-2 text-sm font-medium hover:bg-secondary">Cancel</button>
          <button onClick={ctrl.handleDeleteAccount} disabled={ctrl.saving} className="flex items-center gap-2 rounded-xl bg-destructive px-5 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90 disabled:opacity-50">
            {ctrl.saving ? "Deleting..." : "Delete My Account"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ProfileView({ ctrl }: { ctrl: ProfileController }) {
  const { profile, loading, isGoogleUser } = ctrl;

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <UserIcon className="mb-3 h-12 w-12 opacity-50" />
        <p>Failed to load profile. Pull to refresh.</p>
      </div>
    );
  }

  const { user, stats, timeline, badges } = profile;

  return (
    <>
      <EditModal ctrl={ctrl} />
      <EmailModal ctrl={ctrl} />
      <PasswordModal ctrl={ctrl} />
      <DeleteModal ctrl={ctrl} />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Your profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">Personal details and lifetime impact.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-1 text-center">
          <div className="relative mx-auto h-24 w-24 group">
            <label className="cursor-pointer">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="h-24 w-24 rounded-full object-cover shadow-lift" />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-primary text-3xl font-bold text-white shadow-lift">
                  {getInitials(user.name)}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition group-hover:opacity-100">
                <div className="text-center text-white">
                  <Camera className="mx-auto h-6 w-6" />
                  <span className="mt-1 block text-[11px] font-semibold">Change photo</span>
                </div>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) ctrl.handleUploadAvatar(file); }} />
            </label>
            {user.profilePicture && (
              <button
                onClick={ctrl.handleRemoveAvatar}
                className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-destructive text-white shadow-soft hover:bg-destructive/80 transition"
                title="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            <h3 className="text-xl font-bold">{user.name}</h3>
            <button onClick={ctrl.openEdit} className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-secondary">
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {user.username && <p className="text-sm text-muted-foreground">@{user.username}</p>}

          <p className="text-sm text-muted-foreground">{user.email} · joined {new Date(user.createdAt).getFullYear()}</p>

          {user.bio && <p className="mt-2 text-sm italic text-muted-foreground">"{user.bio}"</p>}

          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">Verified</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isGoogleUser ? "bg-blue-100 text-blue-700" : "bg-primary/15 text-primary"}`}>
              {isGoogleUser ? "Google Account" : "Local Account"}
            </span>
          </div>

          <div className="mt-4 space-y-2 text-left text-sm">
            {user.country && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
                <span>{user.country}{user.city ? `, ${user.city}` : ""}</span>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{user.phone}</span>
              </div>
            )}
            {user.lastLogin && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Last login: {new Date(user.lastLogin).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </Panel>

        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          <StatCard index={0} label="Lifetime saved" value={`${formatNumber(stats.lifetimeSaved)} kg`} icon={<Leaf className="h-5 w-5" />} />
          <StatCard index={1} label="Donations" value={formatNumber(stats.donations)} icon={<HeartHandshake className="h-5 w-5" />} tone="success" />
          <StatCard index={2} label="Meals planned" value={formatNumber(stats.mealsPlanned)} icon={<Utensils className="h-5 w-5" />} tone="warning" />
          <StatCard index={3} label="Items tracked" value={formatNumber(stats.itemsTracked)} icon={<Package className="h-5 w-5" />} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Panel>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current Inventory</p>
          <p className="mt-1 text-2xl font-bold">{stats.currentInventory}</p>
        </Panel>
        <Panel>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Donations</p>
          <p className="mt-1 text-2xl font-bold">{stats.activeDonations}</p>
        </Panel>
        <Panel>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Food Claimed</p>
          <p className="mt-1 text-2xl font-bold">{stats.foodClaimed}</p>
        </Panel>
        <Panel>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Waste Prevented</p>
          <p className="mt-1 text-2xl font-bold">{formatNumber(stats.wastePrevented)} kg</p>
        </Panel>
        <Panel>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Community Posts</p>
          <p className="mt-1 text-2xl font-bold">{stats.communityPosts}</p>
        </Panel>
        <Panel>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Recipes Created</p>
          <p className="mt-1 text-2xl font-bold">{stats.recipesCreated}</p>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel>
          <h3 className="mb-4 text-lg font-bold">Activity Timeline</h3>
          {timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet. Start using FoodNest to see your timeline!</p>
          ) : (
            <div className="space-y-3">
              {timeline.slice(0, 15).map((entry, i) => (
                <motion.div
                  key={`${entry.createdAt}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 text-lg">{TIMELINE_ICONS[entry.type] || "📌"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{entry.description}</p>
                    <p className="text-[11px] text-muted-foreground">{timeAgo(entry.createdAt)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Panel>

        <Panel>
          <h3 className="mb-4 text-lg font-bold">Achievement Badges</h3>
          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.key}
                className={`rounded-2xl p-3 text-center transition ${badge.unlocked ? "bg-gradient-to-br from-success/10 to-success/5 ring-1 ring-success/20" : "bg-background/40 opacity-50"}`}
              >
                <span className="text-2xl">{badge.emoji}</span>
                <p className="mt-1 text-xs font-semibold">{badge.label}</p>
                <p className="text-[10px] text-muted-foreground">
                  {badge.unlocked ? <>Earned {new Date(badge.unlockedAt!).toLocaleDateString()}</> : badge.desc}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel>
          <h3 className="mb-4 text-lg font-bold">Change Email</h3>
          <p className="mb-3 text-sm text-muted-foreground">Current: <span className="font-semibold text-foreground">{user.email}</span></p>
          <button onClick={() => ctrl.setEmailModal(true)} className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80">
            <Mail className="h-4 w-4" />
            Change Email
          </button>
        </Panel>

        {!isGoogleUser ? (
          <Panel>
            <h3 className="mb-4 text-lg font-bold">Change Password</h3>
            <p className="mb-3 text-sm text-muted-foreground">Update your password regularly to keep your account secure.</p>
            <button onClick={() => ctrl.setPasswordModal(true)} className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80">
              <Lock className="h-4 w-4" />
              Change Password
            </button>
          </Panel>
        ) : (
          <Panel>
            <h3 className="mb-4 text-lg font-bold">Password</h3>
            <p className="text-sm text-muted-foreground">You're using Google Sign-In. Password management is handled by Google.</p>
          </Panel>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel>
          <h3 className="mb-4 text-lg font-bold">Account Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-background/40 px-4 py-3">
              <span className="text-muted-foreground">Account Type</span>
              <span className="font-semibold">{isGoogleUser ? "Google" : "Local"}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-background/40 px-4 py-3">
              <span className="text-muted-foreground">Member Since</span>
              <span className="font-semibold">{new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-background/40 px-4 py-3">
              <span className="text-muted-foreground">Last Login</span>
              <span className="font-semibold">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-background/40 px-4 py-3">
              <span className="text-muted-foreground"><Globe className="mr-1 inline h-3 w-3" />Language</span>
              <span className="font-semibold uppercase">{profile.settings.language}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-background/40 px-4 py-3">
              <span className="text-muted-foreground"><Sun className="mr-1 inline h-3 w-3" />Theme</span>
              <span className="font-semibold capitalize">{profile.settings.theme}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-background/40 px-4 py-3">
              <span className="text-muted-foreground"><Bell className="mr-1 inline h-3 w-3" />Notifications</span>
              <span className="font-semibold">Active</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-background/40 px-4 py-3">
              <span className="text-muted-foreground"><Fingerprint className="mr-1 inline h-3 w-3" />Two Factor</span>
              <span className="font-semibold">Disabled</span>
            </div>
          </div>
        </Panel>

        <Panel>
          <h3 className="mb-4 text-lg font-bold">Danger Zone</h3>
          <div className="space-y-4">
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm font-semibold">Logout</p>
              <p className="mt-1 text-xs text-muted-foreground">Sign out of your account on this device.</p>
              <button onClick={() => { clearToken(); window.location.href = "/login"; }} className="mt-3 flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm font-semibold text-destructive">Delete Account</p>
              <p className="mt-1 text-xs text-muted-foreground">Permanently delete your account and all associated data.</p>
              <button onClick={() => ctrl.setDeleteModal(true)} className="mt-3 flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
