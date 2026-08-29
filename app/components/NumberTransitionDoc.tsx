"use client";

import { useState } from "react";
import { Button } from "@/ui/Button";
import { NumberTransition } from "@/ui/NumberTransition";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";

export function NumberTransitionDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [value, setValue] = useState(12840);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Number Transition</h1>
        <p className={styles.lede}>Rolling number treatment for live metrics and counters with tabular numerals.</p>
      </header>
      <section className={styles.master}>
        <div className={styles.masterHeader}>
          <h2 className={styles.masterTitle}>Master</h2>
          <p className={styles.masterSummary}>Bump the value to preview the roll animation.</p>
          <div className={styles.tabList} role="tablist" aria-label="Master views">
            <button type="button" role="tab" aria-selected={tab === "preview"} className={`${styles.tab} ${tab === "preview" ? styles.tabActive : ""}`} onClick={() => setTab("preview")}>Preview</button>
            <button type="button" role="tab" aria-selected={tab === "variants"} className={`${styles.tab} ${tab === "variants" ? styles.tabActive : ""}`} onClick={() => setTab("variants")}>Variants</button>
          </div>
        </div>
        {tab === "preview" ? (
          <div role="tabpanel">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <NumberTransition value={value} format={(n) => Number(n).toLocaleString("en-US")} />
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <Button variant="secondary" size="sm" onClick={() => setValue((v) => v + 137)}>Increase</Button>
                <Button variant="tertiary" size="sm" onClick={() => setValue((v) => Math.max(0, v - 89))}>Decrease</Button>
              </aside>
            </div>
            <div className={styles.docs}>
              <CodeBlock code={'<NumberTransition value={12840} format={(n) => n.toLocaleString()} />'} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <NumberTransition size="sm" value={420} />
                  <NumberTransition size="md" value={12840} />
                  <NumberTransition size="lg" value={987654} />
                </div>
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
