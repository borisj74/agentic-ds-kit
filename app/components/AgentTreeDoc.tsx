"use client";

import { useState } from "react";
import { AgentTree } from "agentic-ds-kit";
import type { AgentTreeNode } from "agentic-ds-kit";
import { AgentDocFrame } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";

const ROOT: AgentTreeNode = {
  id: "root",
  name: "Ship v2 billing",
  status: "running",
  elapsed: "8m 12s",
  children: [
    {
      id: "research",
      name: "Research",
      status: "done",
      elapsed: "2m 10s",
      children: [
        { id: "scan", name: "scan-codebase", status: "done", elapsed: "58s", cost: 0.14 },
        { id: "docs", name: "read-docs", status: "done", elapsed: "1m 12s", cost: 0.24 },
      ],
    },
    {
      id: "implement",
      name: "Implement",
      status: "running",
      elapsed: "5m 40s",
      children: [
        { id: "edit", name: "edit-invoice", status: "done", elapsed: "2m 02s", cost: 0.61 },
        { id: "migrate", name: "migrate-db", status: "waiting", elapsed: "0:31", cost: 0.12, note: "Needs your OK · psql migration" },
        { id: "tests", name: "write-tests", status: "running", elapsed: "1m 18s", cost: 0.79 },
      ],
    },
    {
      id: "verify",
      name: "Verify",
      status: "failed",
      elapsed: "1m 04s",
      children: [
        { id: "unit", name: "unit-tests", status: "failed", elapsed: "44s", cost: 0.31, note: "3 failed · exit code 1" },
        { id: "lint", name: "lint", status: "done", elapsed: "20s", cost: 0.2 },
      ],
    },
  ],
};

function allDone(node: AgentTreeNode): AgentTreeNode {
  return { ...node, status: "done", note: undefined, children: node.children?.map(allDone) };
}

const DONE = allDone(ROOT);
const noop = () => {};

export function AgentTreeDoc() {
  const [folded, setFolded] = useState<string[]>([]);
  return (
    <AgentDocFrame
      id="agenttree"
      name="AgentTree"
      lede="An orchestrator and its sub-agents. Not TreeView. Not AgentFleet."
      summary="Fold a branch with its chevron. Branch costs roll up (Σ); waiting and failed leaves act in place."
      preview={<AgentTree className={agentDoc.trail} label="Orchestrator · example data" root={ROOT} folded={folded} onFoldedChange={setFolded} onApprove={noop} onRetry={noop} />}
      usage="AgentTree shows how one orchestrator split its work. Status is always text in its own column. Several independent agents belong in AgentFleet; a file tree is TreeView."
      code={`<AgentTree
  label="Orchestrator"
  root={root}
  folded={folded}
  onFoldedChange={setFolded}
  onApprove={approve}
  onRetry={retry}
/>`}
      variants={[
        {
          title: "Expanded — failed and waiting nodes",
          about: "A waiting leaf gets a dashed caution frame and Approve; a failed leaf a danger well and Retry. Branches without a cost sum their children.",
          code: `<AgentTree root={root} onFoldedChange={setFolded} onApprove={approve} onRetry={retry} />`,
          render: <AgentTree className={agentDoc.trail} root={ROOT} onFoldedChange={noop} onApprove={noop} onRetry={noop} />,
        },
        {
          title: "Branch folded to one line",
          about: "folded lists branch ids; a folded branch shows how many agents it holds.",
          code: `<AgentTree root={root} folded={["research"]} onFoldedChange={setFolded} />`,
          render: <AgentTree className={agentDoc.trail} root={ROOT} folded={["research"]} onFoldedChange={noop} onApprove={noop} onRetry={noop} />,
        },
        {
          title: "All complete",
          about: "When every node is done the header shows All complete.",
          code: `<AgentTree root={doneRoot} />`,
          render: <AgentTree className={agentDoc.trail} root={DONE} />,
        },
        {
          title: "Loading and empty",
          about: "loading shows an indented skeleton. No root shows Empty.",
          code: `<AgentTree loading />
<AgentTree root={null} />`,
          render: (
            <div className={agentDoc.row}>
              <AgentTree className={agentDoc.trail} loading />
              <AgentTree className={agentDoc.trail} root={null} />
            </div>
          ),
        },
      ]}
    />
  );
}
