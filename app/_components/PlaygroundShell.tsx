"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { AppNav, Button, Drawer, Input } from "agentic-ds-kit";
import {
  buildPlaygroundNavGroups,
  filterPlaygroundNavGroups,
  flattenPlaygroundNav,
} from "@/lib/playground-nav";
import { copyAiPrompt } from "@/lib/playground-prompt";
import { useLocationHash } from "@/lib/use-location-hash";
import { applyPlaygroundTheme, readPlaygroundTheme, type PlaygroundTheme } from "@/lib/playground-theme";
import { CustomizePanel } from "./CustomizePanel";
import { PlaygroundCommand } from "./PlaygroundCommand";
import { useCustomizeOpen } from "./useCustomizeOpen";
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

function subscribeRootTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const readServerFalse = () => false;
const readServerTheme = (): PlaygroundTheme => "light";

export function PlaygroundShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hash = useLocationHash() ?? "";
  const theme = useSyncExternalStore(subscribeRootTheme, readPlaygroundTheme, readServerTheme);
  const compact = useSyncExternalStore(subscribeCompact, readCompact, readServerFalse);
  const customize = useCustomizeOpen(pathname);
  const route = `${pathname}#${hash}`;
  const [navOpenOn, setNavOpenOn] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [navQuery, setNavQuery] = useState("");
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
  const navQueryTrimmed = navQuery.trim();
  const visibleGroups = filterPlaygroundNavGroups(groups, navQueryTrimmed);
  const searching = navQueryTrimmed.length > 0;
  const isDark = theme === "dark";
  const overlayNav = compact && navOpen;

  const handleThemeToggle = () => {
    applyPlaygroundTheme(isDark ? "light" : "dark");
  };

  const handleCopyPrompt = async () => {
    const ok = await copyAiPrompt();
    if (!ok) return;
    setCopiedPrompt(true);
    window.setTimeout(() => setCopiedPrompt(false), 1600);
  };

  const handleNavToggle = () => {
    const next = !navOpen;
    if (next && customize.sheet) customize.close();
    setNavOpenOn(next ? route : null);
  };

  const handleCustomizeToggle = () => {
    if (!customize.open) setNavOpenOn(null);
    customize.toggle();
  };

  return (
    <div className={styles.frame}>
      <header className={styles.topbar}>
        <div className={styles.menu}>
          <Button
            size="sm"
            appearance="ghost"
            mode="neutral"
            iconStart={overlayNav ? "X" : "Menu"}
            ariaLabel={overlayNav ? "Close navigation" : "Open navigation"}
            onClick={handleNavToggle}
          />
        </div>
        <div className={styles.brand}>
          <span className={styles.productName}>Vida</span>
          <span className={styles.tagline}>Agentic DS Kit</span>
        </div>
        <div className={styles.tools}>
          <Button
            size="sm"
            appearance="outline"
            mode="neutral"
            iconStart="SlidersHorizontal"
            ariaLabel="Customize"
            aria-expanded={customize.open}
            aria-controls="customize-panel"
            onClick={handleCustomizeToggle}
          >
            {compact ? undefined : "Customize"}
          </Button>
          <Button
            size="sm"
            appearance="outline"
            mode="neutral"
            iconStart="Copy"
            ariaLabel="Copy prompt for AI"
            onClick={() => {
              void handleCopyPrompt();
            }}
          >
            {compact ? undefined : copiedPrompt ? "Copied" : "Copy prompt for AI"}
          </Button>
          <Button
            size="sm"
            appearance="outline"
            mode="neutral"
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
          <div className={styles.sidebarSearch}>
            <PlaygroundCommand />
            <Input
              id="docs-nav-filter"
              type="search"
              size="sm"
              placeholder="Search"
              iconStart="Search"
              end="⌘K"
              ariaLabel="Search"
              aria-keyshortcuts="Meta+K Control+K"
              value={navQuery}
              onChange={setNavQuery}
            />
          </div>
          <div className={styles.sidebarScroll}>
            {searching && visibleGroups.length === 0 ? (
              <p className={styles.sidebarEmpty}>No matches</p>
            ) : (
              <AppNav
                aria-label="Documentation"
                {...(searching
                  ? { items: flattenPlaygroundNav(visibleGroups) }
                  : { groups: visibleGroups })}
              />
            )}
          </div>
        </aside>
        {customize.docked ? (
          <aside id="customize-panel" className={styles.customize} aria-label="Customize">
            <CustomizePanel variant="dock" onCollapse={customize.close} />
          </aside>
        ) : null}
        <main className={styles.main}>{children}</main>
      </div>
      <Drawer
        open={customize.sheet}
        title="Customize"
        side="left"
        size="sm"
        onClose={customize.close}
      >
        <div id="customize-panel">
          <CustomizePanel variant="sheet" />
        </div>
      </Drawer>
    </div>
  );
}
