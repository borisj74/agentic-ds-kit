"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  AgentFleet,
  AgentMonitor,
  Card,
  InlineDiff,
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
// The findings quote the mistakes they catch (a raw hex value, a local import), so they live as
// data in JSON, not as code the review would read.
import review from "@/lib/home-review.sample.json";
import { presetState } from "@/lib/theme-playground";
import { ThemeScope, useSiteMode } from "../ThemeScope";
import styles from "./Home.module.css";

/**
 * The hero's story, one pinned product screen changed by the chapter the reader is on:
 * 1 agents build it from the kit, 2 a brand colour set repaints it, 3 it switches light or dark,
 * 4 a review checks it, back in the brand's own mode, down to 0 issues. Chapter 0 is the screen at rest under the headline.
 */
const CHAPTERS: { id: string; title: string; body: string }[] = [
  {
    id: "parts",
    title: "Built from your parts",
    body: "Every panel on this screen is a component from your system. Each ships with a contract, a short file of rules your agent reads first, so it never draws a lookalike.",
  },
  {
    id: "brand",
    title: "Your brand, everywhere",
    body: "Swap the colour set and the whole screen follows: buttons, badges, progress, focus. Not one line of markup changes.",
  },
  {
    id: "mode",
    title: "Light or dark, without a redesign",
    body: "Every token has a value for both modes, so the same screen switches with one attribute.",
  },
  {
    id: "review",
    title: "Off-system work gets caught",
    body: "Before you see a screen, the review checks it: only kit parts, only tokens, every control named. What fails comes back fixed.",
  },
];

/** Chapter 1's beats, in seconds: a new step, a sub-agent finishes, the request lands, Grant pulses. */
const STEP_AT = 2;
const DONE_AT = 3;
const ASK_AT = 5;
const PULSE_AT = 6;
const FINAL = 9;

/** The screen's design size: laid out at desktop size, then scaled to the stage through CSS. */
const SCREEN_WIDTH = 1440;
const SCREEN_HEIGHT = 900;
const ASK_WIDTH = 520;
const REVIEW_WIDTH = 520;

const START_SECONDS = 134;

/** The review in chapter 4: three off-system findings, each with its fix, landing in turn. */
const FINDINGS = review.findings;

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
  return [...done.slice(1), { id: "s7", tool: "run_tests", status: "running", target: "invoice.test.ts", started: "2:16" }];
}

/**
 * Counts from 0 up to `to`, one per `stepMs`, while `on`; reads 0 when off. Under reduced motion it
 * lands on `to` at once. State only changes from the timer, and is reset when the count stops.
 */
function useCountUp(on: boolean, to: number, stepMs: number) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!on) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let current = 0;
    const id = window.setInterval(
      () => {
        current = reduced ? to : current + 1;
        setValue(current);
        if (current >= to) window.clearInterval(id);
      },
      reduced ? 0 : stepMs,
    );
    return () => {
      window.clearInterval(id);
      setValue(0);
    };
  }, [on, to, stepMs]);
  return on ? value : 0;
}

/**
 * Which chapter the reader is on: 0 on the server, at first paint and without JS. On wide screens
 * the chapter whose caption crosses the middle of the viewport; on narrow screens (nothing pins)
 * chapter 1's finished state.
 */
function useChapter(list: RefObject<HTMLOListElement | null>) {
  const [chapter, setChapter] = useState(0);
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const element = list.current;
    if (!element) return;
    // 64rem is --grid-breakpoint-md, where the captions and the stage sit side by side.
    const query = window.matchMedia("(width >= 64rem)");
    let observer: IntersectionObserver | undefined;
    const setup = () => {
      observer?.disconnect();
      setWide(query.matches);
      if (!query.matches) {
        setChapter(1);
        return;
      }
      setChapter(0);
      const items = [...element.children] as HTMLElement[];
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const index = items.indexOf(entry.target as HTMLElement);
            if (entry.isIntersecting) setChapter(index + 1);
            // Scrolled back above the first caption: the screen is at rest again.
            else if (index === 0 && entry.boundingClientRect.top > window.innerHeight / 2) setChapter(0);
          }
        },
        { rootMargin: "-45% 0px -45% 0px" },
      );
      items.forEach((item) => observer?.observe(item));
    };
    setup();
    query.addEventListener("change", setup);
    return () => {
      query.removeEventListener("change", setup);
      observer?.disconnect();
    };
  }, [list]);
  return [chapter, wide] as const;
}

