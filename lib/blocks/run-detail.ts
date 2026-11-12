import contract from "../../packages/kit/contracts/rundetail.json";
import type { BlockDoc } from "./types";

export const runDetailDoc: BlockDoc = {
  slug: "run-detail",
  label: "Run detail",
  name: "RunDetail",
  contract,
  lead:
    "One agent run on one screen. The live clock, cost and pending approval lead; beside them sit who started whom and every step. Pick a step anywhere and the strip, the tree, the trail and the tool call all follow it.",
  usage: `import { RunDetail } from "agentic-ds-kit";

export function RunPage({ run, steps, tree }) {
  return (
    <main className="layout-content">
      <RunDetail
        run={run}                // { name, status, elapsed?, cost?, pendingAction?, … }
        steps={steps}            // AgentMonitor steps + agentId, label?, args?, result?, error?
        agents={tree}            // AgentTree root: who started whom
        onApprove={() => approve(run.id)}
        onDeny={() => deny(run.id)}
        onPause={() => pause(run.id)}
        onResume={() => resume(run.id)}
        onCancel={() => cancel(run.id)}
        onRetry={(stepId) => retry(run.id, stepId)}
      />
    </main>
  );
}`,
};
