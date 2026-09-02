"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppNav } from "agentic-ds-kit";
import { Button } from "agentic-ds-kit";
import { Select } from "agentic-ds-kit";
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

export function PlaygroundShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [theme, setTheme] = useState<PlaygroundTheme>("light");
  const [colorTheme, setColorTheme] = useState<PlaygroundColorTheme>("blue");

  useEffect(() => {
    setTheme(readPlaygroundTheme());
    setColorTheme(readPlaygroundColorTheme());
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

  const groups = buildPlaygroundNavGroups(pathname, hash);
  const isDark = theme === "dark";

  const handleThemeToggle = () => {
    const next: PlaygroundTheme = isDark ? "light" : "dark";
    applyPlaygroundTheme(next);
    setTheme(next);
  };

  const handleColorTheme = (value: string | string[]) => {
    if (typeof value !== "string") return;
    if (value !== "blue" && value !== "violet" && value !== "teal") return;
    applyPlaygroundColorTheme(value);
    setColorTheme(value);
  };

  return (
    <div className={styles.frame}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.productName}>Agentic DS Kit</span>
          <span className={styles.tagline}>Code-only design system</span>
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
            shape="pill"
            iconStart={isDark ? "Sun" : "Moon"}
            onClick={handleThemeToggle}
          >
            {isDark ? "Light" : "Dark"}
          </Button>
        </div>
      </header>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <AppNav groups={groups} />
        </aside>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
