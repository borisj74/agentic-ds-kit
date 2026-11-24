"use client";

import { useState } from "react";
import { DateRangePicker, Field } from "agentic-ds-kit";
import type { DateRange, DateRangePickerSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const SIZES: DateRangePickerSize[] = ["sm", "md", "lg"];
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
  const [booking, setBooking] = useState<DateRange | undefined>(undefined);
  const [quarter, setQuarter] = useState<DateRange | undefined>({ start: "2026-11-01", end: "2026-11-30" });

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>DateRangePicker</h2>
        <p className={styles.lede}>
          A period with presets such as This month or Last 30 days, two months side by side, and
          typed start and end dates. Below 40rem it opens as a bottom sheet.
        </p>
      </header>
      <section className={styles.master} aria-labelledby="daterangepicker-master">
        <div className={styles.masterHeader}>
          <h2 id="daterangepicker-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            A preset, two day clicks, or a typed start and end set a pending range. Apply commits it;
            Cancel, Close or Escape leave the value as it was.
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
                  Wrap with Field. One date is DatePicker. Every date range is DateRangePicker: pass
                  presets=&#123;[]&#125; for the months and the typed fields only.
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
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>No presets, unavailable days</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field label="Stay" htmlFor="range-stay" hint="Booked nights are unavailable">
                    <DateRangePicker
                      id="range-stay"
                      presets={[]}
                      weekStart={1}
                      minDate="2026-11-24"
                      isDateDisabled={(iso) => iso >= "2026-12-04" && iso <= "2026-12-06"}
                      value={booking}
                      onValueChange={setBooking}
                    />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  presets=&#123;[]&#125; leaves the months and the typed start and end. Days before
                  minDate or turned off by isDateDisabled are struck through, and the typed fields
                  refuse them.
                </p>
              </div>
              <CodeBlock code={'<DateRangePicker id="stay" presets={[]} weekStart={1} minDate="2026-11-24" isDateDisabled={isBooked} />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
