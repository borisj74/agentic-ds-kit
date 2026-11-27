"use client";

import { AppShellPattern } from "../../packages/kit/patterns/AppShellPattern";
import { AgentPermissionsPattern, type AgentPermissionsRequestState } from "../../packages/kit/patterns/AgentPermissionsPattern";
import { northwindShell } from "./northwindShell";

const REQUEST: Record<string, AgentPermissionsRequestState> = {
  default: "pending",
  "edit-drawer": "pending",
  granted: "granted",
  denied: "denied",
  error: "error",
};

/** agent-permissions as a full screen in the Northwind shell, Home current. `view` picks the request state or opens Edit. */
export function AgentPermissionsScreen({ view = "default" }: { view?: string }) {
  return (
    <AppShellPattern {...northwindShell("home")}>
      <AgentPermissionsPattern
        key={view}
        request={REQUEST[view] ?? "pending"}
        defaultEditing={view === "edit-drawer" ? "refunds" : undefined}
        topBar={false}
      />
    </AppShellPattern>
  );
}
