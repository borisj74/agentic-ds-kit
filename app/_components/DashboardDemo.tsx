"use client";

import { Building2 } from "lucide-react";
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
import { DASHBOARD_DEMO_SHELL, DashboardPattern } from "../../packages/kit/patterns/DashboardPattern";
import type { AppShellNav, AppShellWorkspace } from "../../packages/kit/patterns/AppShellPattern";
import { DemoLogo } from "./AppShellDemo";
import type { DashboardPatternProps } from "../../packages/kit/patterns/DashboardPattern";
import { sampleExchange } from "../../packages/kit/patterns/DashboardPattern/dashboard-data";
import { EMPTY_FIRST_RUN_DEMO_SHELL, EmptyFirstRunPattern } from "../../packages/kit/patterns/EmptyFirstRunPattern";
import { ListDetailPattern } from "../../packages/kit/patterns/ListDetailPattern";
import { SettingsFormPattern } from "../../packages/kit/patterns/SettingsFormPattern";

const NAV_ITEMS: SideNavItemData[] = [
  { id: "overview", label: "Overview", icon: "House" },
  { id: "projects", label: "Invoices", icon: "FileText", badge: "11" },
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

function isListDetailPage(id: string) {
  return LIST_DETAIL_PAGES.has(id);
}

/** The list-detail screens (lib/pattern-screens PATTERN_VIEWS["list-detail"]) as the open invoice. */
function listDetailSelectedId(view?: string): string | undefined {
  return view === "none" ? undefined : "INV-1842";
}

/** The dashboard's screens (lib/pattern-screens PATTERN_VIEWS.dashboard) as pattern props. */
function dashboardViewProps(view?: string): DashboardPatternProps {
  switch (view) {
    case "compare":
      return { defaultCompare: true };
    case "metric":
      return { defaultSelectedMetric: "overdue", defaultCompare: true };
    case "empty":
      return { metrics: [] };
    case "loading":
      return { loading: true };
    case "chat":
      return {
        panel: {
          defaultOpen: true,
          defaultTab: "ask",
          defaultContext: "MRR movements · Last 3 months",
          defaultMessages: sampleExchange("3m"),
        },
      };
    default:
      return {};
  }
}

/* The list-detail board's shell: no top bar when wide, a Northwind SideNav with Work > Home and
   Billing (Invoices, Payments, Plans) and the signed-in account at the foot. Below the breakpoint the
   nav moves into the Drawer behind the same Agentix-style top bar the other screens use. */
const LIST_DETAIL_NAV: SideNavItemData[] = [
  { id: "home", label: "Home", icon: "House" },
  {
    id: "billing",
    label: "Billing",
    icon: "CreditCard",
    items: [
      { id: "invoices", label: "Invoices", badge: "48", active: true },
      { id: "payments", label: "Payments" },
      { id: "plans", label: "Plans" },
    ],
  },
];

export function ListDetailScreen({ view }: { view?: string }) {
  const groups = [{ label: "Work", items: LIST_DETAIL_NAV }];
  const account = { name: "Maya Chen", initials: "MC" };
  return (
    <AppShellPattern
      className="layout-shell--viewport"
      layout="flat"
      navLabel="Northwind"
      markIcon={Building2}
      nav={(placement) => (
        <SideNav
          title="Northwind"
          showHeader={false}
          // The board's rail has the brand and no Close toggle; the Drawer has its own title.
          beforeGroups={
            placement === "rail" ? (
              <SideNav.Header>
                <SideNav.Brand title="Northwind" markIcon={Building2} />
              </SideNav.Header>
            ) : undefined
          }
          radius={placement === "rail" ? "none" : "md"}
          open
          groups={groups}
          account={account}
        />
      )}
    >
      <ListDetailPattern selectedId={listDetailSelectedId(view)} />
    </AppShellPattern>
  );
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

  // The dashboard brings its own shell (header-less inset, with the Ask work panel); it takes this demo's nav.
  if (page === "overview") {
    return (
      <DashboardPattern
        {...dashboardViewProps(pattern === "dashboard" ? view : undefined)}
        shell={{
          // The app-shell example's logo, so the dashboard matches the App shell screens.
          workspace: { ...(DASHBOARD_DEMO_SHELL.workspace as AppShellWorkspace), mark: <DemoLogo /> },
          nav: { ...(DASHBOARD_DEMO_SHELL.nav as AppShellNav), markIcon: <DemoLogo onBrand /> },
        }}
      />
    );
  }

  // Empty first run brings its own shell too (a new Northwind workspace, Invoices selected).
  if (page === "research") {
    return (
      <EmptyFirstRunPattern
        shell={{
          workspace: { ...(EMPTY_FIRST_RUN_DEMO_SHELL.workspace as AppShellWorkspace), mark: <DemoLogo /> },
          nav: { ...(EMPTY_FIRST_RUN_DEMO_SHELL.nav as AppShellNav), markIcon: <DemoLogo onBrand /> },
        }}
      />
    );
  }

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
        {page === "settings" ? (
          <SettingsFormPattern breadcrumbs={trail} />
        ) : isListDetailPage(page) ? (
          <ListDetailPattern selectedId={listDetailSelectedId(pattern === "list-detail" ? view : undefined)} />
        ) : current ? (
          <PlaceholderPage item={current} breadcrumbs={trail} />
        ) : null}
      </AppShellPattern>
      </>
  );
}
