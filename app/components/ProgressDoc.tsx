"use client";

import { useState } from "react";
import { Progress } from "@/ui/Progress";
import type { ProgressShape, ProgressSize } from "@/ui/Progress";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: ProgressSize[] = ["sm", "md", "lg"];
const SHAPES: ProgressShape[] = ["bar", "circle", "semicircle"];
const MASTER_VALUE = 33;
const PREVIEW_FILL = { maxWidth: "24rem" } as const;
const STACK = { display: "grid", gap: "var(--space-4)" } as const;
const ALIGN_STACK = {
  display: "grid",
  justifyItems: "center",
  alignItems: "start",
  gap: "var(--space-6)",
} as const;

function masterCode(size: ProgressSize, shape: ProgressShape) {
  const lines = ["<Progress", `  value={${MASTER_VALUE}}`];
  if (size !== "md") lines.push(`  size="${size}"`);
  if (shape !== "bar") lines.push(`  shape="${shape}"`);
  if (shape !== "bar") lines.push("  showValue");
  lines.push("/>");
  return lines.join("\n");
}

export function ProgressDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<ProgressSize>("md");
  const [shape, setShape] = useState<ProgressShape>("bar");
  const ring = shape !== "bar";

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Progress</h1>
        <p className={styles.lede}>
          Task completion as a bar or circle, 0 to 100. Percent can overlay the track, sit at the
          end, or sit in the ring hole. Tones are brand, danger, and muted. Fill grows once on
          load. One piece. Not ProgressLabel or ProgressIndicator.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="progress-master">
        <div className={styles.masterHeader}>
          <h2 id="progress-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Determinate bar at 33. Size and shape live in the panel. Label and percent are a
            variant.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                {ring ? (
                  <Progress
                    value={MASTER_VALUE}
                    size={size}
                    shape={shape}
                    showValue
                  />
                ) : (
                  <div className={styles.previewFill} style={PREVIEW_FILL}>
                    <Progress value={MASTER_VALUE} size={size} shape={shape} />
                  </div>
                )}
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
                  <span className={styles.panelLabel}>Shape</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Shape">
                    {SHAPES.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.sizeTab} ${shape === option ? styles.sizeTabActive : ""}`}
                        aria-pressed={shape === option}
                        onClick={() => setShape(option)}
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
                  Known percent only. Cell type=progress composes this. Do not invent
                  ProgressLabel, ProgressValue, ProgressIndicator, or MeterCircle.
                </p>
              </div>
              <CodeBlock code={masterCode(size, shape)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Overlay value</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <div style={STACK}>
                    <Progress value={25} showValue valuePosition="overlay" />
                    <Progress value={50} showValue valuePosition="overlay" />
                    <Progress value={100} showValue valuePosition="overlay" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Percent sits on the bar.</p>
              </div>
              <CodeBlock
                code={
                  '<Progress value={25} showValue valuePosition="overlay" />\n<Progress value={50} showValue valuePosition="overlay" />\n<Progress value={100} showValue valuePosition="overlay" />'
                }
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>End value</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <div style={STACK}>
                    <Progress value={25} showValue valuePosition="end" />
                    <Progress value={50} showValue valuePosition="end" />
                    <Progress value={100} showValue valuePosition="end" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Percent sits after the bar.</p>
              </div>
              <CodeBlock
                code={
                  '<Progress value={25} showValue valuePosition="end" />\n<Progress value={50} showValue valuePosition="end" />\n<Progress value={100} showValue valuePosition="end" />'
                }
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Tones</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <div style={STACK}>
                    <Progress value={50} showValue valuePosition="overlay" tone="brand" />
                    <Progress value={50} showValue valuePosition="overlay" tone="danger" />
                    <Progress value={50} showValue valuePosition="overlay" tone="muted" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  brand, danger, and muted on the same piece. No extra tones.
                </p>
              </div>
              <CodeBlock
                code={
                  '<Progress value={50} showValue valuePosition="overlay" tone="brand" />\n<Progress value={50} showValue valuePosition="overlay" tone="danger" />\n<Progress value={50} showValue valuePosition="overlay" tone="muted" />'
                }
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Circle and semicircle</h2>
              <div className={styles.exampleCanvas}>
                <div style={ALIGN_STACK}>
                  <Progress value={50} size="md" shape="circle" showValue />
                  <Progress value={50} size="md" shape="semicircle" showValue />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Donut ring on the same piece. Semicircle is a bottom U: 0% empty, 100% full.
                  Percent sits in the hole or the bowl. Not MeterCircle.
                </p>
              </div>
              <CodeBlock
                code={
                  '<Progress value={50} size="md" shape="circle" showValue />\n<Progress value={50} size="md" shape="semicircle" showValue />'
                }
              />
            </section>
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
