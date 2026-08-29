"use client";

import { useState } from "react";
import { BarChart } from "@/ui/BarChart";
import type { BarChartOrientation } from "@/ui/BarChart";
import { Switch } from "@/ui/Switch";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";

const SAMPLE = [
  { label: "North", value: 2610 },
  { label: "South", value: 2540 },
  { label: "East", value: 2480 },
  { label: "West", value: 2430 },
];

export function BarChartDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [orientation, setOrientation] = useState<BarChartOrientation>("vertical");
  const [showGrid, setShowGrid] = useState(true);

  const code = [
    "<BarChart",
    '  title="Revenue by region"',
    orientation !== "vertical" ? `  orientation="${orientation}"` : null,
    showGrid ? null : "  showGrid={false}",
    "  data={[",
    "    { label: 'North', value: 2610 },",
    "    { label: 'South', value: 2540 },",
    "  ]}",
    "/>",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Bar charts</h1>
        <p className={styles.lede}>Compare magnitudes across categories. Bar length makes close values easy to rank.</p>
      </header>
      <section className={styles.master}>
        <div className={styles.masterHeader}>
          <h2 className={styles.masterTitle}>Master</h2>
          <p className={styles.masterSummary}>Switch orientation and grid lines to preview the bar chart.</p>
          <div className={styles.tabList} role="tablist" aria-label="Master views">
            <button type="button" role="tab" aria-selected={tab === "preview"} className={`${styles.tab} ${tab === "preview" ? styles.tabActive : ""}`} onClick={() => setTab("preview")}>Preview</button>
            <button type="button" role="tab" aria-selected={tab === "variants"} className={`${styles.tab} ${tab === "variants" ? styles.tabActive : ""}`} onClick={() => setTab("variants")}>Variants</button>
          </div>
        </div>
        {tab === "preview" ? (
          <div role="tabpanel">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <BarChart title="Revenue by region" orientation={orientation} showGrid={showGrid} data={SAMPLE} />
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Orientation</span>
                  <div className={styles.radioList} role="radiogroup">
                    {(["vertical", "horizontal"] as const).map((option) => (
                      <label key={option} className={styles.radio}>
                        <input type="radio" name="bar-orientation" checked={orientation === option} onChange={() => setOrientation(option)} />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                <Switch label="Grid" size="sm" checked={showGrid} onChange={setShowGrid} />
              </aside>
            </div>
            <div className={styles.docs}><CodeBlock code={code} /></div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Empty state</h2>
              <div className={styles.exampleCanvas}><BarChart title="Traffic by source" data={[]} /></div>
              <CodeBlock code={'<BarChart title="Traffic by source" data={[]} />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
