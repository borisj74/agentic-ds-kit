"use client";

import { useState, type ReactNode } from "react";
import { ApprovalCard, Button, Switch } from "agentic-ds-kit";
import type { ApprovalCardAction, ApprovalCardRisk, ApprovalCardStatus } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import agentDoc from "./AgentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const RISKS: ApprovalCardRisk[] = ["low", "medium", "high"];

const COMMAND: ApprovalCardAction = {
  kind: "command",
  command: "npm run db:migrate -- --env=staging",
  note: "applies 2 migrations · drops column invoices.legacy_total",
  target: "acme-demo / staging",
};

const DIFF: ApprovalCardAction = {
  kind: "diff",
  file: "src/billing/invoice.ts",
  lines: [
    { type: "context", text: "const subtotal = sumLines(lines);" },
    { type: "remove", text: "return subtotal * (1 + rate);" },
    { type: "add", text: "const total = subtotal * (1 + rate);" },
    { type: "add", text: "return Math.round(total * 100) / 100;" },
  ],
};

const COMMAND_CODE = `action={{
    kind: "command",
    command: "npm run db:migrate -- --env=staging",
    note: "applies 2 migrations · drops column invoices.legacy_total",
    target: "acme-demo / staging",
  }}`;

const DIFF_CODE = `action={{
    kind: "diff",
    file: "src/billing/invoice.ts",
    lines: [
      { type: "context", text: "const subtotal = sumLines(lines);" },
      { type: "remove", text: "return subtotal * (1 + rate);" },
      { type: "add", text: "const total = subtotal * (1 + rate);" },
      { type: "add", text: "return Math.round(total * 100) / 100;" },
    ],
  }}`;

const VARIANT_DOCS: { title: string; about: string; code: string; render: ReactNode }[] = [
  {
    title: "Pending — high risk, countdown",
    about:
      "High risk shows a shield and a danger Badge. countdownSec runs an auto-deny timer; at 0 the card calls onExpire, else onDeny. Enter approves and Escape denies while focus is in the card.",
    code: `<ApprovalCard
  title="Run database migration?"
  description="Agent wants to run a command on staging in acme-demo."
  risk="high"
  ${COMMAND_CODE}
  countdownSec={60}
  onApprove={approve}
  onDeny={deny}
/>`,
    render: (
      <ApprovalCard
        title="Run database migration?"
        description="Agent wants to run a command on staging in acme-demo."
        risk="high"
        action={COMMAND}
        countdownSec={42}
        onApprove={() => {}}
        onDeny={() => {}}
        onExpire={() => {}}
      />
    ),
  },
  {
    title: "Pending — diff preview",
    about: "A file edit shows the exact diff. Added and removed lines read as Added / Removed to screen readers.",
    code: `<ApprovalCard
  title="Edit invoice.ts?"
  description="1 file · +2 −1 lines"
  risk="low"
  ${DIFF_CODE}
  onApprove={approve}
  onDeny={deny}
/>`,
    render: (
      <ApprovalCard
        title="Edit invoice.ts?"
        description="1 file · +2 −1 lines"
        risk="low"
        action={DIFF}
        onApprove={() => {}}
        onDeny={() => {}}
      />
    ),
  },
  {
    title: "Pending — medium risk",
    about: "The default risk. No countdown: the card waits until the person decides.",
    code: `<ApprovalCard
  title="Push branch to origin?"
  description="Agent wants to push 3 commits."
  action={{ kind: "command", command: "git push origin feat/rate-limit" }}
  onApprove={approve}
  onDeny={deny}
/>`,
    render: (
      <ApprovalCard
        title="Push branch to origin?"
        description="Agent wants to push 3 commits."
        action={{ kind: "command", command: "git push origin feat/rate-limit" }}
        onApprove={() => {}}
        onDeny={() => {}}
      />
    ),
  },
  {
    title: "Resolved — one line",
    about:
      "Once decided, the card collapses to one line that stays in the log: Approved, Denied, or Expired (dashed, auto-denied).",
    code: `<ApprovalCard status="approved" title="Run database migration?" action={action} resolvedBy="you" resolvedAt="2s ago" />
<ApprovalCard status="denied" title="Delete exports?" action={action} resolvedBy="you" resolvedAt="1m ago" />
<ApprovalCard status="expired" title="Force push?" action={action} />`,
    render: (
      <div className={agentDoc.stack}>
        <ApprovalCard
          status="approved"
          title="Run database migration?"
          action={{ kind: "command", command: "npm run db:migrate" }}
          resolvedBy="you"
          resolvedAt="2s ago"
        />
        <ApprovalCard
          status="denied"
          title="Delete exports?"
          action={{ kind: "command", command: "rm -rf ./tmp/exports" }}
          resolvedBy="you"
          resolvedAt="1m ago"
        />
        <ApprovalCard status="expired" title="Force push?" action={{ kind: "command", command: "git push --force" }} />
      </div>
    ),
  },
];

