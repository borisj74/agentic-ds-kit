import contract from "../../packages/kit/contracts/failureclusters.json";
import type { BlockDoc } from "./types";

export const failureClustersDoc: BlockDoc = {
  slug: "failure-clusters",
  label: "Failure clusters",
  name: "FailureClusters",
  contract,
  lead:
    "Failed runs across every agent, grouped by likely cause, so ops fixes causes instead of single runs. The largest clusters lead, each with its status, the agents it hits and its trend in words; the selected cluster shows when it started, a chart over time, a sample failing call opened to its error and the recent runs. Arrow keys move through the list.",
  usage: `import { FailureClusters } from "agentic-ds-kit";

export function FailuresPage({ clusters, window }) {
  return (
    <main className="layout-content">
      <FailureClusters
        clusters={clusters}          // { id, title, status, count, agents, trend, firstSeen, lastSeen, sample, runs }[]
        filters={{ time: window }}   // time is a label: pass the clusters for that window
        onFiltersChange={(next) => setWindow(next.time)}
        onMarkKnown={(id) => markKnown(id)}
        onMute={(id) => mute(id, "24h")}
        onOpenIssue={(id) => openIssue(id)}
      />
    </main>
  );
}`,
};
