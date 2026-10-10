"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from "react";
import { AppHeader } from "../../AppHeader";
import type { AppHeaderProps } from "../../AppHeader";
import { Button } from "../../Button";
import { Drawer } from "../../Drawer";
import { SideNav } from "../../SideNav";
import type { SideNavProps } from "../../SideNav";
import styles from "./AppShellPattern.module.css";

/** AppHeader props. The shell owns `radius` (always none). */
export type AppShellHeader = Omit<AppHeaderProps, "radius">;

/** The data SideNav takes. The shell owns `showHeader`, `radius`, and `side`. */
export type AppShellNav = Omit<SideNavProps, "showHeader" | "radius" | "side">;

export interface AppShellPatternProps {
  header: AppShellHeader;
  nav: AppShellNav;
  /** Page content: usually a `layout-canvas` or `layout-workspace`, or another pattern. */
  children: ReactNode;
  /** Extra class on the `layout-shell` root, e.g. to give it the viewport height. */
  className?: string;
}

/*
 * Narrow = below --grid-breakpoint-md. matchMedia reads the token at runtime so
 * the shell follows it; 64rem is only the fallback. The CSS module repeats 64rem
 * for the pre-hydration render (media queries cannot read var()).
 */
const BREAKPOINT_TOKEN = "--grid-breakpoint-md";
const BREAKPOINT_FALLBACK = "64rem";

function narrowQuery(): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(BREAKPOINT_TOKEN).trim();
  return `(width < ${value || BREAKPOINT_FALLBACK})`;
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia(narrowQuery());
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useNarrow(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(narrowQuery()).matches,
    () => false,
  );
}

/**
 * Product chrome at every width. Wide: AppHeader over SideNav + content
 * (layout-shell / layout-app, radius none, no gap). Narrow: no SideNav; a Menu
 * Button at the start of AppHeader opens the same nav in a left Drawer.
 */
export function AppShellPattern({ header, nav, children, className = "" }: AppShellPatternProps) {
  const narrow = useNarrow();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLSpanElement>(null);
  const wasOpen = useRef(false);

  // Widening past the breakpoint closes the Drawer (adjusted during render, not in an effect).
  const [wasNarrow, setWasNarrow] = useState(narrow);
  if (wasNarrow !== narrow) {
    setWasNarrow(narrow);
    if (!narrow) setMenuOpen(false);
  }

  // Drawer restores whatever had focus before it opened; Safari does not focus a
  // clicked button, so the shell puts focus back on the Menu Button itself.
  useEffect(() => {
    if (wasOpen.current && !menuOpen) menuRef.current?.querySelector("button")?.focus();
    wasOpen.current = menuOpen;
  }, [menuOpen]);

  // A leaf pick closes the Drawer; parent disclosures (aria-expanded) do not.
  function closeOnPick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const control = target.closest("a[href], button");
    if (control && !control.hasAttribute("aria-expanded") && !control.hasAttribute("disabled")) {
      setMenuOpen(false);
    }
  }

  return (
    <div className={`layout-shell ${className}`.trim()}>
      <AppHeader
        {...header}
        radius="none"
        logo={
          narrow ? (
            <span ref={menuRef} className={styles.menu}>
              <Button
                variant="tertiary"
                size="sm"
                iconStart="Menu"
                ariaLabel="Open navigation"
                onClick={() => setMenuOpen(true)}
              />
            </span>
          ) : (
            header.logo
          )
        }
      />
      <div className={`layout-app ${styles.app}`}>
        {narrow ? null : (
          <div className={styles.rail}>
            <SideNav {...nav} showHeader={false} radius="none" />
          </div>
        )}
        {children}
      </div>
      {narrow ? (
        <Drawer open={menuOpen} title={nav.title} side="left" size="sm" onClose={() => setMenuOpen(false)}>
          <div className={styles.drawerNav} onClick={closeOnPick}>
            <SideNav {...nav} open showHeader={false} radius="md" onOpenChange={undefined} />
          </div>
        </Drawer>
      ) : null}
    </div>
  );
}
