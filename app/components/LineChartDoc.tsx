"use client";

import { useState } from "react";
import { LineChart } from "@/ui/LineChart";
import type { LineChartVariant } from "@/ui/LineChart";
import { Switch } from "@/ui/Switch";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";

const SAMPLE = [
  { label: "Mon", value: 1240 },
  { label: "Tue", value: 1380 },
  { label: "Wed", value: 1290 },
  { label: "Thu", value: 1520 },
  { label: "Fri", value: 1680 },
  { label: "Sat", value: 1410 },
  { label: "Sun", value: 1320 },
];

export function LineChartDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [variant, setVariant] = useState<LineChartVariant>("area");
  const [showGrid, setShowGrid] = useState(true);

  const code = [
    "<LineChart",
    '  title="Weekly active users"',
    variant !== "area" ? `  variant="${variant}"` : null,
    showGrid ? null : "  showGrid={false}",
    "  data={[",
    "    { label: 'Mon', value: 1240 },",
    "    { label: 'Tue', value: 1380 },",
    "  ]}",
    "/>",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Line charts</h1>
        <p className={styles.lede}>Change and progress over time. Follow trajectories rather than unrelated magnitudes.</p>
      </header>
      <section className={styles.master}>
        <div className={styles.masterHeader}>
          <h2 className={styles.masterTitle}>Master</h2>
          <p className={styles.masterSummary}>Switch between line and area, and toggle grid lines.</p>
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
                  <LineChart title="Weekly active users" variant={variant} showGrid={showGrid} data={SAMPLE} />
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Variant</span>
                  <div className={styles.radioList} role="radiogroup">
                    {(["area", "line"] as const).map((option) => (
                      <label key={option} className={styles.radio}>
                        <input type="radio" name="line-variant" checked={variant === option} onChange={() => setVariant(option)} />
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
              <div className={styles.exampleCanvas}><LineChart title="Weekly active users" data={[]} /></div>
              <CodeBlock code={'<LineChart title="Weekly active users" data={[]} />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
