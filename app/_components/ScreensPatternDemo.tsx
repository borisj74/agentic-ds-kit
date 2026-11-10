"use client";

import { useState } from "react";
import { Avatar, Badge, NotificationStack, Select } from "agentic-ds-kit";
import type { SideNavItemData } from "agentic-ds-kit";
import { AppShellPattern } from "../../packages/kit/patterns/AppShellPattern";
import {
  SettingsPattern,
  type BillingState,
  type SettingsSection,
  type TeamState,
} from "../../packages/kit/patterns/SettingsPattern";
import styles from "../playground.module.css";
import { PreviewScope } from "./ThemeScope";

/** The screens on Paper p-6-0 (Settings set). Each one is a section plus that section's state. */
const SETTINGS_SCREENS: {
  id: string;
  label: string;
  section: SettingsSection;
  billing?: BillingState;
  team?: TeamState;
  invite?: boolean;
  twoFactor?: boolean;
}[] = [
  { id: "billing", label: "Billing", section: "billing" },
  { id: "billing-overdue", label: "Billing · overdue", section: "billing", billing: "overdue" },
  { id: "billing-loading", label: "Billing · loading", section: "billing", billing: "loading" },
  { id: "billing-error", label: "Billing · error", section: "billing", billing: "error" },
  { id: "profile", label: "Profile", section: "profile" },
  { id: "team", label: "Team", section: "team" },
  { id: "team-invite", label: "Team · invite drawer", section: "team", invite: true },
  { id: "team-empty", label: "Team · empty", section: "team", team: "empty" },
  { id: "notifications", label: "Notifications", section: "notifications" },
  { id: "security", label: "Security", section: "security" },
  { id: "security-2fa-off", label: "Security · 2FA off", section: "security", twoFactor: false },
];

const APP_NAV: SideNavItemData[] = [
  { id: "home", label: "Home", icon: "House" },
  { id: "invoices", label: "Invoices", icon: "FileText" },
  { id: "customers", label: "Customers", icon: "Users" },
  { id: "agents", label: "Agents", icon: "Bot" },
  { id: "usage", label: "Usage", icon: "ChartColumn" },
  { id: "integrations", label: "Integrations", icon: "Plug" },
  { id: "settings", label: "Settings", icon: "Settings", active: true },
];

const INBOX = [
  { id: "n1", title: "Payment received", body: "INV-2026-0121 · $1,240.00", createdAt: "2 h ago", read: false, tone: "success" as const },
  { id: "n2", title: "Approval needed", body: "Agent wants to send 4 reminders", createdAt: "5 h ago", read: false, tone: "info" as const },
];

/**
 * The settings pattern inside the app-shell example, framed like the other pattern demos.
 * A Select picks one of Paper's screens (section + state); the pattern's own nav also switches sections.
 * `?view=<screen id>` opens a screen directly (e.g. billing-overdue).
 */
export function SettingsAreaDemo({ view }: { view?: string }) {
  const [screenId, setScreenId] = useState(SETTINGS_SCREENS.some((item) => item.id === view) ? view! : "billing");
  const screen = SETTINGS_SCREENS.find((item) => item.id === screenId) ?? SETTINGS_SCREENS[0];
  const [query, setQuery] = useState("");

  function pickSection(section: SettingsSection) {
    setScreenId(SETTINGS_SCREENS.find((item) => item.section === section)?.id ?? "billing");
  }

  return (
    <div className={styles.signInDemo}>
      <div className={styles.screenPicker}>
        <Select
          id="settings-area-screen"
          size="sm"
          ariaLabel="Settings screen"
          options={SETTINGS_SCREENS.map((item) => ({ value: item.id, label: item.label }))}
          value={screenId}
          onChange={(value) => setScreenId(String(value))}
        />
      </div>
      <div className={styles.browser}>
        <div className={styles.browserChrome} aria-hidden="true">
          <div className={styles.traffic}>
            <span className={`${styles.trafficDot} ${styles.trafficClose}`} />
            <span className={`${styles.trafficDot} ${styles.trafficMin}`} />
            <span className={`${styles.trafficDot} ${styles.trafficMax}`} />
          </div>
          <div className={styles.urlBar}>{`app.northwind.example/settings/${screen.section}`}</div>
        </div>
        <PreviewScope className={styles.scopeFill}>
          <AppShellPattern
            header={{
              title: "Northwind",
              mark: "N",
              searchPlaceholder: "Search or jump to…",
              searchShortcut: "⌘K",
              searchValue: query,
              onSearch: setQuery,
              actions: (
                <>
                  <Badge tone="neutral" appearance="outline" size="sm">
                    Example
                  </Badge>
                  <NotificationStack items={INBOX} label="Notifications" />
                  <Avatar name="Priya Shah" size="sm" />
                </>
              ),
            }}
            nav={{ title: "Northwind", mark: "N", items: APP_NAV }}
          >
            <SettingsPattern
              section={screen.section}
              onSectionChange={pickSection}
              billing={screen.billing ?? "ready"}
              team={screen.team ?? "ready"}
              inviteOpen={screen.invite ?? false}
              onInviteOpenChange={(open) => setScreenId(open ? "team-invite" : "team")}
              twoFactor={screen.twoFactor ?? true}
            />
          </AppShellPattern>
        </PreviewScope>
      </div>
    </div>
  );
}
