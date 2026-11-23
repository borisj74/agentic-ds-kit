"use client";

import { useState } from "react";
import { LineChart } from "agentic-ds-kit";
import type { LineChartVariant } from "agentic-ds-kit";
import { Button, Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const VARIANTS: LineChartVariant[] = ["area", "line"];

const SAMPLE = [
  { label: "Mon", value: 1240 },
  { label: "Tue", value: 1380 },
  { label: "Wed", value: 1290 },
  { label: "Thu", value: 1520 },
  { label: "Fri", value: 1680 },
  { label: "Sat", value: 1410 },
  { label: "Sun", value: 1320 },
];

const GOAL_WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
const GOAL_SERIES = [
  { label: "This period", data: [312, 338, 297, 361, 374, 329, 388, 402] },
  { label: "Previous period", data: [281, 296, 305, 300, 318, 322, 315, 331], dashed: true },
];

// Daily MRR for the last 30 days (Oct 22 to Nov 20) with the net change each day, and the 30 days before.
const MRR_DAYS = [
  ...Array.from({ length: 10 }, (_, index) => `Oct ${22 + index}`),
  ...Array.from({ length: 20 }, (_, index) => `Nov ${1 + index}`),
];
const MRR_NET = [
  -1100, -2500, 1700, -400, -200, 1900, 2700, -900, 1000, -2800, -1000, -200, 2700, 800, -1100,
  2200, 400, 2300, -1600, -700, -1700, 400, 200, 2000, 2900, -1500, 2100, 1500, 700, 4600,
];
const MRR = MRR_NET.reduce<number[]>((totals, change) => [...totals, (totals.at(-1) ?? 398200) + change], []);
const MRR_PREVIOUS = MRR.map((value, index) => value - 6200 + ((index * 7) % 5) * 300);
const MRR_WORST_DAY = MRR_NET.indexOf(Math.min(...MRR_NET));

const YOY_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const YOY_SERIES = [
  { label: "2025", data: [4200, 5100, 4800, 6200, 5900, 7100] },
  { label: "2024", data: [3800, 4200, 4500, 5100, 5400, 5800] },
];

// Active seats by plan, Jan to Sep: Free grows slowly, Pro and Team faster, Enterprise starts in March.
const PLAN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const PLAN_SERIES = [
  { label: "Free", data: [1200, 1260, 1310, 1340, 1390, 1420, 1460, 1480, 1510] },
  { label: "Pro", data: [480, 540, 610, 660, 740, 800, 870, 930, 1010] },
  { label: "Team", data: [220, 260, 300, 360, 410, 470, 540, 600, 690] },
  { label: "Enterprise", data: [0, 0, 40, 60, 90, 120, 160, 190, 240] },
];

function masterCode(variant: LineChartVariant, showGrid: boolean) {
  const lines = [
    "<LineChart",
    '  title="Weekly active users"',
    '  description="Daily average, last 7 days"',
  ];
  if (variant !== "area") lines.push(`  variant="${variant}"`);
  if (!showGrid) lines.push("  showGrid={false}");
  lines.push(
    "  data={[",
    "    { label: 'Mon', value: 1240 },",
    "    { label: 'Tue', value: 1380 },",
    "  ]}",
    "/>",
  );
  return lines.join("\n");
}

export function LineChartDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [replay, setReplay] = useState(0);
  const [variant, setVariant] = useState<LineChartVariant>("area");
  const [showGrid, setShowGrid] = useState(true);
  const [compare, setCompare] = useState(false);

  return (
    <div>
      <header className={styles.hero}>
        <p className={styles.heroKicker}>Chart</p>
        <h2 className={styles.heroTitle}>Line</h2>
        <p className={styles.lede}>
          Change over time. Follow a trajectory, not unrelated magnitudes. One piece. Not a Chart
          cousin.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="linechart-master">
        <div className={styles.masterHeader}>
          <h2 id="linechart-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle area or line, and grid. One series over time.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <LineChart
                    title="Weekly active users"
                    description="Daily average, last 7 days"
                    variant={variant}
                    showGrid={showGrid}
                    data={SAMPLE}
                  />
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Variant</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Variant">
                    {VARIANTS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.sizeTab} ${variant === option ? styles.sizeTabActive : ""}`}
                        aria-pressed={variant === option}
                        onClick={() => setVariant(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Display</span>
                  <Switch size="sm" label="Grid" checked={showGrid} onChange={setShowGrid} />
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use LineChart for change over time. Hover a moment to read the sample. Area fills
                  the path; line keeps the stroke only.
                </p>
              </div>
              <CodeBlock code={masterCode(variant, showGrid)} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Entrance animation</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <LineChart
                    key={replay}
                    title="Revenue, year over year"
                    labels={YOY_LABELS}
                    series={YOY_SERIES}
                    animate
                  />
                </div>
              </div>
              <div>
                <Button appearance="outline" mode="neutral" size="sm" onClick={() => setReplay((count) => count + 1)}>
                  Replay
                </Button>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Lines draw in from left to right the first time they appear, and area fills fade in behind them. Off by default; with reduced motion the chart appears at once. Changing data on a mounted chart does not replay it. To replay, for example one chart per Tabs panel or a range switcher, give the chart a <code>key</code> that changes with the data.
                </p>
              </div>
              <CodeBlock
                code={`<LineChart
  title="Revenue, year over year"
  labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
  series={series}
  animate
/>`}
              />
              <CodeBlock
                code={`<LineChart
  key={range}
  title="Revenue"
  labels={labelsByRange[range]}
  series={seriesByRange[range]}
  animate
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Multiple series</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <LineChart
                    title="Revenue"
                    description="Year over year"
                    variant="line"
                    labels={YOY_LABELS}
                    series={YOY_SERIES}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Overlay series share the axis. Hover one moment to read every series. The legend
                  emphasises one trajectory.
                </p>
              </div>
              <CodeBlock
                code={`<LineChart
  title="Revenue"
  description="Year over year"
  variant="line"
  labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
  series={[
    { label: '2025', data: [4200, 5100, 4800, 6200, 5900, 7100] },
    { label: '2024', data: [3800, 4200, 4500, 5100, 5400, 5800] },
  ]}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Area variant</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <LineChart title="Sessions" variant="area" data={SAMPLE} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Area fills the volume under the curve so magnitude over the week is readable at a
                  glance, not only the stroke.
                </p>
              </div>
              <CodeBlock
                code={`<LineChart
  title="Sessions"
  variant="area"
  data={weeklySessions}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Stacked</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <LineChart
                    title="Active seats by plan"
                    description="2026, by month"
                    variant="area"
                    stack="stacked"
                    labels={PLAN_MONTHS}
                    series={PLAN_SERIES}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  stack=&quot;stacked&quot; piles the series as bands, first series at the bottom, so the top edge
                  is the total. The tooltip and legend list the top band first, and the table adds a Total
                  column. Only stack values that add up and never go negative.
                </p>
              </div>
              <CodeBlock
                code={`<LineChart
  title="Active seats by plan"
  variant="area"
  stack="stacked"
  labels={["Jan", "Feb", "Mar" /* … */]}
  series={[
    { label: "Free", data: [1200, 1260, 1310 /* … */] },
    { label: "Pro", data: [480, 540, 610 /* … */] },
    { label: "Team", data: [220, 260, 300 /* … */] },
    { label: "Enterprise", data: [0, 0, 40 /* … */] },
  ]}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Percent</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <LineChart
                    title="Share of seats by plan"
                    description="2026, by month"
                    variant="area"
                    stack="percent"
                    labels={PLAN_MONTHS}
                    series={PLAN_SERIES}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  stack=&quot;percent&quot; scales every month to 100%, so each band is that plan&apos;s share. The axis
                  runs 0–100%; the tooltip gives each share with its value, and the total.
                </p>
              </div>
              <CodeBlock code={`<LineChart title="Share of seats by plan" variant="area" stack="percent" labels={months} series={plans} />`} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Reference line and comparison</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <LineChart
                    title="Weekly signups"
                    description="Against the goal, with the previous eight weeks dashed"
                    variant="line"
                    labels={GOAL_WEEKS}
                    series={GOAL_SERIES}
                    referenceLine={{ value: 350, label: "Goal 350", highlight: "above" }}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  referenceLine draws a labelled dashed guide; highlight marks points of solid series
                  past it in the accent colour. A series with dashed true reads as a comparison, with
                  no fill. The table names the line, and each point&apos;s name says when it is past it.
                </p>
              </div>
              <CodeBlock
                code={`<LineChart
  title="Weekly signups"
  variant="line"
  labels={weeks}
  series={[
    { label: "This period", data: thisPeriod },
    { label: "Previous period", data: lastPeriod, dashed: true },
  ]}
  referenceLine={{ value: 350, label: "Goal 350", highlight: "above" }}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Latest value, change strip and compare</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <LineChart
                    title="MRR"
                    description="Last 30 days, Oct 22 to Nov 20"
                    labels={MRR_DAYS}
                    series={[
                      { label: "MRR", data: MRR },
                      ...(compare ? [{ label: "Previous 30 days", data: MRR_PREVIOUS, dashed: true }] : []),
                    ]}
                    referenceLine={{ value: 405000, label: "Target $405k" }}
                    highlightLast
                    changeStrip={{ label: "Net change per day", data: MRR_NET }}
                    tooltipNote={(index) =>
                      index === MRR_WORST_DAY ? "The largest one-day drop in 30 days." : undefined
                    }
                    actions={
                      <Button appearance="outline" mode="neutral" size="sm" onClick={() => setCompare((on) => !on)} aria-pressed={compare}>
                        Compare to last period
                      </Button>
                    }
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  highlightLast puts a dot and the value on the latest point. changeStrip adds square bars
                  under the plot for each day&apos;s change, up for gains and down for losses, on the same
                  labels and tooltip. tooltipNote adds one sentence for a day worth explaining. Keep the
                  previous period off by default and let a Compare Button add it as a dashed series, so the
                  card stays calm.
                </p>
              </div>
              <CodeBlock
                code={`<LineChart
  title="MRR"
  labels={days}
  series={[
    { label: "MRR", data: mrr },
    ...(compare ? [{ label: "Previous 30 days", data: previous, dashed: true }] : []),
  ]}
  referenceLine={{ value: 405000, label: "Target $405k" }}
  highlightLast
  changeStrip={{ label: "Net change per day", data: netChange }}
  tooltipNote={(index) => (index === worstDay ? "The largest one-day drop in 30 days." : undefined)}
  actions={
    <Button appearance="outline" mode="neutral" size="sm" aria-pressed={compare} onClick={toggleCompare}>
      Compare to last period
    </Button>
  }
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Error</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <LineChart
                    title="MRR"
                    description="Last 30 days"
                    labels={MRR_DAYS}
                    series={[{ label: "MRR", data: MRR }]}
                    error="Stripe didn't answer in time. Your data is safe. The last value we have is $408.0k from Nov 19."
                    onRetry={() => undefined}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  error swaps the plot for the kit&apos;s Couldn&apos;t load row. Say what failed and that data
                  is safe. onRetry adds a Retry Button.
                </p>
              </div>
              <CodeBlock
                code={`<LineChart
  title="MRR"
  labels={days}
  series={series}
  error="Stripe didn't answer in time. Your data is safe."
  onRetry={refetch}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Empty state</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <LineChart
                    title="Weekly active users"
                    description="Daily average, last 7 days"
                    data={[]}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  With no data the frame holds its shape and states why it is blank, rather than
                  collapsing or drawing an empty path.
                </p>
              </div>
              <CodeBlock
                code={'<LineChart title="Weekly active users" description="Daily average, last 7 days" data={[]} />'}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Header actions</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <LineChart
                    title="Weekly active users"
                    description="Daily average"
                    data={SAMPLE}
                    actions={<Button appearance="ghost" mode="neutral" size="sm" iconStart="MessageCircle" ariaLabel="Ask about Weekly active users" />}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  actions puts kit Buttons in the chart header, before the Table toggle. Every chart takes it.
                </p>
              </div>
              <CodeBlock
                code={`<LineChart
  title="Weekly active users"
  data={data}
  actions={<Button appearance="ghost" mode="neutral" size="sm" iconStart="MessageCircle" ariaLabel="Ask about Weekly active users" />}
/>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