/**
 * The hero story. Captions scroll on the left; the northwind Command screen, built live from kit
 * parts with example data, stays pinned on the right and changes with each chapter. Inert: nothing
 * on the screen takes clicks here. Kit parts only.
 */
export function HomeStory() {
  const listRef = useRef<HTMLOListElement>(null);
  const [chapter, wide] = useChapter(listRef);
  const siteMode = useSiteMode();

  // Chapter 1 plays its beats once, then holds; later chapters keep its finished state.
  const played = useCountUp(chapter === 1, FINAL, 1000);
  const t = chapter === 0 ? 0 : chapter === 1 ? played : FINAL;
  const fixed = useCountUp(chapter === 4, FINDINGS.length, 900);

  const brandMode = siteMode;
  const otherMode = siteMode === "dark" ? "light" : "dark";
  const theme =
    chapter === 3 ? presetState("teal", otherMode) : chapter >= 2 ? presetState("teal", brandMode) : presetState("ink", siteMode);

  const elapsed = START_SECONDS + t;
  const steps = stepsAt(t);
  const running = steps.find((step) => step.status === "running");
  const askShown = t >= ASK_AT && chapter < 4;
  const reviewShown = chapter === 4;

  return (
    <div className={styles.story}>
      <ol ref={listRef} className={styles.storySteps}>
        {CHAPTERS.map((step, index) => (
          <li
            key={step.id}
            className={styles.storyStep}
            data-active={wide && chapter === index + 1 ? "" : undefined}
          >
            <span className={styles.label}>
              <span className={styles.labelNumber}>{`${index + 1}/${CHAPTERS.length}`}</span>
            </span>
            <p className={styles.storyStepTitle}>{step.title}</p>
            <p className={styles.sectionLead}>{step.body}</p>
          </li>
        ))}
      </ol>

      <div className={styles.storyStage} data-motion="stage">
        <div
          className={styles.commandStage}
          role="img"
          aria-label="Example: an agent command screen built from kit parts. As you scroll it is repainted in another colour set, switched between light and dark, and checked by a review."
        >
          <ThemeScope theme={theme} className={styles.commandScope}>
            <div className={styles.commandWindow} style={{ width: SCREEN_WIDTH }} inert>
              <div className={styles.browserBar} aria-hidden="true">
                <span className={styles.browserDots}>
                  <span />
                  <span />
                  <span />
                </span>
                <span className={styles.browserUrl}>northwind.example/agents/command</span>
              </div>
              <div className={styles.commandScreen} style={{ height: SCREEN_HEIGHT }}>
                {/* radius="none": the flush square rail, edge to edge in the window. */}
                <SideNav title="northwind" mark="n" radius="none" items={COMMAND_NAV} />
                <div className={styles.commandMain}>
                  <PageHeader title="Command" />
                  <RunningNow items={RUNNING_NOW_ITEMS} maxVisible={3} />
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
                      axis={["0:00", axisLabel(elapsed)]}
                    />
                    <AgentFleet totals="" agents={commandFleet(t >= DONE_AT)} expandedId={null} />
                  </div>
                </div>
              </div>
            </div>

            {/* Satellites on the window's edge: the request in chapter 1, the review in chapter 4. */}
            <div
              className={styles.commandAsk}
              style={{ width: ASK_WIDTH }}
              data-shown={askShown ? "" : undefined}
              data-pulse={chapter === 1 && t === PULSE_AT ? "" : undefined}
              inert
            >
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
            <div className={styles.commandAsk} style={{ width: REVIEW_WIDTH }} data-shown={reviewShown ? "" : undefined} inert>
              <Card
                title="Review · agents/command"
                description={fixed >= FINDINGS.length ? "0 issues · only kit parts and tokens" : `${FINDINGS.length - fixed} to fix`}
              >
                <div className={styles.storyFindings}>
                  {FINDINGS.map((finding, index) => (
                    <InlineDiff
                      key={finding.id}
                      title={finding.rule}
                      file={finding.file}
                      lines={[
                        { type: "remove", text: finding.fix.remove, oldNo: finding.fix.oldNo },
                        { type: "add", text: finding.fix.add, newNo: finding.fix.oldNo },
                      ]}
                      status={index < fixed ? "accepted" : "pending"}
                      resolvedSummary={finding.summary}
                      onAccept={() => {}}
                      onReject={() => {}}
                    />
                  ))}
                </div>
              </Card>
            </div>
          </ThemeScope>
        </div>
      </div>
    </div>
  );
}
