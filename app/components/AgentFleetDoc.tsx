"use client";

import { useState, type ReactNode } from "react";
import { AgentFleet, Switch } from "agentic-ds-kit";
import type { AgentFleetAgent } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import agentDoc from "./AgentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const AGENTS: AgentFleetAgent[] = [
  {
    id: "billing",
    name: "Billing refactor",
    status: "running",
    cost: "$1.28",
    elapsed: "6m 40s",
    meta: "Orchestrator · Opus 5.5",
    subAgents: [
      { id: "scan", name: "scan-codebase", status: "done", elapsed: "58s", cost: "$0.14" },
      { id: "edit", name: "edit-invoice", status: "done", elapsed: "2m 02s", cost: "$0.61" },
      { id: "tests", name: "write-tests", status: "running", elapsed: "1m 18s", cost: "$0.41" },
      { id: "migrate", name: "migrate-db", status: "waiting", elapsed: "0:31", cost: "$0.12" },
    ],
  },
  {
    id: "docs",
    name: "Docs sweep",
    status: "done",
    cost: "$0.18",
    elapsed: "4m 02s",
    subAgents: [
      { id: "a", name: "find-stale", status: "done", elapsed: "1m 10s", cost: "$0.05" },
      { id: "b", name: "rewrite", status: "done", elapsed: "2m 20s", cost: "$0.10" },
      { id: "c", name: "link-check", status: "done", elapsed: "32s", cost: "$0.03" },
    ],
  },
  {
    id: "flaky",
    name: "Flaky test hunt",
    status: "failed",
    cost: "$0.71",
    elapsed: "9m 15s",
    subAgents: [
      { id: "a", name: "collect-runs", status: "done", elapsed: "2m 40s", cost: "$0.20" },
      { id: "b", name: "bisect", status: "failed", elapsed: "3m 05s", cost: "$0.24" },
      { id: "c", name: "rerun-suite", status: "done", elapsed: "2m 11s", cost: "$0.18" },
      { id: "d", name: "patch-timeouts", status: "running", elapsed: "1m 19s", cost: "$0.09" },
      { id: "e", name: "report", status: "queued" },
    ],
  },
];

const WAITING = AGENTS.map((agent) => (agent.id === "billing" ? { ...agent, status: "waiting" as const } : agent));

const IDLE: AgentFleetAgent[] = AGENTS.map((agent) => ({
  ...agent,
  status: "idle",
  cost: "$0.00",
  subAgents: agent.subAgents.map((sub) => ({ ...sub, status: "queued" as const })),
}));

const noop = () => {};

const VARIANT_DOCS: { title: string; about: string; code: string; render: ReactNode }[] = [
  {
    title: "Overview — three agents",
    about:
      "Each card sums up its sub-agents: count, one bar segment per sub-agent, a text legend, cost and time. The fleet line totals them.",
    code: `<AgentFleet agents={agents} onExpandedChange={setOpenId} />`,
    render: <AgentFleet className={agentDoc.full} agents={AGENTS} onExpandedChange={noop} />,
  },
  {
    title: "Focused — one agent opens, others compact",
    about:
      "expandedId opens one card into its sub-agent tree with cost, time, done and waiting. The others shrink to a compact column. Focus moves into the card and back on close.",
    code: `<AgentFleet agents={agents} expandedId="billing" onExpandedChange={setOpenId} onReview={review} />`,
    render: (
      <AgentFleet className={agentDoc.full} agents={AGENTS} expandedId="billing" onExpandedChange={noop} onReview={noop} />
    ),
  },
  {
    title: "Waiting for you, one failed",
    about: "A sub-agent that waits shows a Review callout on its card; the agent reads Needs you.",
    code: `<AgentFleet agents={agents} onExpandedChange={setOpenId} onReview={review} />`,
    render: <AgentFleet className={agentDoc.full} agents={WAITING} onExpandedChange={noop} onReview={noop} />,
  },
  {
    title: "All idle",
    about: "Idle agents keep empty bars and no time.",
    code: `<AgentFleet agents={idleAgents} />`,
    render: <AgentFleet className={agentDoc.full} agents={IDLE} />,
  },
  {
    title: "Loading",
    about: "loading shows skeleton cards.",
    code: `<AgentFleet agents={[]} loading />`,
    render: <AgentFleet className={agentDoc.full} agents={[]} loading />,
  },
  {
    title: "Empty",
    about: "No agents: the kit Empty with Start an agent.",
    code: `<AgentFleet agents={[]} onStart={start} />`,
    render: <AgentFleet className={agentDoc.full} agents={[]} onStart={noop} />,
  },
];

export function AgentFleetDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [openId, setOpenId] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(true);

  const agents = waiting ? WAITING : AGENTS;
  const code = `<AgentFleet
  agents={agents}
  expandedId={${openId ? `"${openId}"` : "null"}}
  onExpandedChange={setOpenId}
  onReview={(agentId, subAgentId) => review(agentId, subAgentId)}
/>`;

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>AgentFleet</h2>
        <p className={styles.lede}>Several agents side by side. Not Scoreboard. Not DataTable.</p>
      </header>

      <section className={styles.master} aria-labelledby="agentfleet-master">
        <div className={styles.masterHeader}>
          <h2 id="agentfleet-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Open a card to see its sub-agent tree. Collapse it to go back.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <AgentFleet
                  className={agentDoc.full}
                  agents={agents}
                  expandedId={openId}
                  onExpandedChange={setOpenId}
                  onReview={() => setWaiting(false)}
                />
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>State</span>
                  <Switch size="sm" label="Waiting for you" checked={waiting} onChange={setWaiting} />
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  AgentFleet watches many agents at once. Status is always text plus color. One agent&apos;s run is an
                  AgentTrail; one decision is an ApprovalCard.
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
