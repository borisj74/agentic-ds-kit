"use client";

import { useState } from "react";
import {
  AppHeader,
  Avatar,
  Badge,
  Button,
  Empty,
  PageHeader,
  Select,
  SideNavBrand,
  SideNavHeader,
  SideNavItem,
  SideNavNav,
  SideNavRoot,
  SideNavSection,
  SideNavSlot,
} from "agentic-ds-kit";
import type { SideNavGroup, SideNavItemData } from "agentic-ds-kit";
import { AppShellPattern, useAppShell, type AppShellNavPlacement } from "../../packages/kit/patterns/AppShellPattern";
import styles from "../playground.module.css";

const NAV_ITEMS: SideNavItemData[] = [
  { id: "overview", label: "Overview", icon: "House" },
  { id: "inbox", label: "Inbox", icon: "Mail", badge: "7" },
  { id: "projects", label: "Projects", icon: "Folder", badge: "4" },
  { id: "tasks", label: "Open tasks", icon: "Check", badge: "18" },
  { id: "insights", label: "Insights", icon: "Sparkles" },
];

const NAV_FOOTER: SideNavItemData[] = [{ id: "settings", label: "Settings", icon: "Settings" }];

/**
 * Responsive app shell in the playground browser frame. Narrow the window
 * below 64rem to swap SideNav for the Menu button and left Drawer.
 */
export function AppShellDemo() {
  const [page, setPage] = useState("overview");
  const [query, setQuery] = useState("");
  const [navOpen, setNavOpen] = useState(true);

  const bind = (items: SideNavItemData[]) =>
    items.map((item) => ({ ...item, active: item.id === page, onClick: () => setPage(item.id) }));
  const current = [...NAV_ITEMS, ...NAV_FOOTER].find((item) => item.id === page) ?? NAV_ITEMS[0];

  return (
    <div className={styles.browser}>
      <div className={styles.browserChrome} aria-hidden="true">
        <div className={styles.traffic}>
          <span className={`${styles.trafficDot} ${styles.trafficClose}`} />
          <span className={`${styles.trafficDot} ${styles.trafficMin}`} />
          <span className={`${styles.trafficDot} ${styles.trafficMax}`} />
        </div>
        <div className={styles.urlBar}>{`app.operations.dev/${page}`}</div>
      </div>
      <AppShellPattern
        header={{
          title: "Agentix",
          mark: "A",
          searchPlaceholder: "Search",
          searchShortcut: "⌘K",
          searchValue: query,
          onSearch: setQuery,
          actions: <Button variant="tertiary" size="sm" iconStart="Bell" ariaLabel="Notifications" />,
        }}
        nav={{
          title: "Agentix",
          mark: "A",
          open: navOpen,
          onOpenChange: setNavOpen,
          items: bind(NAV_ITEMS),
          footer: bind(NAV_FOOTER),
        }}
      >
        <div className="layout-canvas layout-canvas--sticky-header">
          <div className="layout-header">
            <PageHeader title={current.label} subtitle="Resize the window across 64rem to see the shell switch." />
          </div>
          <div className="layout-content">
            <Empty
              title={`${current.label} goes here`}
              description="The shell owns the chrome. Pages render their own content and their one primary action."
              icon={current.icon}
              outlined
            />
          </div>
        </div>
      </AppShellPattern>
    </div>
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
 * Built nav from the SideNav blocks (named exports, so a Server Component could render it too).
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
 * The same shell with chrome built from blocks: AppHeader.Root with a Beta Badge
 * and Avatar, and a grouped nav from the SideNav blocks with a workspace Select.
 */
export function AppShellCustomDemo() {
  const [page, setPage] = useState("home");
  const [query, setQuery] = useState("");
  const current = CUSTOM_ITEMS.find((item) => item.id === page) ?? CUSTOM_ITEMS[0];

  return (
    <div className={styles.browser}>
      <div className={styles.browserChrome} aria-hidden="true">
        <div className={styles.traffic}>
          <span className={`${styles.trafficDot} ${styles.trafficClose}`} />
          <span className={`${styles.trafficDot} ${styles.trafficMin}`} />
          <span className={`${styles.trafficDot} ${styles.trafficMax}`} />
        </div>
        <div className={styles.urlBar}>{`app.agentix.dev/${page}`}</div>
      </div>
      <AppShellPattern
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
              <Button variant="tertiary" size="sm" iconStart="CircleHelp" ariaLabel="Help" />
              <Avatar name="Maya Chen" size="sm" />
            </AppHeader.Actions>
          </AppHeader.Root>
        }
        nav={<CustomNav page={page} onPick={setPage} />}
      >
        <div className="layout-canvas layout-canvas--sticky-header">
          <div className="layout-header">
            <PageHeader title={current.label} subtitle="Header and nav built from blocks; the shell still owns layout and the Drawer." />
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
    </div>
  );
}

/**
 * Header-less nav built from blocks, taking its placement from the shell's nav function.
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
export function AppShellBuiltNavDemo() {
  const [page, setPage] = useState("home");
  const current = CUSTOM_ITEMS.find((item) => item.id === page) ?? CUSTOM_ITEMS[0];

  return (
    <div className={styles.browser}>
      <div className={styles.browserChrome} aria-hidden="true">
        <div className={styles.traffic}>
          <span className={`${styles.trafficDot} ${styles.trafficClose}`} />
          <span className={`${styles.trafficDot} ${styles.trafficMin}`} />
          <span className={`${styles.trafficDot} ${styles.trafficMax}`} />
        </div>
        <div className={styles.urlBar}>{`app.agentix.dev/${page}`}</div>
      </div>
      <AppShellPattern
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
    </div>
  );
}
