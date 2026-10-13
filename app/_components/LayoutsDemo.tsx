"use client";

import { useState, type ReactNode } from "react";
import { AppHeader, Button, Drawer, Empty, PageHeader, SideNav } from "agentic-ds-kit";
import type { SideNavItemData } from "agentic-ds-kit";
import { CodeBlock } from "../components/CodeBlock";
import styles from "../playground.module.css";
import layout from "./LayoutsDemo.module.css";

const NAV_ITEMS: SideNavItemData[] = [
  { id: "overview", label: "Overview", icon: "House" },
  { id: "inbox", label: "Inbox", icon: "Mail", badge: "7" },
  { id: "projects", label: "Projects", icon: "Folder" },
];

const NAV_FOOTER: SideNavItemData[] = [{ id: "settings", label: "Settings", icon: "Settings" }];

const ALL_ITEMS = [...NAV_ITEMS, ...NAV_FOOTER];

const TOP_BAR_CODE = `<div className="layout-shell">
  <AppHeader title="Acme" mark="A" radius="none" actions={…} />
  <main className="layout-canvas">
    <div className="layout-header"><PageHeader title="Overview" /></div>
    <div className="layout-content">…</div>
  </main>
</div>`;

const SIDE_NAV_CODE = `<div className="layout-app">
  {/* Hidden below 64rem by your CSS */}
  <div className={styles.rail}><SideNav title="Acme" items={items} radius="none" /></div>
  <main className="layout-canvas">
    <div className="layout-header">
      {/* Shown below 64rem */}
      <Button variant="tertiary" size="sm" iconStart="Menu" ariaLabel="Open navigation" onClick={() => setOpen(true)} />
      <PageHeader title="Overview" />
    </div>
    <div className="layout-content">…</div>
  </main>
  <Drawer open={open} title="Acme" side="left" size="sm" onClose={() => setOpen(false)}>
    <SideNav title="Acme" items={items} showHeader={false} open />
  </Drawer>
</div>`;

const BOTH_CODE = `<div className="layout-shell">
  <AppHeader
    title="Acme"
    radius="none"
    logo={<>{/* Mark when wide, Menu Button below 64rem */}</>}
  />
  <div className="layout-app">
    <div className={styles.rail}><SideNav title="Acme" items={items} showHeader={false} radius="none" /></div>
    <main className="layout-canvas">…</main>
  </div>
  <Drawer open={open} title="Acme" side="left" size="sm" onClose={() => setOpen(false)}>
    <SideNav title="Acme" items={items} showHeader={false} open />
  </Drawer>
</div>`;

/** The docs page already has a main landmark, so the demos use a div where your app uses <main>. */
function Content({ title, page }: { title: string; page: string }) {
  const current = ALL_ITEMS.find((item) => item.id === page) ?? ALL_ITEMS[0];
  return (
    <div className="layout-header">
      <PageHeader title={title} subtitle={`${current.label}: in your app this column is <main>.`} />
    </div>
  );
}

function Body({ page }: { page: string }) {
  const current = ALL_ITEMS.find((item) => item.id === page) ?? ALL_ITEMS[0];
  return (
    <div className="layout-content">
      <Empty title={`${current.label} goes here`} description="Built straight from kit components." icon={current.icon} outlined />
    </div>
  );
}

function Frame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className={`${styles.browser} ${layout.frame}`}>
      <div className={styles.browserChrome} aria-hidden="true">
        <div className={styles.traffic}>
          <span className={`${styles.trafficDot} ${styles.trafficClose}`} />
          <span className={`${styles.trafficDot} ${styles.trafficMin}`} />
          <span className={`${styles.trafficDot} ${styles.trafficMax}`} />
        </div>
        <div className={styles.urlBar}>{url}</div>
      </div>
      {children}
    </div>
  );
}

/** Nav rows bound to the demo page; a pick in the Drawer also closes it. */
function useNav(onPick?: () => void) {
  const [page, setPage] = useState("overview");
  const bind = (items: SideNavItemData[]) =>
    items.map((item) => ({
      ...item,
      active: item.id === page,
      onClick: () => {
        setPage(item.id);
        onPick?.();
      },
    }));
  return { page, items: bind(NAV_ITEMS), footer: bind(NAV_FOOTER) };
}

