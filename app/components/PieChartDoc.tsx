"use client";

import { useState } from "react";
import { PieChart } from "agentic-ds-kit";
import type { PieChartLayout, PieChartVariant } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const VARIANTS: PieChartVariant[] = ["donut", "pie"];
const LAYOUTS: PieChartLayout[] = ["split", "stack"];

const SAMPLE = [
  { label: "Listed", value: 256 },
  { label: "Under offer", value: 385 },
  { label: "Under contract", value: 770 },
  { label: "Closed", value: 514 },
  { label: "Off market", value: 385 },
  { label: "Draft", value: 258 },
];

const NINE_SOURCES = [
  { label: "Organic search", value: 4820 },
  { label: "Direct", value: 2410 },
  { label: "Referral", value: 1290 },
  { label: "Social", value: 860 },
  { label: "Email", value: 540 },
  { label: "Affiliates", value: 320 },
  { label: "Paid search", value: 280 },
  { label: "Display", value: 190 },
  { label: "Podcast", value: 90 },
];

const CLOSE_REGIONS = [
  { label: "Region A", value: 2610 },
  { label: "Region B", value: 2540 },
  { label: "Region C", value: 2480 },
  { label: "Region D", value: 2430 },
];

function masterCode(
  variant: PieChartVariant,
  layout: PieChartLayout,
  showCenterTotal: boolean,
  sort: boolean,
) {
  const lines = ["<PieChart", '  title="Properties by status"'];
  if (variant !== "donut") lines.push(`  variant="${variant}"`);
  if (layout !== "split") lines.push(`  layout="${layout}"`);
  if (!showCenterTotal) lines.push("  showCenterTotal={false}");
  if (!sort) lines.push("  sort={false}");
  lines.push(
    "  data={[",
    "    { label: 'Listed', value: 256 },",
    "    { label: 'Under offer', value: 385 },",
    "    { label: 'Under contract', value: 770 },",
    "    { label: 'Closed', value: 514 },",
    "    { label: 'Off market', value: 385 },",
    "    { label: 'Draft', value: 258 },",
    "  ]}",
    "/>",
  );
  return lines.join("\n");
}

export function PieChartDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [variant, setVariant] = useState<PieChartVariant>("donut");
  const [layout, setLayout] = useState<PieChartLayout>("split");
  const [showCenterTotal, setShowCenterTotal] = useState(true);
  const [sort, setSort] = useState(true);

  return (
    <div>
      <header className={styles.hero}>
        <p className={styles.heroKicker}>Chart</p>
        <h1 className={styles.heroTitle}>Pie</h1>
        <p className={styles.lede}>
          Part-to-whole share for a handful of segments, as a donut or pie. One piece. Not a Chart
          cousin.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="piechart-master">
        <div className={styles.masterHeader}>
          <h2 id="piechart-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle donut or pie, layout, centre total, and sort. One share view.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <PieChart
                    title="Properties by status"
                    variant={variant}
                    layout={layout}
                    showCenterTotal={showCenterTotal}
                    sort={sort}
                    data={SAMPLE}
                  />
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Variant</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Variant">
                    {VARIANTS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.sizeTab} ${variant === option ? styles.sizeTabActive : ""}`}
                        aria-pressed={variant === option}
                        onClick={() => setVariant(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Layout</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Layout">
                    {LAYOUTS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.sizeTab} ${layout === option ? styles.sizeTabActive : ""}`}
                        aria-pressed={layout === option}
                        onClick={() => setLayout(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Display</span>
                  <Switch
                    size="sm"
                    label="Centre total"
                    checked={showCenterTotal}
                    onChange={setShowCenterTotal}
                  />
                  <Switch size="sm" label="Sort by size" checked={sort} onChange={setSort} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use PieChart for part-to-whole share with a handful of segments. Split for a
                  labelled share tile. Stack when the card is a tall column.
                </p>
              </div>
              <CodeBlock code={masterCode(variant, layout, showCenterTotal, sort)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Six-segment cap</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <PieChart
                    title="Traffic by source"
                    description="Nine sources, folded to six"
                    maxSegments={6}
                    data={NINE_SOURCES}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Past six slices, adjacent angles stop being distinguishable, so the tail folds
                  into Other. Folded categories still show individually in the table.
                </p>
              </div>
              <CodeBlock
                code={`<PieChart
  title="Traffic by source"
  maxSegments={6}
  data={nineSources}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>When not to use it</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <PieChart
                    title="Revenue by region"
                    description="Close values, the wrong job for this form"
                    variant="pie"
                    data={CLOSE_REGIONS}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  These four regions are within 7% of each other. The pie makes them look identical
                  because similar angles cannot be ranked. Use PieChart for rough share, BarChart
                  to compare close values.
                </p>
              </div>
              <CodeBlock
                code={`// Close values: reach for BarChart instead.
<PieChart variant="pie" data={regions} />`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Empty state</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <PieChart
                    title="Traffic by source"
                    description="Sessions, last 30 days"
                    data={[]}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  With no data the frame holds its shape and states why it is blank, rather than
                  collapsing or drawing an empty ring.
                </p>
              </div>
              <CodeBlock code={'<PieChart title="Traffic by source" data={[]} />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
