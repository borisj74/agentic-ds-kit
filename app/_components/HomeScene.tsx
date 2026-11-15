"use client";

import { useEffect, useState } from "react";
import { AgentMonitor, Badge, ContextWindow, KpiBoard, NumberTransition, RunningNow, type AgentMonitorStep, type RunningNowItem } from "agentic-ds-kit";
import { AGENT_MONITOR_STEPS, RUNNING_NOW_ITEMS, contextSegments } from "@/lib/agent-demo.sample";
import { KPI_METRICS, KPI_RANGES, KPI_ROWS, KPI_SERIES } from "@/lib/blocks/kpi-board.sample";
import { PreviewScope } from "./ThemeScope";
import styles from "./HomeScene.module.css";

/** The run clock starts where the AgentMonitor docs leave it: 2:14 in. */
const START_SECONDS = 134;
/** A new step every few seconds; the scene stops adding them after MAX_PHASE. */
const STEP_SECONDS = 6;
const MAX_PHASE = 12;
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

function clock(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

/** "02:14" plus `seconds`, for the RunningNow clocks of agents still running. */
function later(item: RunningNowItem, seconds: number): RunningNowItem {
  if (item.status !== "running" || !item.elapsed) return item;
  const [minutes, secs] = item.elapsed.split(":").map(Number);
  return { ...item, elapsed: clock(minutes * 60 + secs + seconds) };
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

function useSceneClock() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    // Under reduced motion the scene stays on its first frame: no clock, no new steps.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  return seconds;
}

/**
 * The home page's live product scene, built only from kit parts with example data: an
 * AgentMonitor whose clock, cost and steps move, RunningNow with the rest of the fleet and a
 * ContextWindow that fills as the agent works (its count rolls with NumberTransition), beside a
 * KpiBoard. Server and first client render are the same frame, so nothing mismatches on
 * hydration; under reduced motion the scene holds that frame.
 */
export function HomeScene() {
  const seconds = useSceneClock();
  const phase = Math.min(MAX_PHASE, Math.floor(seconds / STEP_SECONDS));
  const elapsed = START_SECONDS + seconds;
  const steps = stepsAt(phase);
  const running = steps.find((step) => step.status === "running");
  const target = running?.target?.split(" · ")[0] ?? "";
  const used = 104_000 + phase * 3_400;

  return (
    // PreviewScope: the Theme panel's saved theme restyles the scene, like every docs preview.
    <PreviewScope>
      <section className={styles.scene} aria-label="Example: kit components with live sample data">
        <div className={styles.surface}>
          <div className={styles.bar}>
            <Badge size="sm" tone="neutral" appearance="soft">
              Live example · fake data
            </Badge>
            <span className={styles.count}>
              <NumberTransition value={1_284 + phase} size="sm" format={(value) => Number(value).toLocaleString("en-US")} label="Steps run today" />
              <span>steps run today</span>
            </span>
          </div>
          <div className={styles.grid}>
            <div className={styles.side}>
              <AgentMonitor
                className={styles.monitor}
                name="Refactor billing service"
                meta="claude-code · acme-demo"
                status="running"
                headline={running ? `${HEADLINES[running.tool] ?? "Running"} ${target}` : undefined}
                headlineNote={`step ${AGENT_MONITOR_STEPS.length + phase}`}
                elapsed={clock(elapsed)}
                cost={`$${(0.42 + seconds * 0.004).toFixed(2)}`}
                steps={steps}
                axis={["0:00", axisLabel(Math.floor(elapsed / 2)), axisLabel(elapsed)]}
              />
              <RunningNow layout="stack" maxVisible={4} items={RUNNING_NOW_ITEMS.map((item) => later(item, seconds))} />
              <ContextWindow used={used} limit={200_000} segments={contextSegments(6_200, 9_800, 21_400, 58_600 + phase * 3_400, 8_000)} />
            </div>
            <KpiBoard
              className={styles.kpi}
              description="Acme Analytics · example data"
              metrics={KPI_METRICS}
              series={KPI_SERIES}
              rows={KPI_ROWS}
              ranges={KPI_RANGES}
              defaultRange="30d"
              rowLimit={3}
            />
          </div>
        </div>
      </section>
    </PreviewScope>
  );
}
