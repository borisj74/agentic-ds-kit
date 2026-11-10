"use client";

import { useId } from "react";
import { CircleX, History, X } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Empty } from "../Empty";
import { NumberTransition } from "../NumberTransition";
import { Skeleton } from "../Skeleton";
import { cx } from "../shared/cx";
import type { TraceSpan, TraceSpanKind, TraceWaterfallProps } from "./TraceWaterfall.types";
import styles from "./TraceWaterfall.module.css";

export type { TraceWaterfallProps, TraceSpan, TraceSpanKind, TraceStatus } from "./TraceWaterfall.types";

const KIND_LABEL: Record<TraceSpanKind, string> = {
  model: "Model",
  tool: "Tool",
  wait: "Wait",
  approval: "Approval wait",
  other: "Other",
};

const STATUS_BADGE = {
  complete: { label: "Complete", tone: "success" },
  running: { label: "Running", tone: "primary" },
  failed: { label: "Failed", tone: "danger" },
} as const;

function seconds(ms: number) {
  const sec = ms / 1000;
  if (sec < 60) return `${sec.toFixed(1)}s`;
  return `${Math.floor(sec / 60)}m ${String(Math.round(sec % 60)).padStart(2, "0")}s`;
}

function kindClass(span: TraceSpan) {
  if (span.failed) return styles.kindFailed;
  return styles[`kind-${span.kind}`];
}

