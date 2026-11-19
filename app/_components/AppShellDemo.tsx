"use client";

import { useEffect, useState } from "react";
import {
  AppHeader,
  Avatar,
  Badge,
  Button,
  Empty,
  ListView,
  PageHeader,
  Select,
  SideNavBrand,
  SideNavHeader,
  SideNavItem,
  SideNavNav,
  SideNavRoot,
  SideNavSection,
  SideNavSlot,
  Timeline,
} from "agentic-ds-kit";
import type { DropdownMenuGroup, SideNavGroup, SideNavItemData } from "agentic-ds-kit";
import { AppShellPattern, useAppShell, type AppShellNavPlacement } from "../../packages/kit/patterns/AppShellPattern";

const NAV_ITEMS: SideNavItemData[] = [
  { id: "overview", label: "Overview", icon: "House" },
  { id: "inbox", label: "Inbox", icon: "Mail", badge: "7" },
  { id: "tasks", label: "Open tasks", icon: "Check", badge: "18" },
  { id: "insights", label: "Insights", icon: "Sparkles" },
];

const PROJECTS: SideNavItemData[] = [
  { id: "pricing", label: "Pricing study", icon: "Folder" },
  { id: "triage", label: "Support triage", icon: "Folder" },
  { id: "welcome", label: "Welcome emails", icon: "Folder" },
];

const ACCOUNT_MENU: DropdownMenuGroup[] = [
  {
    items: [
      { id: "settings", label: "Settings", icon: "Settings" },
      {
        id: "theme",
        label: "Theme",
        icon: "Moon",
        submenu: [
          {
            items: [
              { id: "theme-light", label: "Light" },
              { id: "theme-dark", label: "Dark" },
              { id: "theme-system", label: "Match device", selected: true },
            ],
          },
        ],
      },
    ],
  },
  { items: [{ id: "sign-out", label: "Sign out", icon: "LogOut" }] },
];

const PANEL_TABS = [
  {
    id: "details",
    label: "Details",
    content: (
      <ListView
        label="Details"
        size="sm"
        items={[
          { id: "owner", primary: "Owner", secondary: "Rin Okafor" },
          { id: "state", primary: "State", secondary: "In review", badge: "2 open", badgeTone: "info" },
          { id: "updated", primary: "Last change", secondary: "Today, 09:40" },
        ]}
      />
    ),
  },
  {
    id: "activity",
    label: "Activity",
    content: (
      <Timeline
        label="Activity"
        items={[
          { id: "a1", status: "now", title: "Draft summary posted", body: "Waiting on a second reviewer" },
          { id: "a2", status: "next", title: "Rin asked for sources", body: "Two links added" },
          { id: "a3", status: "later", title: "Project created" },
        ]}
      />
    ),
  },
];

type ShellView = "flat" | "inset" | "collapsed" | "panel" | "drawer";

const VIEW_NOTES: Record<ShellView, string> = {
  flat: "Flat: the nav sits on a soft neutral fill and the page runs edge to edge.",
  inset: "Inset: the nav shares the page background and the page sits in a raised card.",
  collapsed: "The rail shows icons only; hover or focus an icon for its name.",
  panel: "A work panel with tabs on the right. Close it, or use the panel button in the top bar.",
  drawer: "Below 64rem the nav opens in a left Drawer from the Menu button.",
};

