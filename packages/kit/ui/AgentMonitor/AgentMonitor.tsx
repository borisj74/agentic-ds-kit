"use client";

import { useId, useRef } from "react";
import { Bot, ChevronDown, CircleCheck, CirclePause, CircleX, LoaderCircle, X } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { ApprovalCard } from "../ApprovalCard";
import { Button } from "../Button";
import { LucideByName, type KitIcon } from "../Button/lucideName";
import { Empty } from "../Empty";
import { Skeleton } from "../Skeleton";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import type { AgentMonitorProps, AgentMonitorStatus, AgentMonitorStep } from "./AgentMonitor.types";
import styles from "./AgentMonitor.module.css";

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

function StepIcon({ step }: { step: AgentMonitorStep }) {
  if (step.status === "running") return <LoaderCircle size={16} strokeWidth={ICON_STROKE} className={styles.spin} aria-hidden="true" />;
  if (step.status === "waiting") return <CirclePause size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />;
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

  // Close puts focus back on the step that opened the detail.
  function closeDetail() {
    const id = selectedStepId;
    onSelectStep?.(null);
    window.requestAnimationFrame(() => {
      if (id) rootRef.current?.querySelector<HTMLElement>(`[data-step-id="${CSS.escape(id)}"]`)?.focus();
    });
  }
  const selected = selectedStepId ? steps.find((step) => step.id === selectedStepId) : undefined;
  const tools = Array.from(new Set(steps.map((step) => String(iconFor(step)))));

  const statusChip = (
    <span className={cx(styles.status, styles[`status-${status}`])}>
      <span className={styles.dot} aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );

  if (loading) {
    return (
      <section {...rest} ref={ref} className={cx(styles.monitor, className)} aria-busy="true" aria-label={`${name}, loading`}>
        <div className={styles.header}>
          <Skeleton shape="circle" size="md" />
          <div className={styles.heading}>
            <Skeleton width="60%" />
            <Skeleton width="40%" size="sm" />
          </div>
        </div>
        <Skeleton shape="rect" width="100%" height="calc(var(--space-16) + var(--space-8))" />
        <Skeleton shape="rect" width="100%" height="var(--space-8)" />
      </section>
    );
  }

  if (collapsed) {
    return (
      <section {...rest} ref={ref} className={cx(styles.collapsed, className)} aria-labelledby={nameId}>
        <span className={styles.lead} aria-hidden="true">
          <Bot size={16} strokeWidth={ICON_STROKE} />
        </span>
        <div className={styles.heading}>
          <h3 id={nameId} className={cx(styles.name, styles.nameSmall)}>
            {name}
          </h3>
          <p className={styles.meta}>
            {status === "done" ? "done · " : ""}
            {[elapsed, cost].filter(Boolean).join(" · ")}
          </p>
        </div>
        {status === "done" ? (
          <CircleCheck size={16} strokeWidth={ICON_STROKE} className={styles.doneIcon} aria-label="Done" />
        ) : (
          <ul className={styles.tools} aria-label="Tools used">
            {tools.map((tool) => (
              <li key={tool} className={styles.tool}>
                <LucideByName name={tool} size={14} />
              </li>
            ))}
          </ul>
        )}
        {onCollapsedChange ? (
          <button
            type="button"
            className={styles.toggle}
            aria-expanded="false"
            aria-label={`Show ${name}`}
            onClick={() => onCollapsedChange(false)}
          >
            <ChevronDown size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
          </button>
        ) : null}
      </section>
    );
  }

  const showNow = status !== "idle" && !selected && !(status === "waiting" && pendingAction);

  return (
    <section {...rest} ref={mergeRefs(rootRef, ref)} className={cx(styles.monitor, className)} aria-labelledby={nameId}>
      <header className={styles.header}>
        <span className={styles.lead} aria-hidden="true">
          <Bot size={16} strokeWidth={ICON_STROKE} />
        </span>
        <div className={styles.heading}>
          <h3 id={nameId} className={styles.name}>
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
              <Button size="sm" iconStart="Play" onClick={onStart}>
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
              {status === "running" ? <LoaderCircle size={14} strokeWidth={ICON_STROKE} className={styles.spin} aria-hidden="true" /> : null}
              {status === "paused" ? <CirclePause size={14} strokeWidth={ICON_STROKE} aria-hidden="true" /> : null}
              {status === "done" ? <CircleCheck size={14} strokeWidth={ICON_STROKE} className={styles.doneIcon} aria-hidden="true" /> : null}
              {status === "failed" ? <CircleX size={14} strokeWidth={ICON_STROKE} aria-hidden="true" /> : null}
              <span className={styles.headlineText}>{headline}</span>
              {headlineNote ? <span className={styles.headlineNote}>{headlineNote}</span> : null}
            </p>
          ) : null}
          {status === "failed" && error ? <p className={styles.error}>{error}</p> : null}
          <div className={styles.clockRow}>
            <div>
              <p className={cx(styles.clock, status === "failed" && styles.clockSmall)} role="timer" aria-live="off">
                {elapsed}
              </p>
              {status !== "failed" ? (
                <p className={styles.clockLabel}>{status === "paused" ? "elapsed · clock stopped" : "elapsed"}</p>
              ) : null}
            </div>
            {cost ? (
              <div className={styles.costBlock}>
                <p className={styles.cost}>{cost}</p>
                <p className={styles.clockLabel}>{status === "failed" ? "spent" : "cost so far"}</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {status === "waiting" && pendingAction && !selected ? (
        <ApprovalCard
          className={styles.approval}
          title={pendingAction.title}
          description={pendingAction.description}
          risk={pendingAction.risk}
          action={pendingAction.action}
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
              const label = `Step ${index + 1}: ${step.tool}, ${step.status}${step.duration ? `, ${step.duration}` : ""}`;
              return (
                <li key={step.id} className={styles.cell}>
                  {onSelectStep ? (
                    <button
                      type="button"
                      className={cx(styles.step, styles[`step-${step.status}`], isSelected && styles.selected)}
                      aria-pressed={isSelected}
                      data-step-id={step.id}
                      aria-controls={isSelected ? detailId : undefined}
                      aria-label={label}
                      onClick={() => onSelectStep(isSelected ? null : step.id)}
                    >
                      <StepIcon step={step} />
                    </button>
                  ) : (
                    <span className={cx(styles.step, styles[`step-${step.status}`])} role="img" aria-label={label}>
                      <StepIcon step={step} />
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
          {axis && axis.length > 0 ? (
            <div className={styles.axis} aria-hidden="true">
              {axis.map((tick, index) => (
                <span key={`${tick}-${index}`} className={index === axis.length - 1 ? styles.axisEnd : undefined}>
                  {tick}
                </span>
              ))}
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
            <Button size="sm" appearance="outline" mode="danger" iconStart="CircleX" onClick={onCancel}>
              Cancel run
            </Button>
          ) : (
            <span />
          )}
          {onResume ? (
            <Button size="sm" iconStart="Play" onClick={onResume}>
              Resume
            </Button>
          ) : null}
        </footer>
      ) : null}
      {status === "running" && onPause ? (
        <footer className={styles.footer}>
          <span />
          <Button size="sm" appearance="outline" mode="neutral" iconStart="Pause" onClick={onPause}>
            Pause
          </Button>
        </footer>
      ) : null}
      {status === "done" && (onViewDiff || onOpenTrail) ? (
        <footer className={cx(styles.footer, styles.footerStart)}>
          {onViewDiff ? (
            <Button size="sm" appearance="outline" mode="neutral" iconStart="FileDiff" onClick={onViewDiff}>
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
    </section>
  );
}