function TopBarOnly() {
  return (
    <Frame url="app.acme.dev/overview">
      <div className={`layout-shell ${layout.fill}`}>
        <AppHeader
          title="Acme"
          mark="A"
          radius="none"
          actions={<Button variant="tertiary" size="sm" iconStart="Bell" ariaLabel="Notifications" />}
        />
        <div className="layout-canvas">
          <Content title="Top bar only" page="overview" />
          <Body page="overview" />
        </div>
      </div>
    </Frame>
  );
}

function SideNavOnly() {
  const [open, setOpen] = useState(false);
  const { page, items, footer } = useNav(() => setOpen(false));

  return (
    <Frame url={`app.acme.dev/${page}`}>
      <div className={`layout-app ${layout.app} ${layout.fill}`}>
        <div className={layout.rail}>
          <SideNav title="Acme" mark="A" items={items} footer={footer} radius="none" />
        </div>
        <div className="layout-canvas">
          <div className={`layout-header ${layout.menuRow}`}>
            <span className={layout.narrowOnly}>
              <Button variant="tertiary" size="sm" iconStart="Menu" ariaLabel="Open navigation" onClick={() => setOpen(true)} />
            </span>
            <PageHeader title="Side nav only" subtitle="In your app this column is <main>." />
          </div>
          <Body page={page} />
        </div>
      </div>
      <Drawer open={open} title="Acme" side="left" size="sm" onClose={() => setOpen(false)}>
        <div className={layout.drawerNav}>
          <SideNav title="Acme" items={items} footer={footer} showHeader={false} open />
        </div>
      </Drawer>
    </Frame>
  );
}

function Both() {
  const [open, setOpen] = useState(false);
  const { page, items, footer } = useNav(() => setOpen(false));

  return (
    <Frame url={`app.acme.dev/${page}`}>
      <div className={`layout-shell ${layout.fill}`}>
        <AppHeader
          title="Acme"
          radius="none"
          logo={
            <>
              <span className={layout.wideOnly}>
                <AppHeader.Mark>A</AppHeader.Mark>
              </span>
              <span className={layout.narrowOnly}>
                <Button variant="tertiary" size="sm" iconStart="Menu" ariaLabel="Open navigation" onClick={() => setOpen(true)} />
              </span>
            </>
          }
          actions={<Button variant="tertiary" size="sm" iconStart="Bell" ariaLabel="Notifications" />}
        />
        <div className={`layout-app ${layout.app}`}>
          <div className={layout.rail}>
            <SideNav title="Acme" items={items} footer={footer} showHeader={false} radius="none" />
          </div>
          <div className="layout-canvas">
            <Content title="Top bar and side nav" page={page} />
            <Body page={page} />
          </div>
        </div>
      </div>
      <Drawer open={open} title="Acme" side="left" size="sm" onClose={() => setOpen(false)}>
        <div className={layout.drawerNav}>
          <SideNav title="Acme" items={items} footer={footer} showHeader={false} open />
        </div>
      </Drawer>
    </Frame>
  );
}

/**
 * Three layouts composed straight from kit components, no pattern: top bar only, side nav
 * only, and both. Below 64rem the side nav moves into a left Drawer behind a Menu Button.
 */
export function LayoutsDemo({ titleClassName }: { titleClassName?: string }) {
  return (
    <>
      <h2 className={titleClassName}>Top bar only</h2>
      <div className={styles.stack}>
        <p className={styles.body}>AppHeader over the page. No side nav.</p>
        <TopBarOnly />
        <CodeBlock code={TOP_BAR_CODE} />
      </div>

      <h2 className={titleClassName}>Side nav only</h2>
      <div className={styles.stack}>
        <p className={styles.body}>
          SideNav beside the page. Below 64rem it moves into a left Drawer that a Menu Button
          opens, so the nav stays reachable.
        </p>
        <SideNavOnly />
        <CodeBlock code={SIDE_NAV_CODE} />
      </div>

      <h2 className={titleClassName}>Top bar and side nav</h2>
      <div className={styles.stack}>
        <p className={styles.body}>
          The app-shell layout, composed by hand: the Menu Button replaces the mark below 64rem.
          npx agentic-ds-kit add app-shell copies a ready-made version.
        </p>
        <Both />
        <CodeBlock code={BOTH_CODE} />
      </div>
    </>
  );
}
