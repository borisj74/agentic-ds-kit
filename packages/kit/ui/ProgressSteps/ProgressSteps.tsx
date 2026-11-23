import { Check, X } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import type { ProgressStepsProps, ProgressStepsStatus } from "./ProgressSteps.types";
import { cx } from "../shared/cx";
import { Progress } from "../Progress";
import { clampCurrent, isOptional, resolveStatus, statusWord, summarize } from "./progressSteps.logic";
import styles from "./ProgressSteps.module.css";
import { nisthaAttr } from "../shared/inspect";

export type {
  ProgressStepsItem,
  ProgressStepsOrientation,
  ProgressStepsProps,
  ProgressStepsSize,
  ProgressStepsStatus,
} from "./ProgressSteps.types";

const ICON_SIZE = { sm: 12, md: 14 } as const;

export function ProgressSteps({
  steps,
  current = 0,
  orientation = "horizontal",
  size = "md",
  ariaLabel = "Progress",
  onStepClick,
  className,
  ref,
  ...rest
}: ProgressStepsProps) {
  if (!steps.length) return null;

  const currentIndex = clampCurrent(current);
  const iconPx = ICON_SIZE[size];
  const statuses: ProgressStepsStatus[] = steps.map((step, index) => resolveStatus(step, index, currentIndex));
  const summary = orientation === "horizontal" ? summarize(steps, statuses, currentIndex) : null;

  return (
    <nav
      {...rest} {...nisthaAttr("progresssteps", rest)}
      ref={ref}
      className={cx(styles.root, styles[orientation], styles[size], className)}
      aria-label={ariaLabel}
    >
      <ol className={styles.list}>
        {steps.map((step, index) => {
          const status = statuses[index];
          const optional = isOptional(step, status);
          const word = statusWord(status, optional);
          const prevComplete = index > 0 && statuses[index - 1] === "complete";
          const thisComplete = status === "complete";
          const lineStartClass = cx(styles.line, styles.lineStart, prevComplete && styles.lineComplete);
          const lineEndClass = cx(styles.line, styles.lineEnd, thisComplete && styles.lineComplete);
          const marker = (
            <span className={styles.marker}>
              {status === "complete" ? (
                <Check size={iconPx} strokeWidth={ICON_STROKE} color="currentColor" aria-hidden />
              ) : status === "error" ? (
                <X size={iconPx} strokeWidth={ICON_STROKE} color="currentColor" aria-hidden />
              ) : (
                <span className={styles.number}>{index + 1}</span>
              )}
            </span>
          );
          const content = (
            <>
              <span className={styles.srOnly}>{`${word}, step ${index + 1} of ${steps.length}`}</span>
              {orientation === "horizontal" ? (
                <span className={styles.markerRow} aria-hidden="true">
                  <span className={lineStartClass} />
                  {marker}
                  <span className={lineEndClass} />
                </span>
              ) : (
                <span className={styles.rail} aria-hidden="true">
                  {marker}
                  {index < steps.length - 1 ? <span className={lineEndClass} /> : null}
                </span>
              )}
              <span className={styles.copy}>
                <span className={styles.label}>{step.label}</span>
                <span className={styles.status} aria-hidden="true">
                  {word}
                </span>
                {step.description ? <span className={styles.description}>{step.description}</span> : null}
              </span>
            </>
          );
          const clickable = Boolean(onStepClick) && status === "complete";

          return (
            <li
              key={step.id}
              className={cx(styles.step, styles[status], optional && styles.optional)}
              aria-current={status === "current" ? "step" : undefined}
            >
              {clickable ? (
                <button type="button" className={styles.stepButton} onClick={() => onStepClick?.(index, step)}>
                  {content}
                </button>
              ) : (
                <span className={styles.stepBody}>{content}</span>
              )}
            </li>
          );
        })}
      </ol>
      {summary ? (
        <div className={styles.compact}>
          <span className={styles.compactPosition}>{summary.position}</span>
          {summary.label ? <span className={styles.compactLabel}>{summary.label}</span> : null}
          <Progress value={summary.value} size="md" ariaLabel={summary.next} />
          <span className={styles.compactNext} aria-hidden="true">
            {summary.next}
          </span>
        </div>
      ) : null}
    </nav>
  );
}
