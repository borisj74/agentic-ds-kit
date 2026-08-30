"use client";

import { useState } from "react";
import { Button } from "@/ui/Button";
import { NumberTransition } from "@/ui/NumberTransition";
import type { NumberTransitionSize } from "@/ui/NumberTransition";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: NumberTransitionSize[] = ["sm", "md", "lg"];

function masterCode(size: NumberTransitionSize) {
  const lines = ["<NumberTransition", "  value={12840}"];
  if (size !== "md") lines.push(`  size="${size}"`);
  lines.push("  format={(n) => Number(n).toLocaleString(\"en-US\")}", "/>");
  return lines.join("\n");
}

export function NumberTransitionDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [value, setValue] = useState(12840);
  const [size, setSize] = useState<NumberTransitionSize>("md");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>NumberTransition</h1>
        <p className={styles.lede}>
          Rolling digits for live metrics and counters. Tabular numerals. One piece. Not a CountUp
          cousin.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="numbertransition-master">
        <div className={styles.masterHeader}>
          <h2 id="numbertransition-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Bump the value to preview the roll. Size lives in the panel.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <NumberTransition value={value} size={size} format={(n) => Number(n).toLocaleString("en-US")} />
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
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Value</span>
                  <Button variant="secondary" size="sm" onClick={() => setValue((v) => v + 137)}>
                    Increase
                  </Button>
                  <Button variant="tertiary" size="sm" onClick={() => setValue((v) => Math.max(0, v - 89))}>
                    Decrease
                  </Button>
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use NumberTransition for live metrics that change in place. Pass format for
                  grouped digits. Tabular numerals keep the row stable.
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
                  <NumberTransition size="sm" value={420} />
                  <NumberTransition size="md" value={12840} />
                  <NumberTransition size="lg" value={987654} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use sm in dense rows, md for most metrics, and lg when the number is the page
                  hero.
                </p>
              </div>
              <CodeBlock
                code={[
                  "<NumberTransition size=\"sm\" value={420} />",
                  "<NumberTransition size=\"md\" value={12840} />",
                  "<NumberTransition size=\"lg\" value={987654} />",
                ].join("\n")}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
