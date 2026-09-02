"use client";

import { useState } from "react";
import { Scorecard } from "agentic-ds-kit";
import type { ScorecardSize, ScorecardTrend } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: ScorecardSize[] = ["sm", "md", "lg"];
const TRENDS: ScorecardTrend[] = ["up", "down", "flat", "neutral"];

const DELTA: Record<ScorecardTrend, string> = {
  up: "+12.4%",
  down: "-3.8%",
  flat: "0.0%",
  neutral: "+0.4%",
};

const MASTER_LABEL = "Revenue";
const MASTER_VALUE = "$48.2k";
const MASTER_HINT = "vs last 30 days";
const MASTER_BADGE = "Live";

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
        <h1 className={styles.heroTitle}>Scorecard</h1>
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
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use Scorecard to surface a key metric with optional trend. Keep labels short and
                  values scannable.
                </p>
              </div>
              <CodeBlock code={masterCode(size, trend, showDelta, showHint, showBadge)} />
            </div>
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
