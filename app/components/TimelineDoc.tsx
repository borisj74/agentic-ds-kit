"use client";

import { useState } from "react";
import { Timeline } from "@/ui/Timeline";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";

const ITEMS = [
  { status: "now" as const, phase: "Now", title: "Ship beta", body: "Final QA and release notes this week." },
  { status: "next" as const, phase: "Next", title: "Onboard design partners", body: "Five teams scheduled for guided rollout." },
  { status: "later" as const, phase: "Later", title: "Public launch", body: "Marketing site and pricing go live." },
];

export function TimelineDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Timelines</h1>
        <p className={styles.lede}>A vertical sequence of now, next, and later — for roadmaps and multi-stage work.</p>
      </header>
      <section className={styles.master}>
        <div className={styles.masterHeader}>
          <h2 className={styles.masterTitle}>Master</h2>
          <p className={styles.masterSummary}>Filled node is current. Hollow is next. Muted is later.</p>
          <div className={styles.tabList} role="tablist" aria-label="Master views">
            <button type="button" role="tab" aria-selected={tab === "preview"} className={`${styles.tab} ${tab === "preview" ? styles.tabActive : ""}`} onClick={() => setTab("preview")}>Preview</button>
            <button type="button" role="tab" aria-selected={tab === "variants"} className={`${styles.tab} ${tab === "variants" ? styles.tabActive : ""}`} onClick={() => setTab("variants")}>Variants</button>
          </div>
        </div>
        {tab === "preview" ? (
          <div role="tabpanel">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}><Timeline items={ITEMS} label="Release plan" /></div>
              </div>
            </div>
            <div className={styles.docs}>
              <CodeBlock
                code={`<Timeline
  items={[
    { status: "now", title: "Ship beta", body: "Final QA this week" },
    { status: "next", title: "Onboard partners" },
    { status: "later", title: "Public launch" },
  ]}
/>`}
              />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Single step</h2>
              <div className={styles.exampleCanvas}>
                <Timeline items={[{ status: "now", title: "Current milestone", body: "Only one active step." }]} />
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
