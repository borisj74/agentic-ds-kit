"use client";

import { useState } from "react";
import { Meter } from "agentic-ds-kit";
import type { MeterShape, MeterSize, MeterThresholds } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: MeterSize[] = ["sm", "md", "lg"];
const SHAPES: MeterShape[] = ["bar", "circle", "semicircle"];
const THRESHOLDS: MeterThresholds[] = ["none", "bar", "plotArea", "all"];
const MASTER_VALUE = 60;
const PREVIEW_FILL = { maxWidth: "24rem" } as const;
const STACK = { display: "grid", gap: "var(--space-4)" } as const;
const ALIGN_STACK = {
  display: "grid",
  justifyItems: "center",
  alignItems: "start",
  gap: "var(--space-6)",
} as const;

function masterCode(size: MeterSize, shape: MeterShape, thresholds: MeterThresholds) {
  const lines = ["<Meter", '  label="Budget spent"', `  value={${MASTER_VALUE}}`];
  if (size !== "md") lines.push(`  size="${size}"`);
  if (shape !== "bar") lines.push(`  shape="${shape}"`);
  if (thresholds !== "none") lines.push(`  thresholds="${thresholds}"`);
  if (shape !== "bar") lines.push("  showValue");
  lines.push("/>");
  return lines.join("\n");
}

export function MeterDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<MeterSize>("md");
  const [shape, setShape] = useState<MeterShape>("bar");
  const [thresholds, setThresholds] = useState<MeterThresholds>("none");
  const ring = shape !== "bar";

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Meter</h1>
        <p className={styles.lede}>
          How far along or how full something is, 0 to 100, as a bar, ring, or half ring, with
          optional zones. Not Progress. Not UsageList. Not MeterCircle.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="meter-master">
        <div className={styles.masterHeader}>
          <h2 id="meter-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Budget at 60. Size, shape, and thresholds live in the panel.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                {ring ? (
                  <Meter
                    label="Budget spent"
                    value={MASTER_VALUE}
                    size={size}
                    shape={shape}
                    thresholds={thresholds}
                    showValue
                  />
                ) : (
                  <div className={styles.previewFill} style={PREVIEW_FILL}>
                    <Meter
                      label="Budget spent"
                      value={MASTER_VALUE}
                      size={size}
                      shape={shape}
                      thresholds={thresholds}
                      showValue
                    />
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
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Thresholds</span>
                  <div className={styles.radioList} role="radiogroup" aria-label="Thresholds">
                    {THRESHOLDS.map((option) => (
                      <label key={option} className={styles.radio}>
                        <input
                          type="radio"
                          name="meter-thresholds"
                          value={option}
                          checked={thresholds === option}
                          onChange={() => setThresholds(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Simple determinate completion without zones stays Progress. Zones, datatip, and
                  indeterminate belong here.
                </p>
              </div>
              <CodeBlock code={masterCode(size, shape, thresholds)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Indeterminate</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Meter label="Loading data" value="indeterminate" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  A short segment slides along the bar while the amount done is not known. Bar only.
                </p>
              </div>
              <CodeBlock code={'<Meter label="Loading data" value="indeterminate" />'} />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Thresholds</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <div style={STACK}>
                    <Meter label="Budget spent" value={60} thresholds="bar" />
                    <Meter label="Budget spent" value={60} thresholds="plotArea" />
                    <Meter label="Budget spent" value={60} thresholds="all" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  At 60, the amber zone. bar colors the value, plotArea colors the track, all shows the
                  three bands.
                </p>
              </div>
              <CodeBlock
                code={
                  '<Meter label="Budget spent" value={60} thresholds="bar" />\n<Meter label="Budget spent" value={60} thresholds="plotArea" />\n<Meter label="Budget spent" value={60} thresholds="all" />'
                }
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Reference lines and datatip</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Meter
                    label="Budget spent"
                    value={60}
                    thresholds="bar"
                    referenceLines
                    datatip="$6,000 of $10,000"
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  referenceLines marks the zone edges; datatip puts a note at the end of the value.
                </p>
              </div>
              <CodeBlock
                code={
                  '<Meter label="Budget spent" value={60} thresholds="bar" referenceLines datatip="$6,000 of $10,000" />'
                }
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Circle and semicircle</h2>
              <div className={styles.exampleCanvas}>
                <div style={ALIGN_STACK}>
                  <Meter label="Setup" value={60} shape="circle" showValue />
                  <Meter label="Health score" value={60} shape="semicircle" thresholds="bar" showValue />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Donut ring and bowl gauge on the same piece. Not MeterCircle.
                </p>
              </div>
              <CodeBlock
                code={
                  '<Meter label="Setup" value={60} shape="circle" showValue />\n<Meter label="Health score" value={60} shape="semicircle" thresholds="bar" showValue />'
                }
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
