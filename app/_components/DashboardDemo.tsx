import { AppHeader } from "@/ui/AppHeader";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { DashboardPattern } from "@/ui/patterns/DashboardPattern";
import { SideNav } from "@/ui/SideNav";
import type { SideNavGroup, SideNavItem } from "@/ui/SideNav";
import styles from "../playground.module.css";

const NAV_GROUPS: SideNavGroup[] = [
  {
    label: "Workspace",
    items: [
      { id: "overview", label: "Overview", href: "/patterns#dashboard", icon: "House", active: true },
      { id: "activity", label: "Activity", icon: "ChartBar" },
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
        items: [
          { id: "launch-brief", label: "Launch brief", icon: "File" },
          { id: "qa-checklist", label: "QA checklist", icon: "CircleCheck" },
          { id: "release-notes", label: "Release notes", icon: "File" },
        ],
      },
      { id: "tasks", label: "Open tasks", icon: "Check", badge: "18" },
      { id: "insights", label: "Insights", icon: "Sparkles" },
      { id: "resources", label: "Resources", icon: "Layers" },
    ],
  },
  {
    label: "Tags",
    items: [
      { id: "tag-important", label: "Important", icon: "Star", badge: "3" },
      { id: "tag-at-risk", label: "At risk", icon: "TriangleAlert", badge: "5" },
    ],
  },
];

const NAV_FOOTER: SideNavItem[] = [
  { id: "invite", label: "Invite members", icon: "CirclePlus" },
  { id: "settings", label: "Settings", icon: "Settings" },
];

export function DashboardDemo() {
  return (
    <div className={styles.browser}>
      <div className={styles.browserChrome} aria-hidden="true">
        <div className={styles.traffic}>
          <span className={`${styles.trafficDot} ${styles.trafficClose}`} />
          <span className={`${styles.trafficDot} ${styles.trafficMin}`} />
          <span className={`${styles.trafficDot} ${styles.trafficMax}`} />
        </div>
        <div className={styles.urlBar}>app.operations.dev/overview</div>
      </div>
      <div className={styles.product}>
        <AppHeader
          title="Operations"
          mark="O"
          searchPlaceholder="Search"
          searchShortcut="⌘K"
          actions={
            <>
              <Button variant="tertiary" size="sm" iconStart="Bell" ariaLabel="Notifications" />
              <Button variant="tertiary" size="sm" iconStart="CircleHelp" ariaLabel="Help" />
              <Avatar name="Maya Chen" size="sm" src="/faces/maya-chen.jpg" />
            </>
          }
        />
        <div className={`layout-app ${styles.demo}`}>
          <SideNav title="Operations" mark="O" showHeader={false} groups={NAV_GROUPS} footer={NAV_FOOTER} />
          <DashboardPattern />
        </div>
      </div>
    </div>
  );
}
