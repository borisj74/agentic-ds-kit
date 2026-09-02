"use client";

import { useState } from "react";
import { Slider } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const MASTER_MIN = 0;
const MASTER_MAX = 100;
const PREVIEW_FILL = { maxWidth: "20rem" } as const;

function masterCode(value: number) {
  return `<Slider value={${value}} min={${MASTER_MIN}} max={${MASTER_MAX}} onValueChange={setValue} />`;
}

export function SliderDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [value, setValue] = useState(33);
  const [range, setRange] = useState([25, 75]);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Slider</h1>
        <p className={styles.lede}>
          Pick a value or range along a track. One piece. Range is a two-value array, not
          RangeSlider. Vertical is orientation, not a cousin.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="slider-master">
        <div className={styles.masterHeader}>
          <h2 id="slider-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Single value with a live number. Drag the thumb or use arrow keys.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <div
                    style={{
                      display: "grid",
                      gap: "var(--space-3)",
                      alignItems: "center",
                    }}
                  >
                    <Slider
                      value={value}
                      min={MASTER_MIN}
                      max={MASTER_MAX}
                      onValueChange={(next) => setValue(next as number)}
                    />
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-sans)",
                        fontSize: "var(--type-size-body-sm)",
                        fontVariantNumeric: "tabular-nums",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {value}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Controlled value with min, max, and step. Each thumb is role=slider with keyboard
                  support.
                </p>
              </div>
              <CodeBlock code={masterCode(value)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Range</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Slider value={range} onValueChange={(next) => setRange(next as number[])} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Two-value array for a range. Not RangeSlider.</p>
              </div>
              <CodeBlock
                code={
                  '<Slider value={[25, 75]} onValueChange={setRange} />\n<Slider value={[25, 75]} min={0} max={100} step={1} />'
                }
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Disabled</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Slider value={50} disabled />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>disabled blocks pointer and keyboard input.</p>
              </div>
              <CodeBlock code={'<Slider value={50} disabled />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Vertical</h2>
              <div className={styles.exampleCanvas}>
                <Slider value={60} orientation="vertical" onValueChange={() => {}} />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>orientation vertical on the same piece.</p>
              </div>
              <CodeBlock code={'<Slider value={60} orientation="vertical" onValueChange={setValue} />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
