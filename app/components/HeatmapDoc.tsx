"use client";

import { useState } from "react";
import { Heatmap } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0"));

// Agent runs by weekday and hour: busy working hours, quiet nights, a lighter weekend, and an outage gap on Thursday.
function runsData() {
  const out: { row: string; column: string; value: number }[] = [];
  DAYS.forEach((day, dayIndex) => {
    const weekend = dayIndex >= 5;
    HOURS.forEach((hour, hourIndex) => {
      if (day === "Thu" && hourIndex >= 14 && hourIndex <= 16) return; // no data: outage
      const work = hourIndex >= 8 && hourIndex <= 18 ? 1 : 0.15;
      const peak = hourIndex === 10 || hourIndex === 14 ? 1.35 : 1;
      const wobble = ((dayIndex * 7 + hourIndex * 13) % 9) / 9;
      const value = Math.round((weekend ? 18 : 64) * work * peak * (0.7 + wobble * 0.5));
      out.push({ row: day, column: hour, value: hourIndex >= 2 && hourIndex <= 4 ? 0 : value });
    });
  });
  return out;
}

const RUNS = runsData();

const SERVICES = ["Billing", "Search", "Email", "Auth", "Exports"];
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const ERROR_RATE = [
  [0.4, 0.6, 0.5, 2.8, 0.7],
  [1.2, 1.1, 0.9, 1.4, 1.0],
  [0, 0, 0.2, 0, 0.1],
  [0.3, 0.2, 0.4, 0.3, 5.6],
  [0.8, 0, 0.6, 0.9, 0.7],
];
const ERRORS = SERVICES.flatMap((service, serviceIndex) =>
  WEEK.map((day, dayIndex) => ({ row: service, column: day, value: ERROR_RATE[serviceIndex][dayIndex] })),
);
const percent = (value: number) => `${value.toFixed(1)}%`;

const CODE = `<Heatmap
  title="Agent runs by hour"
  description="Last 7 days, local time"
  rows={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
  columns={["00", "01", /* … */ "23"]}
  data={[
    { row: "Mon", column: "09", value: 58 },
    { row: "Mon", column: "10", value: 81 },
    // one entry per cell; a cell with no entry shows as No data
  ]}
/>`;

export function HeatmapDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Heatmap</h2>
        <p className={styles.lede}>
          A grid of cells, rows by columns, where each cell&apos;s shade shows its value. One hue from light to
          dark, a low-to-high legend, a tooltip per cell and a table view.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="heatmap-master">
        <div className={styles.masterHeader}>
          <h2 id="heatmap-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Agent runs by weekday and hour, with quiet nights and an outage gap.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <Heatmap
                    title="Agent runs by hour"
                    description="Last 7 days, local time"
                    rows={DAYS}
                    columns={HOURS}
                    data={RUNS}
                  />
                </div>
              </div>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Four shades of the first chart colour, by equal shares of the largest value. Zero keeps a solid
                  outline; a cell with no entry has a dashed one and says No data. Tab into the grid, then move
                  with the arrow keys, Home and End.
                </p>
              </div>
              <CodeBlock code={CODE} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Formatted values</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={{ maxWidth: "32rem" }}>
                  <Heatmap
                    title="Error rate by service"
                    description="This week"
                    rows={SERVICES}
                    columns={WEEK}
                    data={ERRORS}
                    valueFormatter={percent}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  valueFormatter writes the tooltip, the legend ends and the table, here as a percent. Fewer
                  columns stretch to fill the frame.
                </p>
              </div>
              <CodeBlock
                code={`<Heatmap
  title="Error rate by service"
  rows={["Billing", "Search", "Email", "Auth", "Exports"]}
  columns={["Mon", "Tue", "Wed", "Thu", "Fri"]}
  data={errors}
  valueFormatter={(value) => \`\${value.toFixed(1)}%\`}
/>`}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Empty</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={{ maxWidth: "32rem" }}>
                  <Heatmap title="Agent runs by hour" rows={DAYS} columns={HOURS} data={[]} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>With no entries at all, the frame shows the chart empty state.</p>
              </div>
              <CodeBlock code={`<Heatmap title="Agent runs by hour" rows={days} columns={hours} data={[]} />`} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
