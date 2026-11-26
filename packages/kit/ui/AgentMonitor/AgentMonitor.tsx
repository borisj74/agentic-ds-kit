"use client";

import { useId, useRef, useState } from "react";
import { Bot, Check, ChevronDown, ChevronUp, CircleCheck, CirclePause, CircleX, LoaderCircle, Pause, X } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { AlertDialog } from "../AlertDialog";
import { ApprovalCard } from "../ApprovalCard";
import { Button } from "../Button";
import { LucideByName, type KitIcon } from "../Button/lucideName";
import { Empty } from "../Empty";
import { Skeleton } from "../Skeleton";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import type { AgentMonitorProps, AgentMonitorStatus, AgentMonitorStep } from "./AgentMonitor.types";
import styles from "./AgentMonitor.module.css";
import { nisthaAttr } from "../shared/inspect";

export type {
  AgentMonitorProps,
  AgentMonitorStatus,
  AgentMonitorStep,
  AgentMonitorStepStatus,
  AgentMonitorPendingAction,
} from "./AgentMonitor.types";

const STATUS_LABEL: Record<AgentMonitorStatus, string> = {
  idle: "Not started",
  running: "Running",
  waiting: "Waiting for you",
  paused: "Paused",
  done: "Done",
  failed: "Failed",
};

/** Collapsed bar: a status mark at the end for runs that are not moving (the word is in the meta line). */
const BAR_STATUS_ICON: Partial<Record<AgentMonitorStatus, typeof CircleCheck>> = {
  waiting: CirclePause,
  paused: CirclePause,
  done: CircleCheck,
  failed: CircleX,
};

/** A Lucide icon for common tool names. */
function iconFor(step: AgentMonitorStep): KitIcon {
  if (step.icon) return step.icon;
  const tool = step.tool.toLowerCase();
  if (tool.includes("search") || tool.includes("grep") || tool.includes("find")) return "Search";
  if (tool.includes("read")) return "FileText";
  if (tool.includes("edit") || tool.includes("write") || tool.includes("patch")) return "Pencil";
  if (tool.includes("test")) return "FlaskConical";
  if (tool.includes("bash") || tool.includes("shell") || tool.includes("psql") || tool.includes("run")) return "SquareTerminal";
  if (tool.includes("git") || tool.includes("pr")) return "GitPullRequest";
  return "Wrench";
}

function stepsSummary(steps: AgentMonitorStep[], status: AgentMonitorStatus): string {
  const done = steps.filter((step) => step.status === "done").length;
  const failed = steps.filter((step) => step.status === "failed").length;
  const running = steps.filter((step) => step.status === "running").length;
  const tail =
    status === "paused" || status === "waiting" ? "paused" : failed ? `${failed} failed` : running ? `${running} running` : "";
  return [`${done} done`, tail].filter(Boolean).join(" · ");
}

/** The tools a run used, in first-use order: one entry per icon, pointing at its first step. */
function toolsUsed(steps: AgentMonitorStep[]): { icon: KitIcon; step: AgentMonitorStep }[] {
  const seen = new Map<KitIcon, AgentMonitorStep>();
  for (const step of steps) {
    const icon = iconFor(step);
    if (!seen.has(icon)) seen.set(icon, step);
  }
  return [...seen].map(([icon, step]) => ({ icon, step }));
}

/** final: the last step of a finished run shows a check. */
function StepIcon({ step, runStatus, final }: { step: AgentMonitorStep; runStatus: AgentMonitorStatus; final?: boolean }) {
  if (step.status === "running") return <LoaderCircle size={16} strokeWidth={ICON_STROKE} className={styles.spin} aria-hidden="true" />;
  if (step.status === "waiting" && runStatus === "paused") return <Pause size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />;
  if (step.status === "waiting") return <CirclePause size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />;
  if (final) return <Check size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />;
  return <LucideByName name={iconFor(step)} size={16} />;
}

