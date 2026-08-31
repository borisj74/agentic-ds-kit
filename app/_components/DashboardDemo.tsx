"use client";

import { useMemo, useState } from "react";
import { ActivityView } from "./ActivityView";
import { InboxView } from "./InboxView";
import { AppHeader } from "@/ui/AppHeader";
import { Button } from "@/ui/Button";
import { Empty } from "@/ui/Empty";
import { PageHeader } from "@/ui/PageHeader";
import type { PageHeaderProps } from "@/ui/PageHeader";
import { DashboardPattern } from "@/ui/patterns/DashboardPattern";
import { SideNav } from "@/ui/SideNav";
import type { SideNavGroup, SideNavItem } from "@/ui/SideNav";
import styles from "../playground.module.css";

const NAV_GROUPS: SideNavGroup[] = [
  {
    label: "Workspace",
    items: [
      { id: "overview", label: "Overview", icon: "House" },
      { id: "activity", label: "Activity", icon: "ChartBar", badge: "6" },
      { id: "inbox", label: "Inbox", icon: "Mail", badge: "7" },
    ],
  },
  {
    label: "Sprint 24",
    items: [
      {
        id: "projects",
        label: "Projects",
        icon: "Folder",
        badge: "4",
        items: [
          { id: "launch-brief", label: "Launch brief", icon: "File" },
          { id: "qa-checklist", label: "QA checklist", icon: "CircleCheck" },
          { id: "release-notes", label: "Release notes", icon: "File" },
        ],
      },
      { id: "tasks", label: "Open tasks", icon: "Check", badge: "18" },
      { id: "insights", label: "Insights", icon: "Sparkles" },
      {
        id: "resources",
        label: "Resources",
        icon: "Layers",
        items: [
          { id: "support-macros", label: "Support macros", icon: "File" },
          { id: "research", label: "User research", icon: "User" },
        ],
      },
    ],
  },
  {
    label: "Tags",
    items: [
      { id: "tag-important", label: "Important", icon: "TriangleAlert", badge: "3" },
      { id: "tag-at-risk", label: "At risk", icon: "Info", badge: "5" },
      { id: "tag-shipped", label: "Shipped", icon: "CircleCheck", badge: "12" },
    ],
  },
];

const NAV_FOOTER: SideNavItem[] = [
  { id: "invite", label: "Invite members", icon: "CirclePlus" },
  { id: "settings", label: "Settings", icon: "Settings" },
];

function bindItems(items: SideNavItem[], page: string, go: (id: string) => void): SideNavItem[] {
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

function findItem(items: SideNavItem[], id: string): SideNavItem | undefined {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.items) {
      const nested = findItem(item.items, id);
      if (nested) return nested;
    }
  }
  return undefined;
}

function findTrail(items: SideNavItem[], id: string, ancestors: SideNavItem[] = []): SideNavItem[] | null {
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

  for (const group of NAV_GROUPS) {
    const path = findTrail(group.items, page);
    if (!path) continue;

    const crumbs: NonNullable<PageHeaderProps["breadcrumbs"]> = [home, workspace];
    if (group.label !== "Workspace") crumbs.push({ label: group.label });
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
  item: SideNavItem;
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

export function DashboardDemo() {
  const [page, setPage] = useState("overview");
  const [query, setQuery] = useState("");

  const groups = useMemo(
    () => NAV_GROUPS.map((group) => ({ ...group, items: bindItems(group.items, page, setPage) })),
    [page],
  );
  const footer = useMemo(() => bindItems(NAV_FOOTER, page, setPage), [page]);

  const allItems = [...NAV_GROUPS.flatMap((group) => group.items), ...NAV_FOOTER];
  const current = findItem(allItems, page);

  const path =
    page === "overview"
      ? "app.operations.dev/overview"
      : page === "activity"
        ? "app.operations.dev/activity"
        : `app.operations.dev/${page}`;

  const trail = breadcrumbsFor(page, setPage);

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
      <div className={styles.product}>
        <AppHeader
          title="Agentix"
          mark="A"
          radius="md"
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
        <div className={styles.productBody}>
          <SideNav title="Agentix" mark="A" showHeader={false} radius="md" groups={groups} footer={footer} />
          <div className={styles.pane}>
            {page === "overview" ? (
              <DashboardPattern breadcrumbs={trail} />
            ) : page === "activity" ? (
              <ActivityView breadcrumbs={trail} />
            ) : page === "inbox" ? (
              <InboxView breadcrumbs={trail} />
            ) : current ? (
              <PlaceholderPage item={current} breadcrumbs={trail} />
            ) : (
              <DashboardPattern breadcrumbs={trail} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
