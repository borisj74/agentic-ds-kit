"use client";

import { useEffect, useState } from "react";
import { AgentFleet, AgentInbox, AgentMonitor, type AgentInboxItem, type AgentMonitorStep } from "agentic-ds-kit";
import { AGENT_MONITOR_STEPS } from "@/lib/agent-demo.sample";
import { HOME_FLEET_HERO } from "@/lib/home.sample";
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

const INBOX: AgentInboxItem[] = [
  { id: "1", agentName: "Migrate DB", type: "approval", preview: "Run migration on staging?", time: "2m" },
  { id: "2", agentName: "Docs sweep", type: "recap", preview: "Draft ready", time: "1h", read: true },
];

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
 * with example data, and all of them work: pick an inbox item or approve it, select a step, pause
 * or collapse the run, open the fleet. Server and first client render are the same frame, so
 * nothing mismatches on hydration; under reduced motion the stage holds that frame.
 */
export function HomeStage() {
  const [paused, setPaused] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [stepId, setStepId] = useState<string | null>(null);
  const [inbox, setInbox] = useState(INBOX);
  const [inboxId, setInboxId] = useState<string | null>(null);
  const [fleetId, setFleetId] = useState<string | null>(null);
  const seconds = useStageClock(paused);
  const phase = Math.min(MAX_PHASE, Math.floor(seconds / STEP_SECONDS));
  const elapsed = START_SECONDS + seconds;
  const steps = stepsAt(phase);
  const running = steps.find((step) => step.status === "running");
  const target = running?.target?.split(" · ")[0] ?? "";

  return (
    <PreviewScope className={styles.stageScope}>
      <section className={styles.stage} aria-label="Example: kit agent components with live sample data">
        <div className={styles.stageSide} data-side="start" data-motion="stage">
          <AgentInbox
            items={inbox}
            selectedId={inboxId}
            onSelect={(id) => {
              setInboxId(id);
              setInbox((items) => items.map((item) => (item.id === id ? { ...item, read: true } : item)));
            }}
            onApprove={(id) => setInbox((items) => items.filter((item) => item.id !== id))}
            onDeny={(id) => setInbox((items) => items.filter((item) => item.id !== id))}
          />
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
            selectedStepId={stepId}
            onSelectStep={setStepId}
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            onPause={() => setPaused(true)}
            onResume={() => setPaused(false)}
          />
        </div>
        <div className={styles.stageSide} data-side="end" data-motion="stage">
          <AgentFleet totals="" agents={HOME_FLEET_HERO} expandedId={fleetId} onExpandedChange={setFleetId} />
        </div>
      </section>
    </PreviewScope>
  );
}
