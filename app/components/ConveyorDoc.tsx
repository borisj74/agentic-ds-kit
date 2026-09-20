"use client";

import { useState } from "react";
import { Badge, Conveyor, Scoreboard, Scorecard } from "agentic-ds-kit";
import type { ConveyorOrientation } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import doc from "./ConveyorDoc.module.css";
import { DocTabList } from "./DocTabList";

const ORIENTATIONS: ConveyorOrientation[] = ["horizontal", "vertical"];
const CONTENTS = ["scorecards", "chips"] as const;

type ContentKind = (typeof CONTENTS)[number];

const METRICS = [
  {
    label: "Open invoices",
    value: "128",
    delta: "+12%",
    trend: "up" as const,
    hint: "MoM",
    badge: "Month",
    badgeTone: "info" as const,
  },
  {
    label: "Overdue",
    value: "$36,420",
    delta: "+4.1%",
    trend: "up" as const,
    hint: "14 accounts",
    badge: "Month",
    badgeTone: "warning" as const,
  },
  {
    label: "Days to pay",
    value: "32 days",
    delta: "0%",
    trend: "flat" as const,
    hint: "Average across accounts",
  },
  {
    label: "Paid",
    value: "$210,300",
    delta: "+8.2%",
    trend: "up" as const,
    hint: "This month",
    badge: "Live",
    badgeTone: "success" as const,
  },
  {
    label: "Disputed",
    value: "6",
    delta: "-2",
    trend: "down" as const,
    hint: "Needs review",
    badge: "Watch",
    badgeTone: "danger" as const,
  },
  {
    label: "Credits",
    value: "$4,800",
    hint: "This month",
  },
  {
    label: "Refunds",
    value: "$1,240",
    delta: "-0.3%",
    trend: "down" as const,
    hint: "This month",
  },
  {
    label: "Trials",
    value: "48",
    hint: "12 converting",
    badge: "Week",
    badgeTone: "brand" as const,
  },
  {
    label: "Metered usage",
    value: "4.2M",
    delta: "+6%",
    trend: "up" as const,
    hint: "Events billed",
  },
];

const CHIPS = [
  "Open",
  "Overdue",
  "Paid",
  "Disputed",
  "Credits",
  "Refunds",
  "Trials",
  "Metered",
  "Collections",
  "Write-offs",
  "Pending",
  "On hold",
  "Chargebacks",
  "Settled",
];

function masterCode(orientation: ConveyorOrientation, content: ContentKind) {
  const lines = ["<Conveyor"];
  if (orientation !== "horizontal") lines.push(`  orientation="${orientation}"`);
  lines.push(`  label="${content === "chips" ? "Filters" : "Key metrics"}"`);
  if (content === "chips") {
    lines.push(">");
    lines.push("  {chips}");
    lines.push("</Conveyor>");
  } else {
    lines.push(">");
    lines.push("  <Scoreboard scroll={false} items={metrics} />");
    lines.push("</Conveyor>");
  }
  return lines.join("\n");
}

