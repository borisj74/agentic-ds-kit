"use client";

import { useState, type ReactNode } from "react";
import { Breadcrumb } from "../../ui/Breadcrumb";
import { Button } from "../../ui/Button";
import { PageHeader } from "../../ui/PageHeader";
import { BillingSettings, type BillingState } from "./BillingSettings";
import { NotificationSettings } from "./NotificationSettings";
import { ProfileSettings } from "./ProfileSettings";
import { SecuritySettings } from "./SecuritySettings";
import { TeamSettings, type TeamState } from "./TeamSettings";
import { SECTIONS, type SettingsSection } from "./settings-data";
import "./SettingsPattern.css";

export type { BillingState, TeamState, SettingsSection };

export interface SettingsPatternProps {
  /**
   * Section to show. The section links live in your app's SideNav: build its rows from
   * SETTINGS_SECTIONS under a Settings group and route the section from your URL.
   */
  section?: SettingsSection;
  /** Page-level actions on the breadcrumb row (top right), e.g. Help and the NotificationStack bell. */
  headerActions?: ReactNode;
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

/**
 * Settings page example: one page per section (Profile, Billing, Team, Notifications, Security)
 * under a Settings › section breadcrumb. Built for the Stage look: an app shell with
 * layout-shell--inset, its SideNav on the canvas listing the sections, and this page on the
 * inset panel. Renders its own `<main>`; don't wrap it in another main.
 */
export function SettingsPattern({
  section = "billing",
  headerActions,
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
  const [ownInvite, setOwnInvite] = useState(false);
  const invite = inviteOpen ?? ownInvite;
  const meta = SECTIONS.find((item) => item.id === section) ?? SECTIONS[0];

  function setInvite(open: boolean) {
    setOwnInvite(open);
    onInviteOpenChange?.(open);
  }

  // One solid primary per view: Team's "Invite people" sits in the PageHeader unless the page is empty.
  const sectionAction: ReactNode =
    section === "team" && team === "ready" ? (
      <Button iconStart="Plus" onClick={() => setInvite(true)}>
        Invite people
      </Button>
    ) : null;

  return (
    <main className="layout-canvas layout-canvas--sticky-header settings-pattern" aria-label={`Settings: ${meta.label}`}>
      <div className="layout-header">
        <div className="settings-pattern__top">
          <Breadcrumb items={[{ label: "Settings" }, { label: meta.label }]} />
          {headerActions ? <div className="settings-pattern__actions">{headerActions}</div> : null}
        </div>
        <PageHeader title={meta.label} subtitle={meta.subtitle} actions={sectionAction ?? undefined} />
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
  );
}
