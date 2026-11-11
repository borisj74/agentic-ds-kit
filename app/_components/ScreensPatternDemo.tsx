"use client";

import { useState } from "react";
import { OnboardingPattern, type OnboardingStep, type WorkspaceState } from "../../packages/kit/patterns/OnboardingPattern";
import {
  Button,
  Input,
  NotificationStack,
  Select,
  SideNavAccount,
  SideNavBrand,
  SideNavHeader,
  SideNavItem,
  SideNavNav,
  SideNavRoot,
  SideNavSection,
  SideNavSlot,
} from "agentic-ds-kit";
import type { SideNavItemData } from "agentic-ds-kit";
import { AppShellPattern, useAppShell } from "../../packages/kit/patterns/AppShellPattern";
import {
  SETTINGS_SECTIONS,
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
  { id: "settings", label: "Settings", icon: "Settings" },
];

/**
 * Paper's second row ("Stage", the Nistha site's chrome): a built SideNav on the canvas with the
 * brand, search, the app rows and the five settings sections nested under SETTINGS, plus the account.
 * Forced open in the narrow Drawer.
 */
function StageNav({ section, onPick }: { section: SettingsSection; onPick: (section: SettingsSection) => void }) {
  const shell = useAppShell();
  const inDrawer = shell?.navPlacement === "drawer";
  return (
    <SideNavRoot aria-label="Northwind" radius={inDrawer ? "md" : "none"} open>
      {inDrawer ? null : (
        <SideNavHeader>
          <SideNavBrand title="northwind" mark="n" />
        </SideNavHeader>
      )}
      <SideNavSlot>
        <Input id={inDrawer ? "stage-search-drawer" : "stage-search"} type="search" size="sm" iconStart="Search" placeholder="Search" ariaLabel="Search" end="⌘K" />
      </SideNavSlot>
      <SideNavNav>
        <SideNavSection>
          {APP_NAV.map((item) => (
            <SideNavItem key={item.id} label={item.label} icon={item.icon} href="#" />
          ))}
        </SideNavSection>
        <SideNavSection label={`Settings · ${SETTINGS_SECTIONS.length}`}>
          {SETTINGS_SECTIONS.map((item) => (
            <SideNavItem
              key={item.id}
              label={item.label}
              active={item.id === section}
              onClick={() => {
                onPick(item.id);
                shell?.closeNav();
              }}
            />
          ))}
        </SideNavSection>
      </SideNavNav>
      <SideNavAccount name="Priya Shah" secondary="Pro plan · 12 seats" initials="PS" />
    </SideNavRoot>
  );
}

const INBOX = [
  { id: "n1", title: "Payment received", body: "INV-2026-0121 · $1,240.00", createdAt: "2 h ago", read: false, tone: "success" as const },
  { id: "n2", title: "Approval needed", body: "Agent wants to send 4 reminders", createdAt: "5 h ago", read: false, tone: "info" as const },
];

/**
 * The settings pattern in the Stage look (Paper's second row, the site's chrome): the app-shell
 * example with layout-shell--inset and StageNav, framed like the other pattern demos.
 * A Select picks one of Paper's screens (section + state); the pattern's own nav also switches sections.
 * `?view=<screen id>` opens a screen directly (e.g. billing-overdue).
 */
export function SettingsAreaDemo({ view }: { view?: string }) {
  const [screenId, setScreenId] = useState(SETTINGS_SCREENS.some((item) => item.id === view) ? view! : "billing");
  const screen = SETTINGS_SCREENS.find((item) => item.id === screenId) ?? SETTINGS_SCREENS[0];

  function pickSection(section: SettingsSection) {
    setScreenId(SETTINGS_SCREENS.find((item) => item.section === section)?.id ?? "billing");
  }

  const settings = (
    <SettingsPattern
      headerActions={
        <>
          <Button appearance="outline" mode="neutral" size="sm" iconStart="CircleHelp">
            Help
          </Button>
          <NotificationStack items={INBOX} label="Notifications" />
        </>
      }
      section={screen.section}
      billing={screen.billing ?? "ready"}
      team={screen.team ?? "ready"}
      inviteOpen={screen.invite ?? false}
      onInviteOpenChange={(open) => setScreenId(open ? "team-invite" : "team")}
      twoFactor={screen.twoFactor ?? true}
    />
  );

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
            className="layout-shell--inset"
            mark="n"
            navLabel="Northwind"
            nav={<StageNav section={screen.section} onPick={pickSection} />}
          >
            {settings}
          </AppShellPattern>
        </PreviewScope>
      </div>
    </div>
  );
}

/** The screens on Paper p-6-0 (Onboarding): each step, plus the workspace step's error and submitting states. */
const ONBOARDING_SCREENS: { id: string; label: string; step: OnboardingStep; workspace?: WorkspaceState }[] = [
  { id: "welcome", label: "01 Welcome", step: "welcome" },
  { id: "workspace", label: "02 Workspace", step: "workspace" },
  { id: "workspace-error", label: "02b Workspace · validation error", step: "workspace", workspace: "error" },
  { id: "workspace-submitting", label: "02c Workspace · submitting", step: "workspace", workspace: "submitting" },
  { id: "connect", label: "03 Connect or choose", step: "connect" },
  { id: "done", label: "04 Done", step: "done" },
];

/**
 * The onboarding pattern in the browser frame. A Select picks one of Paper's screens; the
 * pattern's own buttons also move between steps (creating the workspace waits a moment).
 * `?view=<screen id>` opens a screen directly (e.g. workspace-error).
 */
export function OnboardingDemo({ view }: { view?: string }) {
  const [screenId, setScreenId] = useState(ONBOARDING_SCREENS.some((item) => item.id === view) ? view! : "welcome");
  const screen = ONBOARDING_SCREENS.find((item) => item.id === screenId) ?? ONBOARDING_SCREENS[0];

  return (
    <div className={styles.signInDemo}>
      <div className={styles.screenPicker}>
        <Select
          id="onboarding-screen"
          size="sm"
          ariaLabel="Onboarding screen"
          options={ONBOARDING_SCREENS.map((item) => ({ value: item.id, label: item.label }))}
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
          <div className={styles.urlBar}>{`app.northwind.example/setup/${screen.step}`}</div>
        </div>
        <PreviewScope className={styles.scopeFill}>
          <OnboardingPattern
            viewport={false}
            step={screen.step}
            onStepChange={(step) => setScreenId(step)}
            workspaceState={screen.workspace}
            onCreateWorkspace={() => new Promise((resolve) => setTimeout(resolve, 1200))}
          />
        </PreviewScope>
      </div>
    </div>
  );
}
