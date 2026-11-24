"use client";

import { useId, useLayoutEffect, useRef } from "react";
import { CircleCheck, Lock } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Empty } from "../Empty";
import { IntegrationTile } from "../IntegrationPicker/IntegrationTile";
import { tileState } from "../IntegrationPicker/integrationPicker.logic";
import { Progress } from "../Progress";
import { Skeleton } from "../Skeleton";
import { LoadError } from "../LoadError";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import type { SetupGuideProps, SetupTask } from "./SetupGuide.types";
import { blockedReason, effectiveStatus, progressLabel, statusWord } from "./setupGuide.logic";
import styles from "./SetupGuide.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { SetupGuideProps, SetupTask, SetupTaskStatus } from "./SetupGuide.types";

/**
 * A first-run checklist: overall progress, one row per task with an icon and a status word (Done, Current,
 * To do, Blocked, Skipped), and at most one action per task. The current task's action, or its suggested
 * provider's Connect, is the one solid primary. Built on kit Progress, Badge, Button and Empty, with the
 * IntegrationPicker tile. Not a wizard stepper (ProgressSteps).
 */
export function SetupGuide({
  title,
  description,
  tasks,
  onTaskAction,
  onIntegrationConnect,
  connectingId,
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
  const skippedCount = tasks.filter((task) => task.status === "skipped").length;
  const skipped = skippedCount > 0;
  const complete = total > 0 && tasks.every((task) => task.status === "done" || task.status === "skipped");
  // Skipped tasks don't count toward progress: the denominator is the tasks still in play.
  const counted = total - skippedCount;
  const percent = counted ? Math.round((done / counted) * 100) : total ? 100 : 0;
  const showProgress = !loading && !error && total > 0;
  const rootRef = useRef<HTMLElement | null>(null);
  const pendingFocus = useRef(false);
  const act = (id: string) => {
    pendingFocus.current = true;
    onTaskAction?.(id);
  };
  const connect = (integrationId: string, taskId: string) => {
    pendingFocus.current = true;
    onIntegrationConnect?.(integrationId, taskId);
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
              label={progressLabel(done, counted, skippedCount)}
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
                  <TaskRow
                    key={task.id}
                    task={task}
                    tasks={tasks}
                    connectingId={connectingId}
                    onTaskAction={onTaskAction ? act : undefined}
                    onIntegrationConnect={onIntegrationConnect ? connect : undefined}
                    onUndoSkip={onUndoSkip ? undo : undefined}
                  />
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
  tasks,
  connectingId,
  onTaskAction,
  onIntegrationConnect,
  onUndoSkip,
}: {
  task: SetupTask;
  tasks: SetupTask[];
  connectingId?: string;
  onTaskAction?: (id: string) => void;
  onIntegrationConnect?: (integrationId: string, taskId: string) => void;
  onUndoSkip?: (id: string) => void;
}) {
  const status = effectiveStatus(task, tasks);
  const labelId = useId();
  const tiles = status === "current" && task.integrations?.length ? task.integrations : undefined;
  // The first provider you can connect is the suggested one: its Connect is the card's one solid primary.
  const suggested = tiles?.find((item) => tileState(item, connectingId) === "available")?.id;
  const actionLabel = task.actionLabel ?? (status === "current" ? "Continue" : "Start");
  const description = status === "blocked" ? blockedReason(task, tasks) : task.description;
  const action =
    status === "skipped" && onUndoSkip ? (
      <Button size="sm" appearance="ghost" mode="neutral" aria-describedby={labelId} onClick={() => onUndoSkip(task.id)}>
        Undo skip
      </Button>
    ) : (status === "current" || status === "todo") && !tiles && onTaskAction ? (
      <Button
        size="sm"
        appearance={status === "current" ? "solid" : "outline"}
        mode={status === "current" ? "primary" : "neutral"}
        aria-describedby={labelId}
        onClick={() => onTaskAction(task.id)}
      >
        {actionLabel}
      </Button>
    ) : null;
  return (
    <li
      className={cx(styles.row, action && styles.rowHasAction)}
      aria-current={status === "current" ? "step" : undefined}
    >
      <span className={styles.marker} aria-hidden="true">
        {status === "done" ? (
          <CircleCheck key="done" size={20} strokeWidth={ICON_STROKE} className={styles.doneIcon} />
        ) : status === "blocked" ? (
          <Lock size={20} strokeWidth={ICON_STROKE} className={styles.blockedIcon} />
        ) : (
          <span className={cx(styles.ring, status === "current" && styles.ringCurrent, status === "skipped" && styles.ringSkipped)} />
        )}
      </span>
      <span className={styles.text}>
        <span id={labelId} className={cx(styles.label, (status === "skipped" || status === "blocked") && styles.labelMuted)}>
          {task.label}
        </span>
        {description ? <span className={styles.rowDescription}>{description}</span> : null}
      </span>
      <span className={cx(styles.word, status === "done" && styles.wordDone, status === "current" && styles.wordCurrent)}>{statusWord(status)}</span>
      {action ? <span className={styles.action}>{action}</span> : null}
      {tiles ? (
        <ul className={styles.tiles} aria-label={`${task.label}: providers`}>
          {tiles.map((item) => (
            <IntegrationTile
              key={item.id}
              item={item}
              state={tileState(item, connectingId)}
              size="compact"
              primary={item.id === suggested}
              onConnect={onIntegrationConnect ? (id) => onIntegrationConnect(id, task.id) : undefined}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
