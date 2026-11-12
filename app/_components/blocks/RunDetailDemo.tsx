"use client";

import { useEffect, useState } from "react";
import { RunDetail, type AgentTreeNode, type RunDetailRun, type RunDetailStep } from "agentic-ds-kit";
import styles from "./BlockDemo.module.css";
import { RUN_DETAIL_AGENTS, RUN_DETAIL_RUN, RUN_DETAIL_STEPS } from "@/lib/blocks/run-detail.sample";

const START_SECONDS = 4 * 60 + 12;

function clock(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

/** Set one tree node's status (and note) by id. */
function setNode(node: AgentTreeNode, id: string, change: Partial<AgentTreeNode>): AgentTreeNode {
  if (node.id === id) return { ...node, ...change };
  return node.children ? { ...node, children: node.children.map((child) => setNode(child, id, change)) } : node;
}

/**
 * RunDetail with the sample run. Approve runs the migration and starts the next step, Deny
 * fails it, Pause / Resume stop and start the clock, Retry reruns a failed step and Cancel
 * ends a paused run, so every part of the block moves as you use it.
 */
export function RunDetailDemo() {
  const [run, setRun] = useState<RunDetailRun>(RUN_DETAIL_RUN);
  const [steps, setSteps] = useState<RunDetailStep[]>(RUN_DETAIL_STEPS);
  const [agents, setAgents] = useState<AgentTreeNode>(RUN_DETAIL_AGENTS);
  const [seconds, setSeconds] = useState(START_SECONDS);
  const [status, setStatus] = useState("");
  const ticking = run.status === "running" || run.status === "waiting";

  useEffect(() => {
    if (!ticking) return;
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [ticking]);

  function step(id: string, change: Partial<RunDetailStep>) {
    setSteps((list) => list.map((item) => (item.id === id ? { ...item, ...change } : item)));
  }

  return (
    <>
      <RunDetail
        run={{ ...run, elapsed: clock(seconds) }}
        steps={steps}
        agents={agents}
        onApprove={() => {
          step("s6", { status: "done", duration: "6.2s", timer: undefined, result: ["2 migrations applied", "3 columns dropped"] });
          step("s7", { status: "running", timer: "0:01", target: "feat/invoice-totals", started: clock(seconds), args: { message: "Move invoice totals into totals.ts" } });
          setAgents((tree) => setNode(setNode(tree, "migrator", { status: "done", note: undefined }), "orchestrator", { status: "running" }));
          setRun((current) => ({ ...current, status: "running", pendingAction: undefined, headline: "Committing the branch", headlineNote: "step 7" }));
          setStatus("Approved: staging migration");
        }}
        onDeny={() => {
          step("s6", { status: "failed", timer: undefined, duration: "0:18", error: ["Denied by you"] });
          setAgents((tree) => setNode(tree, "migrator", { status: "failed", note: "Denied by you" }));
          setRun((current) => ({ ...current, status: "failed", pendingAction: undefined, error: "Staging migration denied · the run stopped before step 6" }));
          setStatus("Denied: staging migration");
        }}
        onPause={() => {
          setRun((current) => ({ ...current, status: "paused" }));
          setStatus("Paused");
        }}
        onResume={() => {
          setRun((current) => ({ ...current, status: "running" }));
          setStatus("Resumed");
        }}
        onCancel={() => {
          setRun((current) => ({ ...current, status: "failed", error: "Cancelled by you" }));
          setStatus("Cancelled");
        }}
        onRetry={(id) => {
          step(id, { status: "running", error: undefined, timer: "0:01" });
          setRun((current) => ({ ...current, status: "running", error: undefined, pendingAction: undefined }));
          setStatus(`Retrying: ${steps.find((item) => item.id === id)?.label ?? id}`);
        }}
      />
      <p role="status" className={styles.srOnly}>
        {status}
      </p>
    </>
  );
}