function masterCode(risk: ApprovalCardRisk, diff: boolean, countdown: boolean) {
  const lines = ["<ApprovalCard", diff ? '  title="Edit invoice.ts?"' : '  title="Run database migration?"'];
  lines.push(`  risk="${risk}"`, `  ${diff ? DIFF_CODE : COMMAND_CODE}`);
  if (countdown) lines.push("  countdownSec={60}");
  lines.push("  onApprove={approve}", "  onDeny={deny}", "/>");
  return lines.join("\n");
}

export function ApprovalCardDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [risk, setRisk] = useState<ApprovalCardRisk>("high");
  const [diff, setDiff] = useState(false);
  const [countdown, setCountdown] = useState(true);
  const [status, setStatus] = useState<ApprovalCardStatus>("pending");
  const [run, setRun] = useState(0);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>ApprovalCard</h1>
        <p className={styles.lede}>The agent asks before it acts. Not AlertDialog. Not InsightCard.</p>
      </header>

      <section className={styles.master} aria-labelledby="approvalcard-master">
        <div className={styles.masterHeader}>
          <h2 id="approvalcard-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle risk, the preview kind and the countdown. Approve (Enter) or Deny (Escape) resolves the card to one
            line.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <ApprovalCard
                  key={run}
                  title={diff ? "Edit invoice.ts?" : "Run database migration?"}
                  description={diff ? "1 file · +2 −1 lines" : "Agent wants to run a command on staging in acme-demo."}
                  risk={risk}
                  action={diff ? DIFF : COMMAND}
                  status={status}
                  countdownSec={countdown ? 60 : undefined}
                  onApprove={() => setStatus("approved")}
                  onDeny={() => setStatus("denied")}
                  onExpire={() => setStatus("expired")}
                  resolvedBy="you"
                  resolvedAt="just now"
                />
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Risk</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Risk">
                    {RISKS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.sizeTab} ${risk === option ? styles.sizeTabActive : ""}`}
                        aria-pressed={risk === option}
                        onClick={() => setRisk(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Content</span>
                  <Switch size="sm" label="Diff preview" checked={diff} onChange={setDiff} />
                  <Switch size="sm" label="Countdown" checked={countdown} onChange={setCountdown} />
                </div>
                <div className={styles.panelGroup}>
                  <Button
                    size="sm"
                    appearance="outline"
                    mode="neutral"
                    iconStart="RotateCcw"
                    onClick={() => {
                      setStatus("pending");
                      setRun((value) => value + 1);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  ApprovalCard gates one side effect. Show the exact command or diff, never a paraphrase. Approve is the
                  view&apos;s one solid primary. AgentPlan accepts a whole plan; AlertDialog interrupts the page.
                </p>
              </div>
              <CodeBlock code={masterCode(risk, diff, countdown)} />
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
