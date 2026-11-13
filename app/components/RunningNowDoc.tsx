"use client";

import { useState, type ReactNode } from "react";
import { RunningNow } from "agentic-ds-kit";
import type { RunningNowItem, RunningNowLayout } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import agentDoc from "./AgentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const ITEMS: RunningNowItem[] = [
  { id: "billing", name: "Billing refactor", activity: "editing invoice.ts", status: "running", elapsed: "02:14" },
  { id: "docs", name: "Docs sweep", activity: "reading 14 pages", status: "running", elapsed: "00:48" },
  { id: "flaky", name: "Flaky test hunt", activity: "rerunning suite", status: "running", elapsed: "05:31" },
  { id: "migrate", name: "Migrate DB", activity: "waiting for OK", status: "waiting", elapsed: "00:31" },
  { id: "deps", name: "Dependency bump", activity: "resolving lockfile", status: "running", elapsed: "01:02" },
];

const WAITING = [ITEMS[0], ITEMS[3], ITEMS[1]];
const MIXED: RunningNowItem[] = [
  ITEMS[0],
  { id: "flaky", name: "Flaky test hunt", activity: "3 tests failed", status: "failed", elapsed: "05:31" },
  ITEMS[1],
];

const noop = () => {};

const VARIANT_DOCS: { title: string; about: string; code: string; render: ReactNode }[] = [
  {
    title: "Several running — row, overflow +2",
    about: "row wraps chips for a header. Past maxVisible (3) the rest is a +N chip that calls onShowAll.",
    code: `<RunningNow items={items} onSelect={openAgent} onShowAll={openList} />`,
    render: <RunningNow className={agentDoc.full} items={ITEMS} onSelect={noop} onShowAll={noop} />,
  },
  {
    title: "One awaiting approval — row",
    about: "A waiting item says why in caution text; status is always text plus color.",
    code: `<RunningNow items={items} onSelect={openAgent} />`,
    render: <RunningNow className={agentDoc.full} items={WAITING} onSelect={noop} />,
  },
  {
    title: "Mixed running and failed — stack",
    about: "stack lists one line each for a sidebar, up to 4, then \"+N more running · View all\".",
    code: `<RunningNow layout="stack" items={items} onSelect={openAgent} onShowAll={openList} />`,
    render: (
      <div className={agentDoc.row}>
        <RunningNow layout="stack" items={MIXED} onSelect={noop} />
        <RunningNow layout="stack" items={ITEMS} onSelect={noop} onShowAll={noop} />
      </div>
    ),
  },
  {
    title: "Empty — quiet",
    about: "No items: one quiet line. emptyText can say when the last run was.",
    code: `<RunningNow items={[]} />
<RunningNow items={[]} emptyText="Idle · last run 2h ago" />`,
    render: (
      <div className={agentDoc.row}>
        <RunningNow items={[]} />
        <RunningNow items={[]} emptyText="Idle · last run 2h ago" />
      </div>
    ),
  },
  {
    title: "Loading — row and stack",
    about: "loading shows skeleton chips or lines and marks the strip aria-busy.",
    code: `<RunningNow items={[]} loading />
<RunningNow layout="stack" items={[]} loading />`,
    render: (
      <div className={agentDoc.row}>
        <RunningNow items={[]} loading />
        <RunningNow layout="stack" items={[]} loading />
      </div>
    ),
  },
];

export function RunningNowDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [layout, setLayout] = useState<RunningNowLayout>("row");

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>RunningNow</h2>
        <p className={styles.lede}>Many agents, small. Not AgentMonitor. Not AgentFleet.</p>
      </header>

      <section className={styles.master} aria-labelledby="runningnow-master">
        <div className={styles.masterHeader}>
          <h2 id="runningnow-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>A row for a header or a stack for a sidebar.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <RunningNow className={layout === "row" ? agentDoc.full : undefined} layout={layout} items={ITEMS} onSelect={noop} onShowAll={noop} />
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Layout</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Layout">
                    {(["row", "stack"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.sizeTab} ${layout === option ? styles.sizeTabActive : ""}`}
                        aria-pressed={layout === option}
                        onClick={() => setLayout(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  RunningNow lives in app chrome. Each item links to its agent; open one in an AgentMonitor. Never nest a
                  monitor in the strip.
                </p>
              </div>
              <CodeBlock code={`<RunningNow layout="${layout}" items={items} onSelect={openAgent} onShowAll={openList} />`} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            {VARIANT_DOCS.map((doc) => (
              <section key={doc.title} className={styles.example}>
                <h2 className={styles.exampleTitle}>{doc.title}</h2>
                <div className={styles.exampleCanvas}>{doc.render}</div>
                <div>
                  <h3 className={styles.usageTitle}>Usage</h3>
                  <p className={styles.usageBody}>{doc.about}</p>
                </div>
                <CodeBlock code={doc.code} />
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
