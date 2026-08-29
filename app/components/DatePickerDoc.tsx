"use client";

import { useState } from "react";
import { DatePicker } from "@/ui/DatePicker";
import type { DatePickerSize } from "@/ui/DatePicker";
import { Field } from "@/ui/Field";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: DatePickerSize[] = ["md", "sm"];
const MASTER_DEFAULT = "2026-08-29";

function masterCode(size: DatePickerSize, disabled: boolean, value: string) {
  const lines = ["<DatePicker", '  id="start-date"', `  size="${size}"`, `  value="${value}"`];
  if (disabled) lines.push("  disabled");
  lines.push("  onValueChange={(date) => setDate(date)}");
  lines.push("/>");
  return lines.join("\n");
}

export function DatePickerDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<DatePickerSize>("md");
  const [disabled, setDisabled] = useState(false);
  const [value, setValue] = useState(MASTER_DEFAULT);
  const [fieldValue, setFieldValue] = useState(MASTER_DEFAULT);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>DatePicker</h1>
        <p className={styles.lede}>
          Form field that opens kit Calendar. Calendar stays the month grid. Not a native date input.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="datepicker-master">
        <div className={styles.masterHeader}>
          <h2 id="datepicker-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Trigger shows the chosen day. Click to open Calendar. Escape or a click outside closes it.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewRow}>
                  <DatePicker
                    id="datepicker-master"
                    size={size}
                    value={value}
                    disabled={disabled}
                    onValueChange={setValue}
                  />
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
                <div className={styles.panelGroup}>
                  <label className={styles.radio}>
                    <input
                      type="checkbox"
                      checked={disabled}
                      onChange={(event) => setDisabled(event.target.checked)}
                    />
                    Disabled
                  </label>
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use DatePicker in a form. Use Calendar when the month grid is already on the page.
                  Value is YYYY-MM-DD. Do not invent Popover or a native date input.
                </p>
              </div>
              <CodeBlock code={masterCode(size, disabled, value)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Empty</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <DatePicker id="datepicker-empty" placeholder="Pick a date" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>No value yet. Placeholder stays until a day is chosen.</p>
              </div>
              <CodeBlock code={'<DatePicker id="start-date" placeholder="Pick a date" />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>With Field</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Field label="Start date" htmlFor="datepicker-field" hint="YYYY-MM-DD under the hood">
                    <DatePicker
                      id="datepicker-field"
                      value={fieldValue}
                      onValueChange={setFieldValue}
                    />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Wrap with kit Field. htmlFor matches DatePicker id.</p>
              </div>
              <CodeBlock
                code={[
                  '<Field label="Start date" htmlFor="start-date">',
                  '  <DatePicker id="start-date" value={date} onValueChange={setDate} />',
                  "</Field>",
                ].join("\n")}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Disabled</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <DatePicker id="datepicker-disabled" defaultValue="2026-08-29" disabled />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Disabled blocks the trigger and the calendar.</p>
              </div>
              <CodeBlock code={'<DatePicker id="start-date" defaultValue="2026-08-29" disabled />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Error</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Field label="Due date" htmlFor="datepicker-error" error="Choose a date in range">
                    <DatePicker id="datepicker-error" error />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>error on DatePicker plus Field error text. Same as Input.</p>
              </div>
              <CodeBlock
                code={[
                  '<Field label="Due date" htmlFor="due-date" error="Choose a date in range">',
                  '  <DatePicker id="due-date" error />',
                  "</Field>",
                ].join("\n")}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
