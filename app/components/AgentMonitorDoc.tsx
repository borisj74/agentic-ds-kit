"use client";

import { useState, type ReactNode } from "react";
import { AgentMonitor } from "agentic-ds-kit";
import type { AgentMonitorStatus, AgentMonitorStep } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import agentDoc from "./AgentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";
import { ControlsPanel, RadioControl } from "./ControlsPanel";
import { AGENT_MONITOR_AXIS, AGENT_MONITOR_STEPS } from "@/lib/agent-demo.sample";

const STEPS = AGENT_MONITOR_STEPS;
const AXIS = AGENT_MONITOR_AXIS;
const BASE = { name: "Refactor billing service", meta: "claude-code · acme-demo · example data", axis: AXIS };

const WAITING_STEPS: AgentMonitorStep[] = [...STEPS.slice(0, 5), { id: "s6", tool: "psql", status: "waiting" }];
const PAUSED_STEPS: AgentMonitorStep[] = [...STEPS.slice(0, 5), { id: "s6", tool: "edit_file", status: "waiting" }];
const DONE_STEPS: AgentMonitorStep[] = STEPS.map((step) => ({ ...step, status: "done" }));
const FAILED_STEPS: AgentMonitorStep[] = [
  STEPS[0],
  STEPS[1],
  STEPS[2],
  { id: "s4", tool: "run_tests", status: "failed", target: "invoice.test.ts · 3 failed", duration: "41.0s" },
];

const PENDING = {
  title: "Run a migration on staging?",
  description: "Drops column invoices.legacy_total on staging. Reversible from the 0041 snapshot.",
  risk: "high" as const,
  waitingSec: 31,
  action: {
    kind: "command" as const,
    command: "psql $STAGING_URL -f migrations/0042_drop_legacy.sql",
    target: "staging",
  },
};

const noop = () => {};

const VARIANT_DOCS: { title: string; about: string; code: string; render: ReactNode }[] = [
  {
    title: "Running — live clock and cost",
    about: "The clock and the cost lead. Finished steps sit in an even strip, every step the same width; the running step spins.",
    code: `<AgentMonitor
  name="Refactor billing service"
  meta="claude-code · acme-demo"
  status="running"
  headline="Editing src/billing/invoice.ts"
  headlineNote="step 6"
  elapsed="02:14"
  cost="$0.42"
  steps={steps}
  axis={["0:00", "2:14"]}
  onSelectStep={setStepId}
/>`,
    render: (
      <AgentMonitor {...BASE} headline="Editing src/billing/invoice.ts" headlineNote="step 6" elapsed="02:14" cost="$0.42" steps={STEPS} onSelectStep={noop} />
    ),
  },
  {
    title: "Step selected — details",
    about: "selectedStepId opens a detail panel with duration, tokens, cost and start time. Close returns to the clock.",
    code: `<AgentMonitor … selectedStepId="s2" onSelectStep={setStepId} />`,
    render: <AgentMonitor {...BASE} elapsed="02:14" cost="$0.42" steps={STEPS} selectedStepId="s2" onSelectStep={noop} />,
  },
  {
    title: "Awaiting approval — exact command",
    about: "status waiting with pendingAction renders the compact kit ApprovalCard in place: the title row with \"waiting m:ss\" when waitingSec is set, the exact command, small Deny and Approve (⌘/Ctrl+Enter, Escape).",
    code: `<AgentMonitor … status="waiting" pendingAction={{ title, description, risk: "high", waitingSec: 31, action: { kind: "command", command, target } }} onApprove={approve} onDeny={deny} />`,
    render: (
      <AgentMonitor {...BASE} status="waiting" elapsed="02:14" cost="$0.42" steps={WAITING_STEPS} pendingAction={PENDING} onApprove={noop} onDeny={noop} />
    ),
  },
  {
    title: "Collapsed — one-row bar",
    about: "collapsed is one row: the agent mark, the name over a mono clock and cost line, one tile per tool the run used, then the chevron. Done shows a check in place of the tools. Picking a tool opens the card on its first step; run actions, when passed, sit on a row below.",
    code: `<AgentMonitor … collapsed onCollapsedChange={setCollapsed} />`,
    render: (
      <div className={agentDoc.stack}>
        <AgentMonitor {...BASE} elapsed="02:14" cost="$0.42" steps={STEPS} collapsed onCollapsedChange={noop} />
        <AgentMonitor name="Docs sweep" status="done" elapsed="4:02" cost="$0.18" steps={DONE_STEPS} collapsed onCollapsedChange={noop} />
      </div>
    ),
  },
  {
    title: "Running — Stop run",
    about: "onStop adds Stop run (outline danger) beside Pause. A kit AlertDialog asks once before the run ends; Pause keeps it resumable.",
    code: `<AgentMonitor … status="running" onPause={pause} onStop={stop} />`,
    render: (
      <div className={agentDoc.stack}>
        <AgentMonitor {...BASE} headline="Editing src/billing/invoice.ts" elapsed="02:14" cost="$0.42" steps={STEPS} onPause={noop} onStop={noop} />
        <AgentMonitor name="Invoice reconciler" headline="Step 2 of 4" elapsed="0:03" collapsed onPause={noop} onStop={noop} />
      </div>
    ),
  },
  {
    title: "Paused",
    about: "Paused stops the clock and mutes it. Resume is outline primary; Cancel run is outline danger.",
    code: `<AgentMonitor … status="paused" headline="Paused by you after step 5" onResume={resume} onCancel={cancel} />`,
    render: (
      <AgentMonitor {...BASE} status="paused" headline="Paused by you after step 5" elapsed="02:14" cost="$0.42" steps={PAUSED_STEPS} onResume={noop} onCancel={noop} />
    ),
  },
  {
    title: "Complete",
    about: "Done: the headline says what finished and the last step shows a check. View diff and Open trail follow.",
    code: `<AgentMonitor … status="done" headline="All 6 steps done · tests green" onViewDiff={viewDiff} onOpenTrail={openTrail} />`,
    render: (
      <AgentMonitor
        {...BASE}
        status="done"
        headline="All 6 steps done · tests green"
        elapsed="04:02"
        cost="$0.58"
        steps={DONE_STEPS}
        axis={["0:00", "4:02"]}
        onViewDiff={noop}
        onOpenTrail={noop}
      />
    ),
  },
  {
    title: "Failed",
    about: "Failed tints the panel with danger, names the error in mono and puts the clock and what it spent on one line. Retry step and Open failed step follow.",
    code: `<AgentMonitor … status="failed" headline="run_tests failed at step 4" error="3 tests failed in invoice.test.ts · exit code 1" onRetry={retry} onOpenTrail={openStep} />`,
    render: (
      <AgentMonitor
        {...BASE}
        status="failed"
        headline="run_tests failed at step 4"
        error="3 tests failed in invoice.test.ts · exit code 1"
        elapsed="01:48"
        cost="$0.31"
        steps={FAILED_STEPS}
        axis={["0:00", "1:48"]}
        onRetry={noop}
        onOpenTrail={noop}
      />
    ),
  },
  {
    title: "Loading and not started",
    about: "loading shows skeletons. status idle shows Empty with an outline Start run.",
    code: `<AgentMonitor name="Refactor billing service" loading />
<AgentMonitor name="Refactor billing service" status="idle" onStart={start} />`,
    render: (
      <div className={agentDoc.row}>
        <AgentMonitor {...BASE} loading />
        <AgentMonitor {...BASE} status="idle" onStart={noop} />
      </div>
    ),
  },
];

