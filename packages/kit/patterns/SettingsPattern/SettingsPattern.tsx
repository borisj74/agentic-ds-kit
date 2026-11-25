"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ArrowLeft, User, Users } from "lucide-react";
import { Button } from "../../ui/Button";
import { LinkList } from "../../ui/LinkList";
import { PageHeader } from "../../ui/PageHeader";
import {
  SideNavAccount,
  SideNavBrand,
  SideNavFooter,
  SideNavHeader,
  SideNavItem,
  SideNavNav,
  SideNavRoot,
  SideNavSection,
} from "../../ui/SideNav";
import { IntegrationSettingsPattern } from "../IntegrationSettingsPattern";
import { BillingSettings, type BillingState } from "./BillingSettings";
import { GeneralSettings } from "./GeneralSettings";
import { NotificationSettings } from "./NotificationSettings";
import { ProfileSettings } from "./ProfileSettings";
import { SecuritySettings } from "./SecuritySettings";
import { SignInSettings } from "./SignInSettings";
import { TeamSettings, type TeamState } from "./TeamSettings";
import { PROFILE, SECTIONS, SETTINGS_GROUPS, WORKSPACE, type SettingsSection, type SettingsSectionMeta } from "./settings-data";
import "./SettingsPattern.css";

export type { BillingState, TeamState, SettingsSection };

export interface SettingsPatternProps {
  /**
   * Section to show (controlled). Route it from your URL. `null` is the Settings index page below
   * --grid-breakpoint-md; wide, null shows General. Leave it unset and the pattern keeps its own.
   */
  section?: SettingsSection | null;
  /** A nav row, an index row or Back to Settings was picked. `null` is the index page. */
  onSectionChange?: (section: SettingsSection | null) => void;
  /** Gives each section a URL, so nav and index rows are real links. Without it they are buttons. */
  sectionHref?: (section: SettingsSection) => string;
  /** Where Back to app goes (the nav's first row, and the index page's back step). Default "/". */
  appHref?: string;
  /** Page-level actions on the title row, e.g. Ask and the NotificationStack bell. */
  headerActions?: ReactNode;
  /** Billing page state: ready, overdue (unpaid invoice), loading or error. */
  billing?: BillingState;
  /** Team page state: ready (members) or empty (just you). */
  team?: TeamState;
  /** Invite Drawer open on the Team page (controlled). */
  inviteOpen?: boolean;
  onInviteOpenChange?: (open: boolean) => void;
  /** Your two-factor authentication on Sign-in: on (default) or off with the policy notice. */
  twoFactor?: boolean;
  /** Save on General, Profile, Notifications (the SaveBar, or ⌘/Ctrl+S) and Security (Save sign-in rules). */
  onSave?: (section: SettingsSection) => void;
  onCancel?: (section: SettingsSection) => void;
  onRetryBilling?: () => void;
  /** Delete workspace (Security's Danger zone), after the AlertDialog confirm. */
  onDeleteWorkspace?: () => void;
}

/* Narrow = below --grid-breakpoint-md, read at runtime (64rem fallback): the settings nav gives way to the index page. */
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

/** The scope line under the title: who a change reaches. Its icon is decorative. */
function scopeLine(meta: SettingsSectionMeta, wide: boolean): ReactNode {
  const Icon = meta.group === "you" ? User : Users;
  const text = wide && meta.editors ? `${meta.scope} · ${meta.editors}` : meta.scope;
  return (
    <>
      <Icon aria-hidden="true" strokeWidth={1.5} />
      {text}
    </>
  );
}

/**
 * Settings shell example for one workspace. Wide: a settings SideNav on the canvas (Back to app,
 * then Workspace and You groups) and the section on the inset panel, titled by PageHeader alone
 * with a scope line under it. Below --grid-breakpoint-md: Settings is an index page of two kit
 * LinkLists, and each section has Back to Settings. General, Profile and Notifications end in
 * one SaveBar; Security's sign-in rules end in their own; the other sections act per card.
 * Renders its own `<main>`.
 */
