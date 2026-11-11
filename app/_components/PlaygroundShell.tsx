"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { AppNav, Button, Drawer, Input, Tooltip } from "agentic-ds-kit";
import kitPackage from "agentic-ds-kit/package.json";
import { buildSiteNavItems, filterSiteNavItems } from "@/lib/playground-nav";
import { applyPlaygroundTheme, readPlaygroundTheme, type PlaygroundTheme } from "@/lib/playground-theme";
import { NisthaLogo } from "./NisthaLogo";
import { PlaygroundCommand, openPlaygroundCommand } from "./PlaygroundCommand";
import { ThemeActions, ThemePanel } from "./ThemePanel";
import { useCustomizeOpen } from "./useCustomizeOpen";
import { useSidebarOpen } from "./useSidebarOpen";
import styles from "./PlaygroundShell.module.css";

const GITHUB_URL = "https://github.com/borisj74/agentic-ds-kit";

function subscribeRootTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const readServerTheme = (): PlaygroundTheme => "light";

function SiteNav({ query, onQuery, pathname, searchId }: { query: string; onQuery: (value: string) => void; pathname: string; searchId: string }) {
  const items = buildSiteNavItems(pathname);
  const visible = filterSiteNavItems(items, query);
  const searching = query.trim().length > 0;

  return (
    <>
      <div className={styles.search} role="search">
        <Input
          id={searchId}
          type="search"
          size="sm"
          placeholder="Search parts"
          iconStart="Search"
          end="⌘K"
          ariaLabel="Search parts"
          aria-keyshortcuts="Meta+K Control+K"
          value={query}
          onChange={onQuery}
        />
      </div>
      <div className={styles.navHost}>
        {searching && visible.length === 0 ? (
          <p className={styles.navEmpty} role="status">
            No matches
          </p>
        ) : (
          <AppNav aria-label="Documentation" items={visible} />
        )}
      </div>
    </>
  );
}

/** Pattern frames (/frame/…) are bare screens shown in an iframe: no docs chrome around them. */
export function PlaygroundShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/frame/")) return <>{children}</>;
  return <DocsShell pathname={pathname}>{children}</DocsShell>;
}