export function ConveyorDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [orientation, setOrientation] = useState<ConveyorOrientation>("horizontal");
  const [content, setContent] = useState<ContentKind>("scorecards");
  const vertical = orientation === "vertical";
  const padClass = vertical
    ? `${doc.previewPad} ${doc.previewPadVertical}`
    : content === "chips"
      ? `${doc.previewPad} ${doc.previewPadChips}`
      : doc.previewPad;
  const label = content === "chips" ? "Filters" : "Key metrics";

  const chips = CHIPS.map((chip) => (
    <Badge key={chip} tone="neutral">
      {chip}
    </Badge>
  ));

  const run =
    content === "chips" ? (
      <div className={vertical ? doc.chipCol : doc.chipRow}>{chips}</div>
    ) : vertical ? (
      <div className={doc.scoreStack}>
        {METRICS.map((item) => (
          <Scorecard key={item.label} {...item} />
        ))}
      </div>
    ) : (
      <Scoreboard scroll={false} items={METRICS} />
    );

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Conveyor</h1>
        <p className={styles.lede}>
          Arrows at both ends of a row or column that is too long to fit, so people can move it
          along without a scrollbar.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="conveyor-master">
        <div className={styles.masterHeader}>
          <h2 id="conveyor-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Switch what is inside and the direction. The arrows show only when there is something
            to scroll, and turn off at the ends.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={padClass}>
                  {vertical ? (
                    <div className={doc.verticalFrame}>
                      <Conveyor orientation={orientation} label={label}>
                        {run}
                      </Conveyor>
                    </div>
                  ) : (
                    <Conveyor orientation={orientation} label={label}>
                      {run}
                    </Conveyor>
                  )}
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Orientation</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Orientation">
                    {ORIENTATIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.sizeTab} ${orientation === option ? styles.sizeTabActive : ""}`}
                        aria-pressed={orientation === option}
                        onClick={() => setOrientation(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Content</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Content">
                    {CONTENTS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.sizeTab} ${content === option ? styles.sizeTabActive : ""}`}
                        aria-pressed={content === option}
                        onClick={() => setContent(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use Conveyor around a run that does not fit: eight Scorecards, a row of Badge
                  chips, or a tall side list. One component — put the run inside it. Arrows show
                  only when there is overflow, and each one disables at its end. A soft fade sits
                  where content passes under an arrow. A press moves most of a screenful, or the
                  step you set. Trackpad, wheel, and drag still work. Focus the run; arrow keys
                  scroll it. A Scoreboard past four cards already puts itself in one, so wrap a
                  Scoreboard by hand only when you want other settings, and pass it scroll off. For
                  paged slides with a Slide 2 of 5 caption, use Carousel. In a box narrower than
                  40rem (--grid-breakpoint-sm), the arrows give way to swipe: the track keeps the
                  whole width and comes to rest on a whole piece. It stays a focus stop, so the
                  arrow keys still move it.
                </p>
              </div>
              <CodeBlock code={masterCode(orientation, content)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>A row that does not fit</h2>
              <div className={styles.exampleCanvas}>
                <div className={doc.previewPad}>
                  <Conveyor label="Key metrics">
                    <Scoreboard scroll={false} items={METRICS} />
                  </Conveyor>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  The arrows show only when there is something to scroll, and turn off at the ends.
                  Pass scroll off when a page already wraps Scoreboard in Conveyor.
                </p>
              </div>
              <CodeBlock
                code={`<Conveyor label="Key metrics">
  <Scoreboard scroll={false} items={metrics} />
</Conveyor>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Scoreboard past four cards</h2>
              <div className={styles.exampleCanvas}>
                <div className={doc.previewPad}>
                  <Scoreboard items={METRICS} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  More than four items compose kit Conveyor. Do not wrap this again, and do not
                  invent a local scroller.
                </p>
              </div>
              <CodeBlock
                code={`<Scoreboard
  items={[
    { label: "Open invoices", value: "128" },
    { label: "Overdue", value: "$36,420" },
    { label: "Days to pay", value: "32 days" },
    { label: "Paid", value: "$210,300" },
    { label: "Disputed", value: "6" },
    { label: "Credits", value: "$4,800" },
  ]}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Vertical list</h2>
              <div className={styles.exampleCanvas}>
                <div className={`${doc.previewPad} ${doc.previewPadVertical}`}>
                  <div className={doc.verticalFrame}>
                    <Conveyor orientation="vertical" label="Accounts">
                      <div className={doc.scoreStack}>
                        {METRICS.slice(0, 6).map((item) => (
                          <Scorecard key={item.label} {...item} />
                        ))}
                      </div>
                    </Conveyor>
                  </div>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Vertical puts the arrows above and below. Give the Conveyor a height — a space
                  token or a fixed demo height — so the column can overflow.
                </p>
              </div>
              <CodeBlock
                code={`<Conveyor orientation="vertical" label="Accounts">
  {cards}
</Conveyor>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
