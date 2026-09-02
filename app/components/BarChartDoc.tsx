"use client";

import { useState } from "react";
import { BarChart } from "agentic-ds-kit";
import type { BarChartOrientation } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const ORIENTATIONS: BarChartOrientation[] = ["vertical", "horizontal"];

const SAMPLE = [
  { label: "Region A", value: 2610 },
  { label: "Region B", value: 2540 },
  { label: "Region C", value: 2480 },
  { label: "Region D", value: 2430 },
];

const QUARTER_LABELS = ["Q1", "Q2", "Q3", "Q4"];

const QUARTER_SERIES = [
  { label: "Product A", data: [120, 180, 150, 210] },
  { label: "Product B", data: [90, 110, 130, 140] },
];

const TRAFFIC = [
  { label: "Organic", value: 4820 },
  { label: "Direct", value: 2410 },
  { label: "Referral", value: 1290 },
  { label: "Social", value: 860 },
];

function masterCode(orientation: BarChartOrientation, showGrid: boolean) {
  const lines = [
    "<BarChart",
    '  title="Revenue by region"',
    '  description="Close values, the right job for this form"',
  ];
  if (orientation !== "vertical") lines.push(`  orientation="${orientation}"`);
  if (!showGrid) lines.push("  showGrid={false}");
  lines.push(
    "  data={[",
    "    { label: 'Region A', value: 2610 },",
    "    { label: 'Region B', value: 2540 },",
    "  ]}",
    "/>",
  );
  return lines.join("\n");
}

export function BarChartDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [orientation, setOrientation] = useState<BarChartOrientation>("vertical");
  const [showGrid, setShowGrid] = useState(true);

  return (
    <div>
      <header className={styles.hero}>
        <p className={styles.heroKicker}>Chart</p>
        <h1 className={styles.heroTitle}>Bar</h1>
        <p className={styles.lede}>
          Compare magnitudes across categories. Bar length ranks close values. One piece. Not a
          Chart cousin.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="barchart-master">
        <div className={styles.masterHeader}>
          <h2 id="barchart-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle orientation and grid. One ranked comparison.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <BarChart
                    title="Revenue by region"
                    description="Close values, the right job for this form"
                    orientation={orientation}
                    showGrid={showGrid}
                    data={SAMPLE}
                  />
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Orientation</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Orientation">
                    {ORIENTATIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.sizeTab} ${orientation === option ? styles.sizeTabActive : ""}`}
                        aria-pressed={orientation === option}
                        onClick={() => setOrientation(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Display</span>
                  <Switch size="sm" label="Grid" checked={showGrid} onChange={setShowGrid} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use BarChart when readers need to rank magnitudes. Vertical for time or ordered
                  categories, horizontal when labels run long. Hover a bar to read it.
                </p>
              </div>
              <CodeBlock code={masterCode(orientation, showGrid)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Grouped series</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <BarChart
                    title="Quarterly revenue"
                    categories={QUARTER_LABELS}
                    series={QUARTER_SERIES}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Categories plus series group bars on a shared axis. Hover one bar to isolate it;
                  the legend emphasises a whole series.
                </p>
              </div>
              <CodeBlock
                code={`<BarChart
  title="Quarterly revenue"
  categories={['Q1', 'Q2', 'Q3', 'Q4']}
  series={[
    { label: 'Product A', data: [120, 180, 150, 210] },
    { label: 'Product B', data: [90, 110, 130, 140] },
  ]}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Single series</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <BarChart title="Traffic by source" data={TRAFFIC} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Flat data is one series. Each bar takes its own hue from the palette so adjacent
                  categories stay distinguishable.
                </p>
              </div>
              <CodeBlock
                code={`<BarChart
  title="Traffic by source"
  data={[
    { label: 'Organic', value: 4820 },
    { label: 'Direct', value: 2410 },
    { label: 'Referral', value: 1290 },
    { label: 'Social', value: 860 },
  ]}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Empty state</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <BarChart
                    title="Traffic by source"
                    description="Close values, the right job for this form"
                    data={[]}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  With no data the frame holds its shape and states why it is blank, rather than
                  collapsing or drawing empty bars.
                </p>
              </div>
              <CodeBlock code={'<BarChart title="Traffic by source" data={[]} />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
