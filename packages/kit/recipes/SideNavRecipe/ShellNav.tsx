"use client";

import { useState, type ReactNode } from "react";
import { SideNav, type SideNavItem } from "../../ui/SideNav";
import { useAppShell } from "../../ui/patterns/AppShellPattern";

const ITEMS: SideNavItem[] = [
  { id: "overview", label: "Overview", icon: "House", href: "/" },
  { id: "inbox", label: "Inbox", icon: "Mail", badge: "7", href: "/inbox" },
  { id: "projects", label: "Projects", icon: "Folder", href: "/projects" },
  { id: "insights", label: "Insights", icon: "Sparkles", href: "/insights" },
];

const FOOTER: SideNavItem[] = [{ id: "settings", label: "Settings", icon: "Settings", href: "/settings" }];

export interface ShellNavProps {
  /** Product name: the nav landmark label and the brand header when used on its own. */
  title?: string;
  mark?: string;
  /** Rows. Set `active` on the current one (aria-current="page"). */
  items?: SideNavItem[];
  footer?: SideNavItem[];
  /** Pinned above the rows, e.g. a workspace switcher. */
  beforeGroups?: ReactNode;
}

/**
 * SideNav for your app, ready to edit. On its own it is a closeable rail with a brand
 * header. As `<AppShellPattern nav={<ShellNav />} …>` it drops the header (AppHeader has
 * the brand), sits flush in the rail when wide, and stays expanded inside the Drawer.
 */
export function ShellNav({ title = "Acme", mark, items = ITEMS, footer = FOOTER, beforeGroups }: ShellNavProps) {
  const shell = useAppShell();
  const inDrawer = shell?.navPlacement === "drawer";
  const [open, setOpen] = useState(true);

  return (
    <SideNav
      title={title}
      mark={mark}
      items={items}
      footer={footer}
      beforeGroups={beforeGroups}
      showHeader={!shell}
      radius={shell && !inDrawer ? "none" : "md"}
      open={inDrawer || open}
      onOpenChange={inDrawer ? undefined : setOpen}
    />
  );
}
