"use client";

import { useState } from "react";
import { Scoreboard, Scorecard } from "agentic-ds-kit";
import type { ScorecardProps, ScorecardSize, ScorecardTrend } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const SIZES: ScorecardSize[] = ["sm", "md", "lg"];
const TRENDS: ScorecardTrend[] = ["up", "down", "flat", "neutral"];

const DELTA: Record<ScorecardTrend, string> = {
  up: "+12.4%",
  down: "-3.8%",
  flat: "0.0%",
  neutral: "+0.4%",
};

const MRR = [370, 373, 376, 381, 385, 387, 392, 398, 401, 405, 408, 410, 412.6];
const NET_NEW = [2100, 3400, 2600, 4800, 2200, 3900, 5100, 2400, 3000, 2800, 4600, 3300, 4300];
const NET_NEW_PREVIOUS = [1800, 2400, 2900, 2200, 3100, 2600, 2800, 3300, 2500, 2900, 3200, 2700, 3000];

const LOOKS: ScorecardProps[] = [
  { id: "looks-plain", label: "MRR", value: "$412.6k", delta: "+10.9%", trend: "up", hint: "vs previous 3 months", sparkline: MRR },
  {
    id: "looks-reference",
    label: "MRR",
    value: "$412.6k",
    delta: "+10.9%",
    trend: "up",
    hint: "vs previous 3 months",
    sparkline: MRR,
    sparklineVariant: "reference",
    reference: { value: 400, label: "Target $400k" },
    highlightLast: 4,
    sparklineDates: ["Aug 28", "Nov 20"],
  },
  {
    id: "looks-meter",
    label: "Churn rate",
    value: "2.1%",
    delta: "−0.5 pt",
    trend: "down",
    deltaTone: "success",
    hint: "vs previous 3 months",
    meter: { value: 2.1, max: 3, label: "of 3.0% limit", direction: "lower" },
  },
  {
    id: "looks-expressive",
    label: "Net new MRR",
    value: "$40.7k",
    delta: "+20.8%",
    trend: "up",
    sparkline: NET_NEW,
    sparklineVariant: "expressive",
    compare: NET_NEW_PREVIOUS,
  },
];

const LOOKS_CODE = `<Scorecard label="MRR" value="$412.6k" hint="vs previous 3 months" sparkline={mrr} />

<Scorecard
  label="MRR"
  value="$412.6k"
  hint="vs previous 3 months"
  sparkline={mrr}
  sparklineVariant="reference"
  reference={{ value: 400, label: "Target $400k" }}
  highlightLast={4}
  sparklineDates={["Aug 28", "Nov 20"]}
/>

<Scorecard
  label="Churn rate"
  value="2.1%"
  hint="vs previous 3 months"
  meter={{ value: 2.1, max: 3, label: "of 3.0% limit", direction: "lower" }}
/>

<Scorecard
  label="Net new MRR"
  value="$40.7k"
  sparkline={weeklyNetNew}
  sparklineVariant="expressive"
  compare={previousWeeklyNetNew}
/>`;

const MASTER_LABEL = "Revenue";
const MASTER_VALUE = "$48.2k";
const MASTER_HINT = "vs last 30 days";
const MASTER_BADGE = "Monthly";

function masterCode(
  size: ScorecardSize,
  trend: ScorecardTrend,
  showDelta: boolean,
  showHint: boolean,
  showBadge: boolean,
) {
  const lines = ["<Scorecard", `  label="${MASTER_LABEL}"`, `  value="${MASTER_VALUE}"`];
  if (showDelta) lines.push(`  delta="${DELTA[trend]}"`);
  if (showDelta || trend !== "neutral") lines.push(`  trend="${trend}"`);
  if (showHint) lines.push(`  hint="${MASTER_HINT}"`);
  if (showBadge) lines.push(`  badge="${MASTER_BADGE}"`);
  lines.push(`  size="${size}"`);
  lines.push("/>");
  return lines.join("\n");
}

