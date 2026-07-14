import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/app/primitives";
import { ShieldCheck, Moon, Sun, Bell, Globe2, KeyRound } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — FoodNest" }] }),
  component: Settings,
});

function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <button onClick={() => set(!on)} className={`h-7 w-12 rounded-full p-0.5 transition ${on ? "bg-gradient-primary" : "bg-muted"}`}>
      <span className={`block h-6 w-6 rounded-full bg-white shadow transition ${on ? "translate-x-5" : ""}`} />
    </button>
  );
}

function Settings() {
  const { isDark, setTheme } = useTheme();
  const dark = isDark;
  const setDark = (v: boolean) => setTheme(v ? "dark" : "light");
  const [notif, setNotif] = useState(true);
  const [twofa, setTwoFa] = useState(true);
  return (
    <>
      <PageHeader title="Settings" subtitle="Privacy, security and preferences." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h3 className="text-lg font-bold">Security</h3>
          <Row icon={<ShieldCheck className="h-4 w-4" />} title="Two-factor authentication" desc="TOTP-based 2FA via authenticator apps.">
            <Toggle on={twofa} set={setTwoFa} />
          </Row>
          <Row icon={<KeyRound className="h-4 w-4" />} title="Change password" desc="Last changed 14 days ago.">
            <button className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold hover:bg-secondary">Update</button>
          </Row>
        </Panel>
        <Panel>
          <h3 className="text-lg font-bold">Preferences</h3>
          <Row icon={dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} title="Theme" desc="Light, dark or system">
            <Toggle on={dark} set={setDark} />
          </Row>
          <Row icon={<Bell className="h-4 w-4" />} title="Notifications" desc="Expiry reminders, donations, meals.">
            <Toggle on={notif} set={setNotif} />
          </Row>
          <Row icon={<Globe2 className="h-4 w-4" />} title="Language" desc="English (US)">
            <button className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold hover:bg-secondary">Change</button>
          </Row>
        </Panel>
      </div>
    </>
  );
}

function Row({ icon, title, desc, children }: any) {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-2xl bg-background/60 p-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-white">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      {children}
    </div>
  );
}
