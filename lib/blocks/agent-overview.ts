import contract from "../../packages/kit/contracts/agentoverview.json";
import type { BlockDoc } from "./types";

export const agentOverviewDoc: BlockDoc = {
  slug: "agent-overview",
  label: "Agent overview",
  name: "AgentOverview",
  contract,
  lead:
    "The first screen of an agent workspace. The oldest request that needs you comes first, then every agent with an icon-and-word status, one fact, its cost and one action, then what happened since your last visit. Timeline shows the same agents on one time axis on wide screens. It replaces AgentFleet and AgentLanes.",
  usage: `import { AgentOverview } from "agentic-ds-kit";

export function Home({ agents, events, lastVisit }) {
  return (
    <main className="layout-content">
      <AgentOverview
        agents={agents}          // { id, name, status?, now?, cost?, subAgents? }[]
        events={events}          // AgentLanes tasks, plus action? and risk? for approvals
        since={lastVisit}        // epoch ms
        defaultView="list"       // or view + onViewChange; "timeline" on wide screens
        onApprove={(id) => approve(id)}
        onReject={(id) => deny(id)}
        onReview={(agentId) => openRun(agentId)}
        onAsk={(agentId) => ask(agentId)}
        onNewTask={() => openTaskBrief()}
      />
    </main>
  );
}`,
};