/** One agent at work: a live clock and cost lead, finished steps sit in a time strip you can open. */
export function AgentMonitor({
  name,
  meta,
  status = "running",
  headline,
  headlineNote,
  elapsed,
  cost,
  steps = [],
  axis,
  selectedStepId,
  onSelectStep,
  pendingAction,
  onApprove,
  onDeny,
  error,
  collapsed = false,
  onCollapsedChange,
  onStart,
  onPause,
  onResume,
  onCancel,
  onStop,
  onRetry,
  onViewDiff,
  onOpenTrail,
  loading = false,
  className,
  ref,
  ...rest
}: AgentMonitorProps) {
  const nameId = useId();
  const detailId = useId();
  const rootRef = useRef<HTMLElement | null>(null);
  const [confirmStop, setConfirmStop] = useState(false);

  // Close puts focus back on the step that opened the detail.
  function closeDetail() {
    const id = selectedStepId;
    onSelectStep?.(null);
    window.requestAnimationFrame(() => {
      if (id) rootRef.current?.querySelector<HTMLElement>(`[data-step-id="${CSS.escape(id)}"]`)?.focus();
    });
  }
  const selected = selectedStepId ? steps.find((step) => step.id === selectedStepId) : undefined;

  const statusChip = (
    <span className={cx(styles.status, styles[`status-${status}`])}>
      <span className={styles.dot} aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );

  // Stop run asks once in a kit AlertDialog; Pause keeps the run resumable.
  const stopDialog = onStop ? (
    <AlertDialog
      open={confirmStop}
      size="sm"
      tone="danger"
      title="Stop this run?"
      description={`${name} stops at the current step. A stopped run can't resume; you start a new one.`}
      actionLabel="Stop run"
      actionVariant="danger"
      cancelLabel="Keep running"
      onCancel={() => setConfirmStop(false)}
      onAction={() => {
        setConfirmStop(false);
        onStop();
      }}
    />
  ) : null;
  const stopButton = onStop ? (
    <Button size="sm" appearance="outline" mode="danger" iconStart="Square" onClick={() => setConfirmStop(true)}>
      Stop run
    </Button>
  ) : null;

  if (loading) {
    return (
      <section {...rest} {...nisthaAttr("agentmonitor", rest)} ref={ref} className={cx(styles.monitor, className)} aria-busy="true" aria-label={`${name}, loading`}>
        <div className={styles.header}>
          <Skeleton shape="circle" size="md" />
          <div className={styles.heading}>
            <Skeleton width="60%" />
            <Skeleton width="40%" size="sm" />
          </div>
        </div>
        <Skeleton shape="rect" width="100%" height="calc(var(--space-16) + var(--space-12))" />
        <div className={styles.strip}>
          {[0, 1, 2, 3, 4].map((tile) => (
            <Skeleton key={tile} shape="rect" width="100%" height="var(--control-height-md)" />
          ))}
        </div>
      </section>
    );
  }

  if (collapsed) {
    // Collapsed is one row: agent mark, name over a mono "02:14 · $0.42" line, the tools the run used,
    // then the chevron. Picking a tool opens the card on the first step that used it.
    const openOn = onCollapsedChange
      ? (stepId: string) => {
          onCollapsedChange(false);
          onSelectStep?.(stepId);
        }
      : undefined;
    const tools = status === "done" ? [] : toolsUsed(steps);
    const EndIcon = BAR_STATUS_ICON[status];
    const running = status === "running";
    return (
      <section {...rest} {...nisthaAttr("agentmonitor", rest)} ref={ref} className={cx(styles.collapsed, className)} aria-labelledby={nameId}>
        <span className={cx(styles.agentIcon, styles.agentIconBar)} aria-hidden="true">
          <Bot size={16} strokeWidth={ICON_STROKE} />
        </span>
        <div className={styles.barHeading}>
          <h3 id={nameId} className={styles.barName} title={name}>
            {name}
          </h3>
          {headline ? (
            <p className={styles.barHeadline} title={headline}>
              {headline}
            </p>
          ) : null}
          <p className={styles.barMeta}>
            {running ? <span className={styles.srOnly}>{STATUS_LABEL.running}</span> : <span>{STATUS_LABEL[status].toLowerCase()}</span>}
            {elapsed ? (
              <span role="timer" aria-live="off">
                {elapsed}
              </span>
            ) : null}
            {cost ? <span>{cost}</span> : null}
          </p>
        </div>
        {tools.length > 0 ? (
          <ul className={styles.tools} aria-label="Tools used">
            {tools.map(({ icon, step }) => (
              <li key={step.id} className={styles.toolCell}>
                {openOn ? (
                  <button type="button" className={styles.tool} aria-label={`${step.tool}. Opens ${name}`} onClick={() => openOn(step.id)}>
                    <LucideByName name={icon} size={14} />
                  </button>
                ) : (
                  <span className={styles.tool} role="img" aria-label={step.tool}>
                    <LucideByName name={icon} size={14} />
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : null}
        {EndIcon ? <EndIcon size={16} strokeWidth={ICON_STROKE} className={cx(styles.barStatusIcon, styles[`barStatus-${status}`])} aria-hidden="true" /> : null}
        {onCollapsedChange ? (
          <button
            type="button"
            className={styles.toggle}
            aria-expanded="false"
            aria-label={`Show ${name}`}
            onClick={() => onCollapsedChange(false)}
          >
            <ChevronUp size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
          </button>
        ) : null}
        {running && (onPause || onStop) ? (
          <div className={styles.barActions}>
            {stopButton ?? <span />}
            {onPause ? (
              <Button size="sm" appearance="outline" mode="neutral" iconStart="Pause" onClick={onPause}>
                Pause
              </Button>
            ) : null}
          </div>
        ) : null}
        {status === "paused" && (onCancel || onResume) ? (
          <div className={styles.barActions}>
            {onCancel ? (
              <Button size="sm" appearance="outline" mode="danger" iconStart="Square" onClick={onCancel}>
                Cancel run
              </Button>
            ) : (
              <span />
            )}
            {onResume ? (
              <Button size="sm" appearance="outline" mode="primary" iconStart="Play" onClick={onResume}>
                Resume
              </Button>
            ) : null}
          </div>
        ) : null}
        {stopDialog}
      </section>
    );
  }

  const showNow = status !== "idle" && !selected && !(status === "waiting" && pendingAction);

  return (
    <section {...rest} {...nisthaAttr("agentmonitor", rest)} ref={mergeRefs(rootRef, ref)} className={cx(styles.monitor, className)} aria-labelledby={nameId}>
      <header className={styles.header}>
        <span className={styles.agentIcon} aria-hidden="true">
          <Bot size={16} strokeWidth={ICON_STROKE} />
        </span>
        <div className={styles.heading}>
          <h3 id={nameId} className={styles.name} title={name}>
            {name}
          </h3>
          {meta ? <p className={styles.meta}>{meta}</p> : null}
        </div>
        {statusChip}
        {onCollapsedChange ? (
          <button
            type="button"
            className={cx(styles.toggle, styles.toggleOpen)}
            aria-expanded="true"
            aria-label={`Collapse ${name}`}
            onClick={() => onCollapsedChange(true)}
          >
            <ChevronDown size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
          </button>
        ) : null}
      </header>

      {status === "idle" ? (
        <Empty
          icon="Play"
          title="Not started yet"
          description="The clock, cost and steps appear here once the agent starts."
          actions={
            onStart ? (
              <Button size="sm" appearance="outline" mode="primary" iconStart="Play" onClick={onStart}>
                Start run
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {showNow ? (
        <div className={cx(styles.now, status === "failed" && styles.nowFailed)}>
          {headline ? (
            <p className={styles.headline}>
              {status === "running" ? <LoaderCircle size={16} strokeWidth={ICON_STROKE} className={cx(styles.spin, styles.runningIcon)} aria-hidden="true" /> : null}
              {status === "paused" ? <Pause size={16} strokeWidth={ICON_STROKE} className={styles.pausedIcon} aria-hidden="true" /> : null}
              {status === "done" ? <CircleCheck size={16} strokeWidth={ICON_STROKE} className={styles.doneIcon} aria-hidden="true" /> : null}
              {status === "failed" ? <CircleX size={16} strokeWidth={ICON_STROKE} className={styles.failedIcon} aria-hidden="true" /> : null}
              <span className={styles.headlineText}>{headline}</span>
              {headlineNote ? <span className={styles.headlineNote}>{headlineNote}</span> : null}
            </p>
          ) : null}
          {status === "failed" && error ? <p className={styles.error}>{error}</p> : null}
          {status === "failed" ? (
            <p className={styles.failedClock}>
              <span className={cx(styles.clock, styles.clockSmall)} role="timer" aria-live="off">
                {elapsed}
              </span>
              {cost ? <span className={styles.spent}>· {cost} spent</span> : null}
            </p>
          ) : (
            <div className={styles.clockRow}>
              <div>
                <p className={cx(styles.clock, status === "paused" && styles.clockStopped)} role="timer" aria-live="off">
                  {elapsed}
                </p>
                <p className={styles.clockLabel}>{status === "paused" ? "elapsed · clock stopped" : "elapsed"}</p>
              </div>
              {cost ? (
                <div className={styles.costBlock}>
                  <p className={styles.cost}>{cost}</p>
                  <p className={styles.clockLabel}>cost so far</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      {status === "waiting" && pendingAction && !selected ? (
        <ApprovalCard
          variant="compact"
          className={styles.approval}
          title={pendingAction.title}
          description={pendingAction.description}
          risk={pendingAction.risk}
          action={pendingAction.action}
          waitingSec={pendingAction.waitingSec}
          onApprove={onApprove}
          onDeny={onDeny}
        />
      ) : null}

      {steps.length > 0 ? (
        <div className={styles.steps}>
          <div className={styles.stepsHead}>
            <span>Steps</span>
            <span className={styles.stepsSummary}>{stepsSummary(steps, status)}</span>
          </div>
          <ol className={styles.strip}>
            {steps.map((step, index) => {
              const isSelected = step.id === selectedStepId;
              const final = status === "done" && step.status === "done" && index === steps.length - 1;
              const label = `Step ${index + 1}: ${step.tool}, ${step.status}${step.duration ? `, ${step.duration}` : ""}`;
              return (
                <li key={step.id} className={styles.cell}>
                  {onSelectStep ? (
                    <button
                      type="button"
                      className={cx(styles.step, styles[`step-${step.status}`], final && styles.stepFinal, isSelected && styles.selected)}
                      aria-pressed={isSelected}
                      data-step-id={step.id}
                      aria-controls={isSelected ? detailId : undefined}
                      aria-label={label}
                      onClick={() => onSelectStep(isSelected ? null : step.id)}
                    >
                      <StepIcon step={step} runStatus={status} final={final} />
                    </button>
                  ) : (
                    <span className={cx(styles.step, styles[`step-${step.status}`], final && styles.stepFinal)} role="img" aria-label={label}>
                      <StepIcon step={step} runStatus={status} final={final} />
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
          {/* Tiles are equal widths, not durations, so only the ends are true: the start and now. */}
          {axis && axis.length > 0 ? (
            <div className={styles.axis} aria-hidden="true">
              <span>{axis[0]}</span>
              {axis.length > 1 ? <span className={styles.axisEnd}>{axis[axis.length - 1]}</span> : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {selected ? (
        <div id={detailId} className={styles.detail} role="region" aria-label={`Step detail: ${selected.tool}`}>
          <div className={styles.detailHead}>
            <LucideByName name={iconFor(selected)} size={16} />
            <span className={styles.detailTool}>{selected.tool}</span>
            {onSelectStep ? (
              <button type="button" className={styles.detailClose} aria-label="Close step detail" onClick={closeDetail}>
                <X size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
              </button>
            ) : null}
          </div>
          {selected.target ? <p className={styles.detailTarget}>{selected.target}</p> : null}
          <dl className={styles.detailRows}>
            {[
              ["Duration", selected.duration],
              ["Tokens", selected.tokens],
              ["Cost", selected.cost],
              ["Started", selected.started],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className={styles.detailRow}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>
        </div>
      ) : null}

      {status === "paused" && (onCancel || onResume) ? (
        <footer className={styles.footer}>
          {onCancel ? (
            <Button size="sm" appearance="outline" mode="danger" iconStart="Square" onClick={onCancel}>
              Cancel run
            </Button>
          ) : (
            <span />
          )}
          {onResume ? (
            <Button size="sm" appearance="outline" mode="primary" iconStart="Play" onClick={onResume}>
              Resume
            </Button>
          ) : null}
        </footer>
      ) : null}
      {status === "running" && (onPause || onStop) ? (
        <footer className={styles.footer}>
          {stopButton ?? <span />}
          {onPause ? (
            <Button size="sm" appearance="outline" mode="neutral" iconStart="Pause" onClick={onPause}>
              Pause
            </Button>
          ) : null}
        </footer>
      ) : null}
      {status === "done" && (onViewDiff || onOpenTrail) ? (
        <footer className={cx(styles.footer, styles.footerStart)}>
          {onViewDiff ? (
            <Button size="sm" appearance="outline" mode="neutral" iconStart="FileText" onClick={onViewDiff}>
              View diff
            </Button>
          ) : null}
          {onOpenTrail ? (
            <Button size="sm" appearance="ghost" mode="neutral" iconStart="ArrowRight" onClick={onOpenTrail}>
              Open trail
            </Button>
          ) : null}
        </footer>
      ) : null}
      {status === "failed" && (onOpenTrail || onRetry) ? (
        <footer className={styles.footer}>
          {onOpenTrail ? (
            <Button size="sm" appearance="ghost" mode="neutral" iconStart="ArrowRight" onClick={onOpenTrail}>
              Open failed step
            </Button>
          ) : (
            <span />
          )}
          {onRetry ? (
            <Button size="sm" appearance="outline" mode="neutral" iconStart="RotateCcw" onClick={onRetry}>
              Retry step
            </Button>
          ) : null}
        </footer>
      ) : null}
      {stopDialog}
    </section>
  );
}
