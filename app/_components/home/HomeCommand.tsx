"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AgentFleet,
  AgentMonitor,
  Button,
  PageHeader,
  PermissionRequest,
  RunningNow,
  SideNav,
  type AgentMonitorStep,
} from "agentic-ds-kit";
import { AGENT_MONITOR_STEPS, RUNNING_NOW_ITEMS } from "@/lib/agent-demo.sample";
import {
  COMMAND_NAV,
  COMMAND_PERMISSION_DESCRIPTION,
  COMMAND_PERMISSION_SCOPES,
  COMMAND_PERMISSION_WARNING,
  commandFleet,
} from "@/lib/home-command.sample";
import { PreviewScope } from "../ThemeScope";
import styles from "./Home.module.css";

/**
 * One calm loop, in seconds. The clock runs from 02:14; a new step starts at STEP_AT; the billing
 * agent's tests finish at DONE_AT; the permission request slides in at ASK_AT and its Grant button
 * pulses once at PULSE_AT; the rest of the loop holds still, then it starts over.
 */
const CYCLE = 16;
const STEP_AT = 4;
const DONE_AT = 6;
const ASK_AT = 8;
const PULSE_AT = 9;
/** The last second of the loop: what the server, no-JS and reduced motion show. */
const FINAL = CYCLE - 1;

/** The screen is laid out at desktop size, then scaled to the frame. */
const SCREEN_WIDTH = 1440;
const SCREEN_HEIGHT = 900;

const START_SECONDS = 134;

function clock(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function axisLabel(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** The docs' six steps; past STEP_AT the running edit is done and a test run starts. */
function stepsAt(t: number): AgentMonitorStep[] {
  if (t < STEP_AT) return AGENT_MONITOR_STEPS;
  const done = AGENT_MONITOR_STEPS.map((step) => ({
    ...step,
    status: "done" as const,
    duration: step.duration ?? "41.2s",
    tokens: step.tokens ?? "3,900",
    cost: step.cost ?? "$0.13",
  }));
  return [
    ...done.slice(1),
    { id: "s7", tool: "run_tests", status: "running", target: "invoice.test.ts", started: "2:16" },
  ];
}

/**
 * The loop's second: FINAL on the server and the first client render (so nothing mismatches),
 * then 0 and counting while the screen is on screen. Under reduced motion it stays on FINAL.
 */
function useLoop<T extends Element>() {
  const ref = useRef<T>(null);
  const [t, setT] = useState(FINAL);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setT(0);
    let id: number | undefined;
    const start = () => {
      if (id === undefined) id = window.setInterval(() => setT((value) => (value + 1) % CYCLE), 1000);
    };
    const stop = () => {
      if (id !== undefined) window.clearInterval(id);
      id = undefined;
    };
    const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0.2 });
    observer.observe(element);
    return () => {
      observer.disconnect();
      stop();
    };
  }, []);

  return [ref, t] as const;
}

/** Scales a fixed-size screen to the width it is given. Unscaled (cropped) until measured. */
function useFit<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [scale, setScale] = useState<number | null>(null);
  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;
    const fit = () => host.clientWidth > 8 && setScale(host.clientWidth / SCREEN_WIDTH);
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);
  return [ref, scale] as const;
}

/**
 * The hero visual: the Command screen of an agent workspace, built live from kit parts with
 * example data, in a browser frame. RunningNow, AgentFleet, AgentMonitor and a waiting
 * PermissionRequest play one short loop, then hold. Inert: nothing on it takes clicks here.
 */
export function HomeCommand() {
  const [loopRef, t] = useLoop<HTMLDivElement>();
  const [fitRef, scale] = useFit<HTMLDivElement>();
  const elapsed = START_SECONDS + t;
  const steps = stepsAt(t);
  const running = steps.find((step) => step.status === "running");

  return (
    <div ref={loopRef} className={styles.command} data-motion="stage">
      <div className={styles.browserBar} aria-hidden="true">
        <span className={styles.browserDots}>
          <span />
          <span />
          <span />
        </span>
        <span className={styles.browserUrl}>northwind.example/agents/command</span>
      </div>
      <div ref={fitRef} className={styles.commandHost} style={scale ? { height: SCREEN_HEIGHT * scale } : undefined}>
        <PreviewScope className={styles.commandScope}>
          <div
            className={styles.commandScreen}
            style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, transform: scale ? `scale(${scale})` : undefined }}
            role="img"
            aria-label="Example: an agent command screen built from kit parts, with running agents and a permission request"
            inert
          >
            <SideNav
              title="northwind"
              mark="n"
              groups={COMMAND_NAV}
              account={{ name: "Priya Shah", secondary: "Pro plan · 12 seats" }}
            />
            <div className={styles.commandMain}>
              <PageHeader
                title="Command"
                subtitle="Example data. Agents in the northwind workspace."
                breadcrumbs={[{ label: "Agents" }, { label: "Command" }]}
                actions={
                  <>
                    <Button size="sm" appearance="outline" mode="neutral" shape="pill" iconStart="CircleHelp">
                      Help
                    </Button>
                    <Button size="sm" appearance="outline" mode="neutral" shape="pill" iconStart="Bell" ariaLabel="Notifications" />
                  </>
                }
              />
              <RunningNow items={RUNNING_NOW_ITEMS} maxVisible={3} />
              <AgentFleet totals="" agents={commandFleet(t >= DONE_AT)} expandedId={null} />
              <div className={styles.commandRow}>
                <AgentMonitor
                  name="Refactor billing service"
                  meta="claude-code · northwind-api · example data"
                  status="running"
                  headline={running ? `${running.tool === "run_tests" ? "Running tests in" : "Editing"} ${running.target}` : undefined}
                  headlineNote={`step ${t < STEP_AT ? 6 : 7}`}
                  elapsed={clock(elapsed)}
                  cost={`$${(0.42 + t * 0.004).toFixed(2)}`}
                  steps={steps}
                  axis={["0:00", axisLabel(Math.floor(elapsed / 2)), axisLabel(elapsed)]}
                />
                <div className={styles.commandAsk} data-shown={t >= ASK_AT ? "" : undefined} data-pulse={t === PULSE_AT ? "" : undefined}>
                  <PermissionRequest
                    description={COMMAND_PERMISSION_DESCRIPTION}
                    scopes={COMMAND_PERMISSION_SCOPES}
                    warning={COMMAND_PERMISSION_WARNING}
                    requestedAt="requested 14:02"
                    status="pending"
                    onGrant={() => {}}
                    onDeny={() => {}}
                  />
                </div>
              </div>
            </div>
          </div>
        </PreviewScope>
      </div>
    </div>
  );
}
