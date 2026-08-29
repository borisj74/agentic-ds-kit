"use client";

import { useState } from "react";
import { Button } from "@/ui/Button";
import { Tooltip } from "@/ui/Tooltip";
import type { TooltipPlacement } from "@/ui/Tooltip";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";

export function TooltipDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [placement, setPlacement] = useState<TooltipPlacement>("top");

  const code = `<Tooltip content="Export includes all projects" placement="${placement}">
  <Button variant="secondary" size="sm">Export</Button>
</Tooltip>`;

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Tooltips</h1>
        <p className={styles.lede}>Brief supplementary text on hover or focus. Keep copy short and non-essential.</p>
      </header>
      <section className={styles.master}>
        <div className={styles.masterHeader}>
          <h2 className={styles.masterTitle}>Master</h2>
          <p className={styles.masterSummary}>Hover or focus the trigger. Pick a placement side.</p>
          <div className={styles.tabList} role="tablist" aria-label="Master views">
            <button type="button" role="tab" aria-selected={tab === "preview"} className={`${styles.tab} ${tab === "preview" ? styles.tabActive : ""}`} onClick={() => setTab("preview")}>Preview</button>
            <button type="button" role="tab" aria-selected={tab === "variants"} className={`${styles.tab} ${tab === "variants" ? styles.tabActive : ""}`} onClick={() => setTab("variants")}>Variants</button>
          </div>
        </div>
        {tab === "preview" ? (
          <div role="tabpanel">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <Tooltip content="Export includes all projects" placement={placement}>
                  <Button variant="secondary" size="sm">Export</Button>
                </Tooltip>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Placement</span>
                  <div className={styles.radioList} role="radiogroup">
                    {(["top", "bottom", "left", "right"] as const).map((option) => (
                      <label key={option} className={styles.radio}>
                        <input type="radio" name="tooltip-placement" checked={placement === option} onChange={() => setPlacement(option)} />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
            <div className={styles.docs}><CodeBlock code={code} /></div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Icon trigger</h2>
              <div className={styles.exampleCanvas}>
                <Tooltip content="More options">
                  <Button variant="tertiary" size="sm" iconStart="MoreHorizontal" ariaLabel="More options" />
                </Tooltip>
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
