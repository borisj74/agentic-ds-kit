"use client";

import { useState } from "react";
import { ShimmerText } from "agentic-ds-kit";
import type { ShimmerTextSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: ShimmerTextSize[] = ["sm", "md", "lg"];
const SPEEDS = ["slow", "normal", "fast"] as const;

type NamedSpeed = (typeof SPEEDS)[number];

function masterCode(size: ShimmerTextSize, speed: NamedSpeed) {
  const lines = ["<ShimmerText"];
  if (size !== "md") lines.push(`  size="${size}"`);
  if (speed !== "normal") lines.push(`  speed="${speed}"`);
  lines.push(">", "  Generating response…", "</ShimmerText>");
  return lines.join("\n");
}

export function ShimmerTextDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<ShimmerTextSize>("md");
  const [speed, setSpeed] = useState<NamedSpeed>("normal");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>ShimmerText</h1>
        <p className={styles.lede}>
          Animated text for short, indeterminate processing. One piece. Not a Skeleton cousin.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="shimmertext-master">
        <div className={styles.masterHeader}>
          <h2 id="shimmertext-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle size and speed to preview the shimmer treatment.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <ShimmerText size={size} speed={speed}>
                  Generating response…
                </ShimmerText>
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
                  <span className={styles.panelLabel}>Speed</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Speed">
                    {SPEEDS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.sizeTab} ${speed === option ? styles.sizeTabActive : ""}`}
                        aria-pressed={speed === option}
                        onClick={() => setSpeed(option)}
                      >
                        {option}
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
                  Use ShimmerText for a short, indeterminate processing line. Keep the phrase
                  brief. Not a skeleton block.
                </p>
              </div>
              <CodeBlock code={masterCode(size, speed)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewStack}>
                  <ShimmerText size="sm">Loading summary…</ShimmerText>
                  <ShimmerText size="md">Generating response…</ShimmerText>
                  <ShimmerText size="lg">Preparing draft…</ShimmerText>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use sm in dense chrome, md for most waits, and lg when the line is the focus.
                </p>
              </div>
              <CodeBlock
                code={[
                  '<ShimmerText size="sm">Loading summary…</ShimmerText>',
                  '<ShimmerText size="md">Generating response…</ShimmerText>',
                  '<ShimmerText size="lg">Preparing draft…</ShimmerText>',
                ].join("\n")}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
