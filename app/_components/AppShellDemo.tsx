"use client";

import { useState } from "react";
import { AppShellPattern, Button, Empty, PageHeader } from "agentic-ds-kit";
import type { SideNavItem } from "agentic-ds-kit";
import styles from "../playground.module.css";

const NAV_ITEMS: SideNavItem[] = [
  { id: "overview", label: "Overview", icon: "House" },
  { id: "inbox", label: "Inbox", icon: "Mail", badge: "7" },
  { id: "projects", label: "Projects", icon: "Folder", badge: "4" },
  { id: "tasks", label: "Open tasks", icon: "Check", badge: "18" },
  { id: "insights", label: "Insights", icon: "Sparkles" },
];

const NAV_FOOTER: SideNavItem[] = [{ id: "settings", label: "Settings", icon: "Settings" }];

/**
 * Responsive app shell in the playground browser frame. Narrow the window
 * below 64rem to swap SideNav for the Menu button and left Drawer.
 */
export function AppShellDemo() {
  const [page, setPage] = useState("overview");
  const [query, setQuery] = useState("");
  const [navOpen, setNavOpen] = useState(true);

  const bind = (items: SideNavItem[]) =>
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
