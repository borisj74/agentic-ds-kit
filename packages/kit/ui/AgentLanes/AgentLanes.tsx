"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowRight, Sparkles, TriangleAlert, X } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { LucideByName } from "../Button/lucideName";
import { SegmentedControl } from "../SegmentedControl";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import type { AgentLanesProps, AgentLanesTask } from "./AgentLanes.types";
import styles from "./AgentLanes.module.css";
import { nisthaAttr } from "../shared/inspect";

export type {
  AgentLanesProps,
  AgentLanesAgent,
  AgentLanesTask,
  AgentLanesTaskStatus,
} from "./AgentLanes.types";

const MINUTE = 60_000;
const STATUS_TEXT = { done: "Done", running: "Running", waiting: "Needs you", failed: "Failed" } as const;

function spanLabel(span: number) {
  return `Last ${Math.round(span / MINUTE)}m`;
}

function duration(ms: number) {
  const sec = Math.max(0, Math.round(ms / 1000));
  return sec >= 60 ? `${Math.floor(sec / 60)}m ${String(sec % 60).padStart(2, "0")}s` : `${sec}s`;
}

function useClock(controlled: number | undefined, fallback: number) {
  const [tick, setTick] = useState<number | null>(null);
  useEffect(() => {
    if (controlled !== undefined) return;
    const update = () => setTick(Date.now());
    const first = window.setTimeout(update, 0);
    const id = window.setInterval(update, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [controlled]);
  return controlled ?? tick ?? fallback;
}

/** Where every agent is right now: one lane per agent, blocks growing into now, handoffs, and decisions on the block. */
export function AgentLanes({
  agents,
  tasks,
  span = 10 * MINUTE,
  now: nowProp,
  title = "Agents",
  openTaskId = null,
  onOpenTaskChange,
  onApprove,
  onReject,
  onOpen,
  spans = [3 * MINUTE, 10 * MINUTE],
  onSpanChange,
  className,
  style,
  ref,
  ...rest
}: AgentLanesProps) {
  const titleId = useId();
  const latest = tasks.reduce((max, task) => Math.max(max, task.end ?? task.start), 0);
  const now = useClock(nowProp, latest);
  const from = now - span;
  const pct = (time: number) => Math.min(100, Math.max(0, ((time - from) / span) * 100));
  const laneIndex = new Map(agents.map((agent, index) => [agent.id, index]));
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const running = new Set(tasks.filter((task) => task.status === "running").map((task) => task.agentId)).size;
  const waiting = tasks.filter((task) => task.status === "waiting").length;
  // Whole-minute ticks: every 2m on wide windows, every minute on narrow ones.
  const spanMin = span / MINUTE;
  const stepMin = spanMin >= 8 ? 2 : 1;
  const ticks: { at: number; label: string }[] = [];
  for (let back = Math.floor((spanMin - 0.01) / stepMin) * stepMin; back >= stepMin; back -= stepMin) {
    ticks.push({ at: (1 - back / spanMin) * 100, label: `−${back}m` });
  }
  const open = openTaskId ? byId.get(openTaskId) : undefined;

  function visible(task: AgentLanesTask) {
    return (task.end ?? now) >= from;
  }

  const rootRef = useRef<HTMLElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);
  // The popover opens under its lane; when it would run off the board's
  // bottom and there is more room above, it opens above the lane instead.
  const [popAbove, setPopAbove] = useState(false);
  const openLane = open ? (laneIndex.get(open.agentId) ?? 0) : -1;
  useLayoutEffect(() => {
    const pop = popRef.current;
    const board = pop?.parentElement;
    const lane = board?.querySelectorAll<HTMLElement>(":scope > ol > li")[openLane];
    if (!pop || !board || !lane) {
      setPopAbove(false);
      return;
    }
    // Focusing a button in the popover can scroll the clipped board; undo it
    // before measuring.
    board.scrollTop = 0;
    const b = board.getBoundingClientRect();
    const l = lane.getBoundingClientRect();
    const below = b.bottom - l.bottom;
    const above = l.top - b.top;
    // Keep the board's own bottom padding clear so the popover never sits flush on its edge.
    const pad = parseFloat(getComputedStyle(board).paddingBottom) || 0;
    setPopAbove(pop.offsetHeight + pad > below && above > below);
  }, [openTaskId, openLane, agents.length]);

  // Closing the popover puts focus back on its block.
  function close() {
    const id = openTaskId;
    onOpenTaskChange?.(null);
    window.requestAnimationFrame(() => {
      if (id) rootRef.current?.querySelector<HTMLElement>(`[data-task-id="${CSS.escape(id)}"]`)?.focus();
    });
  }

  function handleKey(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape" && openTaskId && onOpenTaskChange) {
      event.preventDefault();
      close();
    }
  }

  return (
    <section
      {...rest} {...nisthaAttr("agentlanes", rest)}
      ref={mergeRefs(rootRef, ref)}
      className={cx(styles.lanes, className)}
      style={{ ...style, ["--lane-count" as string]: agents.length } as CSSProperties}
      aria-labelledby={titleId}
      onKeyDown={handleKey}
    >
      <header className={styles.header}>
        <Sparkles size={16} strokeWidth={ICON_STROKE} className={styles.titleIcon} aria-hidden="true" />
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        {running ? (
          <span className={cx(styles.count, styles.countRunning)}>
            <span className={styles.dot} aria-hidden="true" />
            {running} running
          </span>
        ) : null}
        {waiting ? (
          <span className={cx(styles.count, styles.countWaiting)}>
            <span className={styles.dot} aria-hidden="true" />
            {waiting} needs you
          </span>
        ) : null}
        <span className={styles.spacer} />
        {onSpanChange ? (
          <SegmentedControl
            size="sm"
            ariaLabel="Time window"
            value={String(span)}
            onChange={(value) => onSpanChange(Number(value))}
            items={spans.map((item) => ({ value: String(item), label: spanLabel(item) }))}
          />
        ) : (
          <span className={styles.span}>{spanLabel(span)}</span>
        )}
      </header>

      <div className={styles.board}>
        <div className={styles.axisRow} aria-hidden="true">
          <span />
          <div className={styles.axis}>
            {ticks.map((tick) => (
              <span key={tick.label} className={styles.tick} style={{ insetInlineStart: `${tick.at}%` }}>
                {tick.label}
              </span>
            ))}
            <span className={styles.now}>now</span>
          </div>
        </div>

        <ol className={styles.rows}>
          {agents.map((agent) => {
            const own = tasks.filter((task) => task.agentId === agent.id && visible(task));
            const busy = own.some((task) => task.status === "running" || task.status === "waiting");
            const needsYou = own.some((task) => task.status === "waiting");
            return (
              <li key={agent.id} className={styles.lane}>
                <div className={styles.agent}>
                  <span className={styles.agentIcon} aria-hidden="true">
                    <LucideByName name={agent.icon ?? "Bot"} size={16} />
                  </span>
                  <span className={styles.agentText}>
                    <span className={styles.agentName}>
                      {agent.name}
                      {needsYou ? (
                        <Badge tone="warning" size="sm">
                          Needs you
                        </Badge>
                      ) : !busy ? (
                        <Badge tone="neutral" size="sm">
                          Idle
                        </Badge>
                      ) : null}
                    </span>
                    {agent.model ? <span className={styles.model}>{agent.model}</span> : null}
                  </span>
                </div>
                <div className={styles.track}>
                  {ticks.map((tick) => (
                    <span key={tick.label} className={styles.grid} style={{ insetInlineStart: `${tick.at}%` }} aria-hidden="true" />
                  ))}
                  {own.map((task) => {
                    const left = pct(task.start);
                    const right = pct(task.end ?? now);
                    const label = `${agent.name}: ${task.title}, ${STATUS_TEXT[task.status]}, ${duration((task.end ?? now) - task.start)}`;
                    const isOpen = openTaskId === task.id;
                    return (
                      <button
                        key={task.id}
                        type="button"
                        className={cx(styles.block, styles[task.status], isOpen && styles.open, task.end === undefined && styles.live)}
                        style={{ insetInlineStart: `${left}%`, width: `max(var(--space-8), ${right - left}%)` }}
                        aria-label={label}
                        data-task-id={task.id}
                        aria-expanded={onOpenTaskChange ? isOpen : undefined}
                        disabled={!onOpenTaskChange}
                        onClick={() => onOpenTaskChange?.(isOpen ? null : task.id)}
                      >
                        {task.icon ? <LucideByName name={task.icon} size={14} /> : null}
                        <span className={styles.blockText}>{task.title}</span>
                        {task.status === "waiting" ? (
                          <span className={styles.flag}>
                            <TriangleAlert size={12} strokeWidth={ICON_STROKE} aria-hidden="true" />
                            Needs you
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ol>

        {/* Handoff connectors: from the source lane down (or up) to the target block's start. */}
        <div className={styles.connectors} aria-hidden="true">
          {tasks
            // A target that began before the window has no visible start to point at.
            .filter((task) => task.handoffTo && byId.has(task.handoffTo) && visible(task) && (byId.get(task.handoffTo)?.start ?? 0) > from)
            .map((task) => {
              const target = byId.get(task.handoffTo as string) as AgentLanesTask;
              const fromLane = laneIndex.get(task.agentId) ?? 0;
              const toLane = laneIndex.get(target.agentId) ?? 0;
              const top = Math.min(fromLane, toLane);
              const rows = Math.abs(toLane - fromLane);
              return (
                <span
                  key={`${task.id}-${target.id}`}
                  className={cx(styles.handoff, toLane < fromLane && styles.up, target.end === undefined && styles.handoffLive)}
                  style={
                    {
                      // Drop just left of the target, but never past the source block's end.
                      ["--handoff-x" as string]: `max(0px, min(calc(${pct(task.end ?? now)}% - var(--space-3)), calc(${pct(target.start)}% - var(--space-4))))`,
                      ["--handoff-to" as string]: `${pct(target.start)}%`,
                      ["--from-lane" as string]: top,
                      ["--rows" as string]: rows,
                    } as CSSProperties
                  }
                />
              );
            })}
        </div>

        {open ? (
          <div
            className={cx(
              styles.popover,
              open.status === "waiting" && styles.decision,
              popAbove && styles.above,
            )}
            ref={popRef}
            role="dialog"
            aria-label={open.status === "waiting" ? `${agents.find((a) => a.id === open.agentId)?.name ?? "Agent"} needs you` : open.title}
            style={{ ["--pop-lane" as string]: laneIndex.get(open.agentId) ?? 0 } as CSSProperties}
          >
            {open.status === "waiting" ? (
              <>
                <p className={styles.popTitle}>
                  <TriangleAlert size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
                  {agents.find((a) => a.id === open.agentId)?.name} needs you
                </p>
                {open.ask ? <p className={styles.popBody}>{open.ask}</p> : null}
                <div className={styles.popActions}>
                  <Button size="sm" appearance="outline" mode="neutral" shortcut="Esc" onClick={() => (onReject ? onReject(open.id) : close())}>
                    Reject
                  </Button>
                  <Button size="sm" shortcut="⏎" autoFocus onClick={() => onApprove?.(open.id)}>
                    Approve
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className={styles.popMeta}>
                  {agents.find((a) => a.id === open.agentId)?.name} · {STATUS_TEXT[open.status]} · {duration((open.end ?? now) - open.start)}
                </p>
                <p className={styles.popHead}>
                  <span className={styles.popName}>{open.title}</span>
                  {onOpen ? (
                    <button type="button" className={styles.popLink} autoFocus onClick={() => onOpen(open.id)}>
                      Open
                      <ArrowRight size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
                    </button>
                  ) : null}
                  <button type="button" className={styles.popClose} aria-label="Close" onClick={close}>
                    <X size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
                  </button>
                </p>
                {open.summary?.length ? (
                  <ul className={styles.popList}>
                    {open.summary.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
