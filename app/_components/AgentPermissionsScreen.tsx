"use client";

import { AgentPermissionsPattern, type AgentPermissionsRequestState } from "../../packages/kit/patterns/AgentPermissionsPattern";

const REQUEST: Record<string, AgentPermissionsRequestState> = {
  default: "pending",
  "edit-drawer": "pending",
  granted: "granted",
  denied: "denied",
  error: "error",
};

/** agent-permissions as a full screen (Paper p-A-1, 4KTJ-0). `view` picks the request state or opens Edit. */
export function AgentPermissionsScreen({ view = "default" }: { view?: string }) {
  return (
    <AgentPermissionsPattern
      key={view}
      request={REQUEST[view] ?? "pending"}
      defaultEditing={view === "edit-drawer" ? "refunds" : undefined}
    />
  );
}