/** Where a run's time and money went: a waterfall of model, tool and approval spans, with totals and span detail. */
export function TraceWaterfall({
  title,
  spans,
  status = "complete",
  totalMs,
  totalCost,
  error,
  selectedId,
  onSpanClick,
  compact = false,
  currency = "$",
  loading = false,
  loadError,
  onRetry,
  className,
  ref,
  ...rest
}: TraceWaterfallProps) {
  const titleId = useId();
  const detailId = useId();
  const end = totalMs ?? Math.max(1, ...spans.map((span) => span.endMs ?? span.startMs));
  const cost = totalCost ?? spans.reduce((sum, span) => sum + (span.cost ?? 0), 0);
  const money = (value: number) => `${currency}${value.toFixed(2)}`;
  const pct = (ms: number) => Math.min(100, Math.max(0, (ms / end) * 100));
  const kinds = Array.from(new Set(spans.map((span) => span.kind)));
  const selected = spans.find((span) => span.id === selectedId);
  const running = status === "running";
  const badge = STATUS_BADGE[status];

  if (compact) {
    return (
      <section {...rest} ref={ref} className={cx(styles.compact, className)} aria-label={`${title}: ${seconds(end)}, ${money(cost)}${running ? ", running" : ""}`}>
        <History size={14} strokeWidth={ICON_STROKE} className={styles.icon} aria-hidden="true" />
        <span className={styles.compactBar} aria-hidden="true">
          {spans.map((span) => (
            <span key={span.id} className={cx(styles.compactSeg, kindClass(span))} style={{ flexGrow: Math.max(1, (span.endMs ?? end) - span.startMs) }} />
          ))}
        </span>
        <span className={styles.compactText}>
          {seconds(end)} · {money(cost)}
        </span>
        {running ? (
          <Badge tone="primary" size="sm">
            Running
          </Badge>
        ) : null}
      </section>
    );
  }

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((step) => ({ at: step * 100, label: `${Math.round((end * step) / 1000)}s` }));

  let body;
  if (loading) {
    body = (
      <div className={styles.loading}>
        <Skeleton shape="rect" width="100%" height="var(--space-12)" />
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className={styles.skeletonRow}>
            <Skeleton width="25%" size="sm" />
            <Skeleton width={`${20 + row * 10}%`} size="sm" />
          </div>
        ))}
      </div>
    );
  } else if (loadError) {
    body = (
      <div className={styles.error} role="alert">
        <CircleX size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
        <span className={styles.errorText}>{loadError}</span>
        {onRetry ? (
          <Button size="sm" appearance="outline" mode="neutral" iconStart="RotateCcw" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </div>
    );
  } else if (spans.length === 0) {
    body = <Empty icon="History" title="No spans recorded" description="The run started but hasn't called a model or tool yet." />;
  } else {
    body = (
      <>
        <dl className={styles.stats}>
          <div className={styles.stat}>
            <dt>Total time</dt>
            <dd>
              <NumberTransition value={seconds(end)} label="Total time" />
            </dd>
          </div>
          <div className={styles.stat}>
            <dt>Total cost</dt>
            <dd>
              <NumberTransition value={money(cost)} label="Total cost" />
            </dd>
          </div>
          <div className={styles.stat}>
            <dt>Spans</dt>
            <dd>
              {spans.length}
              {running ? " so far" : ""}
            </dd>
          </div>
        </dl>

        <div className={styles.table}>
          <div className={styles.axisRow} aria-hidden="true">
            <span />
            <span className={styles.axis}>
              {ticks.map((tick) => (
                <span key={tick.at} className={styles.tick} style={{ insetInlineStart: `${tick.at}%` }}>
                  {tick.label}
                </span>
              ))}
            </span>
            <span />
            <span />
          </div>
          <ol className={styles.rows}>
            {spans.map((span) => {
              const open = span.endMs === undefined;
              const left = pct(span.startMs);
              const solidEnd = open ? Math.min(end, span.startMs + (end - span.startMs) * 0.4) : (span.endMs as number);
              const width = Math.max(0.8, pct(solidEnd) - left);
              const dashed = open ? Math.max(0, 100 - left - width) : 0;
              const duration = open ? "running" : seconds((span.endMs as number) - span.startMs);
              const isSelected = span.id === selectedId;
              const name = `${span.label}, ${KIND_LABEL[span.kind]}, ${duration}${span.cost !== undefined ? `, ${money(span.cost)}` : ""}${span.failed ? ", failed" : ""}`;
              const inner = (
                <>
                  <span className={styles.label}>
                    <span className={cx(styles.dot, kindClass(span))} aria-hidden="true" />
                    <span className={styles.labelText}>{span.label}</span>
                  </span>
                  <span className={styles.track} aria-hidden="true">
                    <span className={cx(styles.bar, kindClass(span))} style={{ insetInlineStart: `${left}%`, width: `${width}%` }} />
                    {dashed ? <span className={styles.pending} style={{ insetInlineStart: `${left + width}%`, width: `${dashed}%` }} /> : null}
                  </span>
                  <span className={styles.num}>{duration}</span>
                  <span className={styles.num}>{span.cost !== undefined ? money(span.cost) : "–"}</span>
                </>
              );
              return (
                <li key={span.id} className={cx(styles.row, span.failed && styles.failed, isSelected && styles.selected)}>
                  {onSpanClick ? (
                    <button
                      type="button"
                      className={styles.rowButton}
                      aria-label={name}
                      aria-expanded={isSelected}
                      aria-controls={isSelected ? detailId : undefined}
                      onClick={() => onSpanClick(isSelected ? null : span.id)}
                    >
                      {inner}
                    </button>
                  ) : (
                    <div className={styles.rowButton} role="group" aria-label={name}>
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {status === "failed" && error ? (
          <p className={styles.failNote}>
            <CircleX size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
            {error}
          </p>
        ) : null}

        {selected ? (
          <div id={detailId} className={styles.detail} role="region" aria-label={`Span detail: ${selected.label}`}>
            <p className={styles.detailHead}>
              <span className={cx(styles.dot, kindClass(selected))} aria-hidden="true" />
              <span className={styles.detailTitle}>{selected.label}</span>
              <Badge tone="neutral" size="sm">
                {KIND_LABEL[selected.kind]}
              </Badge>
              {onSpanClick ? (
                <button type="button" className={styles.close} aria-label="Close span detail" onClick={() => onSpanClick(null)}>
                  <X size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
                </button>
              ) : null}
            </p>
            <dl className={styles.detailRows}>
              {[
                ...(selected.detail ?? []),
                ...(selected.tokensIn !== undefined || selected.tokensOut !== undefined
                  ? [{ label: "Tokens in / out", value: `${(selected.tokensIn ?? 0).toLocaleString("en-US")} / ${(selected.tokensOut ?? 0).toLocaleString("en-US")}` }]
                  : []),
                { label: "Duration", value: selected.endMs === undefined ? "running" : seconds(selected.endMs - selected.startMs) },
                ...(selected.cost !== undefined ? [{ label: "Cost", value: money(selected.cost) }] : []),
              ].map((row) => (
                <div key={row.label} className={styles.detailRow}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        <footer className={styles.legend}>
          <ul className={styles.legendList}>
            {kinds.map((kind) => (
              <li key={kind}>
                <span className={cx(styles.dot, styles[`kind-${kind}`])} aria-hidden="true" />
                {KIND_LABEL[kind]}
              </li>
            ))}
          </ul>
          {running ? <span className={styles.legendNote}>dashed = still running</span> : null}
        </footer>
      </>
    );
  }

  return (
    <section {...rest} ref={ref} className={cx(styles.card, className)} aria-labelledby={titleId} aria-busy={loading || undefined}>
      <header className={styles.header}>
        <History size={16} strokeWidth={ICON_STROKE} className={styles.icon} aria-hidden="true" />
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        {!loading && !loadError && spans.length ? (
          <Badge tone={badge.tone} size="sm">
            {badge.label}
          </Badge>
        ) : null}
      </header>
      {body}
    </section>
  );
}