export function SettingsPattern({
  section,
  onSectionChange,
  sectionHref,
  appHref = "/",
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
  const narrow = useNarrow();
  const [ownSection, setOwnSection] = useState<SettingsSection | null | undefined>(undefined);
  const [ownInvite, setOwnInvite] = useState(false);
  const cameFrom = useRef<SettingsSection | null>(null);
  const indexRef = useRef<HTMLDivElement>(null);
  const invite = inviteOpen ?? ownInvite;

  // Unset: wide opens on General, narrow on the index page.
  const picked = section !== undefined ? section : ownSection !== undefined ? ownSection : narrow ? null : "general";
  const current: SettingsSection | null = picked === null && !narrow ? "general" : picked;

  const sections = SECTIONS.map((item) =>
    item.id === "sign-in" ? { ...item, description: twoFactor ? "Password · two-factor on" : "Password · two-factor off" } : item,
  );

  function go(next: SettingsSection | null) {
    if (next === null && current !== null) cameFrom.current = current;
    setOwnSection(next);
    onSectionChange?.(next);
  }

  // Back on the index page lands on the row you came from.
  useEffect(() => {
    if (current !== null || !cameFrom.current) return;
    const index = SECTIONS.findIndex((item) => item.id === cameFrom.current);
    cameFrom.current = null;
    indexRef.current?.querySelectorAll<HTMLElement>("a, button")[index]?.focus();
  }, [current]);

  /** A real link when sectionHref is set (your router handles it), else a button that switches here. */
  function link(id: SettingsSection): { href?: string; onClick?: () => void } {
    return sectionHref ? { href: sectionHref(id) } : { onClick: () => go(id) };
  }

  function setInvite(open: boolean) {
    setOwnInvite(open);
    onInviteOpenChange?.(open);
  }

  if (current === null) {
    return (
      <main className="layout-canvas layout-canvas--sticky-header layout-shell--viewport settings-pattern" aria-label="Settings">
        <div className="layout-header">
          <PageHeader
            title="Settings"
            subtitle={`${WORKSPACE.name} · ${WORKSPACE.plan}`}
            breadcrumbs={[{ label: "Back to app", href: appHref }, { label: "Settings" }]}
          />
        </div>
        <div className="layout-content settings-pattern__index" ref={indexRef}>
          {SETTINGS_GROUPS.map((group) => (
            <section key={group.id} className="settings-pattern__group" aria-labelledby={`settings-group-${group.id}`}>
              <h2 className="settings-pattern__group-heading" id={`settings-group-${group.id}`}>
                {group.heading}
              </h2>
              <LinkList
                label={group.label}
                items={sections
                  .filter((item) => item.group === group.id)
                  .map((item) => ({
                    id: item.id,
                    label: item.label,
                    icon: item.icon,
                    description: item.description,
                    ...link(item.id),
                  }))}
              />
            </section>
          ))}
        </div>
      </main>
    );
  }

  const meta = sections.find((item) => item.id === current) ?? sections[0];

  // One solid primary per view: Team's "Invite people" sits in the PageHeader unless the page is empty.
  const sectionAction: ReactNode =
    current === "team" && team === "ready" ? (
      <Button iconStart="Plus" onClick={() => setInvite(true)}>
        {narrow ? "Invite" : "Invite people"}
      </Button>
    ) : null;

  const page = (
    <main
      className={`layout-canvas layout-canvas--sticky-header settings-pattern${narrow ? " layout-shell--viewport settings-pattern--narrow" : ""}`}
      aria-label={`Settings: ${meta.label}`}
    >
      <div className="layout-header">
        <PageHeader
          title={meta.label}
          subtitle={scopeLine(meta, !narrow)}
          // Wide, the marked nav row says where you are; narrow, the trail is one Back to Settings step.
          breadcrumbs={
            narrow
              ? [{ label: "Settings", onClick: () => go(null) }, { label: meta.label }]
              : undefined
          }
          // Narrow keeps the section's own primary only; the page-level actions stay on the wide title row.
          actions={
            sectionAction || (headerActions && !narrow) ? (
              <>
                {narrow ? null : headerActions}
                {sectionAction}
              </>
            ) : undefined
          }
        />
      </div>
      {current === "general" ? (
        <GeneralSettings narrow={narrow} onSave={() => onSave?.("general")} onCancel={() => onCancel?.("general")} />
      ) : current === "billing" ? (
        <BillingSettings state={billing} narrow={narrow} onRetry={onRetryBilling} />
      ) : current === "team" ? (
        <TeamSettings state={team} narrow={narrow} inviteOpen={invite} onInviteOpenChange={setInvite} />
      ) : current === "integrations" ? (
        <div className="layout-content">
          <IntegrationSettingsPattern />
        </div>
      ) : current === "security" ? (
        <SecuritySettings
          narrow={narrow}
          onSave={() => onSave?.("security")}
          onCancel={() => onCancel?.("security")}
          onDeleteWorkspace={onDeleteWorkspace}
        />
      ) : current === "profile" ? (
        <ProfileSettings narrow={narrow} onSave={() => onSave?.("profile")} onCancel={() => onCancel?.("profile")} />
      ) : current === "notifications" ? (
        <NotificationSettings narrow={narrow} onSave={() => onSave?.("notifications")} onCancel={() => onCancel?.("notifications")} />
      ) : (
        <SignInSettings twoFactor={twoFactor} />
      )}
    </main>
  );

  if (narrow) return page;

  return (
    <div className="layout-shell layout-shell--inset layout-shell--viewport settings-pattern__shell">
      <div className="layout-app">
        <SideNavRoot aria-label="Settings" radius="none" open>
          <SideNavHeader>
            <SideNavBrand
              mark={WORKSPACE.mark}
              title={
                <span className="settings-pattern__brand">
                  <span className="settings-pattern__brand-name">{WORKSPACE.name}</span>
                  <span className="settings-pattern__brand-plan">{WORKSPACE.plan}</span>
                </span>
              }
            />
          </SideNavHeader>
          <SideNavNav>
            <SideNavSection>
              <SideNavItem label="Back to app" icon={ArrowLeft} href={appHref} />
            </SideNavSection>
            {SETTINGS_GROUPS.map((group) => (
              <SideNavSection key={group.id} label={group.label}>
                {sections
                  .filter((item) => item.group === group.id)
                  .map((item) => {
                    const target = link(item.id);
                    return (
                      <SideNavItem
                        key={item.id}
                        label={item.label}
                        icon={item.icon}
                        active={item.id === current}
                        href={target.href}
                        onClick={target.onClick}
                      />
                    );
                  })}
              </SideNavSection>
            ))}
          </SideNavNav>
          <SideNavFooter>
            <SideNavAccount name={PROFILE.fullName} secondary="Owner" initials={PROFILE.initials} />
          </SideNavFooter>
        </SideNavRoot>
        {page}
      </div>
    </div>
  );
}
