"use client";

import { useState } from "react";
import { LineChart } from "@/ui/LineChart";
import type { LineChartVariant } from "@/ui/LineChart";
import { Switch } from "@/ui/Switch";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const VARIANTS: LineChartVariant[] = ["area", "line"];

const SAMPLE = [
  { label: "Mon", value: 1240 },
  { label: "Tue", value: 1380 },
  { label: "Wed", value: 1290 },
  { label: "Thu", value: 1520 },
  { label: "Fri", value: 1680 },
  { label: "Sat", value: 1410 },
  { label: "Sun", value: 1320 },
];

const YOY_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const YOY_SERIES = [
  { label: "2025", data: [4200, 5100, 4800, 6200, 5900, 7100] },
  { label: "2024", data: [3800, 4200, 4500, 5100, 5400, 5800] },
];

function masterCode(variant: LineChartVariant, showGrid: boolean) {
  const lines = [
    "<LineChart",
    '  title="Weekly active users"',
    '  description="Daily average, last 7 days"',
  ];
  if (variant !== "area") lines.push(`  variant="${variant}"`);
  if (!showGrid) lines.push("  showGrid={false}");
  lines.push(
    "  data={[",
    "    { label: 'Mon', value: 1240 },",
    "    { label: 'Tue', value: 1380 },",
    "  ]}",
    "/>",
  );
  return lines.join("\n");
}

export function LineChartDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [variant, setVariant] = useState<LineChartVariant>("area");
  const [showGrid, setShowGrid] = useState(true);

  return (
    <div>
      <header className={styles.hero}>
        <p className={styles.heroKicker}>Chart</p>
        <h1 className={styles.heroTitle}>Line</h1>
        <p className={styles.lede}>
          Change over time. Follow a trajectory, not unrelated magnitudes. One piece. Not a Chart
          cousin.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="linechart-master">
        <div className={styles.masterHeader}>
          <h2 id="linechart-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle area or line, and grid. One series over time.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <LineChart
                    title="Weekly active users"
                    description="Daily average, last 7 days"
                    variant={variant}
                    showGrid={showGrid}
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
                  <span className={styles.panelLabel}>Display</span>
                  <Switch size="sm" label="Grid" checked={showGrid} onChange={setShowGrid} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use LineChart for change over time. Hover a moment to read the sample. Area fills
                  the path; line keeps the stroke only.
                </p>
              </div>
              <CodeBlock code={masterCode(variant, showGrid)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Multiple series</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <LineChart
                    title="Revenue"
                    description="Year over year"
                    variant="line"
                    labels={YOY_LABELS}
                    series={YOY_SERIES}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Overlay series share the axis. Hover one moment to read every series. The legend
                  emphasises one trajectory.
                </p>
              </div>
              <CodeBlock
                code={`<LineChart
  title="Revenue"
  description="Year over year"
  variant="line"
  labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
  series={[
    { label: '2025', data: [4200, 5100, 4800, 6200, 5900, 7100] },
    { label: '2024', data: [3800, 4200, 4500, 5100, 5400, 5800] },
  ]}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Area variant</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <LineChart title="Sessions" variant="area" data={SAMPLE} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Area fills the volume under the curve so magnitude over the week is readable at a
                  glance, not only the stroke.
                </p>
              </div>
              <CodeBlock
                code={`<LineChart
  title="Sessions"
  variant="area"
  data={weeklySessions}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Empty state</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <LineChart
                    title="Weekly active users"
                    description="Daily average, last 7 days"
                    data={[]}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  With no data the frame holds its shape and states why it is blank, rather than
                  collapsing or drawing an empty path.
                </p>
              </div>
              <CodeBlock
                code={'<LineChart title="Weekly active users" description="Daily average, last 7 days" data={[]} />'}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
