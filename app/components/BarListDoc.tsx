"use client";

import { useState } from "react";
import { BarList, Section } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const PAGES = [
  { label: "/pricing", value: 4820, href: "#pricing" },
  { label: "/docs/install", value: 3110, href: "#install" },
  { label: "/blog/launch-week", value: 1960, href: "#launch" },
  { label: "/changelog", value: 1420, href: "#changelog" },
  { label: "/docs/tokens", value: 1185, href: "#tokens" },
  { label: "/careers", value: 640, href: "#careers" },
  { label: "/docs/patterns/dashboard-with-a-long-path", value: 512, href: "#dashboard" },
  { label: "/legal/privacy", value: 214, href: "#privacy" },
];

const REVENUE = [
  { label: "Northwind Traders", value: 128400 },
  { label: "Acme Logistics", value: 96200 },
  { label: "Globex", value: 71850 },
  { label: "Initech", value: 40300 },
  { label: "Umbrella Health", value: 22900 },
];

const MODELS = [
  { label: "Answer drafted", value: 0.62 },
  { label: "Escalated to a person", value: 0.21 },
  { label: "Asked a follow-up", value: 0.12 },
  { label: "No answer", value: 0.05 },
];

const euro = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const percent = (value: number) => `${Math.round(value * 100)}%`;

const CODE = `<Section title="Top pages">
  <BarList
    label="Top pages by views"
    maxRows={5}
    data={[
      { label: "/pricing", value: 4820, href: "/analytics/pricing" },
      { label: "/docs/install", value: 3110, href: "/analytics/install" },
      { label: "/blog/launch-week", value: 1960 },
    ]}
  />
</Section>`;

export function BarListDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>BarList</h2>
        <p className={styles.lede}>
          A ranked list: each row is a label and its value, with a quiet bar behind the label sized against the
          largest value. Top rows first, Show all for the rest. Put it in a Section or Card.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="barlist-master">
        <div className={styles.masterHeader}>
          <h2 id="barlist-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Top pages by views, five rows first, each row a link.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill} style={{ maxWidth: "26rem" }}>
                  <Section title="Top pages">
                    <BarList label="Top pages by views" maxRows={5} data={PAGES} />
                  </Section>
                </div>
              </div>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  One measure, one colour. Values show as text on every row, so the bar only has to show the
                  shape of the ranking. Several series or an axis stay BarChart; usage against a limit stays
                  UsageList.
                </p>
              </div>
              <CodeBlock code={CODE} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Formatted values</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={{ maxWidth: "26rem" }}>
                  <Section title="Top customers">
                    <BarList label="Top customers by revenue" data={REVENUE} valueFormatter={euro} />
                  </Section>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  valueFormatter writes the value text, here as euros. Without maxRows every row shows.
                </p>
              </div>
              <CodeBlock
                code={`const euro = (value) =>
  value.toLocaleString("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

<BarList label="Top customers by revenue" data={customers} valueFormatter={euro} />`}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Kept order</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={{ maxWidth: "26rem" }}>
                  <Section title="How the agent ended">
                    <BarList label="How the agent ended, share of runs" sort="none" data={MODELS} valueFormatter={percent} />
                  </Section>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  sort=&quot;none&quot; keeps the order of data, for outcomes that read best in a fixed order.
                  ascending puts the smallest first.
                </p>
              </div>
              <CodeBlock code={`<BarList label="How the agent ended" sort="none" data={outcomes} valueFormatter={percent} />`} />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Empty</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={{ maxWidth: "26rem" }}>
                  <Section title="Top pages">
                    <BarList label="Top pages by views" data={[]} />
                  </Section>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>An empty data array shows No data in the muted text colour.</p>
              </div>
              <CodeBlock code={`<BarList label="Top pages by views" data={[]} />`} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
