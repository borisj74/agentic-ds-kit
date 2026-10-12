"use client";

import { useCallback, useMemo, useState } from "react";
import { AppHeader } from "agentic-ds-kit";
import { Button } from "agentic-ds-kit";
import { Empty } from "agentic-ds-kit";
import { PageHeader } from "agentic-ds-kit";
import type { PageHeaderProps } from "agentic-ds-kit";
import { SideNav } from "agentic-ds-kit";
import type { SideNavItemData } from "agentic-ds-kit";
import { pushHash, useLocationHash } from "@/lib/use-location-hash";
// Content patterns are copy-in only (npx agentic-ds-kit add <id>), not package exports:
// render them from their kit source.
import { ActivityPattern } from "../../packages/kit/patterns/ActivityPattern";
import { AssistantWorkspacePattern } from "../../packages/kit/patterns/AssistantWorkspacePattern";
import { DashboardPattern } from "../../packages/kit/patterns/DashboardPattern";
import { EmptyFirstRunPattern } from "../../packages/kit/patterns/EmptyFirstRunPattern";
import { InboxPattern } from "../../packages/kit/patterns/InboxPattern";
import { InviteMembersPattern } from "../../packages/kit/patterns/InviteMembersPattern";
import { ListDetailPattern } from "../../packages/kit/patterns/ListDetailPattern";
import { SettingsFormPattern } from "../../packages/kit/patterns/SettingsFormPattern";
import styles from "../playground.module.css";

const NAV_ITEMS: SideNavItemData[] = [
  { id: "overview", label: "Overview", icon: "House" },
  { id: "activity", label: "Activity", icon: "ChartBar", badge: "6" },
  { id: "inbox", label: "Inbox", icon: "Mail", badge: "7" },
  { id: "projects", label: "Projects", icon: "Folder", badge: "4" },
  { id: "tasks", label: "Open tasks", icon: "Check", badge: "18" },
  { id: "insights", label: "Insights", icon: "Sparkles" },
  { id: "resources", label: "Resources", icon: "Layers" },
  { id: "tag-important", label: "Important", icon: "TriangleAlert", badge: "3" },
  { id: "tag-at-risk", label: "At risk", icon: "Info", badge: "5" },
  { id: "tag-shipped", label: "Shipped", icon: "CircleCheck", badge: "12" },
];

const NAV_FOOTER: SideNavItemData[] = [
  { id: "invite", label: "Invite members", icon: "CirclePlus" },
  { id: "settings", label: "Settings", icon: "Settings" },
];

function bindItems(items: SideNavItemData[], page: string, go: (id: string) => void): SideNavItemData[] {
  return items.map((item) => {
    const nested = Boolean(item.items && item.items.length > 0);
    return {
      ...item,
      active: !nested && item.id === page,
      onClick: nested ? undefined : () => go(item.id),
      items: nested ? bindItems(item.items!, page, go) : undefined,
    };
  });
}

function findItem(items: SideNavItemData[], id: string): SideNavItemData | undefined {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.items) {
      const nested = findItem(item.items, id);
      if (nested) return nested;
    }
  }
  return undefined;
}

function findTrail(items: SideNavItemData[], id: string, ancestors: SideNavItemData[] = []): SideNavItemData[] | null {
  for (const item of items) {
    if (item.id === id) return [...ancestors, item];
    if (item.items) {
      const nested = findTrail(item.items, id, [...ancestors, item]);
      if (nested) return nested;
    }
  }
  return null;
}

function breadcrumbsFor(page: string, go: (id: string) => void): PageHeaderProps["breadcrumbs"] {
  const home = { label: "Agentix", onClick: () => go("overview") };
  const workspace = {
    label: "Workspace",
    onClick: page === "overview" ? undefined : () => go("overview"),
  };

  const footerHit = NAV_FOOTER.find((item) => item.id === page);
  if (footerHit) return [home, { label: footerHit.label }];

  const path = findTrail(NAV_ITEMS, page);
  if (path) {
    const crumbs: NonNullable<PageHeaderProps["breadcrumbs"]> = [home, workspace];
    path.slice(0, -1).forEach((parent) => {
      crumbs.push({ label: parent.label });
    });
    crumbs.push({ label: path[path.length - 1].label });
    return crumbs;
  }

  return [home, workspace, { label: "Overview" }];
}

function PlaceholderPage({
  item,
  breadcrumbs,
}: {
  item: SideNavItemData;
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
}) {
  return (
    <div className="layout-canvas layout-canvas--sticky-header">
      <div className="layout-header">
        <PageHeader
          title={item.label}
          subtitle="Nothing to show for this view yet."
          breadcrumbs={breadcrumbs}
        />
      </div>
      <div className="layout-content">
        <Empty
          title="Nothing here yet"
          description={`${item.label} will show up here when there is something to review.`}
          icon={item.icon}
          outlined
        />
      </div>
    </div>
  );
}

const LIST_DETAIL_PAGES = new Set([
  "projects",
  "list-detail",
  "launch-brief",
  "qa-checklist",
  "release-notes",
  "support-macros",
]);

const LIST_DETAIL_HASHES = new Set([
  "list-detail",
  "launch-brief",
  "qa-checklist",
  "release-notes",
  "support-macros",
]);

