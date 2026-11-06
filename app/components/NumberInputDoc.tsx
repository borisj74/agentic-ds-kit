"use client";

import { useState } from "react";
import { Field, NumberInput } from "agentic-ds-kit";
import type { NumberInputSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const SIZES: NumberInputSize[] = ["sm", "md", "lg"];
const PREVIEW_FILL = { maxWidth: "20rem" } as const;

export function NumberInputDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<NumberInputSize>("md");
  const [qty, setQty] = useState<number | null>(12);
  const [seats, setSeats] = useState<number | null>(4);
  const [de, setDe] = useState<number | null>(1250.5);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>NumberInput</h1>
        <p className={styles.lede}>
          A number with locale formatting, min, max, and step. Arrow keys and the stepper buttons
          move by step. Money is CurrencyInput.
        </p>
      </header>
      <section className={styles.master} aria-labelledby="numberinput-master">
        <div className={styles.masterHeader}>
          <h2 id="numberinput-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Grouping appears when the field is not focused. Typing uses the locale decimal mark.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>
        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field label="Quantity" htmlFor="number-qty">
                    <NumberInput id="number-qty" size={size} min={1} max={99} step={1} value={qty} onChange={setQty} />
                  </Field>
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
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Wrap with Field. Blur clamps to min and max. Use Slider for a rough amount on a
                  track, and CurrencyInput for money.
                </p>
              </div>
              <CodeBlock code={'<Field label="Quantity" htmlFor="qty"><NumberInput id="qty" min={1} max={99} step={1} /></Field>'} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Locale</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field label="Amount" htmlFor="number-de" hint="de-DE grouping and decimal mark">
                    <NumberInput id="number-de" locale="de-DE" value={de} onChange={setDe} steppers={false} />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  locale formats the idle value. steppers=&#123;false&#125; hides the buttons. Arrow
                  keys still step.
                </p>
              </div>
              <CodeBlock code={'<NumberInput id="amount" locale="de-DE" steppers={false} />'} />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Min and max</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field label="Seats" htmlFor="number-seats" hint="1 to 10. A typed value outside the range is clamped on blur.">
                    <NumberInput id="number-seats" min={1} max={10} value={seats} onChange={setSeats} />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  The stepper stops at min and max. A typed value outside the range is clamped on
                  blur. Field still owns the error message.
                </p>
              </div>
              <CodeBlock code={'<NumberInput id="seats" min={1} max={10} />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
