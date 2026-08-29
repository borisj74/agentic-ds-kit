"use client";

import { useState } from "react";
import { Toast } from "@/ui/Toast";
import type { ToastStatus } from "@/ui/Toast";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";

export function ToastDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [status, setStatus] = useState<ToastStatus>("success");

  const code = `<Toast
  title="Saved"
  description="Your changes are live."
  status="${status}"
  duration={4000}
  onClose={() => {}}
/>`;

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Toasts</h1>
        <p className={styles.lede}>Short non-blocking feedback after an action. Not Alert. Not AlertDialog.</p>
      </header>
      <section className={styles.master}>
        <div className={styles.masterHeader}>
          <h2 className={styles.masterTitle}>Master</h2>
          <p className={styles.masterSummary}>Pick a status tone for the toast preview.</p>
          <div className={styles.tabList} role="tablist" aria-label="Master views">
            <button type="button" role="tab" aria-selected={tab === "preview"} className={`${styles.tab} ${tab === "preview" ? styles.tabActive : ""}`} onClick={() => setTab("preview")}>Preview</button>
            <button type="button" role="tab" aria-selected={tab === "variants"} className={`${styles.tab} ${tab === "variants" ? styles.tabActive : ""}`} onClick={() => setTab("variants")}>Variants</button>
          </div>
        </div>
        {tab === "preview" ? (
          <div role="tabpanel">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <Toast title="Saved" description="Your changes are live." status={status} onClose={() => {}} />
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Status</span>
                  <div className={styles.radioList} role="radiogroup">
                    {(["default", "success", "warning", "danger", "info"] as const).map((option) => (
                      <label key={option} className={styles.radio}>
                        <input type="radio" name="toast-status" checked={status === option} onChange={() => setStatus(option)} />
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
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewStack}>
                  <Toast size="sm" title="Small" description="Compact toast." onClose={() => {}} />
                  <Toast size="md" title="Medium" description="Default toast." onClose={() => {}} />
                  <Toast size="lg" title="Large" description="Roomier toast." onClose={() => {}} />
                </div>
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
