"use client";

import { useId, type KeyboardEvent } from "react";
import { CircleCheck, CircleX, FileText, Pencil, TriangleAlert } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Empty } from "../Empty";
import { Skeleton } from "../Skeleton";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { useResolvedFocus } from "../shared/useResolvedFocus";
import type { DiffLine, InlineDiffProps, InlineDiffStatus } from "./InlineDiff.types";
import styles from "./InlineDiff.module.css";

export type { InlineDiffProps, InlineDiffStatus, InlineDiffMode, DiffLine, DiffSegment } from "./InlineDiff.types";

const BADGE: Partial<Record<InlineDiffStatus, { label: string; tone: "neutral" | "warning" | "danger" }>> = {
  pending: { label: "Pending", tone: "neutral" },
  stale: { label: "Stale", tone: "warning" },
  loading: { label: "Preparing", tone: "neutral" },
  error: { label: "Error", tone: "danger" },
  empty: { label: "No changes", tone: "neutral" },
};

const MARK = { add: "+", remove: "−", context: "" } as const;
const SAY = { add: "Added: ", remove: "Removed: ", context: "" } as const;

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
    const Icon = accepted ? CircleCheck : CircleX;
    return (
      <section
        {...rest}
        ref={mergeRefs(focus.rowRef, ref)}
        tabIndex={-1}
        className={cx(styles.resolved, styles[status], className)}
        aria-label={`${accepted ? "Accepted" : "Rejected"}: ${title}`}
      >
        <Icon size={16} strokeWidth={ICON_STROKE} className={styles.resolvedIcon} aria-hidden="true" />
        <span className={styles.resolvedLabel}>{accepted ? "Accepted" : "Rejected"}</span>
        <span className={styles.resolvedText}>· {resolvedSummary ?? (accepted ? `+${added} −${removed}` : "kept the original")}</span>
        {resolvedAt ? <span className={styles.resolvedAt}>{resolvedAt}</span> : null}
      </section>
    );
  }

  const active = status === "pending";
  const stale = status === "stale";

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!active || event.defaultPrevented) return;
    if (event.key === "Escape" && onReject) {
      event.preventDefault();
      onReject();
    } else if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && onAccept) {
      event.preventDefault();
      onAccept();
    }
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
            <del key={index} className={styles.del}>
              <span aria-hidden="true">− </span>
              {segment.text}
            </del>
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
              +{added} −{removed}
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
      {...rest}
      ref={ref}
      tabIndex={-1}
      className={cx(styles.card, className)}
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
          <Badge tone={badge.tone} size="sm">
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
      {showActions ? (
        <footer className={styles.footer}>
          {hunkLabel ? <span className={styles.note}>{hunkLabel}</span> : <span />}
          <span className={styles.actions}>
            {onReject ? (
              <Button size="sm" appearance="outline" mode="neutral" shortcut="Esc" aria-keyshortcuts="Escape" disabled={stale} onClick={onReject}>
                Reject
              </Button>
            ) : null}
            {onAcceptAll ? (
              <Button size="sm" appearance="ghost" mode="neutral" disabled={stale} onClick={onAcceptAll}>
                Accept all
              </Button>
            ) : null}
            {onAccept ? (
              <Button size="sm" shortcut="⌘⏎" aria-keyshortcuts="Meta+Enter Control+Enter" disabled={stale} onClick={onAccept}>
                Accept
              </Button>
            ) : null}
          </span>
        </footer>
      ) : null}
    </section>
  );
}
