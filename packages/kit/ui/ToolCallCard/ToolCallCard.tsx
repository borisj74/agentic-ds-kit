"use client";

import { useEffect, useId, useState } from "react";
import { Check, ChevronDown, ChevronRight, Layers, LoaderCircle, TriangleAlert } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { cx } from "../shared/cx";
import type { ToolCall, ToolCallCardProps, ToolCallStatus } from "./ToolCallCard.types";
import styles from "./ToolCallCard.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { ToolCallCardProps, ToolCall, ToolCallStatus } from "./ToolCallCard.types";

const STATUS_TEXT: Record<ToolCallStatus, string> = { running: "Running", done: "Done", error: "Error" };

function StatusIcon({ status }: { status: ToolCallStatus }) {
  if (status === "running") return <LoaderCircle size={16} strokeWidth={ICON_STROKE} className={cx(styles.icon, styles.spin)} aria-hidden="true" />;
  if (status === "error") return <TriangleAlert size={16} strokeWidth={ICON_STROKE} className={cx(styles.icon, styles.iconError)} aria-hidden="true" />;
  return <Check size={16} strokeWidth={ICON_STROKE} className={cx(styles.icon, styles.iconDone)} aria-hidden="true" />;
}

function lines(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) return value as string[];
  if (typeof value === "string") return value.split("\n");
  return JSON.stringify(value, null, 2).split("\n");
}

function useLiveDuration(running: boolean, startedAt: number | undefined, fallback: string | undefined) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!running || startedAt === undefined) return;
    const tick = () => setNow(Date.now());
    const id = window.setInterval(tick, 100);
    const first = window.setTimeout(tick, 0);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(first);
    };
  }, [running, startedAt]);
  if (!running || startedAt === undefined || now === null) return fallback;
  return `${(Math.max(0, now - startedAt) / 1000).toFixed(1)}s`;
}

function Pane({ label, meta, body, tone }: { label: string; meta?: string; body: string[]; tone?: "error" }) {
  return (
    <div className={cx(styles.pane, tone === "error" && styles.paneError)}>
      {tone === "error" ? null : (
        <div className={styles.paneHead}>
          <span>{label}</span>
          {meta ? <span className={styles.paneMeta}>{meta}</span> : null}
        </div>
      )}
      <pre className={styles.code} aria-label={label}>
        {body.join("\n")}
      </pre>
    </div>
  );
}

/**
 * One tool call on one line: status, name, summary and a live timer. Opens to arguments and result.
 * With `calls`, several calls roll into one group row.
 */
export function ToolCallCard({
  name = "",
  summary,
  status = "done",
  duration,
  startedAt,
  args,
  result,
  resultMeta,
  error,
  onRetry,
  attempt,
  calls,
  groupTitle,
  expanded,
  defaultExpanded,
  onExpandedChange,
  className,
  ref,
  ...rest
}: ToolCallCardProps) {
  const panelId = useId();
  const group = Array.isArray(calls);
  const [innerOpen, setInnerOpen] = useState(defaultExpanded ?? (status === "error" && !group));
  const open = expanded ?? innerOpen;
  const live = useLiveDuration(status === "running" && !group, startedAt, duration);

  const argLines = lines(args);
  const resultLines = lines(result);
  const errorLines = lines(error);
  const hasDetail = group ? (calls?.length ?? 0) > 0 : argLines.length > 0 || resultLines.length > 0 || errorLines.length > 0 || Boolean(onRetry);

  function toggle() {
    const next = !open;
    if (expanded === undefined) setInnerOpen(next);
    onExpandedChange?.(next);
  }

  let headIcon;
  let headName: string;
  let headSummary: string | undefined;
  let headDuration: string | undefined;
  let headStatus: ToolCallStatus = status;

  if (group) {
    const list = calls ?? [];
    const done = list.filter((call) => call.status === "done").length;
    const running = list.filter((call) => call.status === "running").length;
    const failed = list.filter((call) => call.status === "error").length;
    headStatus = failed ? "error" : running ? "running" : "done";
    headIcon = <Layers size={16} strokeWidth={ICON_STROKE} className={cx(styles.icon, styles.iconGroup)} aria-hidden="true" />;
    headName = groupTitle ?? `Ran ${list.length} tool${list.length === 1 ? "" : "s"}`;
    headSummary = [done ? `${done} done` : "", running ? `${running} running` : "", failed ? `${failed} failed` : ""]
      .filter(Boolean)
      .join(" · ");
    headDuration = duration;
  } else {
    headIcon = <StatusIcon status={status} />;
    headName = name;
    headSummary = summary;
    headDuration = live;
  }

  const Chevron = open ? ChevronDown : ChevronRight;
  const headInner = (
    <>
      {headIcon}
      <span className={cx(styles.name, group && styles.groupName)}>{headName}</span>
      {headSummary ? <span className={styles.summary}>{headSummary}</span> : <span className={styles.summary} />}
      {!group && status === "running" ? (
        <Badge tone="info" size="sm" className={styles.badge}>
          Running
        </Badge>
      ) : null}
      {!group && status === "error" ? (
        <Badge tone="danger" size="sm" className={styles.badge}>
          Error
        </Badge>
      ) : null}
      {headDuration ? (
        <span className={styles.duration} aria-live={status === "running" ? "off" : undefined}>
          {headDuration}
        </span>
      ) : null}
      {hasDetail ? <Chevron size={16} strokeWidth={ICON_STROKE} className={styles.chevron} aria-hidden="true" /> : null}
      <span className={styles.srOnly}>, {STATUS_TEXT[headStatus]}</span>
    </>
  );

  return (
    <div {...rest} {...nisthaAttr("toolcallcard", rest)} ref={ref} className={cx(styles.card, styles[headStatus], className)}>
      {hasDetail ? (
        <button type="button" className={styles.head} aria-expanded={open} aria-controls={panelId} onClick={toggle}>
          {headInner}
        </button>
      ) : (
        <div className={styles.head}>{headInner}</div>
      )}
      {hasDetail && open ? (
        <div id={panelId} className={styles.body}>
          {group ? (
            <ul className={styles.calls}>
              {(calls ?? []).map((call: ToolCall) => (
                <li key={call.id} className={cx(styles.call, styles[call.status])}>
                  <StatusIcon status={call.status} />
                  <span className={styles.name}>{call.name}</span>
                  <span className={styles.summary}>{call.summary}</span>
                  {call.duration ? <span className={styles.duration}>{call.duration}</span> : null}
                  <span className={styles.srOnly}>, {STATUS_TEXT[call.status]}</span>
                </li>
              ))}
            </ul>
          ) : (
            <>
              {errorLines.length ? <Pane label="Error" body={errorLines} tone="error" /> : null}
              {argLines.length ? <Pane label="Arguments" body={argLines} /> : null}
              {resultLines.length ? <Pane label="Result" meta={resultMeta} body={resultLines} /> : null}
              {onRetry ? (
                <div className={styles.retry}>
                  <Button size="sm" appearance="outline" mode="neutral" iconStart="RotateCcw" onClick={onRetry}>
                    Retry
                  </Button>
                  {attempt ? (
                    <span className={styles.attempt}>
                      Attempt {attempt.n} of {attempt.max}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
