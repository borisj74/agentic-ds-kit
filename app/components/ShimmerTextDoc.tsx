"use client";

import { useState } from "react";
import { ShimmerText } from "@/ui/ShimmerText";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";

export function ShimmerTextDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [speed, setSpeed] = useState(1);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Shimmer Text</h1>
        <p className={styles.lede}>Animated text for short, indeterminate processing states.</p>
      </header>
      <section className={styles.master}>
        <div className={styles.masterHeader}>
          <h2 className={styles.masterTitle}>Master</h2>
          <p className={styles.masterSummary}>Change speed to preview the shimmer treatment.</p>
          <div className={styles.tabList} role="tablist" aria-label="Master views">
            <button type="button" role="tab" aria-selected={tab === "preview"} className={`${styles.tab} ${tab === "preview" ? styles.tabActive : ""}`} onClick={() => setTab("preview")}>Preview</button>
            <button type="button" role="tab" aria-selected={tab === "variants"} className={`${styles.tab} ${tab === "variants" ? styles.tabActive : ""}`} onClick={() => setTab("variants")}>Variants</button>
          </div>
        </div>
        {tab === "preview" ? (
          <div role="tabpanel">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <ShimmerText speed={speed}>Generating response…</ShimmerText>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <label className={styles.radio}>
                  Speed
                  <input type="range" min={0.5} max={2} step={0.25} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
                </label>
              </aside>
            </div>
            <div className={styles.docs}>
              <CodeBlock code={`<ShimmerText speed={${speed}}>Generating response…</ShimmerText>`} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewStack}>
                  <ShimmerText size="sm">Loading summary…</ShimmerText>
                  <ShimmerText size="md">Generating response…</ShimmerText>
                  <ShimmerText size="lg">Preparing draft…</ShimmerText>
                </div>
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
