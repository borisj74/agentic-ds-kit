"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppNav } from "@/ui/AppNav";
import { Button } from "@/ui/Button";
import { buildPlaygroundNavGroups } from "@/lib/playground-nav";
import { applyPlaygroundTheme, readPlaygroundTheme, type PlaygroundTheme } from "@/lib/playground-theme";
import styles from "./PlaygroundShell.module.css";

export function PlaygroundShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [theme, setTheme] = useState<PlaygroundTheme>("light");

  useEffect(() => {
    setTheme(readPlaygroundTheme());
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

  return (
    <div className={styles.frame}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.productName}>Agentic DS Kit</span>
          <span className={styles.tagline}>Code-only design system</span>
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
