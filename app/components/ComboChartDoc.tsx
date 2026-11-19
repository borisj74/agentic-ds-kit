"use client";

import { useState } from "react";
import { ComboChart } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const REVENUE_VALUES = [42000, 45500, 44100, 49800, 53200, 51900, 56400, 61200, 59800, 64500, 70100, 76300];

// Revenue per month as bars, month-over-month growth as the line on its own percent axis.
// January has no earlier month to compare with, so it has no growth value and the line starts in February.
const REVENUE = MONTHS.map((label, index) => {
  const revenue = REVENUE_VALUES[index];
  const previous = REVENUE_VALUES[index - 1];
  return previous === undefined
    ? { label, revenue }
    : { label, revenue, growth: Math.round(((revenue - previous) / previous) * 1000) / 10 };
});

const ORDERS = [
  { label: "W1", web: 310, app: 180 },
  { label: "W2", web: 342, app: 205 },
  { label: "W3", web: 298, app: 231 },
  { label: "W4", web: 365, app: 248 },
  { label: "W5", web: 401, app: 262 },
  { label: "W6", web: 377, app: 290 },
].map((row, index, rows) => {
  const window = rows.slice(Math.max(0, index - 3), index + 1);
  const average = Math.round(window.reduce((sum, entry) => sum + entry.web + entry.app, 0) / window.length / 2);
  return { ...row, average };
});

const euro = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "EUR", notation: "compact", maximumFractionDigits: 1 });
const percent = (value: number) => `${value}%`;

const CODE = `<ComboChart
  title="Revenue and growth"
  description="2026, by month"
  axis="dual"
  data={[
    { label: "Jan", revenue: 42000 }, // no earlier month, so no growth
    { label: "Feb", revenue: 45500, growth: 8.3 },
    { label: "Mar", revenue: 44100, growth: -3.1 },
  ]}
  bars={[{ key: "revenue", label: "Revenue" }]}
  line={{ key: "growth", label: "Growth, month over month" }}
  valueFormatter={{ bars: euro, line: (value) => \`\${value}%\` }}
/>`;

const SEATS = [
  { label: "Jun", added: 48, grown: 21, shrunk: -9, removed: -14 },
  { label: "Jul", added: 52, grown: 18, shrunk: -12, removed: -20 },
  { label: "Aug", added: 39, grown: 25, shrunk: -7, removed: -11 },
  { label: "Sep", added: 61, grown: 22, shrunk: -15, removed: -26 },
  { label: "Oct", added: 57, grown: 30, shrunk: -10, removed: -18 },
  { label: "Nov", added: 66, grown: 27, shrunk: -13, removed: -16 },
].map((row) => ({ ...row, net: row.added + row.grown + row.shrunk + row.removed }));

export function ComboChartDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>ComboChart</h2>
        <p className={styles.lede}>
          Bars and a line on one chart over the same categories, like revenue with its growth rate. One shared
          axis, or a second axis on the right when the line has its own unit.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="combochart-master">
        <div className={styles.masterHeader}>
          <h2 id="combochart-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Revenue by month as bars, growth as a line on a percent axis.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <ComboChart
                    title="Revenue and growth"
                    description="2026, by month"
                    axis="dual"
                    data={REVENUE}
                    bars={[{ key: "revenue", label: "Revenue" }]}
                    line={{ key: "growth", label: "Growth, month over month" }}
                    valueFormatter={{ bars: euro, line: percent }}
                  />
                </div>
              </div>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  axis=&quot;dual&quot; gives the line its own scale on the right, with ticks on the same
                  gridlines. Hover or Tab to a column to read every value at once; arrow keys move column by
                  column. Bars alone stay BarChart, lines alone stay LineChart.
                </p>
              </div>
              <CodeBlock code={CODE} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Shared axis, two bar series</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <ComboChart
                    title="Orders by week"
                    description="Web and app orders, with the two-channel average over the last four weeks"
                    data={ORDERS}
                    bars={[
                      { key: "web", label: "Web" },
                      { key: "app", label: "App" },
                    ]}
                    line={{ key: "average", label: "Average of both channels" }}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  The default shared axis, for a line in the same unit as the bars. Bar series take the first,
                  second and fourth chart colours; the line keeps the third.
                </p>
              </div>
              <CodeBlock
                code={`<ComboChart
  title="Orders by week"
  data={orders}
  bars={[{ key: "web", label: "Web" }, { key: "app", label: "App" }]}
  line={{ key: "average", label: "Average of both channels" }}
/>`}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Stacked, gains and losses</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <ComboChart
                    title="Seat changes"
                    description="Seats added and removed each month, with the net"
                    stack="stacked"
                    data={SEATS}
                    bars={[
                      { key: "added", label: "New teams" },
                      { key: "grown", label: "Teams grew" },
                      { key: "shrunk", label: "Teams shrank" },
                      { key: "removed", label: "Teams left" },
                    ]}
                    line={{ key: "net", label: "Net change" }}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  stack stacked draws one bar per column. Positive values pile up from zero and
                  negative values pile down, so losses sit below the baseline. The line is the net.
                </p>
              </div>
              <CodeBlock
                code={`<ComboChart
  title="Seat changes"
  stack="stacked"
  data={seats}
  bars={[
    { key: "added", label: "New teams" },
    { key: "grown", label: "Teams grew" },
    { key: "shrunk", label: "Teams shrank" },
    { key: "removed", label: "Teams left" },
  ]}
  line={{ key: "net", label: "Net change" }}
/>`}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Empty</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <ComboChart
                    title="Revenue and growth"
                    data={[]}
                    bars={[{ key: "revenue", label: "Revenue" }]}
                    line={{ key: "growth", label: "Growth" }}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>With no values, the frame shows the chart empty state.</p>
              </div>
              <CodeBlock code={`<ComboChart title="Revenue and growth" data={[]} bars={bars} line={line} />`} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