/** Opens the nav Drawer on narrow screens, so the mobile view shows it. */
function OpenDrawerOnNarrow() {
  const shell = useAppShell();
  const narrow = shell?.narrow;
  const openNav = shell?.openNav;
  useEffect(() => {
    if (narrow) openNav?.();
  }, [narrow]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/**
 * Responsive app shell in the playground browser frame, from props: header, nav, a Projects
 * group, the account menu, and an optional work panel. Narrow the window below 64rem to swap
 * SideNav for the Menu button and left Drawer.
 */
function AppShellDefault({ view }: { view: ShellView }) {
  const [page, setPage] = useState("overview");
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState(view === "collapsed");

  const bind = (items: SideNavItemData[]) =>
    items.map((item) => ({ ...item, active: item.id === page, onClick: () => setPage(item.id) }));
  const current = [...NAV_ITEMS, ...PROJECTS].find((item) => item.id === page) ?? NAV_ITEMS[0];

  return (
    <AppShellPattern
      className="layout-shell--viewport"
      layout={view === "inset" ? "inset" : "flat"}
      collapsed={view === "collapsed" ? collapsed : undefined}
      onCollapsedChange={view === "collapsed" ? setCollapsed : undefined}
      header={{
        title: "Agentix",
        mark: "A",
        searchPlaceholder: "Search",
        searchShortcut: "⌘K",
        searchValue: query,
        onSearch: setQuery,
        actions: <Button appearance="ghost" mode="neutral" size="sm" iconStart="Bell" ariaLabel="Notifications" />,
      }}
      nav={{ title: "Agentix", mark: "A", items: bind(NAV_ITEMS) }}
      projects={{ items: bind(PROJECTS), onNew: () => setPage("overview") }}
      account={{ name: "Rin Okafor", email: "rin.okafor@example.com", menu: ACCOUNT_MENU }}
      workPanel={view === "panel" || view === "drawer" ? { title: "Context", tabs: PANEL_TABS, defaultOpen: view === "panel" } : undefined}
    >
      {view === "drawer" ? <OpenDrawerOnNarrow /> : null}
      <main className="layout-canvas layout-canvas--sticky-header">
        <div className="layout-header">
          <PageHeader title={current.label} subtitle={VIEW_NOTES[view]} />
        </div>
        <div className="layout-content">
          <Empty
            title={`${current.label} goes here`}
            description="The shell owns the chrome. Pages render their own content and their one primary action."
            icon={current.icon}
            outlined
          />
        </div>
      </main>
    </AppShellPattern>
  );
}

const CUSTOM_GROUPS: SideNavGroup[] = [
  {
    label: "Work",
    items: [
      { id: "home", label: "Home", icon: "House" },
      { id: "reviews", label: "Reviews", icon: "Check", badge: "3" },
      { id: "runs", label: "Agent runs", icon: "Sparkles" },
    ],
  },
  {
    label: "Library",
    items: [
      { id: "docs", label: "Docs", icon: "Folder" },
      { id: "people", label: "People", icon: "User" },
    ],
  },
];

const CUSTOM_ITEMS = CUSTOM_GROUPS.flatMap((group) => group.items);

const WORKSPACES = [
  { value: "agentix", label: "Agentix" },
  { value: "northwind", label: "Northwind" },
];

/**
 * Built nav from the SideNav compose parts (named exports, so a Server Component could render it too).
 * One nav adapts to where the shell renders it: flush in the rail, forced open in the Drawer.
 */
function CustomNav({ page, onPick }: { page: string; onPick: (id: string) => void }) {
  const shell = useAppShell();
  const inDrawer = shell?.navPlacement === "drawer";

  return (
    <SideNavRoot aria-label="Agentix" radius={inDrawer ? "md" : "none"} open>
      <SideNavSlot>
        <Select id={inDrawer ? "shell-ws-drawer" : "shell-ws"} size="sm" ariaLabel="Workspace" defaultValue="agentix" options={WORKSPACES} />
      </SideNavSlot>
      <SideNavNav>
        {CUSTOM_GROUPS.map((group) => (
          <SideNavSection key={group.label} label={group.label}>
            {group.items.map((item) => (
              <SideNavItem
                key={item.id}
                label={item.label}
                icon={item.icon}
                badge={item.badge}
                active={item.id === page}
                onClick={() => onPick(item.id)}
              />
            ))}
          </SideNavSection>
        ))}
      </SideNavNav>
    </SideNavRoot>
  );
}

/**
 * The same shell with chrome built from compose parts: AppHeader.Root with a Beta Badge
 * and Avatar, and a grouped nav from the SideNav compose parts with a workspace Select.
 */
function AppShellCustom() {
  const [page, setPage] = useState("home");
  const [query, setQuery] = useState("");
  const current = CUSTOM_ITEMS.find((item) => item.id === page) ?? CUSTOM_ITEMS[0];

  return (
    <>
      <AppShellPattern
        className="layout-shell--viewport"
        navLabel="Agentix"
        header={
          <AppHeader.Root ariaLabel="Agentix">
            <AppHeader.Brand
              logo={
                <AppShellPattern.MenuButton>
                  <AppHeader.Mark>A</AppHeader.Mark>
                </AppShellPattern.MenuButton>
              }
            >
              <AppHeader.Title>Agentix</AppHeader.Title>
              <Badge tone="info" size="sm">Beta</Badge>
            </AppHeader.Brand>
            <AppHeader.Search placeholder="Search runs" shortcut="⌘K" value={query} onSearch={setQuery} />
            <AppHeader.Actions>
              <Button appearance="ghost" mode="neutral" size="sm" iconStart="CircleHelp" ariaLabel="Help" />
              <Avatar name="Maya Chen" size="sm" />
            </AppHeader.Actions>
          </AppHeader.Root>
        }
        nav={<CustomNav page={page} onPick={setPage} />}
      >
        <div className="layout-canvas layout-canvas--sticky-header">
          <div className="layout-header">
            <PageHeader title={current.label} subtitle="Header and nav built from compose parts; the shell still owns layout and the Drawer." />
          </div>
          <div className="layout-content">
            <Empty
              title={`${current.label} goes here`}
              description="Below 64rem the Menu Button in the brand cell opens this nav in the left Drawer."
              icon={current.icon}
              outlined
            />
          </div>
        </div>
      </AppShellPattern>
      </>
  );
}

/**
 * Header-less nav built from compose parts, taking its placement from the shell's nav function.
 * With no top bar it shows its own brand in the wide rail; in the Drawer it drops the header.
 */
function BrandedNav({ placement, page, onPick }: { placement: AppShellNavPlacement; page: string; onPick: (id: string) => void }) {
  const shell = useAppShell();
  const inDrawer = placement === "drawer";
  const showBrand = !inDrawer && !shell?.hasHeader;

  return (
    <SideNavRoot aria-label="Agentix" radius={inDrawer ? "md" : "none"} open>
      {showBrand ? (
        <SideNavHeader>
          <SideNavBrand title="Agentix" markIcon="Sparkles" />
        </SideNavHeader>
      ) : null}
      <SideNavNav>
        {CUSTOM_GROUPS.map((group) => (
          <SideNavSection key={group.label} label={group.label}>
            {group.items.map((item) => (
              <SideNavItem
                key={item.id}
                label={item.label}
                icon={item.icon}
                badge={item.badge}
                active={item.id === page}
                onClick={() => onPick(item.id)}
              />
            ))}
          </SideNavSection>
        ))}
      </SideNavNav>
    </SideNavRoot>
  );
}

/**
 * No header and a built nav (a function of placement). The shell cannot read a mark from a
 * built nav, so `markIcon` on the shell gives the default narrow top bar its brand.
 */
function AppShellBuiltNav() {
  const [page, setPage] = useState("home");
  const current = CUSTOM_ITEMS.find((item) => item.id === page) ?? CUSTOM_ITEMS[0];

  return (
    <>
      <AppShellPattern
        className="layout-shell--viewport"
        navLabel="Agentix"
        markIcon="Sparkles"
        nav={(placement) => <BrandedNav placement={placement} page={page} onPick={setPage} />}
      >
        <div className="layout-canvas layout-canvas--sticky-header">
          <div className="layout-header">
            <PageHeader title={current.label} subtitle="No header: the nav carries the brand when wide, markIcon brands the narrow top bar." />
          </div>
          <div className="layout-content">
            <Empty
              title={`${current.label} goes here`}
              description="Below 64rem the default narrow top bar shows the Menu Button, the Sparkles mark, and Agentix."
              icon={current.icon}
              outlined
            />
          </div>
        </div>
      </AppShellPattern>
      </>
  );
}

const SHELL_VIEWS: ShellView[] = ["flat", "inset", "collapsed", "panel", "drawer"];

/** The app-shell example as a full screen. `view`: a props view (flat, inset, collapsed, panel, drawer), custom (built chrome) or built-nav (no header). */
export function AppShellScreen({ view = "flat" }: { view?: string }) {
  if (view === "custom") return <AppShellCustom />;
  if (view === "built-nav") return <AppShellBuiltNav />;
  return <AppShellDefault view={SHELL_VIEWS.includes(view as ShellView) ? (view as ShellView) : "flat"} />;
}
