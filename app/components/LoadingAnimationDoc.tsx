"use client";

import { useState } from "react";
import { LoadingAnimation } from "@/ui/LoadingAnimation";
import type { LoadingAnimationSize } from "@/ui/LoadingAnimation";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";

const SIZES: LoadingAnimationSize[] = ["sm", "md", "lg"];

export function LoadingAnimationDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Loading Animation</h1>
        <p className={styles.lede}>Square dot-grid loading for compact panel or card waits.</p>
      </header>
      <section className={styles.master}>
        <div className={styles.masterHeader}>
          <h2 className={styles.masterTitle}>Master</h2>
          <p className={styles.masterSummary}>Nine-dot grid with crossfade motion.</p>
          <div className={styles.tabList} role="tablist" aria-label="Master views">
            <button type="button" role="tab" aria-selected={tab === "preview"} className={`${styles.tab} ${tab === "preview" ? styles.tabActive : ""}`} onClick={() => setTab("preview")}>Preview</button>
            <button type="button" role="tab" aria-selected={tab === "variants"} className={`${styles.tab} ${tab === "variants" ? styles.tabActive : ""}`} onClick={() => setTab("variants")}>Variants</button>
          </div>
        </div>
        {tab === "preview" ? (
          <div role="tabpanel">
            <div className={styles.layout}>
              <div className={styles.canvas}><LoadingAnimation label="Loading" size="md" /></div>
            </div>
            <div className={styles.docs}><CodeBlock code={'<LoadingAnimation label="Loading" size="md" />'} /></div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  {SIZES.map((size) => (
                    <LoadingAnimation key={size} label="Loading" size={size} />
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
