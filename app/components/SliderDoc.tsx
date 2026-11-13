"use client";

import { useState } from "react";
import { Field, Slider } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const MASTER_MIN = 0;
const MASTER_MAX = 100;
const PREVIEW_FILL = { maxWidth: "20rem" } as const;

function masterCode(value: number) {
  return `<Field label="Volume" htmlFor="volume">\n  <Slider id="volume" value={${value}} min={${MASTER_MIN}} max={${MASTER_MAX}} onValueChange={setValue} />\n</Field>`;
}

export function SliderDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [value, setValue] = useState(33);
  const [range, setRange] = useState([25, 75]);

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Slider</h2>
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
                    <Field label="Volume" htmlFor="slider-doc-volume">
                      <Slider
                        id="slider-doc-volume"
                        value={value}
                        min={MASTER_MIN}
                        max={MASTER_MAX}
                        onValueChange={(next) => setValue(next as number)}
                      />
                    </Field>
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
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Controlled value with min, max, and step. Each thumb is role=slider with keyboard
                  support. Inside Field, the label names every thumb; on its own, pass aria-label.
                </p>
              </div>
              <CodeBlock code={masterCode(value)} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Range</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Slider aria-label="Price range" value={range} onValueChange={(next) => setRange(next as number[])} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Two-value array for a range. Not RangeSlider.</p>
              </div>
              <CodeBlock
                code={
                  '<Slider aria-label="Price range" value={[25, 75]} onValueChange={setRange} />\n<Slider aria-label="Price range" value={[25, 75]} min={0} max={100} step={1} />'
                }
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Disabled</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Slider aria-label="Volume" value={50} disabled />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>disabled blocks pointer and keyboard input.</p>
              </div>
              <CodeBlock code={'<Slider aria-label="Volume" value={50} disabled />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Vertical</h2>
              <div className={styles.exampleCanvas}>
                <Slider aria-label="Level" value={60} orientation="vertical" onValueChange={() => {}} />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>orientation vertical on the same piece.</p>
              </div>
              <CodeBlock code={'<Slider aria-label="Level" value={60} orientation="vertical" onValueChange={setValue} />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
