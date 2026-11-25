import contract from "../../packages/kit/contracts/rundetail.json";
import type { BlockDoc } from "./types";

export const runDetailDoc: BlockDoc = {
  slug: "run-detail",
  label: "Run detail",
  name: "RunDetail",
  contract,
  lead:
    "One agent run on one screen. The live clock, cost and pending approval lead; beside them sit who started whom and every step. Pick a step anywhere and the strip, the tree, the trail and the tool call all follow it. Pass messages and onSend for the Ask panel, where you ask or steer the agent. It replaces LiveSession. For one agent, leave agents out; calls=\"all\" with a trace gives the run detail screen: a one-row bar, the trail and trace, and every call (see the run-detail pattern).",
  usage: `import { RunDetail } from "agentic-ds-kit";

export function RunPage({ run, steps, tree }) {
  return (
    <main className="layout-content">
      <RunDetail
        run={run}                // { name, status, elapsed?, cost?, pendingAction?, … }
        steps={steps}            // AgentMonitor steps + agentId, label?, args?, result?, error?
        agents={tree}            // optional: AgentTree root, who started whom
        // calls="all" stacks every started step's call; trace={spans} replaces the step strip
        onApprove={() => approve(run.id)}
        onDeny={() => deny(run.id)}
        onPause={() => pause(run.id)}
        onResume={() => resume(run.id)}
        onCancel={() => cancel(run.id)}
        onStop={() => stop(run.id)}  // running: Stop run, confirmed once
        onRetry={(stepId) => retry(run.id, stepId)}
        messages={messages}      // Ask panel: Chat messages
        onSend={(text) => askOrSteer(run.id, text)}
      />
    </main>
  );
}`,
};
