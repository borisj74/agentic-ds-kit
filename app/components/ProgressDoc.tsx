"use client";

import { useState } from "react";
import { Progress } from "@/ui/Progress";
import type { ProgressSize } from "@/ui/Progress";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: ProgressSize[] = ["sm", "md"];
const MASTER_VALUE = 33;
const PREVIEW_FILL = { maxWidth: "24rem" } as const;

function masterCode(size: ProgressSize) {
  const lines = ["<Progress", `  value={${MASTER_VALUE}}`];
  if (size !== "md") lines.push(`  size="${size}"`);
  lines.push("/>");
  return lines.join("\n");
}

export function ProgressDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<ProgressSize>("md");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Progress</h1>
        <p className={styles.lede}>
          Task completion as a bar, 0 to 100. One piece. Not ProgressLabel or ProgressIndicator.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="progress-master">
        <div className={styles.masterHeader}>
          <h2 id="progress-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Determinate bar at 33. Size lives in the panel. Label and percent are a variant.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Progress value={MASTER_VALUE} size={size} />
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Size</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Size">
                    {SIZES.map((step) => (
                      <button
                        key={step}
                        type="button"
                        className={`${styles.sizeTab} ${size === step ? styles.sizeTabActive : ""}`}
                        aria-pressed={size === step}
                        onClick={() => setSize(step)}
                      >
                        {step}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Known percent only. Cell type=progress composes this. Do not invent
                  ProgressLabel, ProgressValue, or ProgressIndicator.
                </p>
              </div>
              <CodeBlock code={masterCode(size)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Label and value</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Progress value={56} label="Upload progress" showValue />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  label and showValue sit on the same piece. No ProgressLabel or ProgressValue.
                </p>
              </div>
              <CodeBlock code={'<Progress value={56} label="Upload progress" showValue />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
