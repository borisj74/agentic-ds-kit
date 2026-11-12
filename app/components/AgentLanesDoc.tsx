"use client";

import { useState } from "react";
import { AgentLanes } from "agentic-ds-kit";
import type { AgentLanesAgent, AgentLanesTask } from "agentic-ds-kit";
import { AgentDocFrame } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";

const NOW = Date.UTC(2026, 10, 10, 14, 0, 0);
const M = 60_000;

const AGENTS: AgentLanesAgent[] = [
  { id: "orch", name: "Orchestrator", model: "Opus 5.5", icon: "Network" },
  { id: "research", name: "Research", model: "Haiku 5.5", icon: "Search" },
  { id: "coder", name: "Coder", model: "Sonnet 5.5", icon: "Pencil" },
  { id: "db", name: "Database", model: "Sonnet 5.5", icon: "Database" },
  { id: "tester", name: "Tester", model: "Haiku 5.5", icon: "FlaskConical" },
];

const TASKS: AgentLanesTask[] = [
  { id: "plan", agentId: "orch", title: "plan & dispatch", status: "running", start: NOW - 8 * M, icon: "Network", handoffTo: "edit" },
  { id: "scan", agentId: "research", title: "scan + read docs", status: "done", start: NOW - 7.8 * M, end: NOW - 5.6 * M },
  { id: "edit", agentId: "coder", title: "edit invoice", status: "done", start: NOW - 5.4 * M, end: NOW - 2.2 * M, icon: "Pencil", handoffTo: "migrate" },
  {
    id: "tests",
    agentId: "coder",
    title: "write tests",
    status: "running",
    start: NOW - 2.1 * M,
    summary: ["6 cases added to invoice.test.ts", "rounding case still red"],
    handoffTo: "unit",
  },
  {
    id: "migrate",
    agentId: "db",
    title: "migrate-db",
    status: "waiting",
    start: NOW - 3.4 * M,
    ask: "Run 0042_drop_legacy.sql on staging? Reversible from the 0041 snapshot.",
  },
  { id: "unit", agentId: "tester", title: "unit tests", status: "failed", start: NOW - 1.6 * M, end: NOW - 0.3 * M },
];

const noop = () => {};

export function AgentLanesDoc() {
  const [open, setOpen] = useState<string | null>(null);
  const [span, setSpan] = useState(10 * M);
  return (
    <AgentDocFrame
      id="agentlanes"
      name="AgentLanes"
      lede="Where every agent is right now. Not RunningNow. Not Calendar."
      summary="Open a block for what it did; open a Needs you block to decide on it. Switch the window to zoom."
      preview={
        <AgentLanes
          className={agentDoc.full}
          agents={AGENTS}
          tasks={TASKS}
          now={NOW}
          span={span}
          onSpanChange={setSpan}
          openTaskId={open}
          onOpenTaskChange={setOpen}
          onApprove={() => setOpen(null)}
          onReject={() => setOpen(null)}
          onOpen={noop}
        />
      }
      usage="AgentLanes shows parallel agents over the last minutes. Blocks carry text, so status never depends on color. A compact list for chrome is RunningNow."
      code={`<AgentLanes
  agents={agents}
  tasks={tasks}
  span={span}
  onSpanChange={setSpan}
  openTaskId={openId}
  onOpenTaskChange={setOpenId}
  onApprove={approve}
  onReject={reject}
/>`}
      variants={[
        {
          title: "Live — blocks grow into now, live handoff",
          about: "Open tasks (no end) grow to now; running blocks shimmer on transform. handoffTo draws the line into the next agent's block.",
          code: `<AgentLanes agents={agents} tasks={tasks} onOpenTaskChange={setOpenId} />`,
          render: <AgentLanes className={agentDoc.full} agents={AGENTS} tasks={TASKS} now={NOW} onOpenTaskChange={noop} />,
        },
        {
          title: "Block opened — what got done",
          about: "openTaskId opens a dark detail on the lane (below it, or above when the board has no room) with the summary lines and Open.",
          code: `<AgentLanes … openTaskId="tests" onOpen={openRun} />`,
          render: <AgentLanes className={agentDoc.full} agents={AGENTS} tasks={TASKS} now={NOW} openTaskId="tests" onOpenTaskChange={noop} onOpen={noop} />,
        },
        {
          title: "Needs you — decision on the block",
          about: "A waiting task opens a decision: Reject (Esc) and Approve (⏎).",
          code: `<AgentLanes … openTaskId="migrate" onApprove={approve} onReject={reject} />`,
          render: <AgentLanes className={agentDoc.full} agents={AGENTS} tasks={TASKS} now={NOW} openTaskId="migrate" onOpenTaskChange={noop} onApprove={noop} onReject={noop} />,
        },
        {
          title: "Zoomed in — last 3 minutes",
          about: "span sets the window; onSpanChange shows the zoom control.",
          code: `<AgentLanes … span={180000} onSpanChange={setSpan} />`,
          render: <AgentLanes className={agentDoc.full} agents={AGENTS} tasks={TASKS} now={NOW} span={3 * M} onSpanChange={noop} onOpenTaskChange={noop} />,
        },
      ]}
    />
  );
}
