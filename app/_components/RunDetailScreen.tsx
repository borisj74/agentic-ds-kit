"use client";

import { RunDetailPattern, type RunDetailState } from "../../packages/kit/patterns/RunDetailPattern";

const STATE: Record<string, RunDetailState> = {
  failed: "failed",
  running: "running",
  done: "done",
  mobile: "failed",
  "mobile-running": "running",
};

/** run-detail as a full screen (Paper p-A-1, 4LD6-0). `view` picks the run's state. */
export function RunDetailScreen({ view = "failed" }: { view?: string }) {
  return <RunDetailPattern state={STATE[view] ?? "failed"} />;
}
