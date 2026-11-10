"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Button } from "../../ui/Button";
import { Drawer } from "../../ui/Drawer";
import { PageHeader } from "../../ui/PageHeader";
import { SideNavItem, SideNavNav, SideNavRoot, SideNavSection } from "../../ui/SideNav";
import { BillingSettings, type BillingState } from "./BillingSettings";
import { NotificationSettings } from "./NotificationSettings";
import { ProfileSettings } from "./ProfileSettings";
import { SecuritySettings } from "./SecuritySettings";
import { TeamSettings, type TeamState } from "./TeamSettings";
import { SECTIONS, type SettingsSection } from "./settings-data";
import "./SettingsPattern.css";

export type { BillingState, TeamState, SettingsSection };

export interface SettingsPatternProps {
  /** Current section (controlled). Pair it with onSectionChange, or route it from your URL. */
  section?: SettingsSection;
  defaultSection?: SettingsSection;
  onSectionChange?: (section: SettingsSection) => void;
  /** Billing page state: ready, overdue (unpaid invoice), loading or error. */
  billing?: BillingState;
  /** Team page state: ready (members) or empty (just you). */
  team?: TeamState;
  /** Invite Drawer open on the Team page (controlled). */
  inviteOpen?: boolean;
  onInviteOpenChange?: (open: boolean) => void;
  /** Two-factor authentication on (default) or off with the policy notice. */
  twoFactor?: boolean;
  /** Save on Profile and Notifications (submit, or ⌘/Ctrl+S). */
  onSave?: (section: SettingsSection) => void;
  onCancel?: (section: SettingsSection) => void;
  onRetryBilling?: () => void;
  /** Delete workspace, after the AlertDialog confirm. */
  onDeleteWorkspace?: () => void;
}

/*
 * Narrow = below --grid-breakpoint-md, read at runtime like the app-shell example, so the
 * settings nav moves into a kit Drawer at the same width as the app nav. 64rem is the fallback.
 */
function narrowQuery(): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--grid-breakpoint-md").trim();
  return `(width < ${value || "64rem"})`;
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia(narrowQuery());
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useNarrow(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(narrowQuery()).matches, () => false);
}

/**
 * Settings area example: a settings nav (Profile, Billing, Team, Notifications, Security) beside one
 * page per section. Below the md breakpoint the nav moves into a kit Drawer. Renders its own
 * `<nav>` and `<main>`; place it inside your app chrome (e.g. the app-shell example), not inside another main.
 */
export function SettingsPattern({
  section: sectionProp,
  defaultSection = "billing",
  onSectionChange,
  billing = "ready",
  team = "ready",
  inviteOpen,
  onInviteOpenChange,
  twoFactor = true,
  onSave,
  onCancel,
  onRetryBilling,
  onDeleteWorkspace,
}: SettingsPatternProps) {
  const [ownSection, setOwnSection] = useState(defaultSection);
  const section = sectionProp ?? ownSection;
  const [navOpen, setNavOpen] = useState(false);
  const [ownInvite, setOwnInvite] = useState(false);
  const invite = inviteOpen ?? ownInvite;
  const narrow = useNarrow();
  const meta = SECTIONS.find((item) => item.id === section) ?? SECTIONS[0];

  function go(id: SettingsSection) {
    setOwnSection(id);
    onSectionChange?.(id);
    setNavOpen(false);
  }

  function setInvite(open: boolean) {
    setOwnInvite(open);
    onInviteOpenChange?.(open);
  }

  // In the rail the nav carries a "Settings" label and a rule; in the Drawer the Drawer title says it.
  const nav = (
    <SideNavRoot aria-label="Settings" radius="none" open className={narrow ? undefined : "settings-pattern__nav"}>
      <SideNavNav>
        <SideNavSection label={narrow ? undefined : "Settings"}>
          {SECTIONS.map((item) => (
            <SideNavItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              active={item.id === section}
              onClick={() => go(item.id)}
            />
          ))}
        </SideNavSection>
      </SideNavNav>
    </SideNavRoot>
  );

  // One solid primary per view: Team's "Invite people" sits in the PageHeader unless the page is empty.
  const actions: ReactNode =
    section === "team" && team === "ready" ? (
      <Button iconStart="Plus" onClick={() => setInvite(true)}>
        Invite people
      </Button>
    ) : undefined;

  return (
    <div className={narrow ? "layout-app settings-pattern settings-pattern--narrow" : "layout-app settings-pattern"}>
      {narrow ? null : nav}
      <main className="layout-canvas layout-canvas--sticky-header settings-pattern__page" aria-label={`Settings: ${meta.label}`}>
        {narrow ? (
          <div className="settings-pattern__menu">
            <Button appearance="outline" mode="neutral" size="sm" iconStart="Menu" onClick={() => setNavOpen(true)} aria-haspopup="dialog">
              {`Settings · ${meta.label}`}
            </Button>
          </div>
        ) : null}
        <div className="layout-header">
          <PageHeader title={meta.label} subtitle={meta.subtitle} actions={actions} />
        </div>
        {section === "profile" ? (
          <ProfileSettings onSave={() => onSave?.("profile")} onCancel={() => onCancel?.("profile")} />
        ) : section === "billing" ? (
          <BillingSettings state={billing} onRetry={onRetryBilling} />
        ) : section === "team" ? (
          <TeamSettings state={team} inviteOpen={invite} onInviteOpenChange={setInvite} />
        ) : section === "notifications" ? (
          <NotificationSettings onSave={() => onSave?.("notifications")} onCancel={() => onCancel?.("notifications")} />
        ) : (
          <SecuritySettings twoFactor={twoFactor} onDeleteWorkspace={onDeleteWorkspace} />
        )}
      </main>
      {narrow ? (
        <Drawer open={navOpen} side="left" size="sm" title="Settings" onClose={() => setNavOpen(false)}>
          {nav}
        </Drawer>
      ) : null}
    </div>
  );
}
