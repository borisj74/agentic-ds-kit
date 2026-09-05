"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppNav, Button, Select } from "agentic-ds-kit";
import { buildPlaygroundNavGroups } from "@/lib/playground-nav";
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

export function PlaygroundShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [theme, setTheme] = useState<PlaygroundTheme>("light");
  const [colorTheme, setColorTheme] = useState<PlaygroundColorTheme>("ink");
  const [compact, setCompact] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setTheme(readPlaygroundTheme());
    setColorTheme(readPlaygroundColorTheme());
  }, []);

  useEffect(() => {
    const media = window.matchMedia(COMPACT_NAV);
    const apply = () => {
      setCompact(media.matches);
      if (!media.matches) setNavOpen(false);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const readHash = () => setHash(window.location.hash);
    readHash();
    window.addEventListener("hashchange", readHash);
    window.addEventListener("popstate", readHash);
    return () => {
      window.removeEventListener("hashchange", readHash);
      window.removeEventListener("popstate", readHash);
    };
  }, []);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname, hash]);

  useEffect(() => {
    if (!compact || !navOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNavOpen(false);
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
    setTheme(next);
  };

  const handleColorTheme = (value: string | string[]) => {
    if (typeof value !== "string") return;
    if (value !== "ink" && value !== "blue" && value !== "violet" && value !== "teal") return;
    applyPlaygroundColorTheme(value);
    setColorTheme(value);
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
            onClick={() => setNavOpen((open) => !open)}
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
            onClick={() => setNavOpen(false)}
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
