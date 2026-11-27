"use client";

import { AssistantStartPattern, type AssistantStartState } from "../../packages/kit/patterns/AssistantStartPattern";

const STATE: Record<string, AssistantStartState> = {
  default: "ready",
  loading: "loading",
  "reconnect-error": "reconnect-error",
};

/** assistant-start as a full screen (Paper p-A-1, 4GX4-0). `view` picks the page state. */
export function AssistantStartScreen({ view = "default" }: { view?: string }) {
  return <AssistantStartPattern state={STATE[view] ?? "ready"} />;
}
