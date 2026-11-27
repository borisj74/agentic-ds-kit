"use client";

import { useState } from "react";
import { Field, TimePicker } from "agentic-ds-kit";
import type { HourCycle, TimePickerSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocNotes } from "./DocNotes";
import { ControlsPanel, RadioControl, SizeControl } from "./ControlsPanel";
import { DocTabList } from "./DocTabList";

const SIZES: TimePickerSize[] = ["sm", "md"];
const CYCLES: HourCycle[] = ["12", "24"];
const FILL = { maxWidth: "16rem" } as const;

export function TimePickerDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<TimePickerSize>("md");
  const [cycle, setCycle] = useState<HourCycle>("12");
  const [time, setTime] = useState("09:30");

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>TimePicker</h2>
        <p className={styles.lede}>
          Hour and minute. Arrow keys change the focused part. 12-hour mode has an AM/PM button.
          The value is always HH:mm.
        </p>
      </header>
      <section className={styles.master} aria-labelledby="timepicker-master">
        <div className={styles.masterHeader}>
          <h2 id="timepicker-master" className={styles.masterTitle}>Master</h2>
          <p className={styles.masterSummary}>A date and a time together is DateTimePicker. A day only is DatePicker.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>
        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill} style={FILL}>
                  <Field label="Start time" htmlFor="time-start">
                    <TimePicker id="time-start" size={size} hourCycle={cycle} value={time} onValueChange={setTime} />
                  </Field>
                </div>
              </div>
              <ControlsPanel>
                <SizeControl options={SIZES} value={size} onChange={setSize} />
                <RadioControl label="Hour cycle" options={CYCLES} value={cycle} onChange={setCycle} />
              </ControlsPanel>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Wrap with Field. Focus the hour or the minute, then ArrowUp and ArrowDown. Do not use a native time input.</p>
              </div>
              <CodeBlock code={'<Field label="Start time" htmlFor="start"><TimePicker id="start" hourCycle="12" /></Field>'} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>24-hour</h2>
              <div className={styles.exampleCanvas}>
                <Field label="Close" htmlFor="time-24">
                  <TimePicker id="time-24" hourCycle="24" defaultValue="18:00" />
                </Field>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>hourCycle 24 hides AM/PM. The stored value is still HH:mm.</p>
              </div>
              <CodeBlock code={'<TimePicker id="close" hourCycle="24" defaultValue="18:00" />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
