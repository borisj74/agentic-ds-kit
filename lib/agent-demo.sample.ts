import type { AgentMonitorStep, ContextSegment, RunningNowItem } from "agentic-ds-kit";

/**
 * Example data shared by the AgentMonitor and ContextWindow docs and the home page scene: one
 * agent refactoring a billing service. Fake names and numbers.
 */
export const AGENT_MONITOR_STEPS: AgentMonitorStep[] = [
  { id: "s1", tool: "search_files", status: "done", target: '"invoice total" in src/billing · 3 matches', duration: "0.9s", tokens: "820", cost: "$0.01", started: "0:02" },
  { id: "s2", tool: "read_file", status: "done", target: "src/billing/invoice.ts · 142 lines", duration: "0.4s", tokens: "1,240", cost: "$0.01", started: "0:21" },
  { id: "s3", tool: "read_file", status: "done", target: "src/billing/tax.ts · 64 lines", duration: "0.3s", tokens: "610", cost: "$0.01", started: "0:40" },
  { id: "s4", tool: "run_tests", status: "done", target: "invoice.test.ts · 12 passed", duration: "31.2s", tokens: "2,100", cost: "$0.06", started: "0:52" },
  { id: "s5", tool: "edit_file", status: "done", target: "src/billing/invoice.ts · +2 −1", duration: "1.8s", tokens: "3,400", cost: "$0.12", started: "1:31" },
  { id: "s6", tool: "edit_file", status: "running", target: "src/billing/invoice.ts", started: "2:01" },
];

export const AGENT_MONITOR_AXIS = ["0:00", "2:14"];

/** ContextWindow segments in display order. */
export function contextSegments(system: number, memory: number, tools: number, messages: number, reserved: number): ContextSegment[] {
  return [
    { id: "system", label: "System", tokens: system },
    { id: "memory", label: "Memory", tokens: memory },
    { id: "tools", label: "Tools", tokens: tools },
    { id: "messages", label: "Messages", tokens: messages },
    { id: "reserved", label: "Reserved", tokens: reserved },
  ];
}

/** RunningNow items: several agents at once, one waiting. */
export const RUNNING_NOW_ITEMS: RunningNowItem[] = [
  { id: "billing", name: "Billing refactor", activity: "editing invoice.ts", status: "running", elapsed: "02:14" },
  { id: "docs", name: "Docs sweep", activity: "reading 14 pages", status: "running", elapsed: "00:48" },
  { id: "flaky", name: "Flaky test hunt", activity: "rerunning suite", status: "running", elapsed: "05:31" },
  { id: "migrate", name: "Migrate DB", activity: "waiting for OK", status: "waiting", elapsed: "00:31" },
  { id: "deps", name: "Dependency bump", activity: "resolving lockfile", status: "running", elapsed: "01:02" },
];
