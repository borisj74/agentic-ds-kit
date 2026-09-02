import { Check, X } from "lucide-react";
import type { ProgressStepsItem, ProgressStepsProps, ProgressStepsStatus } from "./ProgressSteps.types";
import styles from "./ProgressSteps.module.css";

export type {
  ProgressStepsItem,
  ProgressStepsOrientation,
  ProgressStepsProps,
  ProgressStepsSize,
  ProgressStepsStatus,
} from "./ProgressSteps.types";

const ICON_SIZE = { sm: 12, md: 14 } as const;
const STATUSES: readonly ProgressStepsStatus[] = ["complete", "current", "upcoming", "error"];

function clampCurrent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

function isStatus(value: ProgressStepsStatus | undefined): value is ProgressStepsStatus {
  return Boolean(value && STATUSES.includes(value));
}

function resolveStatus(step: ProgressStepsItem, index: number, current: number): ProgressStepsStatus {
  if (isStatus(step.status)) return step.status;
  if (index < current) return "complete";
  if (index === current) return "current";
  return "upcoming";
}

function statusPhrase(status: ProgressStepsStatus): string {
  if (status === "complete") return "Completed";
  if (status === "current") return "Current";
  if (status === "error") return "Error";
  return "Upcoming";
}

export function ProgressSteps({
  steps,
  current = 0,
  orientation = "horizontal",
  size = "md",
  ariaLabel = "Progress",
  className = "",
}: ProgressStepsProps) {
  if (!steps.length) return null;

  const currentIndex = clampCurrent(current);
  const iconPx = ICON_SIZE[size];
  const statuses = steps.map((step, index) => resolveStatus(step, index, currentIndex));

  return (
    <nav aria-label={ariaLabel} className={`${styles.root} ${styles[orientation]} ${styles[size]} ${className}`.trim()}>
      <ol className={styles.list}>
        {steps.map((step, index) => {
          const status = statuses[index];
          const prevComplete = index > 0 && statuses[index - 1] === "complete";
          const thisComplete = status === "complete";
          const lineStartClass = `${styles.line} ${styles.lineStart} ${prevComplete ? styles.lineComplete : ""}`.trim();
          const lineEndClass = `${styles.line} ${styles.lineEnd} ${thisComplete ? styles.lineComplete : ""}`.trim();
          const marker = (
            <span className={styles.marker}>
              {status === "complete" ? (
                <Check size={iconPx} strokeWidth={2.5} color="currentColor" aria-hidden />
              ) : status === "error" ? (
                <X size={iconPx} strokeWidth={2.5} color="currentColor" aria-hidden />
              ) : (
                <span className={styles.number}>{index + 1}</span>
              )}
            </span>
          );

          return (
            <li
              key={step.id}
              className={`${styles.step} ${styles[status]}`}
              aria-current={status === "current" ? "step" : undefined}
            >
              <span className={styles.srOnly}>
                {`${statusPhrase(status)}, step ${index + 1} of ${steps.length}`}
              </span>
              {orientation === "horizontal" ? (
                <div className={styles.markerRow} aria-hidden="true">
                  <span className={lineStartClass} />
                  {marker}
                  <span className={lineEndClass} />
                </div>
              ) : (
                <span className={styles.rail} aria-hidden="true">
                  {marker}
                  {index < steps.length - 1 ? <span className={lineEndClass} /> : null}
                </span>
              )}
              <div className={styles.copy}>
                <span className={styles.label}>{step.label}</span>
                {step.description ? <span className={styles.description}>{step.description}</span> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
