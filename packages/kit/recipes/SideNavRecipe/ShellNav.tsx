"use client";

import { useState, type ReactNode } from "react";
import { AppHeaderMark, AppHeaderTitle } from "../../ui/AppHeader";
import {
  SideNavFooter,
  SideNavHeader,
  SideNavItem,
  SideNavNav,
  SideNavRoot,
  SideNavSection,
  SideNavSlot,
  SideNavToggle,
} from "../../ui/SideNav";
import { useAppShell } from "../../ui/patterns/AppShellPattern";

export interface ShellNavProps {
  /** Product name: the nav landmark label and the brand header when used on its own. */
  title?: string;
  /** Brand letter. Defaults to the first character of title. */
  mark?: string;
  /** Id of the current page: that row gets aria-current="page" and the active fill. */
  current?: string;
  /** In-app navigation: called with the row id. Omit it and the rows are plain links (href). */
  onNavigate?: (id: string) => void;
  /** Pinned above the rows, e.g. a workspace switcher. Hidden on the closed rail. */
  beforeGroups?: ReactNode;
}

/**
 * SideNav for your app, built from the SideNav blocks so you can rearrange it. On its own
 * it is a closeable rail with a brand header and Toggle. As
 * `<AppShellPattern nav={<ShellNav />} …>` it drops the header (AppHeader has the brand),
 * sits flush in the rail when wide, and is forced open inside the Drawer.
 */
export function ShellNav({ title = "Acme", mark, current = "overview", onNavigate, beforeGroups }: ShellNavProps) {
  const shell = useAppShell();
  const inDrawer = shell?.navPlacement === "drawer";
  const [open, setOpen] = useState(true);

  // Per-row state: active row and, with onNavigate, an in-app pick instead of the link.
  const row = (id: string) => ({
    active: current === id,
    onClick: onNavigate ? () => onNavigate(id) : undefined,
  });

  return (
    <SideNavRoot
      aria-label={title}
      radius={shell && !inDrawer ? "none" : "md"}
      open={inDrawer || open}
      onOpenChange={inDrawer ? undefined : setOpen}
    >
      {shell ? null : (
        <SideNavHeader>
          <AppHeaderMark>{mark ?? title.charAt(0)}</AppHeaderMark>
          <AppHeaderTitle>{title}</AppHeaderTitle>
          <SideNavToggle />
        </SideNavHeader>
      )}

      {beforeGroups ? <SideNavSlot>{beforeGroups}</SideNavSlot> : null}

      <SideNavNav>
        <SideNavSection>
          <SideNavItem label="Overview" icon="House" href="/" {...row("overview")} />
          <SideNavItem label="Inbox" icon="Mail" badge="7" href="/inbox" {...row("inbox")} />
          <SideNavItem label="Projects" icon="Folder" href="/projects" {...row("projects")} />
          <SideNavItem label="Insights" icon="Sparkles" href="/insights" {...row("insights")} />
        </SideNavSection>
      </SideNavNav>

      <SideNavFooter>
        <SideNavSection>
          <SideNavItem label="Settings" icon="Settings" href="/settings" {...row("settings")} />
        </SideNavSection>
      </SideNavFooter>
    </SideNavRoot>
  );
}
