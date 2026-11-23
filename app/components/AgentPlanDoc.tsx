"use client";

import { useState, type ReactNode } from "react";
import { AgentPlan, TraceWaterfall } from "agentic-ds-kit";
import type { AgentPlanStatus, AgentPlanStep, TraceSpan } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const STEPS: AgentPlanStep[] = [
  { id: "read", label: "Read invoice module", tool: "read_file", target: "src/billing/invoice.ts" },
  { id: "find", label: "Find rounding call sites", tool: "search_files", target: '"Math.round" in src/billing' },
  {
    id: "patch",
    label: "Patch totals to integer cents",
    tool: "edit_file",
    target: "invoice.ts, tax.ts",
    note: "Only invoice.ts and tax.ts. Keep the public API.",
    needsApproval: true,
  },
  { id: "test", label: "Run unit tests", tool: "run_tests", target: "invoice.test.ts" },
  { id: "pr", label: "Open pull request", tool: "gh pr create", target: "to main, draft", needsApproval: true },
];

const FAILED_STEPS = STEPS.map((step) =>
  step.id === "test" ? { ...step, error: "3 tests failed · exit code 1" } : step,
);

const STATUSES: AgentPlanStatus[] = ["draft", "accepted", "running", "complete", "failed"];

const FOOTER: Record<AgentPlanStatus, string | undefined> = {
  drafting: undefined,
  draft: undefined,
  accepted: "accepted 14:02",
  running: "3 of 5 · 1m 48s",
  complete: "done in 3m 12s · $0.38",
  failed: "stopped at 4",
};

const CURRENT: Partial<Record<AgentPlanStatus, string>> = { running: "patch", failed: "test" };

const RUN_STEPS: AgentPlanStep[] = [
  {
    id: "fetch",
    label: "Fetch Stripe charges",
    calls: [{ id: "c1", name: "stripe.charges.list", summary: "3 charges for Northwind", status: "done", duration: "0.9s" }],
  },
  {
    id: "match",
    label: "Match payments to INV-1842",
    calls: [
      { id: "c2", name: "ledger.read", summary: "INV-1842 open, $2,418.00 due", status: "done", duration: "0.9s" },
      { id: "c3", name: "match_payments", summary: "3 charges against INV-1842", status: "running" },
    ],
  },
  { id: "update", label: "Update ledger", tool: "ledger.update", needsApproval: true },
];

const RUN_SPANS: TraceSpan[] = [
  { id: "s1", label: "Plan the run", kind: "model", startMs: 0, endMs: 6200, cost: 0.04 },
  { id: "s2", label: "stripe.charges.list", kind: "tool", startMs: 6200, endMs: 7100 },
  { id: "s3", label: "Read 3 charges", kind: "model", startMs: 7100, endMs: 19400, cost: 0.13 },
  { id: "s4", label: "match_payments", kind: "tool", startMs: 19400 },
];

const noop = () => {};

