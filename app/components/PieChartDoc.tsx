"use client";

import { useState } from "react";
import { PieChart } from "@/ui/PieChart";
import type { PieChartVariant } from "@/ui/PieChart";
import { Switch } from "@/ui/Switch";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";

const SAMPLE = [
  { label: "Listed", value: 256 },
  { label: "Under offer", value: 385 },
  { label: "Under contract", value: 770 },
  { label: "Closed", value: 514 },
];

export function PieChartDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [variant, setVariant] = useState<PieChartVariant>("donut");
  const [showCenterTotal, setShowCenterTotal] = useState(true);

  const code = [
    "<PieChart",
    '  title="Properties by status"',
    variant !== "donut" ? `  variant="${variant}"` : null,
    showCenterTotal ? null : "  showCenterTotal={false}",
    "  data={[",
    "    { label: 'Listed', value: 256 },",
    "    { label: 'Under offer', value: 385 },",
    "  ]}",
    "/>",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Pie charts</h1>
        <p className={styles.lede}>
          Part-to-whole share for a handful of segments, as a donut or solid pie. Use when readers need
          rough share at a glance.
        </p>
      </header>
      <section className={styles.master}>
        <div className={styles.masterHeader}>
          <h2 className={styles.masterTitle}>Master</h2>
          <p className={styles.masterSummary}>Switch between donut and pie, and toggle the centre total.</p>
          <div className={styles.tabList} role="tablist" aria-label="Master views">
            <button type="button" role="tab" aria-selected={tab === "preview"} className={`${styles.tab} ${tab === "preview" ? styles.tabActive : ""}`} onClick={() => setTab("preview")}>Preview</button>
            <button type="button" role="tab" aria-selected={tab === "variants"} className={`${styles.tab} ${tab === "variants" ? styles.tabActive : ""}`} onClick={() => setTab("variants")}>Variants</button>
          </div>
        </div>
        {tab === "preview" ? (
          <div role="tabpanel">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <PieChart title="Properties by status" variant={variant} showCenterTotal={showCenterTotal} data={SAMPLE} />
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Variant</span>
                  <div className={styles.radioList} role="radiogroup">
                    {(["donut", "pie"] as const).map((option) => (
                      <label key={option} className={styles.radio}>
                        <input type="radio" name="pie-variant" checked={variant === option} onChange={() => setVariant(option)} />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                <Switch label="Centre total" size="sm" checked={showCenterTotal} onChange={setShowCenterTotal} />
              </aside>
            </div>
            <div className={styles.docs}><CodeBlock code={code} /></div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Empty state</h2>
              <div className={styles.exampleCanvas}><PieChart title="Traffic by source" data={[]} /></div>
              <CodeBlock code={'<PieChart title="Traffic by source" data={[]} />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
