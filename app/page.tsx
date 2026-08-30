import { Chat } from "@/ui/Chat";
import { DashboardPattern } from "@/ui/patterns/DashboardPattern";
import { SideNav } from "@/ui/SideNav";
import type { SideNavGroup, SideNavItem } from "@/ui/SideNav";
import styles from "./playground.module.css";

const NAV_GROUPS: SideNavGroup[] = [
  {
    label: "Workspace",
    items: [
      { id: "overview", label: "Overview", href: "/", icon: "House", active: true },
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

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.opsShell}>
        <div className={styles.ops}>
          <SideNav title="Operations" mark="O" groups={NAV_GROUPS} footer={NAV_FOOTER} />
          <DashboardPattern />
          <aside className={styles.rail}>
            <Chat
              title="Workspace assistant"
              status="Ready"
              placeholder="Message the assistant..."
              menuItems={[{ label: "Refresh" }]}
              suggestions={["Assign Final QA", "Draft sprint update"]}
              messages={[
                {
                  role: "assistant",
                  content:
                    "I can summarize open work, draft updates, or assign owners from this sprint.",
                  timestamp: "Just now",
                },
                {
                  role: "user",
                  content: "Who still needs an owner?",
                  timestamp: "Just now",
                },
                {
                  role: "assistant",
                  content: "QA checklist is still unassigned. Want me to draft an ask for Maya?",
                  timestamp: "Just now",
                },
              ]}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
