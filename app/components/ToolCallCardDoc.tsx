"use client";

import { useState, type ReactNode } from "react";
import { Switch, ToolCallCard } from "agentic-ds-kit";
import type { ToolCall, ToolCallStatus } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import agentDoc from "./AgentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const STATUSES: ToolCallStatus[] = ["running", "done", "error"];

const ARGS = { query: "invoice total", path: "src/billing", limit: 20 };
const RESULT = [
  "invoice.ts:41 return subtotal * (1 + rate);",
  "invoice.ts:88 const total = calcTotal(inv);",
  "summary.ts:12 total: formatMoney(t),",
];
const ERROR = ["FAIL invoice.test.ts › rounds to cents", "Expected 107.1 · Received 107.10000000000001"];
const CALLS: ToolCall[] = [
  { id: "1", name: "read_file", summary: "invoice.ts", status: "done", duration: "0.4s" },
  { id: "2", name: "search_files", summary: "3 matches", status: "done", duration: "0.9s" },
  { id: "3", name: "edit_file", summary: "+2 −1", status: "done", duration: "0.2s" },
  { id: "4", name: "run_tests", summary: "invoice.test.ts", status: "running", duration: "1.1s" },
];

const noop = () => {};

const VARIANT_DOCS: { title: string; about: string; code: string; render: ReactNode }[] = [
  {
    title: "Running — live timer",
    about: "A running call spins its marker and shows a Running Badge. With startedAt the timer ticks every 100ms.",
    code: `<ToolCallCard name="search_files" summary='query: "invoice total"' status="running" startedAt={startedAt} args={args} />`,
    render: <ToolCallCard name="search_files" summary='query: "invoice total"' status="running" duration="1.2s" args={ARGS} />,
  },
  {
    title: "Done — collapsed",
    about: "The default: one line with a check, the name in mono, a summary and the time. The chevron opens the detail.",
    code: `<ToolCallCard name="read_file" summary="src/billing/invoice.ts · 142 lines" duration="0.4s" result={lines} />`,
    render: <ToolCallCard name="read_file" summary="src/billing/invoice.ts · 142 lines" duration="0.4s" result={RESULT} />,
  },
  {
    title: "Expanded — arguments and result",
    about: "Open, a call shows its arguments as JSON and its result lines. resultMeta labels the result.",
    code: `<ToolCallCard name="search_files" summary="3 matches in 2 files" duration="0.9s" args={args} result={lines} resultMeta="3 of 3" defaultExpanded />`,
    render: (
      <ToolCallCard
        name="search_files"
        summary="3 matches in 2 files"
        duration="0.9s"
        args={ARGS}
        result={RESULT}
        resultMeta="3 of 3"
        defaultExpanded
      />
    ),
  },
  {
    title: "Error — retry",
    about: "An error opens by default with the failure in mono and Retry. attempt says how many tries are left.",
    code: `<ToolCallCard name="run_tests" summary="3 failed · exit code 1" status="error" duration="8.1s" error={lines} onRetry={retry} attempt={{ n: 1, max: 3 }} />`,
    render: (
      <ToolCallCard
        name="run_tests"
        summary="3 failed · exit code 1"
        status="error"
        duration="8.1s"
        error={ERROR}
        onRetry={noop}
        attempt={{ n: 1, max: 3 }}
      />
    ),
  },
  {
    title: "Group — summary",
    about: "calls rolls several calls into one row: \"Ran 4 tools · 3 done · 1 running\". Open it to see each call.",
    code: `<ToolCallCard calls={calls} duration="2.6s" defaultExpanded />`,
    render: <ToolCallCard calls={CALLS} duration="2.6s" defaultExpanded />,
  },
];

export function ToolCallCardDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [status, setStatus] = useState<ToolCallStatus>("done");
  const [open, setOpen] = useState(true);
  const [group, setGroup] = useState(false);

  const code = group
    ? `<ToolCallCard calls={calls} duration="2.6s" />`
    : `<ToolCallCard
  name="search_files"
  summary="3 matches in 2 files"
  status="${status}"
  duration="0.9s"
  args={args}
  result={lines}${status === "error" ? "\n  error={errorLines}\n  onRetry={retry}" : ""}
/>`;

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>ToolCallCard</h1>
        <p className={styles.lede}>One tool call on one line. Not CodeSnippet. Not AgentTrail.</p>
      </header>

      <section className={styles.master} aria-labelledby="toolcallcard-master">
        <div className={styles.masterHeader}>
          <h2 id="toolcallcard-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Pick a status, open the detail, or roll calls into a group.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                {group ? (
                  <ToolCallCard calls={CALLS} duration="2.6s" expanded={open} onExpandedChange={setOpen} />
                ) : (
                  <ToolCallCard
                    name="search_files"
                    summary="3 matches in 2 files"
                    status={status}
                    duration="0.9s"
                    args={ARGS}
                    result={status === "error" ? undefined : RESULT}
                    resultMeta="3 of 3"
                    error={status === "error" ? ERROR : undefined}
                    onRetry={status === "error" ? noop : undefined}
                    attempt={status === "error" ? { n: 1, max: 3 } : undefined}
                    expanded={open}
                    onExpandedChange={setOpen}
                  />
                )}
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Status</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Status">
                    {STATUSES.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.sizeTab} ${status === option ? styles.sizeTabActive : ""}`}
                        aria-pressed={status === option}
                        onClick={() => setStatus(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Content</span>
                  <Switch size="sm" label="Open" checked={open} onChange={setOpen} />
                  <Switch size="sm" label="Group" checked={group} onChange={setGroup} />
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  ToolCallCard logs one call an agent made. Show the real arguments. A call that needs an OK first is an
                  ApprovalCard; a whole task is an AgentTrail.
                </p>
              </div>
              <CodeBlock code={code} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            {VARIANT_DOCS.map((doc) => (
              <section key={doc.title} className={styles.example}>
                <h2 className={styles.exampleTitle}>{doc.title}</h2>
                <div className={styles.exampleCanvas}>
                  <div className={agentDoc.stack}>{doc.render}</div>
                </div>
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