const VARIANT_DOCS: { title: string; about: string; code: string; render: ReactNode }[] = [
  {
    title: "Draft — edit, remove, add",
    about:
      "With onChange, each step gets Edit and Remove, and Add step opens the same form. Accept plan is the view's one solid primary (⌘/Ctrl+Enter).",
    code: `<AgentPlan title="Fix invoice rounding" status="draft" steps={steps} onChange={setSteps} onAccept={accept} />`,
    render: <AgentPlan title="Fix invoice rounding" status="draft" steps={STEPS} onChange={noop} onAccept={noop} />,
  },
  {
    title: "Accepted — ready to run",
    about: "Accepted plans lose Edit / Remove. Edit goes back to draft; Run is outline (⌘/Ctrl+Enter).",
    code: `<AgentPlan title="Fix invoice rounding" status="accepted" steps={steps} footerNote="accepted 14:02" onEdit={edit} onRun={run} />`,
    render: (
      <AgentPlan title="Fix invoice rounding" status="accepted" steps={STEPS} footerNote="accepted 14:02" onEdit={noop} onRun={noop} />
    ),
  },
  {
    title: "In progress — step 3 waits for approval",
    about:
      "currentStepId marks the step that runs now. Steps before it are done. A step with needsApproval says it waits for the person's OK.",
    code: `<AgentPlan title="Fix invoice rounding" status="running" currentStepId="patch" steps={steps} footerNote="3 of 5 · 1m 48s" onSkipStep={skip} onStop={stop} />`,
    render: (
      <AgentPlan
        title="Fix invoice rounding"
        status="running"
        currentStepId="patch"
        steps={STEPS}
        footerNote="3 of 5 · 1m 48s"
        onSkipStep={noop}
        onStop={noop}
      />
    ),
  },
  {
    title: "In progress — tool calls under each step, trace in the header",
    about:
      "calls puts each step's tool calls under it as one ToolCallCard group row, open on the current step. trace takes a compact TraceWaterfall for time and cost so far.",
    code: `<AgentPlan
  title="Reconcile INV-1842"
  status="running"
  currentStepId="match"
  steps={steps}
  trace={<TraceWaterfall title="Run trace" spans={spans} status="running" totalMs={31000} compact />}
  onSkipStep={skip}
  onStop={stop}
/>`,
    render: (
      <AgentPlan
        title="Reconcile INV-1842"
        status="running"
        currentStepId="match"
        steps={RUN_STEPS}
        trace={<TraceWaterfall title="Run trace" spans={RUN_SPANS} status="running" totalMs={31000} compact />}
        footerNote="Step 3 asks you before it writes to the ledger."
        onSkipStep={noop}
        onStop={noop}
      />
    ),
  },
  {
    title: "Complete",
    about: "All steps done. View trail opens the run's AgentTrail.",
    code: `<AgentPlan title="Fix invoice rounding" status="complete" steps={steps} footerNote="done in 3m 12s · $0.38" onViewTrail={openTrail} />`,
    render: (
      <AgentPlan title="Fix invoice rounding" status="complete" steps={STEPS} footerNote="done in 3m 12s · $0.38" onViewTrail={noop} />
    ),
  },
  {
    title: "Failed — retry or skip",
    about: "The failed step shows its error in mono. Retry step or Skip step move on.",
    code: `<AgentPlan title="Fix invoice rounding" status="failed" currentStepId="test" steps={steps} footerNote="stopped at 4" onSkipStep={skip} onRetryStep={retry} />`,
    render: (
      <AgentPlan
        title="Fix invoice rounding"
        status="failed"
        currentStepId="test"
        steps={FAILED_STEPS}
        footerNote="stopped at 4"
        onSkipStep={noop}
        onRetryStep={noop}
      />
    ),
  },
  {
    title: "Loading — drafting",
    about: "status drafting shows skeleton rows while the agent writes the plan. The card is aria-busy.",
    code: `<AgentPlan title="Fix invoice rounding" status="drafting" steps={[]} />`,
    render: <AgentPlan title="Fix invoice rounding" status="drafting" steps={[]} />,
  },
  {
    title: "Empty",
    about: "A draft with no steps shows the kit Empty with Draft a plan.",
    code: `<AgentPlan title="New plan" status="draft" steps={[]} onDraft={draft} />`,
    render: <AgentPlan title="New plan" status="draft" steps={[]} onDraft={noop} />,
  },
  {
    title: "Collapsed",
    about: "collapsed keeps the header: title, status and the summary line. With onCollapsedChange the chevron opens it.",
    code: `<AgentPlan title="Fix invoice rounding" steps={steps} collapsed onCollapsedChange={setCollapsed} />`,
    render: <AgentPlan title="Fix invoice rounding" steps={STEPS} collapsed onCollapsedChange={noop} />,
  },
];

export function AgentPlanDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [status, setStatus] = useState<AgentPlanStatus>("draft");
  const [steps, setSteps] = useState<AgentPlanStep[]>(STEPS);
  const [collapsed, setCollapsed] = useState(false);

  const code = `<AgentPlan
  title="Fix invoice rounding"
  status="${status}"${CURRENT[status] ? `\n  currentStepId="${CURRENT[status]}"` : ""}
  steps={steps}
  onChange={setSteps}
  onAccept={() => setStatus("accepted")}
  onEdit={() => setStatus("draft")}
  onRun={() => setStatus("running")}
/>`;

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>AgentPlan</h2>
        <p className={styles.lede}>What the agent intends to do. Not AgentTrail. Not ProgressSteps.</p>
      </header>

      <section className={styles.master} aria-labelledby="agentplan-master">
        <div className={styles.masterHeader}>
          <h2 id="agentplan-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Edit the draft, accept it, run it. Pick a status to see each footer.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <AgentPlan
                  title="Fix invoice rounding"
                  status={status}
                  currentStepId={CURRENT[status]}
                  steps={status === "failed" ? steps.map((s) => (s.id === "test" ? { ...s, error: "3 tests failed · exit code 1" } : s)) : steps}
                  footerNote={FOOTER[status]}
                  collapsed={collapsed}
                  onCollapsedChange={setCollapsed}
                  onChange={setSteps}
                  onAccept={() => setStatus("accepted")}
                  onEdit={() => setStatus("draft")}
                  onRun={() => setStatus("running")}
                  onSkipStep={noop}
                  onStop={() => setStatus("failed")}
                  onRetryStep={() => setStatus("running")}
                  onViewTrail={noop}
                />
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
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  AgentPlan is the agent&apos;s intent: people edit and accept it before it runs. Accept plan is the one
                  solid primary; Run is outline. AgentTrail logs what already happened.
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
