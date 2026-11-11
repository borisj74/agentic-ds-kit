"use client";

import { useState } from "react";
import { ONBOARDING_SCREENS, SETTINGS_SCREENS } from "@/lib/pattern-screens";
import { OnboardingPattern } from "../../packages/kit/patterns/OnboardingPattern";
import {
  Button,
  Input,
  NotificationStack,
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
import { SETTINGS_SECTIONS, SettingsPattern, type SettingsSection } from "../../packages/kit/patterns/SettingsPattern";

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
 * The settings pattern as a full screen in the Stage look (Paper's second row, the site's chrome):
 * the app-shell example with layout-shell--inset and StageNav. `view` is one of Paper's screens
 * (section + state); the nav also switches sections.
 */
export function SettingsScreen({ view }: { view?: string }) {
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
    <AppShellPattern
      className="layout-shell--inset layout-shell--viewport"
      mark="n"
      navLabel="Northwind"
      nav={<StageNav section={screen.section} onPick={pickSection} />}
    >
      {settings}
    </AppShellPattern>
  );
}


/**
 * The onboarding pattern as a full screen. `view` is one of Paper's screens; the pattern's own
 * buttons also move between steps (creating the workspace waits a moment).
 */
export function OnboardingScreen({ view }: { view?: string }) {
  const [screenId, setScreenId] = useState(ONBOARDING_SCREENS.some((item) => item.id === view) ? view! : "welcome");
  const screen = ONBOARDING_SCREENS.find((item) => item.id === screenId) ?? ONBOARDING_SCREENS[0];

  return (
    <OnboardingPattern
      step={screen.step}
      onStepChange={(step) => setScreenId(step)}
      workspaceState={screen.workspace}
      onCreateWorkspace={() => new Promise((resolve) => setTimeout(resolve, 1200))}
    />
  );
}
