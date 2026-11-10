"use client";

import { useState, type ReactNode } from "react";
import { AgentTrail, Switch } from "agentic-ds-kit";
import type { AgentTrailStep } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import agentDoc from "./AgentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const APPROVAL_STEPS: AgentTrailStep[] = [
  { id: "read", label: "Read auth module", status: "done", duration: "4.1s" },
  { id: "draft", label: "Draft patch", status: "done", duration: "12.0s" },
  {
    id: "approve",
    label: "Awaiting approval",
    status: "approval",
    timer: "0:18",
    sublabel: "write_file src/middleware/auth.ts",
  },
  { id: "test", label: "Run unit tests", status: "pending" },
  { id: "pr", label: "Open pull request", status: "pending" },
];

const RUNNING_STEPS: AgentTrailStep[] = [
  { id: "read", label: "Read auth module", status: "done", duration: "4.1s" },
  { id: "apply", label: "Apply rate-limit patch", status: "running", timer: "0:18", sublabel: "applying hunk 2/4" },
  { id: "test", label: "Run unit tests", status: "pending" },
];

const FAILED_STEPS: AgentTrailStep[] = [
  { id: "read", label: "Read auth module", status: "done", duration: "4.1s" },
  { id: "apply", label: "Apply rate-limit patch", status: "done", duration: "9.6s" },
  { id: "test", label: "Run unit tests", status: "failed", duration: "31.2s", sublabel: "3 tests failed · exit code 1" },
  { id: "pr", label: "Open pull request", status: "pending" },
];

const DONE_STEPS: AgentTrailStep[] = APPROVAL_STEPS.map((step, index) => ({
  ...step,
  label: index === 2 ? "Write middleware" : step.label,
  status: "done",
  duration: ["4.1s", "12.0s", "2.3s", "28.4s", "3.0s"][index],
  sublabel: undefined,
  timer: undefined,
}));

const VARIANT_DOCS: { title: string; about: string; code: string; render: ReactNode }[] = [
  {
    title: "Current step awaiting approval",
    about:
      "status approval marks the step that waits for the person; pair it with an ApprovalCard. timer is the live wait, sublabel the tool call in mono. The counter reads 3/5.",
    code: `<AgentTrail
  title="Implement login rate limit"
  icon="GitPullRequest"
  tag="feat/rate-limit"
  steps={[
    { id: "read", label: "Read auth module", status: "done", duration: "4.1s" },
    { id: "draft", label: "Draft patch", status: "done", duration: "12.0s" },
    { id: "approve", label: "Awaiting approval", status: "approval", timer: "0:18", sublabel: "write_file src/middleware/auth.ts" },
    { id: "test", label: "Run unit tests", status: "pending" },
    { id: "pr", label: "Open pull request", status: "pending" },
  ]}
/>`,
    render: (
      <AgentTrail
        className={agentDoc.trail}
        title="Implement login rate limit"
        icon="GitPullRequest"
        tag="feat/rate-limit"
        steps={APPROVAL_STEPS}
      />
    ),
  },
  {
    title: "Current step running",
    about: "status running spins the marker (off under reduced motion). A sub-step line shows what it is doing now.",
    code: `<AgentTrail
  title="Current · running"
  steps={[
    { id: "read", label: "Read auth module", status: "done", duration: "4.1s" },
    { id: "apply", label: "Apply rate-limit patch", status: "running", timer: "0:18", sublabel: "applying hunk 2/4" },
    { id: "test", label: "Run unit tests", status: "pending" },
  ]}
/>`,
    render: <AgentTrail className={agentDoc.trail} title="Current · running" steps={RUNNING_STEPS} />,
  },
  {
    title: "Failed step",
    about: "status failed stops the trail at that step; sublabel says why.",
    code: `<AgentTrail
  title="Implement login rate limit"
  steps={[
    …,
    { id: "test", label: "Run unit tests", status: "failed", duration: "31.2s", sublabel: "3 tests failed · exit code 1" },
    { id: "pr", label: "Open pull request", status: "pending" },
  ]}
/>`,
    render: <AgentTrail className={agentDoc.trail} title="Implement login rate limit" steps={FAILED_STEPS} />,
  },
  {
    title: "Complete",
    about: "Every step done: the counter reads 5/5 and the rail is strong end to end.",
    code: `<AgentTrail title="Implement login rate limit" icon="GitPullRequest" steps={doneSteps} />`,
    render: (
      <AgentTrail className={agentDoc.trail} title="Implement login rate limit" icon="GitPullRequest" steps={DONE_STEPS} />
    ),
  },
];

export function AgentTrailDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [showIcon, setShowIcon] = useState(true);
  const [showTag, setShowTag] = useState(true);

  const code = [
    "<AgentTrail",
    '  title="Implement login rate limit"',
    ...(showIcon ? ['  icon="GitPullRequest"'] : []),
    ...(showTag ? ['  tag="feat/rate-limit"'] : []),
    "  steps={steps}",
    "/>",
  ].join("\n");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>AgentTrail</h1>
        <p className={styles.lede}>What an agent did and is doing now. Not Timeline. Not ProgressSteps.</p>
      </header>

      <section className={styles.master} aria-labelledby="agenttrail-master">
        <div className={styles.masterHeader}>
          <h2 id="agenttrail-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Done steps show their duration, the current step a live timer, pending steps wait below.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <AgentTrail
                  className={agentDoc.trail}
                  title="Implement login rate limit"
                  icon={showIcon ? "GitPullRequest" : undefined}
                  tag={showTag ? "feat/rate-limit" : undefined}
                  steps={APPROVAL_STEPS}
                />
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Content</span>
                  <Switch size="sm" label="Icon" checked={showIcon} onChange={setShowIcon} />
                  <Switch size="sm" label="Tag" checked={showTag} onChange={setShowTag} />
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  AgentTrail logs one agent run. AgentPlan shows what it intends to do; AgentFleet shows many agents.
                  Approvals go in an ApprovalCard next to the trail, not inside it.
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
