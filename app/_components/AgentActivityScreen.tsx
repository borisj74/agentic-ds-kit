"use client";

import { AppShellPattern } from "../../packages/kit/patterns/AppShellPattern";
import { AgentActivityPattern, type AgentActivityView } from "../../packages/kit/patterns/AgentActivityPattern";
import { northwindShell } from "./northwindShell";

const VIEW: Record<string, AgentActivityView> = {
  default: "default",
  empty: "empty",
  error: "error",
  undone: "undone",
};

/** agent-activity as a full screen in the Northwind shell, Home current. `view` picks the demo state. */
export function AgentActivityScreen({ view = "default" }: { view?: string }) {
  return (
    <AppShellPattern {...northwindShell("home")}>
      <AgentActivityPattern key={view} view={VIEW[view] ?? "default"} topBar={false} />
    </AppShellPattern>
  );
}
