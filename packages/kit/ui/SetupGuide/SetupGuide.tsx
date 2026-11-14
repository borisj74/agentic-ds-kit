"use client";

import { useId, useLayoutEffect, useRef } from "react";
import { CircleCheck, Rocket } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Empty } from "../Empty";
import { Progress } from "../Progress";
import { Skeleton } from "../Skeleton";
import { LoadError } from "../shared/LoadError";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import type { SetupGuideProps, SetupTask } from "./SetupGuide.types";
import styles from "./SetupGuide.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { SetupGuideProps, SetupTask, SetupTaskStatus } from "./SetupGuide.types";

/**
 * A first-run checklist: overall progress, one row per task with its status in words, and one action per
 * task. Built on kit Progress, Badge, Button and Empty. Not a wizard stepper (ProgressSteps).
 */
export function SetupGuide({
  title,
  description,
  tasks,
  onTaskAction,
  onUndoSkip,
  onComplete,
  completeLabel = "Go to dashboard",
  onDismiss,
  skippedNote = "Skipped tasks don’t count toward progress; undo any time.",
  emptyTitle = "Nothing to set up",
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  loading = false,
  error,
  onRetry,
  className,
  ref,
  ...rest
}: SetupGuideProps) {
  const titleId = useId();
  const total = tasks.length;
  const done = tasks.filter((task) => task.status === "done").length;
  const skipped = tasks.some((task) => task.status === "skipped");
  const complete = total > 0 && tasks.every((task) => task.status === "done" || task.status === "skipped");
  const percent = total ? Math.round((done / total) * 100) : 0;
  const showProgress = !loading && !error && total > 0;
  const rootRef = useRef<HTMLElement | null>(null);
  const pendingFocus = useRef(false);
  const act = (id: string) => {
    pendingFocus.current = true;
    onTaskAction?.(id);
  };
  const undo = (id: string) => {
    pendingFocus.current = true;
    onUndoSkip?.(id);
  };
  // A finished row loses its button; keep keyboard focus in the guide (next task's action, else the guide).
  useLayoutEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    const root = rootRef.current;
    if (!root || root.contains(document.activeElement)) return;
    const next = root.querySelector<HTMLElement>('[aria-current="step"] button') ?? root.querySelector<HTMLElement>("button");
    (next ?? root).focus();
  }, [tasks]);

  return (
    <section
      {...rest} {...nisthaAttr("setupguide", rest)}
      ref={mergeRefs(rootRef, ref)}
      tabIndex={-1}
      className={cx(styles.card, className)} aria-labelledby={titleId} aria-busy={loading || undefined}>
      {loading ? (
        <div className={styles.loading}>
          <Skeleton width="50%" />
          <Skeleton width="100%" size="sm" />
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className={styles.loadingRow}>
              <Skeleton shape="circle" width="var(--space-5)" height="var(--space-5)" />
              <div className={styles.loadingText}>
                <Skeleton width="60%" size="sm" />
                <Skeleton width="35%" size="sm" />
              </div>
            </div>
          ))}
          <span id={titleId} className={styles.srOnly}>
            {title}
          </span>
        </div>
      ) : (
        <>
          <header className={styles.header}>
            <Rocket size={16} strokeWidth={ICON_STROKE} aria-hidden="true" className={styles.headerIcon} />
            <h3 id={titleId} className={styles.title}>
              {title}
            </h3>
            {complete ? (
              <Badge tone="success" size="sm">
                Complete
              </Badge>
            ) : onDismiss && !error ? (
              <Button size="sm" appearance="ghost" mode="neutral" onClick={onDismiss}>
                Dismiss
              </Button>
            ) : null}
          </header>
          {description ? <p className={styles.description}>{description}</p> : null}

          {showProgress ? (
            <Progress
              className={styles.progress}
              size="sm"
              value={percent}
              label={`${done} of ${total} done`}
              showValue
              valuePosition="end"
            />
          ) : null}

          {error ? (
            <LoadError message={error} onRetry={onRetry} />
          ) : total === 0 ? (
            <Empty
              title={emptyTitle}
              description={emptyDescription}
              icon="Rocket"
              actions={
                emptyActionLabel && onEmptyAction ? (
                  <Button size="md" appearance="outline" mode="neutral" onClick={onEmptyAction}>
                    {emptyActionLabel}
                  </Button>
                ) : undefined
              }
            />
          ) : complete ? (
            <div className={styles.complete} role="status">
              <CircleCheck size={24} strokeWidth={ICON_STROKE} aria-hidden="true" className={styles.completeIcon} />
              <p className={styles.completeTitle}>You’re all set</p>
              <p className={styles.completeBody}>Every setup task is done. This guide will hide itself tomorrow.</p>
              {onComplete ? (
                <Button size="md" iconStart="ArrowRight" onClick={onComplete}>
                  {completeLabel}
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              <ol className={styles.list} aria-label={`${title}: tasks`}>
                {tasks.map((task) => (
                  <TaskRow key={task.id} task={task} onTaskAction={onTaskAction ? act : undefined} onUndoSkip={onUndoSkip ? undo : undefined} />
                ))}
              </ol>
              {skipped && skippedNote ? <p className={styles.note}>{skippedNote}</p> : null}
            </>
          )}
        </>
      )}
    </section>
  );
}

function TaskRow({
  task,
  onTaskAction,
  onUndoSkip,
}: {
  task: SetupTask;
  onTaskAction?: (id: string) => void;
  onUndoSkip?: (id: string) => void;
}) {
  const { status } = task;
  const labelId = useId();
  const actionLabel = task.actionLabel ?? (status === "current" ? "Continue" : "Start");
  return (
    <li className={cx(styles.row, status === "current" && styles.rowCurrent)} aria-current={status === "current" ? "step" : undefined}>
      <span className={styles.marker} aria-hidden="true">
        {status === "done" ? (
          <CircleCheck key="done" size={20} strokeWidth={ICON_STROKE} className={styles.doneIcon} />
        ) : (
          <span className={cx(styles.ring, status === "current" && styles.ringCurrent, status === "skipped" && styles.ringSkipped)} />
        )}
      </span>
      <span className={styles.text}>
        <span id={labelId} className={cx(styles.label, (status === "done" || status === "skipped") && styles.labelMuted, status === "skipped" && styles.labelSkipped)}>
          {task.label}
        </span>
        {task.description ? <span className={styles.rowDescription}>{task.description}</span> : null}
      </span>
      <span className={styles.trail}>
        {status === "done" ? (
          <span className={styles.doneWord}>Done</span>
        ) : status === "skipped" ? (
          <span className={styles.skippedWord}>
            Skipped
            {onUndoSkip ? (
              <>
                {" · "}
                <button type="button" className={styles.undo} onClick={() => onUndoSkip(task.id)} aria-label={`Undo skip: ${task.label}`}>
                  Undo
                </button>
              </>
            ) : null}
          </span>
        ) : onTaskAction ? (
          <Button
            size="sm"
            appearance={status === "current" ? "outline" : "ghost"}
            mode="neutral"
            aria-describedby={labelId}
            onClick={() => onTaskAction(task.id)}
          >
            {actionLabel}
          </Button>
        ) : null}
      </span>
    </li>
  );
}
