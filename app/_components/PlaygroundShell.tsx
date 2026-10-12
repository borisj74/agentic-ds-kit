"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { AppNav, Button, Select } from "agentic-ds-kit";
import { buildPlaygroundNavGroups } from "@/lib/playground-nav";
import { useLocationHash } from "@/lib/use-location-hash";
import {
  PLAYGROUND_COLOR_THEMES,
  applyPlaygroundColorTheme,
  applyPlaygroundTheme,
  readPlaygroundColorTheme,
  readPlaygroundTheme,
  type PlaygroundColorTheme,
  type PlaygroundTheme,
} from "@/lib/playground-theme";
import styles from "./PlaygroundShell.module.css";

const COMPACT_NAV = "(max-width: 767px)";

function subscribeCompact(onChange: () => void) {
  const media = window.matchMedia(COMPACT_NAV);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function readCompact() {
  return window.matchMedia(COMPACT_NAV).matches;
}

/** Theme lives on <html> (set before paint by the init script); re-read when it changes. */
function subscribeRootTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-color"],
  });
  return () => observer.disconnect();
}

const readServerFalse = () => false;
const readServerTheme = (): PlaygroundTheme => "light";
const readServerColorTheme = (): PlaygroundColorTheme => "ink";

export function PlaygroundShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hash = useLocationHash() ?? "";
  const theme = useSyncExternalStore(subscribeRootTheme, readPlaygroundTheme, readServerTheme);
  const colorTheme = useSyncExternalStore(
    subscribeRootTheme,
    readPlaygroundColorTheme,
    readServerColorTheme,
  );
  const compact = useSyncExternalStore(subscribeCompact, readCompact, readServerFalse);
  // The overlay nav belongs to the route it was opened on: navigating closes it.
  const route = `${pathname}#${hash}`;
  const [navOpenOn, setNavOpenOn] = useState<string | null>(null);
  const navOpen = navOpenOn === route;

  useEffect(() => {
    const media = window.matchMedia(COMPACT_NAV);
    const onChange = () => {
      if (!media.matches) setNavOpenOn(null);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!compact || !navOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNavOpenOn(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [compact, navOpen]);

  const groups = buildPlaygroundNavGroups(pathname, hash);
  const isDark = theme === "dark";
  const overlayNav = compact && navOpen;

  const handleThemeToggle = () => {
    const next: PlaygroundTheme = isDark ? "light" : "dark";
    applyPlaygroundTheme(next);
  };

  const handleColorTheme = (value: string | string[]) => {
    if (typeof value !== "string") return;
    if (value !== "ink" && value !== "blue" && value !== "violet" && value !== "teal") return;
    applyPlaygroundColorTheme(value);
  };

  return (
    <div className={styles.frame}>
      <header className={styles.topbar}>
        <div className={styles.menu}>
          <Button
            size="sm"
            variant="tertiary"
            iconStart={overlayNav ? "X" : "Menu"}
            ariaLabel={overlayNav ? "Close navigation" : "Open navigation"}
            onClick={() => setNavOpenOn(navOpen ? null : route)}
          />
        </div>
        <div className={styles.brand}>
          <span className={styles.productName}>Agentic DS Kit</span>
          <span className={styles.tagline}>Code is the contract</span>
        </div>
        <div className={styles.tools}>
          <div className={styles.colorSelect}>
            <Select
              id="playground-color-theme"
              size="sm"
              ariaLabel="Color theme"
              value={colorTheme}
              onChange={handleColorTheme}
              options={PLAYGROUND_COLOR_THEMES}
            />
          </div>
          <Button
            size="sm"
            variant="secondary"
            iconStart={isDark ? "Sun" : "Moon"}
            ariaLabel={isDark ? "Switch to light theme" : "Switch to dark theme"}
            onClick={handleThemeToggle}
          >
            {compact ? undefined : isDark ? "Light" : "Dark"}
          </Button>
        </div>
      </header>
      <div className={styles.shell}>
        {overlayNav ? (
          <button
            type="button"
            className={styles.scrim}
            aria-label="Close navigation"
            onClick={() => setNavOpenOn(null)}
          />
        ) : null}
        <aside
          id="playground-nav"
          className={`${styles.sidebar} ${overlayNav ? styles.sidebarOpen : ""}`}
          inert={compact && !navOpen ? true : undefined}
        >
          <AppNav groups={groups} />
        </aside>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
