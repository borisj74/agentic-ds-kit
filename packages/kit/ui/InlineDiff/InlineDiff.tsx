"use client";

import { useId, type KeyboardEvent } from "react";
import { CircleX, FileText, Pencil, TriangleAlert } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Empty } from "../Empty";
import { Skeleton } from "../Skeleton";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { useResolvedFocus } from "../shared/useResolvedFocus";
import { ResolvedRow, reviewStyles } from "../shared/ResolvedRow";
import { handleReviewKeys } from "../shared/reviewKeys";
import type { DiffLine, InlineDiffProps, InlineDiffStatus } from "./InlineDiff.types";
import styles from "./InlineDiff.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { InlineDiffProps, InlineDiffStatus, InlineDiffMode, DiffLine, DiffSegment } from "./InlineDiff.types";

/** Neutral states get the hairline badge; stale and error keep the soft tint. */
const BADGE: Partial<Record<InlineDiffStatus, { label: string; tone: "neutral" | "warning" | "danger"; appearance: "outline" | "soft" }>> = {
  pending: { label: "Pending", tone: "neutral", appearance: "outline" },
  stale: { label: "Stale", tone: "warning", appearance: "soft" },
  loading: { label: "Preparing", tone: "neutral", appearance: "outline" },
  error: { label: "Error", tone: "danger", appearance: "soft" },
  empty: { label: "No changes", tone: "neutral", appearance: "outline" },
};

const MARK = { add: "+", remove: "−", context: "" } as const;
const SAY = { add: "Added: ", remove: "Removed: ", context: "" } as const;

/** Counts in words, e.g. "2 added, 2 removed", so the change never rests on + / − alone. */
function countsInWords(added: number, removed: number): string {
  return `${added} added, ${removed} removed`;
}

function Line({ line, side }: { line: DiffLine; side?: "old" | "new" }) {
  const number = side === "old" ? line.oldNo : side === "new" ? line.newNo : (line.newNo ?? line.oldNo);
  return (
    <span className={cx(styles.line, styles[line.type])}>
      <span className={styles.no} aria-hidden="true">
        {number ?? ""}
      </span>
      <span className={styles.mark} aria-hidden="true">
        {MARK[line.type]}
      </span>
      <span className={styles.srOnly}>{SAY[line.type]}</span>
      <code className={styles.code}>{line.text}</code>
    </span>
  );
}

