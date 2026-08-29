"use client";

import { useState } from "react";
import { Scoreboard } from "@/ui/Scoreboard";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const ITEMS = [
  { label: "Revenue", value: "$48.2k", delta: "+12.4%", trend: "up" as const, hint: "vs last 30 days" },
  { label: "Conversion", value: "3.6%", delta: "+0.4%", trend: "up" as const, hint: "vs last 30 days" },
  { label: "Churn", value: "1.2%", delta: "-0.3%", trend: "down" as const, hint: "vs last 30 days" },
];

const SNIPPET = `<Scoreboard
  items={[
    { label: "Revenue", value: "$48.2k", delta: "+12.4%", trend: "up", hint: "vs last 30 days" },
    { label: "Conversion", value: "3.6%", delta: "+0.4%", trend: "up", hint: "vs last 30 days" },
    { label: "Churn", value: "1.2%", delta: "-0.3%", trend: "down", hint: "vs last 30 days" },
  ]}
/>`;

export function ScoreboardDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Scoreboard</h1>
        <p className={styles.lede}>
          A metrics strip of kit Scorecards. One KPI alone is Scorecard. Do not invent a local row.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="scoreboard-master">
        <div className={styles.masterHeader}>
          <h2 id="scoreboard-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Scoreboard composes kit Scorecards. Preview the strip, then the row example.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.exampleCanvas}>
              <Scoreboard items={ITEMS} />
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Scoreboard is a metrics strip of kit Scorecards. One KPI alone is Scorecard. Do
                  not invent a local row.
                </p>
              </div>
              <CodeBlock code={SNIPPET} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Row</h2>
              <div className={styles.exampleCanvas}>
                <Scoreboard items={ITEMS} />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Pass items with label, value, delta, trend, and hint. Scoreboard lays out the
                  Scorecards. Do not restyle the cards from here.
                </p>
              </div>
              <CodeBlock code={SNIPPET} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
