"use client";

import { useId } from "react";
import { CircleX, Layers, LoaderCircle, TriangleAlert } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Meter } from "../Meter";
import { NumberTransition } from "../NumberTransition";
import { Skeleton } from "../Skeleton";
import { cx } from "../shared/cx";
import type { ContextWindowProps } from "./ContextWindow.types";
import styles from "./ContextWindow.module.css";

export type { ContextWindowProps, ContextSegment } from "./ContextWindow.types";

const full = (value: number) => value.toLocaleString("en-US");
const short = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(value >= 100_000 ? 0 : 1).replace(/\.0$/, "")}K` : String(value);

/** How full the prompt context is and what uses the space. Built on kit Meter (compact) and NumberTransition. */
export function ContextWindow({
  used,
  limit,
  segments = [],
  warningAt = 0.8,
  compact = false,
  label = "Context window",
  onTrim,
  loading = false,
  error,
  onRetry,
  className,
  ref,
  ...rest
}: ContextWindowProps) {
  const titleId = useId();
  const share = limit ? used / limit : 0;
  const state = !limit ? "unknown" : share >= 1 ? "full" : share >= warningAt ? "warn" : "ok";
  const percent = Math.min(100, Math.round(share * 100));
  const intent = state === "full" ? "danger" : state === "warn" ? "warning" : "info";

  if (compact) {
    return (
      <section {...rest} ref={ref} className={cx(styles.compact, styles[state], className)} aria-label={label} aria-busy={loading || undefined}>
        {loading ? (
          <LoaderCircle size={16} strokeWidth={ICON_STROKE} className={styles.spin} aria-hidden="true" />
        ) : (
          <Layers size={16} strokeWidth={ICON_STROKE} className={styles.icon} aria-hidden="true" />
        )}
        <Meter
          className={styles.compactMeter}
          size="sm"
          value={loading || !limit ? "indeterminate" : percent}
          intent={intent}
          label={`${label}: ${loading ? "loading" : limit ? `${percent}% used` : "limit unknown"}`}
        />
        <span className={styles.compactValue}>{loading ? "– / –" : limit ? `${short(used)} / ${short(limit)}` : short(used)}</span>
        {state === "warn" && !loading ? <TriangleAlert size={16} strokeWidth={ICON_STROKE} aria-label="Near limit" /> : null}
        {state === "full" && !loading ? <CircleX size={16} strokeWidth={ICON_STROKE} aria-label="Full" /> : null}
      </section>
    );
  }

  const total = Math.max(limit ?? used, 1);

  return (
    <section {...rest} ref={ref} className={cx(styles.card, styles[state], className)} aria-labelledby={titleId} aria-busy={loading || undefined}>
      <header className={styles.header}>
        <Layers size={16} strokeWidth={ICON_STROKE} className={styles.icon} aria-hidden="true" />
        <h3 id={titleId} className={styles.title}>
          {label}
        </h3>
        {state === "warn" && !loading && !error ? (
          <Badge tone="warning" size="sm">
            Near limit
          </Badge>
        ) : null}
        {state === "full" && !loading && !error ? (
          <Badge tone="danger" size="sm">
            Full
          </Badge>
        ) : null}
      </header>

      {loading ? (
        <div className={styles.loading}>
          <Skeleton width="40%" height="var(--space-6)" />
          <Skeleton width="100%" size="sm" />
          <Skeleton width="70%" size="sm" />
          <Skeleton width="60%" size="sm" />
          <Skeleton width="80%" size="sm" />
        </div>
      ) : error ? (
        <p className={styles.error} role="alert">
          <CircleX size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
          <span className={styles.errorText}>{error}</span>
          {onRetry ? (
            <button type="button" className={styles.retry} onClick={onRetry}>
              Retry
            </button>
          ) : null}
        </p>
      ) : (
        <>
          <p className={styles.figures}>
            <NumberTransition className={styles.used} value={used} format={(value) => full(Number(value))} label="Tokens used" />
            <span className={styles.of}>{limit ? `/ ${full(limit)} tokens` : "tokens used · limit unknown"}</span>
            {limit ? <span className={styles.percent}>{percent}% used</span> : null}
          </p>
          {limit ? (
            <div
              className={styles.bar}
              role="meter"
              aria-valuemin={0}
              aria-valuemax={limit}
              aria-valuenow={Math.min(used, limit)}
              aria-valuetext={`${full(used)} of ${full(limit)} tokens, ${percent}% used`}
              aria-label={label}
            >
              {segments.map((segment, index) => (
                <span
                  key={segment.id}
                  className={cx(styles.segment, styles[`seg${index % 5}`])}
                  style={{ flexGrow: segment.tokens / total }}
                />
              ))}
              <span className={styles.rest} style={{ flexGrow: Math.max(0, (total - segments.reduce((sum, s) => sum + s.tokens, 0)) / total) }} />
            </div>
          ) : (
            <div className={styles.unknownBar} aria-hidden="true" />
          )}
          {segments.length && limit ? (
            <ul className={styles.legend}>
              {segments.map((segment, index) => (
                <li key={segment.id} className={styles.legendRow}>
                  <span className={cx(styles.dot, styles[`seg${index % 5}`])} aria-hidden="true" />
                  <span className={styles.legendLabel}>{segment.label}</span>
                  <span className={styles.legendValue}>{short(segment.tokens)}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {state === "warn" ? (
            <p className={cx(styles.notice, styles.noticeWarn)}>
              <TriangleAlert size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
              Oldest messages will be trimmed soon. Trim now to keep control.
            </p>
          ) : null}
          {state === "full" ? (
            <p className={cx(styles.notice, styles.noticeFull)}>
              <CircleX size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
              No room left. The next turn drops the oldest messages automatically.
            </p>
          ) : null}
          {state === "unknown" ? (
            <p className={styles.unknownNote}>This model doesn&apos;t report its context size, so no percentage is shown.</p>
          ) : null}
          {onTrim && limit ? (
            <div className={styles.actions}>
              <Button size="sm" appearance={state === "ok" ? "ghost" : "outline"} mode="neutral" iconStart="Scissors" onClick={onTrim}>
                Trim oldest
              </Button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
