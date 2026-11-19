"use client";

import { useState } from "react";
import { ScatterChart } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

// Accounts by monthly revenue and support tickets: tickets mostly grow with revenue, with two
// accounts that need a look (Hooli, high tickets for its size; Stark, quiet for its size).
const ACCOUNTS = [
  { id: "acme", label: "Acme", x: 12400, y: 18 },
  { id: "globex", label: "Globex", x: 31800, y: 41 },
  { id: "initech", label: "Initech", x: 4200, y: 7 },
  { id: "umbrella", label: "Umbrella", x: 22600, y: 29 },
  { id: "hooli", label: "Hooli", x: 9800, y: 46 },
  { id: "stark", label: "Stark", x: 38900, y: 12 },
  { id: "wayne", label: "Wayne", x: 27300, y: 35 },
  { id: "wonka", label: "Wonka", x: 6900, y: 11 },
  { id: "soylent", label: "Soylent", x: 16800, y: 24 },
  { id: "tyrell", label: "Tyrell", x: 19500, y: 21 },
  { id: "cyberdyne", label: "Cyberdyne", x: 33400, y: 38 },
  { id: "aperture", label: "Aperture", x: 14100, y: 16 },
];

const PLAN_OF: Record<string, string> = {
  acme: "Pro",
  globex: "Enterprise",
  initech: "Starter",
  umbrella: "Pro",
  hooli: "Starter",
  stark: "Enterprise",
  wayne: "Enterprise",
  wonka: "Starter",
  soylent: "Pro",
  tyrell: "Pro",
  cyberdyne: "Enterprise",
  aperture: "Starter",
};
const SEATS_OF: Record<string, number> = {
  acme: 40,
  globex: 220,
  initech: 8,
  umbrella: 90,
  hooli: 14,
  stark: 310,
  wayne: 180,
  wonka: 12,
  soylent: 60,
  tyrell: 55,
  cyberdyne: 260,
  aperture: 20,
};
const BY_PLAN = ACCOUNTS.map((row) => ({ ...row, group: PLAN_OF[row.id], size: SEATS_OF[row.id] }));

const euro = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "EUR", notation: "compact", maximumFractionDigits: 1 });

const CODE = `<ScatterChart
  title="Accounts by revenue and tickets"
  description="Last 30 days"
  xLabel="Monthly revenue"
  yLabel="Support tickets"
  valueFormatter={{ x: euro }}
  data={[
    { id: "acme", label: "Acme", x: 12400, y: 18 },
    { id: "globex", label: "Globex", x: 31800, y: 41 },
    { id: "hooli", label: "Hooli", x: 9800, y: 46 },
  ]}
/>`;

export function ScatterChartDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>ScatterChart</h2>
        <p className={styles.lede}>
          One dot per item, placed by two numeric measures, to show how they relate and which items break the
          pattern. Optional groups by colour, and dot size by a third value.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="scatterchart-master">
        <div className={styles.masterHeader}>
          <h2 id="scatterchart-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Accounts by monthly revenue and support tickets, one group.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <ScatterChart
                    title="Accounts by revenue and tickets"
                    description="Last 30 days"
                    xLabel="Monthly revenue"
                    yLabel="Support tickets"
                    valueFormatter={{ x: euro }}
                    data={ACCOUNTS}
                  />
                </div>
              </div>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Tickets mostly rise with revenue; the dots off that line are the accounts to look at. Hover or
                  Tab into the chart and use the arrow keys to move from dot to dot, left to right. Change over
                  time stays LineChart; comparing categories stays BarChart.
                </p>
              </div>
              <CodeBlock code={CODE} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Groups and size</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <ScatterChart
                    title="Accounts by plan"
                    description="Dot size is seats"
                    xLabel="Monthly revenue"
                    yLabel="Support tickets"
                    size="value"
                    sizeLabel="Seats"
                    valueFormatter={{ x: euro }}
                    data={BY_PLAN}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  group colours each dot, --chart-1 to --chart-6 in order of first appearance, and adds the legend.
                  size=&quot;value&quot; sizes dots by area from each row&apos;s size, here seats.
                </p>
              </div>
              <CodeBlock
                code={`<ScatterChart
  title="Accounts by plan"
  xLabel="Monthly revenue"
  yLabel="Support tickets"
  size="value"
  sizeLabel="Seats"
  data={[
    { id: "acme", label: "Acme", x: 12400, y: 18, group: "Pro", size: 40 },
    { id: "globex", label: "Globex", x: 31800, y: 41, group: "Enterprise", size: 220 },
  ]}
/>`}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Empty</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <ScatterChart title="Accounts by revenue and tickets" xLabel="Monthly revenue" yLabel="Support tickets" data={[]} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>With no rows to place, the frame shows the chart empty state.</p>
              </div>
              <CodeBlock code={`<ScatterChart title="Accounts by revenue and tickets" xLabel="Monthly revenue" yLabel="Support tickets" data={[]} />`} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
