"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "agentic-ds-kit";
import { Empty } from "agentic-ds-kit";
import { PageHeader } from "agentic-ds-kit";
import type { PageHeaderProps } from "agentic-ds-kit";
import { SideNav } from "agentic-ds-kit";
import type { SideNavItemData } from "agentic-ds-kit";
// Content patterns are copy-in only (npx agentic-ds-kit add <id>), not package exports:
// render them from their kit source.
import { AppShellPattern } from "../../packages/kit/patterns/AppShellPattern";
import { DashboardPattern } from "../../packages/kit/patterns/DashboardPattern";
import { EmptyFirstRunPattern } from "../../packages/kit/patterns/EmptyFirstRunPattern";
import { ListDetailPattern } from "../../packages/kit/patterns/ListDetailPattern";
import { SettingsFormPattern } from "../../packages/kit/patterns/SettingsFormPattern";

const NAV_ITEMS: SideNavItemData[] = [
  { id: "overview", label: "Overview", icon: "House" },
  { id: "projects", label: "Projects", icon: "Folder", badge: "4" },
  { id: "tasks", label: "Open tasks", icon: "Check", badge: "18" },
  { id: "resources", label: "Resources", icon: "Layers" },
  { id: "tag-important", label: "Important", icon: "TriangleAlert", badge: "3" },
  { id: "tag-at-risk", label: "At risk", icon: "Info", badge: "5" },
  { id: "tag-shipped", label: "Shipped", icon: "CircleCheck", badge: "12" },
];

const NAV_FOOTER: SideNavItemData[] = [
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
  if (id === "research") return "empty";
  if (id === "projects" || id === "list-detail") return "list-detail";
  if (LIST_DETAIL_HASHES.has(id)) return id;
  return "dashboard";
}

function selectedProjectId(page: string) {
  if (page === "projects" || page === "list-detail") return "launch-brief";
  return page;
}

/** The four dashboard-family screens (its own variant names; the docs slugs are settings-form and empty-first-run). */
type DashboardRoute = "dashboard" | "settings" | "list-detail" | "empty";

/**
 * The content patterns (dashboard, settings-form, list-detail, empty-first-run) as one full
 * screen inside the app-shell example. `pattern` picks the start page; the nav moves between
 * them in place, as a real app would.
 */
export function DashboardScreen({
  pattern,
  view,
}: {
  pattern: DashboardRoute;
  view?: string;
}) {
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [page, setPage] = useState(
    pattern === "settings"
      ? "settings"
      : pattern === "empty"
        ? "research"
        : pattern === "list-detail"
          ? "projects"
          : view && hashForPage(view) === "dashboard"
            ? view
            : "overview",
  );

  const go = useCallback((id: string) => setPage(id), []);

  const items = useMemo(() => bindItems(NAV_ITEMS, page, go), [page, go]);
  const navFooter = useMemo(() => bindItems(NAV_FOOTER, page, go), [page, go]);
  const footer = useMemo(() => {
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
  }, [navFooter, sidebarOpen]);

  const allItems = [...NAV_ITEMS, ...NAV_FOOTER];
  const current = findItem(allItems, page);

  const trail = breadcrumbsFor(page, go);

  return (
    <>
      <AppShellPattern
        className="layout-shell--viewport"
        navLabel="Agentix"
        header={{
          title: "Agentix",
          mark: "A",
          searchPlaceholder: "Search",
          searchShortcut: "⌘K",
          searchValue: query,
          onSearch: setQuery,
          actions: (
            <>
              <Button appearance="ghost" mode="neutral" size="sm" iconStart="Bell" ariaLabel="Notifications" />
              <Button appearance="ghost" mode="neutral" size="sm" iconStart="CircleHelp" ariaLabel="Help" />
            </>
          ),
        }}
        nav={(placement) =>
          placement === "rail" ? (
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
          ) : (
            // In the Drawer the nav is always expanded, so it drops the collapse toggle.
            <SideNav title="Agentix" mark="A" showHeader={false} radius="md" open items={items} footer={navFooter} />
          )
        }
      >
        {page === "overview" ? (
          <DashboardPattern breadcrumbs={trail} />
        ) : page === "settings" ? (
          <SettingsFormPattern breadcrumbs={trail} onCancel={() => go("overview")} />
        ) : page === "research" ? (
          <EmptyFirstRunPattern breadcrumbs={trail} />
        ) : isListDetailPage(page) ? (
          <ListDetailPattern breadcrumbs={trail} selectedId={selectedProjectId(page)} />
        ) : current ? (
          <PlaceholderPage item={current} breadcrumbs={trail} />
        ) : (
          <DashboardPattern breadcrumbs={trail} />
        )}
      </AppShellPattern>
      </>
  );
}