function DocsShell({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  const siteMode = useSyncExternalStore(subscribeRootTheme, readPlaygroundTheme, readServerTheme);
  const customize = useCustomizeOpen(pathname);
  const sidebar = useSidebarOpen();
  const [navOpenOn, setNavOpenOn] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [query, setQuery] = useState("");
  // The drawer closes itself when the route changes: it is only open for the page it opened on.
  const navOpen = navOpenOn === pathname;

  // The docked panel sits before the Theme button in the tab order: move focus into it on open,
  // and back to the button on close, so keyboard users don't lose their place.
  function toggleThemePanel() {
    const opening = !customize.docked;
    customize.toggle();
    if (opening) window.requestAnimationFrame(() => document.getElementById("customize-panel")?.focus());
  }

  function closeThemePanel() {
    customize.close();
    window.requestAnimationFrame(() => document.getElementById("theme-toggle")?.focus());
  }

  // Hide and Show swap places (sidebar brand row ↔ topbar start): move focus to the one that
  // appears, two frames on so it lands after the browser has dropped focus from the hidden one.
  function focusAfterSwap(id: string) {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => document.getElementById(id)?.focus()));
  }

  function hideSidebar() {
    sidebar.setOpen(false);
    focusAfterSwap("sidebar-open");
  }

  function showSidebar() {
    sidebar.setOpen(true);
    focusAfterSwap("sidebar-close");
  }

  const themePanel = <ThemePanel onClose={customize.pinned ? undefined : closeThemePanel} />;

  return (
    <div className={styles.frame}>
      <a className={styles.skip} href="#main">
        Skip to content
      </a>

      <header className={styles.mobileHeader}>
        <NisthaLogo />
        <div className={styles.mobileTools}>
          <Button size="lg" appearance="ghost" mode="neutral" iconStart="Search" ariaLabel="Search" onClick={openPlaygroundCommand} />
          <Button
            size="lg"
            appearance="ghost"
            mode="neutral"
            iconStart="SlidersHorizontal"
            ariaLabel="Theme"
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
            onClick={() => setSheetOpen(true)}
          />
          <Button
            size="lg"
            appearance="ghost"
            mode="neutral"
            iconStart="Menu"
            ariaLabel="Open navigation"
            aria-haspopup="dialog"
            aria-expanded={navOpen}
            onClick={() => setNavOpenOn(pathname)}
          />
        </div>
      </header>

      <div id="site-sidebar" className={styles.sidebar}>
        <div className={styles.brandRow}>
          <div className={styles.brand}>
            <NisthaLogo />
            <span className={styles.version}>{kitPackage.version}</span>
          </div>
          <Tooltip content="Hide sidebar" placement="right">
            <Button
              id="sidebar-close"
              size="sm"
              appearance="ghost"
              mode="neutral"
              iconStart="PanelLeftClose"
              ariaLabel="Hide sidebar"
              aria-controls="site-sidebar"
              aria-expanded={sidebar.open}
              onClick={hideSidebar}
            />
          </Tooltip>
        </div>
        <SiteNav query={query} onQuery={setQuery} pathname={pathname} searchId="site-nav-search" />
      </div>

      {customize.docked ? (
        <aside id="customize-panel" className={styles.themeColumn} aria-label="Theme" tabIndex={-1}>
          {themePanel}
        </aside>
      ) : null}

      <div className={styles.panel}>
        <header className={styles.topbar}>
          {/* Shown (by CSS, from html[data-sidebar]) only while the sidebar is hidden. */}
          <span className={styles.sidebarOpen}>
            <Tooltip content="Show sidebar" placement="right">
              <Button
                id="sidebar-open"
                size="sm"
                appearance="ghost"
                mode="neutral"
                iconStart="PanelLeftOpen"
                ariaLabel="Show sidebar"
                aria-controls="site-sidebar"
                aria-expanded={sidebar.open}
                onClick={showSidebar}
              />
            </Tooltip>
          </span>
          <Button
            id="theme-toggle"
            size="sm"
            appearance={customize.open ? "soft" : "outline"}
            mode={customize.open ? "primary" : "neutral"}
            iconStart="SlidersHorizontal"
            ariaLabel="Theme"
            aria-expanded={customize.docked}
            aria-controls={customize.docked ? "customize-panel" : undefined}
            onClick={toggleThemePanel}
          />
          <div className={styles.modeGroup} role="group" aria-label="Site colour mode">
            <Button
              size="sm"
              appearance={siteMode === "light" ? "soft" : "ghost"}
              mode="neutral"
              iconStart="Sun"
              ariaLabel="Light"
              aria-pressed={siteMode === "light"}
              onClick={() => applyPlaygroundTheme("light")}
            />
            <Button
              size="sm"
              appearance={siteMode === "dark" ? "soft" : "ghost"}
              mode="neutral"
              iconStart="Moon"
              ariaLabel="Dark"
              aria-pressed={siteMode === "dark"}
              onClick={() => applyPlaygroundTheme("dark")}
            />
          </div>
          {/* The kit has no link Button, so the GitHub link is an anchor styled with tokens. */}
          <a className={styles.github} href={GITHUB_URL} target="_blank" rel="noreferrer">
            GitHub
            <span aria-hidden="true">↗</span>
            <span className={styles.srOnly}> (opens in a new tab)</span>
          </a>
        </header>
        <main id="main" className={styles.main} tabIndex={-1}>
          {children}
        </main>
      </div>

      <Drawer open={navOpen} title="Navigation" side="left" size="sm" onClose={() => setNavOpenOn(null)}>
        {navOpen ? (
          <div className={styles.drawerNav}>
            <SiteNav query={query} onQuery={setQuery} pathname={pathname} searchId="drawer-nav-search" />
            <div className={styles.drawerFooter}>
              <span className={styles.version}>agentic-ds-kit {kitPackage.version}</span>
              <a className={styles.github} href={GITHUB_URL} target="_blank" rel="noreferrer">
                GitHub
                <span aria-hidden="true">↗</span>
                <span className={styles.srOnly}> (opens in a new tab)</span>
              </a>
            </div>
          </div>
        ) : null}
      </Drawer>

      <Drawer
        open={sheetOpen}
        title="Theme"
        side="bottom"
        size="md"
        onClose={() => setSheetOpen(false)}
        footer={sheetOpen ? <ThemeActions compact /> : undefined}
      >
        {sheetOpen ? <ThemePanel showHeader={false} showActions={false} /> : null}
      </Drawer>

      <PlaygroundCommand />
    </div>
  );
}
