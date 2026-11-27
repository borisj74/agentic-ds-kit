"use client";

import { AssistantStartPattern, type AssistantStartState } from "../../packages/kit/patterns/AssistantStartPattern";
import { northwindShell } from "./northwindShell";

const STATE: Record<string, AssistantStartState> = {
  default: "ready",
  loading: "loading",
  "reconnect-error": "reconnect-error",
};

/** assistant-start as a full screen (Paper p-A-1, 4GX4-0) in the Northwind shell, Home current. `view` picks the page state. */
export function AssistantStartScreen({ view = "default" }: { view?: string }) {
  // The demo shell's narrow top bar is its own; drop it so the Northwind shell's shows.
  return <AssistantStartPattern state={STATE[view] ?? "ready"} shell={{ ...northwindShell("home"), narrowHeader: undefined }} />;
}