export function ScorecardDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<ScorecardSize>("md");
  const [trend, setTrend] = useState<ScorecardTrend>("up");
  const [showDelta, setShowDelta] = useState(true);
  const [showHint, setShowHint] = useState(true);
  const [showBadge, setShowBadge] = useState(true);

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Scorecard</h2>
        <p className={styles.lede}>
          Metric surfaces for dashboards with a label, value, and trend in lg, md, and sm. One
          piece. Not InsightCard. Not Card. Not a KpiCard cousin.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="scorecard-master">
        <div className={styles.masterHeader}>
          <h2 id="scorecard-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle size, trend, delta, hint, and badge. One KPI tile.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <Scorecard
                  label={MASTER_LABEL}
                  value={MASTER_VALUE}
                  delta={showDelta ? DELTA[trend] : undefined}
                  trend={trend}
                  hint={showHint ? MASTER_HINT : undefined}
                  badge={showBadge ? MASTER_BADGE : undefined}
                  size={size}
                />
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
                  <span className={styles.panelLabel}>Trend</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Trend">
                    {TRENDS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.sizeTab} ${trend === option ? styles.sizeTabActive : ""}`}
                        aria-pressed={trend === option}
                        onClick={() => setTrend(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Structure</span>
                  <Switch size="sm" label="Delta" checked={showDelta} onChange={setShowDelta} />
                  <Switch size="sm" label="Hint" checked={showHint} onChange={setShowHint} />
                  <Switch size="sm" label="Badge" checked={showBadge} onChange={setShowBadge} />
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use Scorecard to surface a key metric with optional trend. Keep labels short and
                  values scannable.
                </p>
              </div>
              <CodeBlock code={masterCode(size, trend, showDelta, showHint, showBadge)} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  {SIZES.map((step) => (
                    <Scorecard
                      key={step}
                      label="Active users"
                      value="12,480"
                      delta="+8.1%"
                      trend="up"
                      hint="vs last week"
                      size={step}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use sm in dense dashboards, md for most summary rows, and lg when the metric is a
                  page hero.
                </p>
              </div>
              <CodeBlock
                code={["sm", "md", "lg"]
                  .map(
                    (step) =>
                      `<Scorecard label="Active users" value="12,480" delta="+8.1%" trend="up" hint="vs last week" size="${step}" />`,
                  )
                  .join("\n")}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Looks</h2>
              <div className={styles.exampleCanvas}>
                <Scoreboard aria-label="Scorecard looks" items={LOOKS} />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Plain stays the default. reference adds a faint grid, a dashed target with its label,
                  darker dots on the last points and start and end dates. meter swaps the line for a
                  calm bar toward a target, or under a limit with direction lower; it turns amber only
                  when the limit is passed. expressive draws a smooth curve, the previous period dashed
                  with a legend, and the latest point&apos;s value on its end dot. Keep delta or hint: the
                  drawing is decorative.
                </p>
              </div>
              <CodeBlock code={LOOKS_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Trends</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Scorecard
                    label="Conversion"
                    value="3.6%"
                    delta="+0.4%"
                    trend="up"
                    hint="vs prior period"
                  />
                  <Scorecard
                    label="Churn"
                    value="1.2%"
                    delta="-0.3%"
                    trend="down"
                    hint="vs prior period"
                  />
                  <Scorecard
                    label="NPS"
                    value="62"
                    delta="0.0%"
                    trend="flat"
                    hint="vs prior period"
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Map trend to direction. Up for growth, down for declines, and flat or neutral when
                  the change is not directional.
                </p>
              </div>
              <CodeBlock
                code={`<Scorecard label="Conversion" value="3.6%" delta="+0.4%" trend="up" hint="vs prior period" />
<Scorecard label="Churn" value="1.2%" delta="-0.3%" trend="down" hint="vs prior period" />
<Scorecard label="NPS" value="62" delta="0.0%" trend="flat" hint="vs prior period" />`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Delta tone</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Scorecard label="Overdue" value="$12.4k" delta="3 urgent" deltaTone="warning" hint="due this week" />
                  <Scorecard label="Disputes" value="2" delta="+1" trend="up" deltaTone="danger" hint="vs last week" />
                  <Scorecard label="Collected" value="$84.1k" delta="+6.2%" trend="up" hint="vs last month" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  The delta renders as a kit Delta: arrow from trend, colour from trend or deltaTone.
                  Use deltaTone when the trend colour would mislead, like a rise that is bad news.
                  With trend neutral the delta is a status, like an amber count of urgent items, and
                  shows the tone&apos;s status icon. Put changes in delta, never in badge.
                </p>
              </div>
              <CodeBlock
                code={`<Scorecard label="Overdue" value="$12.4k" delta="3 urgent" deltaTone="warning" hint="due this week" />
<Scorecard label="Disputes" value="2" delta="+1" trend="up" deltaTone="danger" hint="vs last week" />
<Scorecard label="Collected" value="$84.1k" delta="+6.2%" trend="up" hint="vs last month" />`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Good direction</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Scorecard label="Pass rate" value="91.7%" delta="+6.3 pts" trend="up" goodWhen="up" hint="vs v2 85.4%" />
                  <Scorecard label="Average cost per case" value="$0.021" delta="+17%" trend="up" goodWhen="down" hint="vs v2 $0.018" />
                  <Scorecard label="p50 latency" value="1.8 s" delta="−14%" trend="down" goodWhen="down" hint="vs v2 2.1 s" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  goodWhen says which way is good. The delta then starts with Better or Worse, with
                  CircleCheck or TriangleAlert, so a rising cost never reads as good news. Only Worse is coloured. Use up for
                  pass rate or revenue and down for cost, latency or churn.
                </p>
              </div>
              <CodeBlock
                code={`<Scorecard label="Pass rate" value="91.7%" delta="+6.3 pts" trend="up" goodWhen="up" hint="vs v2 85.4%" />
<Scorecard label="Average cost per case" value="$0.021" delta="+17%" trend="up" goodWhen="down" hint="vs v2 $0.018" />
<Scorecard label="p50 latency" value="1.8 s" delta="−14%" trend="down" goodWhen="down" hint="vs v2 2.1 s" />`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Interactive</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Scorecard
                    label="Pipeline"
                    value="$192k"
                    delta="+18%"
                    trend="up"
                    hint="vs last month"
                    onClick={() => {}}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Pass onClick when the card opens a detail view. Keep the press feedback subtle so
                  scanning still feels fast.
                </p>
              </div>
              <CodeBlock
                code={`<Scorecard
  label="Pipeline"
  value="$192k"
  delta="+18%"
  trend="up"
  hint="vs last month"
  onClick={() => {}}
/>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
