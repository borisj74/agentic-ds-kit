"use client";

import { useState } from "react";
import { Scoreboard } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const TWO = [
  {
    label: "Revenue",
    value: "$48.2k",
    delta: "+12.4%",
    trend: "up" as const,
    hint: "vs last 30 days",
    badge: "Live",
    badgeTone: "success" as const,
  },
  {
    label: "Churn",
    value: "1.2%",
    delta: "-0.3%",
    trend: "down" as const,
    hint: "vs last 30 days",
    badge: "Watch",
    badgeTone: "warning" as const,
  },
];

const THREE = [
  ...TWO.slice(0, 1),
  {
    label: "Conversion",
    value: "3.6%",
    delta: "+0.4%",
    trend: "up" as const,
    hint: "vs last 30 days",
    badge: "30d",
    badgeTone: "info" as const,
  },
  ...TWO.slice(1),
];

const FOUR = [
  ...THREE,
  {
    label: "Active users",
    value: "12.4k",
    delta: "+4.1%",
    trend: "up" as const,
    hint: "vs last 30 days",
    badge: "Live",
    badgeTone: "brand" as const,
  },
];

const MORE = [
  ...FOUR,
  {
    label: "NPS",
    value: "64",
    delta: "+2",
    trend: "up" as const,
    hint: "vs last 30 days",
    badge: "Survey",
    badgeTone: "neutral" as const,
  },
  {
    label: "Tickets",
    value: "38",
    delta: "-6",
    trend: "down" as const,
    hint: "vs last 30 days",
    badge: "Open",
    badgeTone: "danger" as const,
  },
];

const SNIPPET = `<Scoreboard
  items={[
    { label: "Revenue", value: "$48.2k", delta: "+12.4%", trend: "up", hint: "vs last 30 days", badge: "Live", badgeTone: "success" },
    { label: "Conversion", value: "3.6%", delta: "+0.4%", trend: "up", hint: "vs last 30 days", badge: "30d", badgeTone: "info" },
    { label: "Churn", value: "1.2%", delta: "-0.3%", trend: "down", hint: "vs last 30 days", badge: "Watch", badgeTone: "warning" },
    { label: "Active users", value: "12.4k", delta: "+4.1%", trend: "up", hint: "vs last 30 days", badge: "Live", badgeTone: "brand" },
  ]}
/>`;

export function ScoreboardDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Scoreboard</h1>
        <p className={styles.lede}>
          A metrics strip of kit Scorecards. Two to four fill the row. Four stay in one row until
          the strip narrows. More than four compose Carousel. One KPI alone is Scorecard.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="scoreboard-master">
        <div className={styles.masterHeader}>
          <h2 id="scoreboard-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Four Scorecards fill the strip. Preview the row, then two, three, four, and more.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.exampleCanvas}>
              <Scoreboard items={FOUR} />
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Pass items with label, value, delta, trend, hint, and optional badge. Two to four
                  cards share the row equally. Four stay four-up until the strip narrows, then two,
                  then one. More than four pages four-up in kit Carousel. Do not restyle the cards
                  from here.
                </p>
              </div>
              <CodeBlock code={SNIPPET} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Two</h2>
              <div className={styles.exampleCanvas}>
                <Scoreboard items={TWO} />
              </div>
              <p className={styles.usageBody}>Two Scorecards fill the row.</p>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Three</h2>
              <div className={styles.exampleCanvas}>
                <Scoreboard items={THREE} />
              </div>
              <p className={styles.usageBody}>Three Scorecards fill the row.</p>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Four</h2>
              <div className={styles.exampleCanvas}>
                <Scoreboard items={FOUR} />
              </div>
              <p className={styles.usageBody}>
                Four Scorecards fill the row. This is the Master count. They stay in one row until
                the strip is too narrow.
              </p>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>More</h2>
              <div className={styles.exampleCanvas}>
                <Scoreboard items={MORE} />
              </div>
              <p className={styles.usageBody}>
                More than four compose kit Carousel, four visible at a time. Do not invent a local scroller.
              </p>
              <CodeBlock
                code={`<Scoreboard
  items={[
    { label: "Revenue", value: "$48.2k", badge: "Live", badgeTone: "success" },
    { label: "Conversion", value: "3.6%", badge: "30d", badgeTone: "info" },
    { label: "Churn", value: "1.2%", badge: "Watch", badgeTone: "warning" },
    { label: "Active users", value: "12.4k", badge: "Live", badgeTone: "brand" },
    { label: "NPS", value: "64", badge: "Survey" },
    { label: "Tickets", value: "38", badge: "Open", badgeTone: "danger" },
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
