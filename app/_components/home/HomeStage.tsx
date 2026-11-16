"use client";

import { useEffect, useState } from "react";
import { AgentFleet, AgentInbox, AgentMonitor, type AgentFleetAgent, type AgentFleetSubAgentStatus, type AgentInboxItem, type AgentMonitorStep } from "agentic-ds-kit";
import { AGENT_MONITOR_STEPS } from "@/lib/agent-demo.sample";
import { HOME_FLEET_HERO } from "@/lib/home.sample";
import { useDemoLoop } from "./useDemoLoop";
import { PreviewScope } from "../ThemeScope";
import styles from "./Home.module.css";

/** The run clock starts where the AgentMonitor docs leave it: 2:14 in. */
const START_SECONDS = 134;
/** A new step every few seconds; the stage stops adding them after MAX_PHASE. */
const STEP_SECONDS = 6;
const MAX_PHASE = 10;
const STEPS_SHOWN = 6;

/** The tools the sample agent cycles through after the docs' six steps. */
const NEXT_STEPS: Omit<AgentMonitorStep, "id" | "status">[] = [
  { tool: "run_tests", target: "invoice.test.ts · 13 passed", duration: "28.4s", tokens: "2,040", cost: "$0.05" },
  { tool: "read_file", target: "src/billing/discounts.ts · 88 lines", duration: "0.3s", tokens: "720", cost: "$0.01" },
  { tool: "edit_file", target: "src/billing/discounts.ts · +6 −4", duration: "2.1s", tokens: "2,900", cost: "$0.09" },
  { tool: "search_files", target: '"applyDiscount" in src · 5 matches', duration: "0.8s", tokens: "640", cost: "$0.01" },
  { tool: "edit_file", target: "src/billing/totals.ts · +3 −3", duration: "1.6s", tokens: "2,300", cost: "$0.07" },
];

const HEADLINES: Record<string, string> = {
  edit_file: "Editing",
  read_file: "Reading",
  run_tests: "Running tests in",
  search_files: "Searching",
};

/** Messages that arrive in the inbox one by one; the newest sits on top, unread. */
const INBOX_POOL: Omit<AgentInboxItem, "read">[] = [
  { id: "migrate", agentName: "Migrate DB", type: "approval", preview: "Run migration on staging?", time: "now" },
  { id: "docs", agentName: "Docs sweep", type: "recap", preview: "Draft ready", time: "now" },
  { id: "flaky", agentName: "Flaky test hunt", type: "failure", preview: "3 retries failed on checkout.spec", time: "now" },
  { id: "billing", agentName: "Billing refactor", type: "question", preview: "Keep v1 rounding for old invoices?", time: "now" },
];
const AGES = ["now", "2m", "1h"];

function inboxAt(tick: number): AgentInboxItem[] {
  return [0, 1, 2].map((offset) => {
    const item = INBOX_POOL[(tick + INBOX_POOL.length - offset) % INBOX_POOL.length];
    return { ...item, time: tick === 0 ? (offset === 0 ? "2m" : "1h") : AGES[offset], read: offset > 0 };
  }).slice(0, tick === 0 ? 2 : 3);
}

/** The fleet's sub-agents move along: tests finish, the migration runs, then the run is done. */
const FLEET_FRAMES: AgentFleetSubAgentStatus[][] = [
  ["done", "done", "running", "queued"],
  ["done", "done", "done", "running"],
  ["done", "done", "done", "done"],
];

function fleetAt(tick: number): AgentFleetAgent[] {
  const frame = FLEET_FRAMES[tick % FLEET_FRAMES.length];
  return HOME_FLEET_HERO.map((agent) => ({
    ...agent,
    status: frame.every((status) => status === "done") ? "done" : "running",
    subAgents: agent.subAgents.map((sub, index) => ({ ...sub, status: frame[index] })),
  }));
}

function clock(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function axisLabel(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** The docs' six steps plus `phase` more, the last one running; the strip shows the latest six. */
function stepsAt(phase: number): AgentMonitorStep[] {
  if (phase === 0) return AGENT_MONITOR_STEPS;
  const done = AGENT_MONITOR_STEPS.map((step) => ({
    ...step,
    status: "done" as const,
    duration: step.duration ?? "29.6s",
    tokens: step.tokens ?? "3,100",
    cost: step.cost ?? "$0.10",
  }));
  const more = Array.from({ length: phase }, (_, index) => ({
    ...NEXT_STEPS[index % NEXT_STEPS.length],
    id: `n${index}`,
    status: index === phase - 1 ? ("running" as const) : ("done" as const),
  }));
  return [...done, ...more].slice(-STEPS_SHOWN);
}

function useStageClock(paused: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    // Under reduced motion the stage stays on its first frame: no clock, no new steps.
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [paused]);
  return seconds;
}

/**
 * The hero's product stage: AgentInbox, a live AgentMonitor and AgentFleet, all kit components
 * with example data, each playing by itself: messages arrive in the inbox, the monitor's clock and
 * steps run (pause and collapse work in place), the fleet's sub-agents finish. Nothing opens a
 * panel on click. Server and first client render are the same frame, so
 * nothing mismatches on hydration; under reduced motion the stage holds that frame.
 */
export function HomeStage() {
  const [paused, setPaused] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [inboxRef, inboxTick] = useDemoLoop<HTMLDivElement>(3600);
  const [fleetRef, fleetTick] = useDemoLoop<HTMLDivElement>(2800);
  const seconds = useStageClock(paused);
  const phase = Math.min(MAX_PHASE, Math.floor(seconds / STEP_SECONDS));
  const elapsed = START_SECONDS + seconds;
  const steps = stepsAt(phase);
  const running = steps.find((step) => step.status === "running");
  const target = running?.target?.split(" · ")[0] ?? "";

  return (
    <PreviewScope className={styles.stageScope}>
      <section className={styles.stage} aria-label="Example: kit agent components with live sample data">
        {/* Self-playing: new messages arrive. inert, so a click opens no detail pane. */}
        <div ref={inboxRef} className={styles.stageSide} data-side="start" data-motion="stage" inert>
          <AgentInbox items={inboxAt(inboxTick)} />
        </div>
        <div className={styles.stageMain} data-motion="stage">
          <AgentMonitor
            name="Refactor billing service"
            meta="claude-code · acme-demo · example data"
            status={paused ? "paused" : "running"}
            headline={running ? `${HEADLINES[running.tool] ?? "Running"} ${target}` : undefined}
            headlineNote={`step ${AGENT_MONITOR_STEPS.length + phase}`}
            elapsed={clock(elapsed)}
            cost={`$${(0.42 + seconds * 0.004).toFixed(2)}`}
            steps={steps}
            axis={["0:00", axisLabel(Math.floor(elapsed / 2)), axisLabel(elapsed)]}
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            onPause={() => setPaused(true)}
            onResume={() => setPaused(false)}
          />
        </div>
        {/* Self-playing: sub-agents finish one by one. inert, so a click does not expand it. */}
        <div ref={fleetRef} className={styles.stageSide} data-side="end" data-motion="stage" inert>
          <AgentFleet totals="" agents={fleetAt(fleetTick)} expandedId={null} />
        </div>
      </section>
    </PreviewScope>
  );
}
