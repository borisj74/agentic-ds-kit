"use client";

import { useState } from "react";
import { Button } from "agentic-ds-kit";
import { Spinner } from "agentic-ds-kit";
import type { SpinnerSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: SpinnerSize[] = ["sm", "md", "lg"];

function masterCode(size: SpinnerSize) {
  if (size === "md") return "<Spinner />";
  return `<Spinner size="${size}" />`;
}

export function SpinnerDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<SpinnerSize>("md");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Spinner</h1>
        <p className={styles.lede}>
          Spinning circular loader for indeterminate waits. One piece. Not LoadingAnimation dot-grid.
          Not ThinkingAnimation.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="spinner-master">
        <div className={styles.masterHeader}>
          <h2 id="spinner-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Medium spinner. Size lives in the panel.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <Spinner size={size} />
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
                  role=status with aria-live polite. Pass label for visible copy beside the spinner.
                </p>
              </div>
              <CodeBlock code={masterCode(size)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>sm, md, and lg on one piece.</p>
              </div>
              <CodeBlock
                code={[
                  "<Spinner size=\"sm\" />",
                  "<Spinner size=\"md\" />",
                  "<Spinner size=\"lg\" />",
                ].join("\n")}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>With label</h2>
              <div className={styles.exampleCanvas}>
                <Spinner label="Processing payment…" />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Visible label beside the spinner.</p>
              </div>
              <CodeBlock code={'<Spinner label="Processing payment…" />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>In a button row</h2>
              <div className={styles.exampleCanvas}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                  }}
                >
                  <Spinner size="sm" />
                  <Button disabled>Loading…</Button>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Flex Spinner beside a kit Button. Button children stay a string.
                </p>
              </div>
              <CodeBlock
                code={`import { Button } from "agentic-ds-kit";
import { Spinner } from "agentic-ds-kit";

<div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
  <Spinner size="sm" />
  <Button disabled>Loading…</Button>
</div>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