/** Proposed text or code edits you accept or reject in place. Additions and removals always carry + / − marks. */
export function InlineDiff({
  title,
  mode = "unified",
  file,
  hunkHeader,
  lines = [],
  segments = [],
  status = "pending",
  hunkLabel,
  staleReason,
  errorMessage = "Couldn't apply the edit.",
  onRetry,
  onAccept,
  onReject,
  onAcceptAll,
  resolvedSummary,
  resolvedAt,
  className,
  ref,
  ...rest
}: InlineDiffProps) {
  const titleId = useId();
  const resolved = status === "accepted" || status === "rejected";
  const focus = useResolvedFocus(resolved);
  const added = lines.filter((line) => line.type === "add").length;
  const removed = lines.filter((line) => line.type === "remove").length;

  if (resolved) {
    const accepted = status === "accepted";
    const label = accepted ? "Accepted" : "Rejected";
    return (
      <ResolvedRow
        {...rest} {...nisthaAttr("inlinediff", rest)}
        ref={mergeRefs(focus.rowRef, ref)}
        className={className}
        outcome={accepted ? "yes" : "no"}
        label={label}
        text={resolvedSummary ?? (accepted ? countsInWords(added, removed) : "kept the original")}
        meta={resolvedAt}
        aria-label={`${label}: ${title}`}
      />
    );
  }

  const active = status === "pending";
  const stale = status === "stale";

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!active) return;
    handleReviewKeys(event, { onYes: onAccept, onNo: onReject });
  }

  const badge = BADGE[status];
  const TitleIcon = mode === "inline" ? Pencil : FileText;

  let body;
  if (status === "loading") {
    body = (
      <div className={cx(styles.frame, styles.loading)} aria-busy="true">
        <Skeleton width="40%" size="sm" />
        <Skeleton width="85%" size="sm" />
        <Skeleton width="70%" size="sm" />
        <Skeleton width="60%" size="sm" />
      </div>
    );
  } else if (status === "error") {
    body = (
      <div className={styles.error} role="alert">
        <CircleX size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
        <span className={styles.errorText}>{errorMessage}</span>
        {onRetry ? (
          <Button size="sm" appearance="outline" mode="neutral" iconStart="RotateCcw" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </div>
    );
  } else if (status === "empty") {
    body = <Empty icon="FileText" title="No changes to review" description="The proposal matches the current file." />;
  } else if (mode === "inline") {
    body = (
      <p className={styles.prose}>
        {segments.map((segment, index) =>
          segment.type === "same" ? (
            <span key={index}>{segment.text}</span>
          ) : segment.type === "remove" ? (
            <span key={index}>
              <del className={styles.del}>
                <span aria-hidden="true">− </span>
                {segment.text}
              </del>
              {segments[index + 1]?.type === "add" ? " " : null}
            </span>
          ) : (
            <ins key={index} className={styles.ins}>
              <span aria-hidden="true">+ </span>
              {segment.text}
            </ins>
          ),
        )}
      </p>
    );
  } else if (mode === "split") {
    const before = lines.filter((line) => line.type !== "add");
    const after = lines.filter((line) => line.type !== "remove");
    body = (
      <div className={cx(styles.frame, styles.split, stale && styles.muted)}>
        <div className={styles.side}>
          <span className={styles.sideHead}>Before</span>
          <pre className={styles.pre} aria-label="Before">
            {before.map((line, index) => (
              <Line key={index} line={line} side="old" />
            ))}
          </pre>
        </div>
        <div className={styles.side}>
          <span className={styles.sideHead}>After</span>
          <pre className={styles.pre} aria-label="After">
            {after.map((line, index) => (
              <Line key={index} line={line} side="new" />
            ))}
          </pre>
        </div>
      </div>
    );
  } else {
    body = (
      <div className={cx(styles.frame, stale && styles.muted)}>
        {file || hunkHeader ? (
          <div className={styles.fileHead}>
            <FileText size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
            {file ? <span className={styles.file}>{file}</span> : null}
            {hunkHeader ? <span className={styles.hunk}>{hunkHeader}</span> : null}
            <span className={styles.counts}>
              <span aria-hidden="true">
                +{added} −{removed}
              </span>
              <span className={styles.srOnly}>{countsInWords(added, removed)}</span>
            </span>
          </div>
        ) : null}
        <pre className={styles.pre}>
          {lines.map((line, index) => (
            <Line key={index} line={line} />
          ))}
        </pre>
      </div>
    );
  }

  const showActions = status === "pending" || status === "stale";

  return (
    <section
      {...rest} {...nisthaAttr("inlinediff", rest)}
      ref={ref}
      tabIndex={-1}
      className={cx(styles.card, reviewStyles.focusRing, className)}
      aria-labelledby={titleId}
      aria-busy={status === "loading" || undefined}
      onKeyDown={handleKeyDown}
      onFocusCapture={focus.onFocusCapture}
      onBlurCapture={focus.onBlurCapture}
    >
      <header className={styles.header}>
        <TitleIcon size={16} strokeWidth={ICON_STROKE} className={styles.titleIcon} aria-hidden="true" />
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        {badge ? (
          <Badge tone={badge.tone} appearance={badge.appearance} size="sm">
            {badge.label}
          </Badge>
        ) : null}
      </header>
      {body}
      {stale && staleReason ? (
        <p className={styles.stale}>
          <TriangleAlert size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
          {staleReason}
        </p>
      ) : null}
      {showActions && (onAccept || onReject || onAcceptAll) ? (
        <footer className={reviewStyles.footer}>
          {hunkLabel ? <span className={styles.note}>{hunkLabel}</span> : null}
          <span className={reviewStyles.actions}>
            {onReject ? (
              <Button
                appearance="outline"
                mode="neutral"
                shortcut="Esc"
                aria-keyshortcuts="Escape"
                disabled={stale}
                onClick={onReject}
              >
                Reject
              </Button>
            ) : null}
            {onAcceptAll ? (
              <Button appearance="ghost" mode="neutral" disabled={stale} onClick={onAcceptAll}>
                Accept all
              </Button>
            ) : null}
            {onAccept ? (
              <Button shortcut="⌘⏎" aria-keyshortcuts="Meta+Enter Control+Enter" disabled={stale} onClick={onAccept}>
                Accept
              </Button>
            ) : null}
          </span>
        </footer>
      ) : null}
    </section>
  );
}
