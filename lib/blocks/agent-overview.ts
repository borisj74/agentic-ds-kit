import contract from "../../packages/kit/contracts/agentoverview.json";
import type { BlockDoc } from "./types";

export const agentOverviewDoc: BlockDoc = {
  slug: "agent-overview",
  label: "Agent overview",
  name: "AgentOverview",
  contract,
  lead:
    "The first screen of an agent workspace. It says what changed since your last visit, lays every agent on one time axis, and lists what waits on you. One filter drives all three.",
  usage: `import { AgentOverview } from "agentic-ds-kit";

export function Home({ agents, events, lastVisit }) {
  return (
    <main className="layout-content">
      <AgentOverview
        agents={agents}          // { id, name, model?, icon? }[]
        events={events}          // AgentLanes tasks, plus action? and risk? for approvals
        since={lastVisit}        // epoch ms
        defaultFilter="all"      // or filter + onFilterChange
        onApprove={(id) => approve(id)}
        onReject={(id) => reject(id)}
        onRetry={(id) => retry(id)}
      />
    </main>
  );
}`,
};
