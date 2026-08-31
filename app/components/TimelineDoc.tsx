"use client";

import { useState } from "react";
import { Timeline } from "@/ui/Timeline";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const ITEMS = [
  { status: "now" as const, phase: "Now", title: "Ship beta", body: "Final QA and release notes this week." },
  { status: "next" as const, phase: "Next", title: "Onboard design partners", body: "Five teams scheduled for guided rollout." },
  { status: "later" as const, phase: "Later", title: "Public launch", body: "Marketing site and pricing go live." },
];

const MASTER_CODE = `<Timeline
  label="Release plan"
  items={[
    { status: "now", phase: "Now", title: "Ship beta", body: "Final QA this week" },
    { status: "next", phase: "Next", title: "Onboard partners" },
    { status: "later", phase: "Later", title: "Public launch" },
  ]}
/>`;

export function TimelineDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Timeline</h1>
        <p className={styles.lede}>
          A vertical sequence of now, next, and later — for roadmaps and multi-stage work. One
          piece. Numbered wizard steps use ProgressSteps.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="timeline-master">
        <div className={styles.masterHeader}>
          <h2 id="timeline-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Filled node is current. Hollow is next. Muted is later.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <Timeline items={ITEMS} label="Release plan" />
                </div>
              </div>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use Timeline for now, next, and later. Filled node is current. Hollow is next.
                  Muted is later.
                </p>
              </div>
              <CodeBlock code={MASTER_CODE} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Single step</h2>
              <div className={styles.exampleCanvas}>
                <Timeline items={[{ status: "now", title: "Current milestone", body: "Only one active step." }]} />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  A single now step is valid. Numbered wizard steps use ProgressSteps.
                </p>
              </div>
              <CodeBlock
                code={'<Timeline items={[{ status: "now", title: "Current milestone", body: "Only one active step." }]} />'}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
