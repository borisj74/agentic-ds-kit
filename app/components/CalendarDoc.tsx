"use client";

import { useState } from "react";
import { Calendar } from "agentic-ds-kit";
import type { CalendarSize } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: CalendarSize[] = ["sm", "md", "lg"];
const SNIPPET = `<Calendar size="md" defaultValue="2026-08-29" onValueChange={(date) => setDate(date)} />`;
const MASTER_DEFAULT = "2026-08-29";

function masterCode(size: CalendarSize, disabled: boolean, value: string) {
  const lines = ["<Calendar", `  size="${size}"`, `  value="${value}"`];
  if (disabled) lines.push("  disabled");
  lines.push("  onValueChange={(date) => setDate(date)}");
  lines.push("/>");
  return lines.join("\n");
}

export function CalendarDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<CalendarSize>("md");
  const [disabled, setDisabled] = useState(false);
  const [value, setValue] = useState(MASTER_DEFAULT);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Calendars</h1>
        <p className={styles.lede}>
          Month view for picking a date in lg, md, and sm. Optional start and end highlight a range.
          Not an event calendar.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="calendar-master">
        <div className={styles.masterHeader}>
          <h2 id="calendar-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle size and disabled to preview the month grid. One date by default.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewRow}>
                  <Calendar size={size} value={value} disabled={disabled} onValueChange={setValue} />
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
                  <span className={styles.panelLabel}>States</span>
                  <Switch label="Disabled" size="sm" checked={disabled} onChange={setDisabled} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  One date by default. start and end highlight a span. Date field overlay uses this
                  Calendar. Nav is kit Buttons. minDate and maxDate are YYYY-MM-DD bounds.
                </p>
              </div>
              <CodeBlock code={masterCode(size, disabled, value)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  {SIZES.map((step) => (
                    <Calendar key={step} size={step} defaultValue={MASTER_DEFAULT} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Show lg, md, and sm when hierarchy or density changes. Default is md.
                </p>
              </div>
              <CodeBlock
                code={SIZES.map((step) => `<Calendar size="${step}" defaultValue="${MASTER_DEFAULT}" />`).join("\n")}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Disabled</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Calendar size="md" defaultValue={MASTER_DEFAULT} disabled />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Disabled dims the calendar and blocks interaction, including month navigation.
                </p>
              </div>
              <CodeBlock code={'<Calendar size="md" defaultValue="2026-08-29" disabled />'} />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Min and max</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Calendar
                    size="md"
                    defaultValue={MASTER_DEFAULT}
                    minDate="2026-08-10"
                    maxDate="2026-09-15"
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  minDate and maxDate bound selectable days. Adjacent months are blocked when they
                  fall fully outside the range.
                </p>
              </div>
              <CodeBlock
                code={'<Calendar size="md" defaultValue="2026-08-29" minDate="2026-08-10" maxDate="2026-09-15" />'}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Range</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Calendar size="md" start="2026-08-10" end="2026-08-18" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  start and end highlight the span. DatePicker mode=&quot;range&quot; drives this. Not an
                  event calendar and not DualCalendar.
                </p>
              </div>
              <CodeBlock code={'<Calendar start="2026-08-10" end="2026-08-18" />'} />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Contract snippet</h2>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  One date by default. Date field overlay uses this Calendar. Nav is kit Buttons.
                </p>
              </div>
              <CodeBlock code={SNIPPET} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
