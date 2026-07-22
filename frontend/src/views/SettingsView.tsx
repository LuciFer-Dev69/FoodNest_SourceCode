import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  KeyRound,
  Bell,
  Globe2,
  User,
  Eye,
  Download,
  AlertTriangle,
  X,
  Sparkles,
} from "lucide-react";
import { PageHeader, Panel } from "@/components/app/primitives";
import { useLocale } from "@/lib/i18n";
import { LANGUAGE_OPTIONS, FONT_OPTIONS } from "@/models/settings.model";
import type { SettingsController } from "@/controllers/settings.controller";
import type { ReactNode } from "react";

function Toggle({
  on,
  set,
  disabled,
}: {
  on: boolean;
  set: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => !disabled && set(!on)}
      disabled={disabled}
      className={`h-7 w-12 rounded-full p-0.5 transition ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${on ? "bg-gradient-primary" : "bg-muted"}`}
    >
      <span
        className={`block h-6 w-6 rounded-full bg-white shadow transition ${on ? "translate-x-5" : ""}`}
      />
    </button>
  );
}

function SelectRow({
  label,
  desc,
  value,
  options,
  onChange,
}: {
  label: string;
  desc: string;
  value: string;
  options: readonly { code: string; label: string }[] | readonly string[];
  onChange: (v: string) => void;
}) {
  const { t } = useLocale();
  return (
    <div className="mt-3 flex items-center gap-3 rounded-2xl bg-background/60 p-3">
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl border border-border bg-card px-3 py-1.5 text-sm font-semibold outline-none hover:bg-secondary"
      >
        {options.map((opt) => {
          const code = typeof opt === "string" ? opt : opt.code;
          const displayLabel =
            typeof opt === "string" ? opt.charAt(0).toUpperCase() + opt.slice(1) : t(opt.label);
          return (
            <option key={code} value={code}>
              {displayLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
}

function SettingRow({
  icon,
  title,
  desc,
  children,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  children?: ReactNode;
}) {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-2xl bg-background/60 p-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-primary text-white">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      {children}
    </div>
  );
}

export function SettingsView({
  settings,
  profile,
  loading,
  saving,
  passwordModal,
  setPasswordModal,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showCurrent,
  setShowCurrent,
  showNew,
  setShowNew,
  showConfirm,
  setShowConfirm,
  passwordErrors,
  deleteModal,
  setDeleteModal,
  deletePassword,
  setDeletePassword,
  deleteError,
  updateSetting,
  handleChangePassword,
  handleDeleteAccount,
  handleExport,
}: SettingsController) {
  const { t, locale } = useLocale();

  if (loading || !settings) {
    return (
      <>
        <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Panel key={i}>
              <div className="h-6 w-40 rounded bg-secondary/50 animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-14 rounded-2xl bg-secondary/30 animate-pulse" />
                ))}
              </div>
            </Panel>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Language & Preferences */}
        <Panel>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Globe2 className="h-4 w-4" /> {t("settings.language")}
          </h3>
          <SelectRow
            label={t("settings.language")}
            desc={t("settings.languageDesc")}
            value={settings.language}
            options={LANGUAGE_OPTIONS}
            onChange={(v) => updateSetting("language", v)}
          />
          <SelectRow
            label={t("settings.theme")}
            desc={t("settings.themeDesc")}
            value={settings.theme}
            options={[
              { code: "light", label: t("settings.light") },
              { code: "dark", label: t("settings.dark") },
            ]}
            onChange={(v) => updateSetting("theme", v)}
          />
          <SelectRow
            label={t("settings.fontSize")}
            desc={t("settings.fontSizeDesc")}
            value={settings.fontSize}
            options={FONT_OPTIONS}
            onChange={(v) => updateSetting("fontSize", v)}
          />
          <SettingRow
            icon={
              settings.animations ? <Sparkles className="h-4 w-4" /> : <X className="h-4 w-4" />
            }
            title={t("settings.animations")}
            desc={t("settings.animationsDesc")}
          >
            <Toggle on={settings.animations} set={(v) => updateSetting("animations", v)} />
          </SettingRow>
        </Panel>

        {/* Security */}
        <Panel>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> {t("settings.security")}
          </h3>
          <SettingRow
            icon={<ShieldCheck className="h-4 w-4" />}
            title={t("settings.twofa")}
            desc={t("settings.twofaDesc")}
          >
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              {t("settings.twofaComing")}
            </span>
          </SettingRow>
          <SettingRow
            icon={<KeyRound className="h-4 w-4" />}
            title={t("settings.changePassword")}
            desc={t("settings.changePasswordDesc")}
          >
            <button
              onClick={() => setPasswordModal(true)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold hover:bg-secondary"
            >
              {t("settings.update")}
            </button>
          </SettingRow>
        </Panel>

        {/* Notification Preferences */}
        <Panel>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Bell className="h-4 w-4" /> {t("settings.notifications")}
          </h3>
          <p className="text-xs text-muted-foreground mb-1">{t("settings.notificationsDesc")}</p>
          <SettingRow
            icon={<Bell className="h-4 w-4" />}
            title={t("settings.notifyInventory")}
            desc={t("settings.notifyInventoryDesc")}
          >
            <Toggle
              on={settings.notifyInventory}
              set={(v) => updateSetting("notifyInventory", v)}
            />
          </SettingRow>
          <SettingRow
            icon={<Bell className="h-4 w-4" />}
            title={t("settings.notifyDonations")}
            desc={t("settings.notifyDonationsDesc")}
          >
            <Toggle
              on={settings.notifyDonations}
              set={(v) => updateSetting("notifyDonations", v)}
            />
          </SettingRow>
          <SettingRow
            icon={<Bell className="h-4 w-4" />}
            title={t("settings.notifyCommunity")}
            desc={t("settings.notifyCommunityDesc")}
          >
            <Toggle
              on={settings.notifyCommunity}
              set={(v) => updateSetting("notifyCommunity", v)}
            />
          </SettingRow>
          <SettingRow
            icon={<Bell className="h-4 w-4" />}
            title={t("settings.notifyMeals")}
            desc={t("settings.notifyMealsDesc")}
          >
            <Toggle on={settings.notifyMeals} set={(v) => updateSetting("notifyMeals", v)} />
          </SettingRow>
          <SettingRow
            icon={<Bell className="h-4 w-4" />}
            title={t("settings.notifyWeekly")}
            desc={t("settings.notifyWeeklyDesc")}
          >
            <Toggle on={settings.notifyWeekly} set={(v) => updateSetting("notifyWeekly", v)} />
          </SettingRow>
          <SettingRow icon={<Bell className="h-4 w-4" />} title={t("settings.notifyEmail")} desc="">
            <Toggle on={settings.notifyEmail} set={(v) => updateSetting("notifyEmail", v)} />
          </SettingRow>
          <SettingRow icon={<Bell className="h-4 w-4" />} title={t("settings.notifyPush")} desc="">
            <Toggle on={settings.notifyPush} set={(v) => updateSetting("notifyPush", v)} />
          </SettingRow>
        </Panel>

        {/* Account Information */}
        <Panel>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <User className="h-4 w-4" /> {t("settings.account")}
          </h3>
          <p className="text-xs text-muted-foreground mb-1">{t("settings.accountDesc")}</p>
          <div className="mt-3 rounded-2xl bg-background/60 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("settings.name")}</span>
              <span className="font-semibold">{profile?.name || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("settings.email")}</span>
              <span className="font-semibold">{profile?.email || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("settings.joined")}</span>
              <span className="font-semibold">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("settings.verified")}</span>
              <span className="font-semibold text-success">✓ {t("common.success")}</span>
            </div>
          </div>
        </Panel>

        {/* Privacy */}
        <Panel>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Eye className="h-4 w-4" /> {t("settings.privacy")}
          </h3>
          <p className="text-xs text-muted-foreground mb-1">{t("settings.privacyDesc")}</p>
          <SettingRow
            icon={<Eye className="h-4 w-4" />}
            title={t("settings.publicProfile")}
            desc=""
          >
            <Toggle
              on={settings.privacyPublicProfile}
              set={(v) => updateSetting("privacyPublicProfile", v)}
            />
          </SettingRow>
          <SettingRow
            icon={<Eye className="h-4 w-4" />}
            title={t("settings.showDonations")}
            desc=""
          >
            <Toggle
              on={settings.privacyShowDonations}
              set={(v) => updateSetting("privacyShowDonations", v)}
            />
          </SettingRow>
          <SettingRow
            icon={<Eye className="h-4 w-4" />}
            title={t("settings.allowMessages")}
            desc=""
          >
            <Toggle
              on={settings.privacyAllowMessages}
              set={(v) => updateSetting("privacyAllowMessages", v)}
            />
          </SettingRow>
          <SettingRow icon={<Eye className="h-4 w-4" />} title={t("settings.showOnline")} desc="">
            <Toggle
              on={settings.privacyShowOnline}
              set={(v) => updateSetting("privacyShowOnline", v)}
            />
          </SettingRow>
        </Panel>

        {/* Data Management */}
        <Panel>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Download className="h-4 w-4" /> {t("settings.data")}
          </h3>
          <p className="text-xs text-muted-foreground mb-1">{t("settings.dataDesc")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => handleExport("all")}
              className="rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-soft hover:shadow-lift"
            >
              {t("settings.downloadAll")}
            </button>
            <button
              onClick={() => handleExport("inventory")}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary"
            >
              {t("settings.exportInventory")}
            </button>
            <button
              onClick={() => handleExport("donations")}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary"
            >
              {t("settings.exportDonations")}
            </button>
            <button
              onClick={() => handleExport("mealplans")}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary"
            >
              {t("settings.exportMealPlans")}
            </button>
          </div>
        </Panel>

        {/* Danger Zone */}
        <Panel className="border border-destructive/30">
          <h3 className="text-lg font-bold flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" /> {t("settings.danger")}
          </h3>
          <p className="text-xs text-muted-foreground mb-1">{t("settings.dangerDesc")}</p>
          <button
            onClick={() => setDeleteModal(true)}
            className="mt-3 rounded-full bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/20 border border-destructive/30"
          >
            {t("settings.deleteAccount")}
          </button>
        </Panel>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {passwordModal && (
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm grid place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPasswordModal(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-[92vw] max-w-md glass-card rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{t("settings.changePassword")}</h3>
                <button
                  onClick={() => setPasswordModal(false)}
                  className="grid h-8 w-8 place-items-center rounded-xl hover:bg-secondary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">
                    {t("settings.currentPassword")}
                  </span>
                  <span className="flex items-center gap-2 rounded-2xl border border-border bg-background/70 px-3 py-2.5">
                    <input
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      type={showCurrent ? "text" : "password"}
                      className="flex-1 bg-transparent text-sm outline-none"
                    />
                    <button
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {showCurrent ? t("settings.hide") : t("settings.show")}
                    </button>
                  </span>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">
                    {t("settings.newPassword")}
                  </span>
                  <span className="flex items-center gap-2 rounded-2xl border border-border bg-background/70 px-3 py-2.5">
                    <input
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      type={showNew ? "text" : "password"}
                      className="flex-1 bg-transparent text-sm outline-none"
                    />
                    <button
                      onClick={() => setShowNew(!showNew)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {showNew ? t("settings.hide") : t("settings.show")}
                    </button>
                  </span>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">
                    {t("settings.confirmPassword")}
                  </span>
                  <span className="flex items-center gap-2 rounded-2xl border border-border bg-background/70 px-3 py-2.5">
                    <input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type={showConfirm ? "text" : "password"}
                      className="flex-1 bg-transparent text-sm outline-none"
                    />
                    <button
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? t("settings.hide") : t("settings.show")}
                    </button>
                  </span>
                </label>
                {passwordErrors.length > 0 && (
                  <div className="rounded-2xl bg-destructive/10 p-3">
                    {passwordErrors.map((err, i) => (
                      <p key={i} className="text-xs text-destructive">
                        • {err}
                      </p>
                    ))}
                  </div>
                )}
                <button
                  onClick={handleChangePassword}
                  className="w-full rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-lift"
                >
                  {t("settings.update")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm grid place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteModal(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-[92vw] max-w-md glass-card rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> {t("settings.deleteAccount")}
                </h3>
                <button
                  onClick={() => setDeleteModal(false)}
                  className="grid h-8 w-8 place-items-center rounded-xl hover:bg-secondary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm mb-4">{t("settings.deleteConfirm")}</p>
              <label className="block mb-3">
                <span className="mb-1 block text-sm font-medium">
                  {t("settings.deletePassword")}
                </span>
                <input
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  type="password"
                  className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none"
                />
              </label>
              {deleteError && <p className="text-xs text-destructive mb-2">{deleteError}</p>}
              <button
                onClick={handleDeleteAccount}
                className="w-full rounded-2xl bg-destructive px-5 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-lift"
              >
                {t("settings.deleteAccount")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
