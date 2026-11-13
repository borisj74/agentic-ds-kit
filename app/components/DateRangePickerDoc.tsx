"use client";

import { useState } from "react";
import { DateRangePicker, Field } from "agentic-ds-kit";
import type { DateRange, DateRangePickerSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const SIZES: DateRangePickerSize[] = ["sm", "md"];
const PREVIEW_FILL = { maxWidth: "20rem" } as const;
const QUARTERS = [
  { id: "q1", label: "Q1", start: "2026-01-01", end: "2026-03-31" },
  { id: "q2", label: "Q2", start: "2026-04-01", end: "2026-06-30" },
  { id: "this-month", label: "This month", start: "2026-11-01", end: "2026-11-30" },
  { id: "last-30", label: "Last 30 days", start: "2026-10-08", end: "2026-11-06" },
];

export function DateRangePickerDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<DateRangePickerSize>("md");
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [quarter, setQuarter] = useState<DateRange | undefined>({ start: "2026-11-01", end: "2026-11-30" });

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>DateRangePicker</h2>
        <p className={styles.lede}>
          A period with presets such as This month or Last 30 days, plus the month grid when the
          preset is not enough.
        </p>
      </header>
      <section className={styles.master} aria-labelledby="daterangepicker-master">
        <div className={styles.masterHeader}>
          <h2 id="daterangepicker-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Presets commit immediately. On the grid, the first click is the start and the second is
            the end.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>
        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field label="Period" htmlFor="range-period">
                    <DateRangePicker id="range-period" size={size} value={range} onValueChange={setRange} />
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
                  Wrap with Field. One date is DatePicker. A range without named presets is
                  DatePicker mode=range. This component is the preset list plus the grid.
                </p>
              </div>
              <CodeBlock code={'<Field label="Period" htmlFor="period"><DateRangePicker id="period" /></Field>'} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Custom presets</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field label="Quarter" htmlFor="range-quarter">
                    <DateRangePicker
                      id="range-quarter"
                      presets={QUARTERS}
                      value={quarter}
                      onValueChange={setQuarter}
                    />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  presets replaces Today, Yesterday, Last 7 days, Last 30 days, This month, and Last
                  month. Each preset is an id, a label, and YYYY-MM-DD start and end.
                </p>
              </div>
              <CodeBlock code={'<DateRangePicker id="quarter" presets={quarters} value={range} onValueChange={setRange} />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