function isListDetailPage(id: string) {
  return LIST_DETAIL_PAGES.has(id);
}

function hashForPage(id: string) {
  if (id === "settings") return "settings";
  if (id === "invite") return "invite";
  if (id === "insights") return "insights";
  if (id === "activity") return "activity";
  if (id === "inbox") return "inbox";
  if (id === "research") return "empty";
  if (id === "projects" || id === "list-detail") return "list-detail";
  if (LIST_DETAIL_HASHES.has(id)) return id;
  return "dashboard";
}

function selectedProjectId(page: string) {
  if (page === "projects" || page === "list-detail") return "launch-brief";
  return page;
}

/** Page a pattern hash links to, or null for the dashboard (whose page lives in state). */
function pageForHash(hash: string): string | null {
  if (hash === "settings") return "settings";
  if (hash === "invite") return "invite";
  if (hash === "insights") return "insights";
  if (hash === "activity") return "activity";
  if (hash === "inbox") return "inbox";
  if (hash === "empty" || hash === "research") return "research";
  if (hash === "list-detail" || hash === "projects") return "projects";
  if (LIST_DETAIL_HASHES.has(hash)) return hash;
  return null;
}

export function DashboardDemo() {
  // null until hydrated, so the server and the first client render agree on "overview".
  const hash = useLocationHash();
  const [dashboardPage, setDashboardPage] = useState("overview");
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const hashPage = hash === null ? null : pageForHash(hash);
  const page =
    hashPage ?? (hashForPage(dashboardPage) === "dashboard" ? dashboardPage : "overview");

  const go = useCallback((id: string) => {
    const next = hashForPage(id);
    if (next === "dashboard") setDashboardPage(id);
    if (window.location.hash.replace(/^#/, "") !== next) pushHash(next);
  }, []);

  const items = useMemo(() => bindItems(NAV_ITEMS, page, go), [page, go]);
  const footer = useMemo(() => {
    const navFooter = bindItems(NAV_FOOTER, page, go);
    const toggleLabel = sidebarOpen ? "Close sidebar" : "Open sidebar";
    const toggleIcon = sidebarOpen ? "PanelLeftClose" : "PanelLeftOpen";
    const toggle: SideNavItemData = {
      id: "toggle-sidebar",
      label: toggleLabel,
      icon: toggleIcon,
      active: false,
      onClick: () => setSidebarOpen((current) => !current),
    };
    return [...navFooter, toggle];
  }, [page, go, sidebarOpen]);

  const allItems = [...NAV_ITEMS, ...NAV_FOOTER];
  const current = findItem(allItems, page);

  const path =
    page === "overview"
      ? "app.operations.dev/overview"
      : page === "activity"
        ? "app.operations.dev/activity"
        : `app.operations.dev/${page}`;

  const trail = breadcrumbsFor(page, go);

  return (
    <div className={styles.browser}>
      <div className={styles.browserChrome} aria-hidden="true">
        <div className={styles.traffic}>
          <span className={`${styles.trafficDot} ${styles.trafficClose}`} />
          <span className={`${styles.trafficDot} ${styles.trafficMin}`} />
          <span className={`${styles.trafficDot} ${styles.trafficMax}`} />
        </div>
        <div className={styles.urlBar}>{path}</div>
      </div>
      <div className={hash === null ? `layout-shell ${styles.pending}` : "layout-shell"}>
        <AppHeader
          title="Agentix"
          mark="A"
          searchPlaceholder="Search"
          searchShortcut="⌘K"
          searchValue={query}
          onSearch={setQuery}
          actions={
            <>
              <Button variant="tertiary" size="sm" iconStart="Bell" ariaLabel="Notifications" />
              <Button variant="tertiary" size="sm" iconStart="CircleHelp" ariaLabel="Help" />
            </>
          }
        />
        <div className="layout-app">
          <SideNav
            title="Agentix"
            mark="A"
            showHeader={false}
            radius="none"
            open={sidebarOpen}
            onOpenChange={setSidebarOpen}
            items={items}
            footer={footer}
          />
          {page === "overview" ? (
            <DashboardPattern breadcrumbs={trail} />
          ) : page === "activity" ? (
            <ActivityPattern breadcrumbs={trail} />
          ) : page === "inbox" ? (
            <InboxPattern breadcrumbs={trail} />
          ) : page === "settings" ? (
            <SettingsFormPattern breadcrumbs={trail} onCancel={() => go("overview")} />
          ) : page === "invite" ? (
            <InviteMembersPattern breadcrumbs={trail} />
          ) : page === "insights" ? (
            <AssistantWorkspacePattern breadcrumbs={trail} />
          ) : page === "research" ? (
            <EmptyFirstRunPattern breadcrumbs={trail} />
          ) : isListDetailPage(page) ? (
            <ListDetailPattern breadcrumbs={trail} selectedId={selectedProjectId(page)} />
          ) : current ? (
            <PlaceholderPage item={current} breadcrumbs={trail} />
          ) : (
            <DashboardPattern breadcrumbs={trail} />
          )}
        </div>
      </div>
    </div>
  );
}
