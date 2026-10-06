"use client";

import { useState } from "react";
import { AppHeader } from "../../AppHeader";
import { AppNav } from "../../AppNav";
import { Button } from "../../Button";
import { Drawer } from "../../Drawer";
import { ListView } from "../../ListView";
import { PageHeader } from "../../PageHeader";
import type { PageHeaderProps } from "../../PageHeader";
import styles from "./MobilePattern.module.css";

const MENU_ITEMS = [
  { href: "/patterns#mobile", label: "Home", active: true },
  { href: "/patterns#planner", label: "Planner" },
  { href: "/patterns#tasks", label: "Tasks" },
  { href: "/patterns#inbox", label: "Inbox" },
  { href: "/patterns#settings", label: "Settings" },
];

const TODAY_ITEMS = [
  {
    id: "launch-brief",
    primary: "Close launch brief comments",
    secondary: "Maya Chen · Today",
    name: "Maya Chen",
    badge: "High",
    badgeTone: "danger" as const,
  },
  {
    id: "release-notes",
    primary: "Confirm known-issues list",
    secondary: "Jordan Lee · Today",
    name: "Jordan Lee",
    badge: "Medium",
    badgeTone: "warning" as const,
  },
  {
    id: "insights-share",
    primary: "Send the insights digest",
    secondary: "Iris Okafor · Today",
    name: "Iris Okafor",
    badge: "Medium",
    badgeTone: "warning" as const,
  },
];

export interface MobilePatternProps {
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
}

export function MobilePattern({ breadcrumbs }: MobilePatternProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.stage}>
      <div className={styles.phone}>
        <AppHeader
          title="Agentix"
          mark="A"
          search={false}
          actions={
            <>
              <Button
                variant="tertiary"
                size="sm"
                iconStart="Bell"
                ariaLabel="Notifications"
              />
              <Button
                variant="tertiary"
                size="sm"
                iconStart={menuOpen ? "X" : "Menu"}
                ariaLabel={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((open) => !open)}
              />
            </>
          }
        />
        <div className={`${styles.canvas} layout-canvas layout-canvas--sticky-header`}>
          <div className="layout-header">
            <PageHeader
              title="Today"
              subtitle="Three tasks before standup."
              breadcrumbs={breadcrumbs}
            />
          </div>
          <div className="layout-content">
            <ListView
              label="Today's tasks"
              size="md"
              items={TODAY_ITEMS}
              empty={{ title: "Nothing due today", icon: "Check", outlined: true }}
            />
          </div>
        </div>
      </div>
      <Drawer
        open={menuOpen}
        title="Menu"
        description="Go to a workspace screen."
        side="left"
        size="sm"
        onClose={() => setMenuOpen(false)}
      >
        <div
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) setMenuOpen(false);
          }}
        >
          <AppNav title="Agentix" items={MENU_ITEMS} />
        </div>
      </Drawer>
    </div>
  );
}
