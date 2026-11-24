"use client";

import { useId } from "react";
import { LucideByName } from "../Button/lucideName";
import { AGENT_STATUS_WORD, AgentStatusIcon, type AgentStatus } from "../shared/agentStatus";
import { cx } from "../shared/cx";
import type { AgentTrailProps, AgentTrailStep, AgentTrailStepStatus } from "./AgentTrail.types";
import styles from "./AgentTrail.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { AgentTrailProps, AgentTrailStep, AgentTrailStepStatus } from "./AgentTrail.types";

// The shared agent status marks, so the trail matches AgentOverview and RunDetail.
const MARK_STATUS: Record<AgentTrailStepStatus, AgentStatus> = {
  done: "done",
  running: "running",
  approval: "needs-you",
  pending: "queued",
  failed: "failed",
};

// Pending steps leave the time column empty: the queued marker and muted label already say it.
function meta(step: AgentTrailStep): string | undefined {
  if (step.status === "pending") return undefined;
  if (step.status === "running" || step.status === "approval") return step.timer ?? step.duration;
  return step.duration ?? step.timer;
}

function defaultProgress(steps: AgentTrailStep[]) {
  const open = steps.findIndex((step) => step.status !== "done");
  return { current: open === -1 ? steps.length : open + 1, total: steps.length };
}

/** A vertical step list for a running agent task: what already happened, what runs now, what is next. */
export function AgentTrail({
  title,
  steps,
  icon,
  tag,
  progress,
  selectedStepId,
  onSelectStep,
  className,
  ref,
  ...rest
}: AgentTrailProps) {
  const titleId = useId();
  const counter = progress ?? defaultProgress(steps);
  const firstOpen = steps.findIndex((step) => step.status !== "done");
  // The current step is the live one (running or waiting on you), else the failed one.
  const live = steps.find((step) => step.status === "running" || step.status === "approval");
  const currentId = (live ?? steps.find((step) => step.status === "failed"))?.id;

  return (
    <section {...rest} {...nisthaAttr("agenttrail", rest)} ref={ref} className={cx(styles.trail, className)} aria-labelledby={titleId}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          {icon ? <LucideByName name={icon} size={16} className={styles.titleIcon} /> : null}
          <h3 id={titleId} className={styles.title}>
            {title}
          </h3>
          {tag ? <span className={styles.tag}>{tag}</span> : null}
        </div>
        <span className={styles.counter} aria-label={`Step ${counter.current} of ${counter.total}`}>
          {counter.current}/{counter.total}
        </span>
      </header>
      <ol className={styles.steps}>
        {steps.map((step, index) => {
          const last = index === steps.length - 1;
          const value = meta(step);
          // The line out of a step is strong while the trail behind it is finished.
          const lineDone = firstOpen === -1 || index < firstOpen + 1;
          return (
            <li
              key={step.id}
              className={cx(styles.step, styles[step.status])}
              aria-current={step.id === currentId ? "step" : undefined}
            >
              <div className={styles.rail} aria-hidden="true">
                <span className={styles.marker}>
                  <AgentStatusIcon status={MARK_STATUS[step.status]} size={16} />
                </span>
                {last ? null : <span className={cx(styles.line, lineDone && styles.lineDone)} />}
              </div>
              {onSelectStep ? (
                <div className={cx(styles.body, last && styles.bodyLast)}>
                  <button
                    type="button"
                    className={cx(styles.select, step.id === selectedStepId && styles.selected)}
                    aria-pressed={step.id === selectedStepId}
                    onClick={() => onSelectStep(step.id === selectedStepId ? null : step.id)}
                  >
                    <span className={styles.row}>
                      <span className={styles.label}>{step.label}</span>
                      {value ? <span className={styles.meta}>{value}</span> : null}
                    </span>
                    <span className={cx(styles.status, styles.statusBlock)}>
                      <span className={styles.srOnly}>, </span>
                      {AGENT_STATUS_WORD[MARK_STATUS[step.status]]}
                    </span>
                    {step.sublabel ? <span className={cx(styles.sublabel, styles.sublabelBlock)}>{step.sublabel}</span> : null}
                  </button>
                </div>
              ) : (
                <div className={cx(styles.body, last && styles.bodyLast)}>
                  <div className={styles.row}>
                    <span className={styles.label}>{step.label}</span>
                    {value ? <span className={styles.meta}>{value}</span> : null}
                  </div>
                  <p className={styles.status}>{AGENT_STATUS_WORD[MARK_STATUS[step.status]]}</p>
                  {step.sublabel ? <p className={styles.sublabel}>{step.sublabel}</p> : null}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
