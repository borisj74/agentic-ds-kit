"use client";

import type { ReactNode } from "react";
import { PageHeader } from "agentic-ds-kit";
import type { SideNavItemData } from "agentic-ds-kit";
// Content patterns are copy-in only (npx agentic-ds-kit add <id>), not package exports:
// render them from their kit source.
import { AppShellPattern } from "../../packages/kit/patterns/AppShellPattern";
import type { AppShellNav, AppShellPatternProps, AppShellWorkspace } from "../../packages/kit/patterns/AppShellPattern";
import { DASHBOARD_DEMO_SHELL } from "../../packages/kit/patterns/DashboardPattern";
import { DemoLogo } from "./AppShellDemo";

/** A row of the Northwind nav: a top-level id, or a Billing child (invoices, payments, plans). */
export type NorthwindNavId = "home" | "customers" | "invoices" | "payments" | "plans" | "reports" | "settings";

const SETTINGS_ROW: SideNavItemData = { id: "settings", label: "Settings", icon: "Settings" };

function withActive(items: SideNavItemData[], active: NorthwindNavId): SideNavItemData[] {
  return items.map((item) =>
    item.items?.length
      ? { ...item, active: false, items: withActive(item.items, active) }
      : { ...item, active: item.id === active },
  );
}

/**
 * The dashboard's Northwind shell (workspace switcher, Quick actions, Notifications, nav, account)
 * with a Settings row added and `active` as the current row, so every pattern preview reads as
 * one product. Pass it whole to AppShellPattern, or to a pattern's `shell` prop.
 */
export function northwindShell(active: NorthwindNavId): Omit<AppShellPatternProps, "children"> {
  const nav = DASHBOARD_DEMO_SHELL.nav as AppShellNav;
  return {
    ...DASHBOARD_DEMO_SHELL,
    // The app-shell example's logo, as on the dashboard.
    workspace: { ...(DASHBOARD_DEMO_SHELL.workspace as AppShellWorkspace), mark: <DemoLogo /> },
    nav: {
      ...nav,
      markIcon: <DemoLogo onBrand />,
      items: withActive([...(nav.items ?? []), SETTINGS_ROW], active),
    },
  };
}

/**
 * A pattern that has no page frame of its own, on a Northwind page: the shell, then the
 * dashboard's frame (sticky page header with title, one-line subtitle and actions, then content).
 */
export function NorthwindPage({
  active,
  title,
  subtitle,
  actions,
  children,
}: {
  active: NorthwindNavId;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <AppShellPattern {...northwindShell(active)}>
      <main className="layout-canvas layout-canvas--sticky-header">
        <div className="layout-header">
          <PageHeader title={title} subtitle={subtitle} actions={actions} />
        </div>
        <div className="layout-content">{children}</div>
      </main>
    </AppShellPattern>
  );
}