export function AgentMonitorDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [status, setStatus] = useState<AgentMonitorStatus>("running");
  const [stepId, setStepId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const steps = status === "waiting" ? WAITING_STEPS : status === "done" ? DONE_STEPS : status === "paused" ? PAUSED_STEPS : STEPS;

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>AgentMonitor</h2>
        <p className={styles.lede}>One agent at work. Not RunningNow. Not AgentFleet.</p>
      </header>

      <section className={styles.master} aria-labelledby="agentmonitor-master">
        <div className={styles.masterHeader}>
          <h2 id="agentmonitor-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Click a step in the strip to open its detail. Pick a status to see each state.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <AgentMonitor
                  {...BASE}
                  status={status}
                  headline={
                    status === "running"
                      ? "Editing src/billing/invoice.ts"
                      : status === "paused"
                        ? "Paused by you after step 5"
                        : status === "done"
                          ? "All 6 steps done · tests green"
                          : undefined
                  }
                  headlineNote={status === "running" ? "step 6" : undefined}
                  elapsed="02:14"
                  cost="$0.42"
                  steps={steps}
                  selectedStepId={stepId}
                  onSelectStep={setStepId}
                  pendingAction={PENDING}
                  onApprove={() => setStatus("running")}
                  onDeny={() => setStatus("paused")}
                  collapsed={collapsed}
                  onCollapsedChange={setCollapsed}
                  onPause={() => setStatus("paused")}
                  onResume={() => setStatus("running")}
                  onCancel={noop}
                  onStop={() => setStatus("done")}
                  onViewDiff={noop}
                  onOpenTrail={noop}
                />
              </div>
              <ControlsPanel>
                <RadioControl
                  label="Status"
                  options={["running", "waiting", "paused", "done"] as const}
                  value={status}
                  onChange={(option) => {
                    setStepId(null);
                    setStatus(option);
                  }}
                />
              </ControlsPanel>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  AgentMonitor watches one run. Its pending action is a kit ApprovalCard, so Approve stays the one solid
                  primary. Many agents at a glance belong in RunningNow.
                </p>
              </div>
              <CodeBlock
                code={`<AgentMonitor
  name="Refactor billing service"
  status="${status}"
  elapsed="02:14"
  cost="$0.42"
  steps={steps}
  selectedStepId={stepId}
  onSelectStep={setStepId}
/>`}
              />
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
