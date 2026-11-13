"use client";

import { useState } from "react";
import { DateTimePicker, Field } from "agentic-ds-kit";
import type { DateTimePickerSize, DateTimeValue, HourCycle } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocNotes } from "./DocNotes";
import { DocTabList } from "./DocTabList";

const SIZES: DateTimePickerSize[] = ["sm", "md"];
const FILL = { maxWidth: "20rem" } as const;

export function DateTimePickerDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<DateTimePickerSize>("md");
  const [value, setValue] = useState<DateTimeValue>({ date: "2026-11-06", time: "09:30" });
  const [cycle, setCycle] = useState<HourCycle>("12");

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>DateTimePicker</h2>
        <p className={styles.lede}>
          One field for a day and a time. The dialog keeps the month grid and the time together
          until Done or Escape.
        </p>
      </header>
      <section className={styles.master} aria-labelledby="datetimepicker-master">
        <div className={styles.masterHeader}>
          <h2 id="datetimepicker-master" className={styles.masterTitle}>Master</h2>
          <p className={styles.masterSummary}>A day only is DatePicker. A time only is TimePicker. A range of days is DateRangePicker.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>
        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill} style={FILL}>
                  <Field label="Starts" htmlFor="starts">
                    <DateTimePicker id="starts" size={size} hourCycle={cycle} value={value} onValueChange={setValue} />
                  </Field>
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Size</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Size">
                    {SIZES.map((step) => (
                      <button key={step} type="button" className={`${styles.sizeTab} ${size === step ? styles.sizeTabActive : ""}`} aria-pressed={size === step} onClick={() => setSize(step)}>{step}</button>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Hour cycle</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Hour cycle">
                    {(["12", "24"] as const).map((step) => (
                      <button key={step} type="button" className={`${styles.sizeTab} ${cycle === step ? styles.sizeTabActive : ""}`} aria-pressed={cycle === step} onClick={() => setCycle(step)}>{step}</button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>value is a date in YYYY-MM-DD and a time in HH:mm. Done closes the dialog. Escape does too, and returns focus to the field.</p>
              </div>
              <CodeBlock code={'<Field label="Starts" htmlFor="starts"><DateTimePicker id="starts" /></Field>'} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Empty</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={FILL}>
                  <Field label="Deadline" htmlFor="deadline">
                    <DateTimePicker id="deadline" placeholder="Pick a date and time" />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Leave value empty until the person picks a day and a time. The hidden input submits YYYY-MM-DDTHH:mm once both are set.</p>
              </div>
              <CodeBlock code={'<DateTimePicker id="deadline" />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
