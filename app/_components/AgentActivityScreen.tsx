"use client";

import { AgentActivityPattern, type AgentActivityView } from "../../packages/kit/patterns/AgentActivityPattern";

const VIEW: Record<string, AgentActivityView> = {
  default: "default",
  empty: "empty",
  error: "error",
  undone: "undone",
};

/** agent-activity as a full screen (Paper p-A-1, 4JQS-0). `view` picks the demo state. */
export function AgentActivityScreen({ view = "default" }: { view?: string }) {
  return <AgentActivityPattern key={view} view={VIEW[view] ?? "default"} />;
}
