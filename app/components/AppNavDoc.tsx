"use client";

import { useState } from "react";
import { AppNav } from "agentic-ds-kit";
import { PLAYGROUND_APPNAV_DEMO_GROUPS } from "@/lib/playground-nav";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import demo from "./AppNavDoc.module.css";
import { DocTabList } from "./DocTabList";

const CODE = `<AppNav title="Agentic DS Kit" groups={[{ label: 'Components', items: [{ href: '/components#button', label: 'Button', active: true }] }]} />`;

const FLAT_ITEMS = [
  { href: "/patterns#list-detail", label: "Launch brief", active: true },
  { href: "/patterns#qa-checklist", label: "QA checklist" },
  { href: "/patterns#release-notes", label: "Release notes" },
];

export function AppNavDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>AppNav</h1>
        <p className={styles.lede}>
          Vertical sidebar for playground and product shells. Grouped catalog or a flat list. Not
          SideNav. Not AppHeader.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="appnav-master">
        <div className={styles.masterHeader}>
          <h2 id="appnav-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Groups collapse one at a time. Active leaf uses aria-current=page.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={demo.canvas}>
                <div className={demo.nav}>
                  <AppNav title="Agentic DS Kit" groups={PLAYGROUND_APPNAV_DEMO_GROUPS} />
                </div>
              </div>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use for a persistent left sidebar. Use SideNav when chrome can close. Use
                  NavigationMenu for horizontal site nav. Use Tabs for in-page panels.
                </p>
              </div>
              <CodeBlock code={CODE} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Grouped catalog</h2>
              <div className={demo.exampleCanvas}>
                <div className={demo.nav}>
                  <AppNav title="Agentic DS Kit" groups={PLAYGROUND_APPNAV_DEMO_GROUPS} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Groups for docs and playground IA. Only one group is open at a time.
                </p>
              </div>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Flat list</h2>
              <div className={demo.exampleCanvas}>
                <div className={demo.nav}>
                  <AppNav title="Sprint 24" items={FLAT_ITEMS} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  items is a small list for list-detail shells. Ignored when groups is set.
                </p>
              </div>
              <CodeBlock
                code={`<AppNav
  title="Sprint 24"
  items={[
    { href: "/patterns#list-detail", label: "Launch brief", active: true },
    { href: "/patterns#qa-checklist", label: "QA checklist" },
  ]}
/>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
