"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { AppNav, Button, Select } from "agentic-ds-kit";
import { buildPlaygroundNavGroups } from "@/lib/playground-nav";
import { copyAiPrompt } from "@/lib/playground-prompt";
import { useLocationHash } from "@/lib/use-location-hash";
import {
  PLAYGROUND_COLOR_THEMES,
  PLAYGROUND_FONTS,
  PLAYGROUND_HEADING_WEIGHTS,
  applyPlaygroundColorTheme,
  applyPlaygroundFont,
  applyPlaygroundHeadingWeight,
  applyPlaygroundTheme,
  readPlaygroundColorTheme,
  readPlaygroundFont,
  readPlaygroundHeadingWeight,
  readPlaygroundTheme,
  type PlaygroundColorTheme,
  type PlaygroundFont,
  type PlaygroundHeadingWeight,
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

function subscribeRootTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-color", "data-font", "style"],
  });
  return () => observer.disconnect();
}

const readServerFalse = () => false;
const readServerTheme = (): PlaygroundTheme => "light";
const readServerColorTheme = (): PlaygroundColorTheme => "ink";
const readServerFont = (): PlaygroundFont => "ibm-plex";
const readServerWeight = (): PlaygroundHeadingWeight => "600";

export function PlaygroundShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hash = useLocationHash() ?? "";
  const theme = useSyncExternalStore(subscribeRootTheme, readPlaygroundTheme, readServerTheme);
  const colorTheme = useSyncExternalStore(
    subscribeRootTheme,
    readPlaygroundColorTheme,
    readServerColorTheme,
  );
  const font = useSyncExternalStore(subscribeRootTheme, readPlaygroundFont, readServerFont);
  const headingWeight = useSyncExternalStore(
    subscribeRootTheme,
    readPlaygroundHeadingWeight,
    readServerWeight,
  );
  const compact = useSyncExternalStore(subscribeCompact, readCompact, readServerFalse);
  const route = `${pathname}#${hash}`;
  const [navOpenOn, setNavOpenOn] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
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
    if (value !== "ink" && value !== "blue" && value !== "violet" && value !== "teal" && value !== "custom") {
      return;
    }
    applyPlaygroundColorTheme(value);
  };

  const handleFont = (value: string | string[]) => {
    if (typeof value !== "string") return;
    if (value !== "ibm-plex" && value !== "inter" && value !== "geist" && value !== "system") return;
    applyPlaygroundFont(value);
  };

  const handleWeight = (value: string | string[]) => {
    if (typeof value !== "string") return;
    if (value !== "400" && value !== "500" && value !== "600" && value !== "700") return;
    applyPlaygroundHeadingWeight(value);
  };

  const handleCopyPrompt = async () => {
    const ok = await copyAiPrompt();
    if (!ok) return;
    setCopiedPrompt(true);
    window.setTimeout(() => setCopiedPrompt(false), 1600);
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
            onClick={() => setNavOpenOn(navOpen ? null : route)}
          />
        </div>
        <div className={styles.brand}>
          <span className={styles.productName}>Agentic DS Kit</span>
          <span className={styles.tagline}>Code is the contract</span>
        </div>
        <div className={styles.tools}>
          <div className={styles.fontSelect}>
            <Select
              id="playground-font"
              size="sm"
              ariaLabel="Font"
              value={font}
              onChange={handleFont}
              options={PLAYGROUND_FONTS}
            />
          </div>
          <div className={styles.weightSelect}>
            <Select
              id="playground-heading-weight"
              size="sm"
              ariaLabel="Heading weight"
              value={headingWeight}
              onChange={handleWeight}
              options={PLAYGROUND_HEADING_WEIGHTS}
            />
          </div>
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
          <AppNav groups={groups} />
        </aside>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
