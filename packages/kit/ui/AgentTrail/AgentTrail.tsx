"use client";

import { useId } from "react";
import { Circle, CircleCheck, CircleDashed, CircleX, LoaderCircle } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { LucideByName } from "../Button/lucideName";
import { cx } from "../shared/cx";
import type { AgentTrailProps, AgentTrailStep, AgentTrailStepStatus } from "./AgentTrail.types";
import styles from "./AgentTrail.module.css";

export type { AgentTrailProps, AgentTrailStep, AgentTrailStepStatus } from "./AgentTrail.types";

const STATUS_ICON = {
  done: CircleCheck,
  running: LoaderCircle,
  approval: CircleDashed,
  pending: Circle,
  failed: CircleX,
} as const;

const STATUS_TEXT: Record<AgentTrailStepStatus, string> = {
  done: "Done",
  running: "Running",
  approval: "Awaiting approval",
  pending: "Pending",
  failed: "Failed",
};

function meta(step: AgentTrailStep): string | undefined {
  if (step.status === "pending") return "Pending";
  if (step.status === "running" || step.status === "approval") return step.timer ?? step.duration;
  return step.duration ?? step.timer;
}

function defaultProgress(steps: AgentTrailStep[]) {
  const open = steps.findIndex((step) => step.status !== "done");
  return { current: open === -1 ? steps.length : open + 1, total: steps.length };
}

/** A vertical step list for a running agent task: what already happened, what runs now, what is next. */
export function AgentTrail({ title, steps, icon, tag, progress, className, ref, ...rest }: AgentTrailProps) {
  const titleId = useId();
  const counter = progress ?? defaultProgress(steps);
  const firstOpen = steps.findIndex((step) => step.status !== "done");

  return (
    <section {...rest} ref={ref} className={cx(styles.trail, className)} aria-labelledby={titleId}>
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
          const Icon = STATUS_ICON[step.status];
          const last = index === steps.length - 1;
          const value = meta(step);
          // The line out of a step is strong while the trail behind it is finished.
          const lineDone = firstOpen === -1 || index < firstOpen + 1;
          return (
            <li
              key={step.id}
              className={cx(styles.step, styles[step.status])}
              aria-current={step.status === "running" || step.status === "approval" ? "step" : undefined}
            >
              <div className={styles.rail} aria-hidden="true">
                <span className={styles.marker}>
                  <Icon size={16} strokeWidth={ICON_STROKE} className={styles.icon} />
                </span>
                {last ? null : <span className={cx(styles.line, lineDone && styles.lineDone)} />}
              </div>
              <div className={cx(styles.body, last && styles.bodyLast)}>
                <div className={styles.row}>
                  <span className={styles.label}>
                    {step.label}
                    <span className={styles.srOnly}>, {STATUS_TEXT[step.status]}</span>
                  </span>
                  {value ? <span className={styles.meta}>{value}</span> : null}
                </div>
                {step.sublabel ? <p className={styles.sublabel}>{step.sublabel}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
