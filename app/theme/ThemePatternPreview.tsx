"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "agentic-ds-kit";
import type { SideNavItemData } from "agentic-ds-kit";
import { AppShellPattern } from "../../packages/kit/patterns/AppShellPattern";
import { DashboardPattern } from "../../packages/kit/patterns/DashboardPattern";
import { ListDetailPattern } from "../../packages/kit/patterns/ListDetailPattern";
import { SettingsFormPattern } from "../../packages/kit/patterns/SettingsFormPattern";
import styles from "./theme.module.css";

export type ThemePatternId = "dashboard" | "list" | "settings";

/** Wide enough that the shell keeps its rail, then the frame scales to the slot. */
const DESIGN_WIDTH = 1100;

const NAV: SideNavItemData[] = [
  { id: "overview", label: "Overview", icon: "House" },
  { id: "projects", label: "Projects", icon: "Folder", badge: "4" },
  { id: "tasks", label: "Open tasks", icon: "Check", badge: "18" },
  { id: "settings", label: "Settings", icon: "Settings" },
];

function ScaledFrame({ label, children }: { label: string; children: ReactNode }) {
  const slotRef = useRef<HTMLDivElement>(null);
  const designRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(720);
  const [designWidth, setDesignWidth] = useState(DESIGN_WIDTH);

  useEffect(() => {
    const slot = slotRef.current;
    const design = designRef.current;
    if (!slot || !design) return;
    const measure = () => {
      const slotWidth = slot.clientWidth;
      const next = Math.min(1, slotWidth / DESIGN_WIDTH);
      const width = next < 1 ? DESIGN_WIDTH : Math.max(DESIGN_WIDTH, slotWidth);
      setScale(next);
      setDesignWidth(width);
      setHeight(Math.ceil(design.scrollHeight * next));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(slot);
    observer.observe(design);
    measure();
    return () => observer.disconnect();
  }, [children]);

  return (
    // A picture of a whole app page: it is named as one image, and the page inside is inert so its
    // own h1, landmarks and controls don't mix into this page's outline or tab order.
    <div ref={slotRef} className={styles.slot} role="img" aria-label={label}>
      <div className={styles.scaler} style={{ height }}>
        <div
          ref={designRef}
          inert
          className={styles.design}
          style={{ width: designWidth, transform: scale < 1 ? `scale(${scale})` : undefined }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

const PREVIEW_LABEL: Record<ThemePatternId, string> = {
  dashboard: "Dashboard pattern in your theme",
  list: "List pattern in your theme",
  settings: "Settings pattern in your theme",
};

export function ThemePatternPreview({ pattern }: { pattern: ThemePatternId }) {
  const active = pattern === "settings" ? "settings" : "overview";
  return (
    <ScaledFrame label={PREVIEW_LABEL[pattern]}>
      <AppShellPattern
        navLabel="Agentix"
        header={{
          title: "Agentix",
          mark: "A",
          searchPlaceholder: "Search",
          searchShortcut: "⌘K",
          actions: (
            <>
              <Button appearance="ghost" mode="neutral" size="sm" iconStart="Bell" ariaLabel="Notifications" />
              {pattern === "settings" ? null : (
                <Button appearance="solid" mode="primary" size="sm">
                  New order
                </Button>
              )}
            </>
          ),
        }}
        nav={{
          title: "Agentix",
          mark: "A",
          items: NAV.map((item) => ({ ...item, active: item.id === active })),
        }}
      >
        {pattern === "dashboard" ? <DashboardPattern /> : null}
        {pattern === "list" ? <ListDetailPattern /> : null}
        {pattern === "settings" ? <SettingsFormPattern /> : null}
      </AppShellPattern>
    </ScaledFrame>
  );
}
