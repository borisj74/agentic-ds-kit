"use client";

import { useState } from "react";
import { Scoreboard } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

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

const PICKER = [
  { id: "seats", label: "Paid seats", value: "1,204", delta: "+6.2%", trend: "up" as const, sparkline: [1080, 1102, 1131, 1150, 1176, 1204] },
  { id: "trials", label: "Open trials", value: "88", delta: "−4", trend: "down" as const, deltaTone: "neutral" as const, sparkline: [97, 95, 93, 90, 91, 88] },
  { id: "refunds", label: "Refunds", value: "6", delta: "+2", trend: "up" as const, deltaTone: "danger" as const, sparkline: [3, 4, 4, 5, 4, 6] },
];

const PICKER_CODE = `const [metric, setMetric] = useState("seats");

<Scoreboard
  aria-label="Chart metric"
  appearance="divided"
  selectable
  value={metric}
  onValueChange={setMetric}
  items={[
    { id: "seats", label: "Paid seats", value: "1,204", delta: "+6.2%", trend: "up", sparkline: [1080, 1102, 1131, 1150, 1176, 1204] },
    { id: "trials", label: "Open trials", value: "88", delta: "−4", trend: "down", deltaTone: "neutral", sparkline: [97, 95, 93, 90, 91, 88] },
    { id: "refunds", label: "Refunds", value: "6", delta: "+2", trend: "up", deltaTone: "danger", sparkline: [3, 4, 4, 5, 4, 6] },
  ]}
/>`;

/** The billing home from the Metrics and DataGrid redesign: deltas judged by goodWhen, one Charted. */
const BILLING = [
  { id: "mrr", label: "MRR", value: "$412.6k", delta: "+4.2%", trend: "up" as const, goodWhen: "up" as const, hint: "vs Oct" },
  { id: "collected", label: "Collected", value: "$386.1k", delta: "+2.8%", trend: "up" as const, goodWhen: "up" as const, hint: "vs Oct" },
  { id: "overdue", label: "Overdue · 14 invoices", value: "$23.4k", delta: "+18.0%", trend: "up" as const, goodWhen: "down" as const, hint: "vs Oct" },
  { id: "churn", label: "Churn", value: "2.1%", delta: "−0.3 pt", trend: "down" as const, goodWhen: "down" as const, hint: "vs Oct" },
];

const BILLING_CODE = `const [metric, setMetric] = useState("mrr");

<Scoreboard
  aria-label="Billing, pick one to chart"
  selectable
  value={metric}
  onValueChange={setMetric}
  items={[
    { id: "mrr", label: "MRR", value: "$412.6k", delta: "+4.2%", trend: "up", goodWhen: "up", hint: "vs Oct", badge: metric === "mrr" ? "Charted" : undefined, badgeTone: "brand" },
    { id: "overdue", label: "Overdue · 14 invoices", value: "$23.4k", delta: "+18.0%", trend: "up", goodWhen: "down", hint: "vs Oct" },
    // …Collected, Churn
  ]}
/>

// On a phone: appearance="divided" keeps four figures two by two.`;

function BillingPicker({ appearance }: { appearance?: "cards" | "divided" }) {
  const [metric, setMetric] = useState("mrr");
  const items = BILLING.map((item) =>
    item.id === metric ? { ...item, badge: "Charted", badgeTone: "brand" as const } : item,
  );
  return (
    <Scoreboard
      aria-label="Billing, pick one to chart"
      appearance={appearance}
      selectable
      value={metric}
      onValueChange={setMetric}
      items={items}
    />
  );
}

function MetricPicker() {
  const [metric, setMetric] = useState("seats");
  const chosen = PICKER.find((item) => item.id === metric);
  return (
    <>
      <Scoreboard aria-label="Chart metric" appearance="divided" selectable value={metric} onValueChange={setMetric} items={PICKER} />
      <p className={styles.usageBody} aria-live="polite">
        Chart shows: {chosen?.label}
      </p>
    </>
  );
}

export function ScoreboardDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Scoreboard</h2>
        <p className={styles.lede}>
          A metrics strip of kit Scorecards: two to six figures, and the only metric picker. Up to
          six sit in one row; more wrap, and four or more go two by two on a phone. One KPI alone
          is Scorecard.
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
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Pass items with label, value, delta, trend, hint, and optional badge. Two to four
                  cards share the row equally. Four stay four-up until the strip narrows, then go
                  two by two. Five or six wrap three to a row, then two. Do not restyle the cards
                  from here.
                </p>
              </div>
              <CodeBlock code={SNIPPET} />
            </DocNotes>
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
              <h2 className={styles.exampleTitle}>Divided</h2>
              <div className={styles.exampleCanvas}>
                <Scoreboard appearance="divided" items={THREE} />
              </div>
              <p className={styles.usageBody}>
                appearance divided drops the card frames and puts a thin rule between values. Below
                about 38rem three values stack with horizontal rules; four or more go two by two
                with rules both ways.
              </p>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Selectable</h2>
              <div className={styles.exampleCanvas}>
                <MetricPicker />
              </div>
              <p className={styles.usageBody}>
                selectable makes the strip a radiogroup that picks what a chart shows. Tab in once,
                then use the arrow keys; Home and End jump. sparkline adds a small decorative trend
                under each value.
              </p>
              <CodeBlock code={PICKER_CODE} />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Charted, Better and Worse</h2>
              <div className={styles.exampleCanvas}>
                <BillingPicker />
              </div>
              <p className={styles.usageBody}>
                goodWhen makes each delta read Better or Worse with its signed value; only Worse is
                coloured. The checked card carries a Charted badge, and its name includes it.
              </p>
              <CodeBlock code={BILLING_CODE} />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Divided, two by two at 390</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewSurface}>
                  <BillingPicker appearance="divided" />
                </div>
              </div>
              <p className={styles.usageBody}>
                On a phone four figures stay two by two with rules both ways. Tap a figure to chart
                it.
              </p>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>More</h2>
              <div className={styles.exampleCanvas}>
                <Scoreboard items={MORE} />
              </div>
              <p className={styles.usageBody}>
                Five or six sit in one row on a wide page, three to a row when it narrows and two
                by two on a phone. Scoreboard never scrolls sideways and does not go in Conveyor.
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
