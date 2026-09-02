"use client";

import { useState } from "react";
import { LoadingAnimation } from "agentic-ds-kit";
import type { LoadingAnimationSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: LoadingAnimationSize[] = ["sm", "md", "lg"];

function masterCode(size: LoadingAnimationSize) {
  return `<LoadingAnimation label="Loading" size="${size}" />`;
}

export function LoadingAnimationDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<LoadingAnimationSize>("md");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>LoadingAnimation</h1>
        <p className={styles.lede}>
          Square dot-grid wait for compact panels and cards. One piece. Not Spinner. Not
          ThinkingAnimation.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="loadinganimation-master">
        <div className={styles.masterHeader}>
          <h2 id="loadinganimation-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Nine-dot grid with crossfade motion. Size lives in the panel.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <LoadingAnimation label="Loading" size={size} />
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
                  Use LoadingAnimation for compact panel or card waits. Pass label for the status
                  name. Not ThinkingAnimation.
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
                  {SIZES.map((step) => (
                    <LoadingAnimation key={step} label="Loading" size={step} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use sm in tight chrome, md for most cards, and lg when the wait is the page
                  focus.
                </p>
              </div>
              <CodeBlock
                code={SIZES.map((step) => `<LoadingAnimation label="Loading" size="${step}" />`).join("\n")}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
