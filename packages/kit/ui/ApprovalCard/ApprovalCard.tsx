"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { FilePen, SquareTerminal, Timer } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Progress } from "../Progress";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { useResolvedFocus } from "../shared/useResolvedFocus";
import { KeyHint, ResolvedRow, reviewStyles } from "../shared/ResolvedRow";
import { handleReviewKeys } from "../shared/reviewKeys";
import type { ApprovalCardAction, ApprovalCardProps, ApprovalCardRisk } from "./ApprovalCard.types";
import styles from "./ApprovalCard.module.css";
import { nisthaAttr } from "../shared/inspect";

export type {
  ApprovalCardProps,
  ApprovalCardRisk,
  ApprovalCardStatus,
  ApprovalCardAction,
  ApprovalCardCommand,
  ApprovalCardDiff,
  ApprovalCardDiffLine,
  ApprovalCardFact,
} from "./ApprovalCard.types";

const RISK_LABEL: Record<ApprovalCardRisk, string> = { low: "Low risk", medium: "Medium risk", high: "High risk" };
const RISK_TONE = { low: "success", medium: "warning", high: "danger" } as const;

function formatClock(totalSec: number): string {
  const sec = Math.max(0, Math.ceil(totalSec));
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

function summaryOf(action: ApprovalCardAction): string {
  return action.kind === "command" ? action.command : action.file;
}

function Preview({ action }: { action: ApprovalCardAction }) {
  if (action.kind === "command") {
    return (
      <figure className={styles.preview}>
        <figcaption className={styles.previewHead}>
          <SquareTerminal size={16} strokeWidth={ICON_STROKE} className={styles.previewIcon} aria-hidden="true" />
          <span className={styles.previewLabel}>Exact command</span>
          {action.target ? <span className={styles.previewTarget}>{action.target}</span> : null}
        </figcaption>
        <pre className={styles.code}>
          <span className={styles.line}>
            <span className={styles.gutter} aria-hidden="true">
              $
            </span>
            <code className={styles.text}>{action.command}</code>
          </span>
          {action.note ? (
            <span className={cx(styles.line, styles.comment)}>
              <span className={styles.gutter} aria-hidden="true" />
              <span className={styles.text}># {action.note}</span>
            </span>
          ) : null}
        </pre>
      </figure>
    );
  }
  return (
    <figure className={styles.preview}>
      <figcaption className={styles.previewHead}>
        <FilePen size={16} strokeWidth={ICON_STROKE} className={styles.previewIcon} aria-hidden="true" />
        <span className={cx(styles.previewLabel, styles.mono)}>{action.file}</span>
      </figcaption>
      <pre className={styles.code}>
        {action.lines.map((line, index) => (
          <span key={index} className={cx(styles.line, styles[line.type])}>
            <span className={styles.gutter} aria-hidden="true">
              {line.type === "add" ? "+" : line.type === "remove" ? "−" : ""}
            </span>
            <span className={styles.srOnly}>{line.type === "add" ? "Added: " : line.type === "remove" ? "Removed: " : ""}</span>
            <code className={styles.text}>{line.text}</code>
          </span>
        ))}
      </pre>
    </figure>
  );
}

/**
 * The agent asks before it acts: risk, what will happen in words (facts), the exact command or
 * diff, and Approve (⌘/Ctrl+Enter) / Deny (Escape). Resolved cards collapse to one line.
 */
export function ApprovalCard({
  title,
  description,
  risk = "medium",
  action,
  facts,
  status = "pending",
  countdownSec,
  onApprove,
  onDeny,
  onExpire,
  resolvedBy,
  resolvedAt,
  approveLabel = "Approve",
  denyLabel = "Deny",
  className,
  ref,
  ...rest
}: ApprovalCardProps) {
  const titleId = useId();
  const descriptionId = useId();
  const focus = useResolvedFocus(status !== "pending");
  const [remaining, setRemaining] = useState(countdownSec);
  const [countdownFrom, setCountdownFrom] = useState(countdownSec);
  const expireRef = useRef(onExpire ?? onDeny);
  const pending = status === "pending";
  const counting = pending && countdownSec !== undefined && countdownSec > 0;

  // A new countdownSec restarts the timer (state reset during render, not in an effect).
  if (countdownFrom !== countdownSec) {
    setCountdownFrom(countdownSec);
    setRemaining(countdownSec);
  }

  useEffect(() => {
    expireRef.current = onExpire ?? onDeny;
  });

  useEffect(() => {
    if (!counting) return;
    const id = window.setInterval(() => {
      setRemaining((value) => {
        const next = (value ?? 0) - 1;
        if (next <= 0) {
          window.clearInterval(id);
          expireRef.current?.();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [counting]);

  if (!pending) {
    const label = status === "approved" ? "Approved" : status === "denied" ? "Denied" : "Expired";
    const meta =
      status === "expired" ? "auto-denied" : [resolvedBy, resolvedAt].filter(Boolean).join(" · ") || undefined;
    return (
      <ResolvedRow
        {...rest} {...nisthaAttr("approvalcard", rest)}
        as="article"
        ref={mergeRefs(focus.rowRef, ref)}
        className={className}
        outcome={status === "approved" ? "yes" : status === "denied" ? "no" : "expired"}
        label={label}
        text={<span className={styles.mono}>{summaryOf(action)}</span>}
        meta={meta}
        aria-label={`${label}: ${title}`}
      />
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    handleReviewKeys(event, { onYes: onApprove, onNo: onDeny });
  }

  const fraction = counting && remaining !== undefined ? (remaining / countdownSec) * 100 : 0;

  const lastSeconds = counting && remaining !== undefined && remaining <= 10;

  return (
    <article
      {...rest} {...nisthaAttr("approvalcard", rest)}
      ref={ref}
      tabIndex={-1}
      className={cx(styles.card, reviewStyles.focusRing, className)}
      onFocusCapture={focus.onFocusCapture}
      onBlurCapture={focus.onBlurCapture}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.top}>
        <Badge tone={RISK_TONE[risk]} size="sm" className={styles.risk}>
          {RISK_LABEL[risk]}
        </Badge>
        {counting && remaining !== undefined ? (
          <p className={styles.countdownText}>
            <Timer size={16} strokeWidth={ICON_STROKE} className={styles.countdownIcon} aria-hidden="true" />
            <span>Auto-deny in</span>
            <span className={styles.clock} role="timer" aria-live="off">
              {formatClock(remaining)}
            </span>
          </p>
        ) : null}
      </div>

      <header className={styles.heading}>
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        {description ? (
          <p id={descriptionId} className={styles.description}>
            {description}
          </p>
        ) : null}
      </header>

      {facts && facts.length > 0 ? (
        <dl className={styles.facts}>
          {facts.map((fact) => (
            <div key={fact.label} className={styles.fact}>
              <dt className={styles.factLabel}>{fact.label}</dt>
              <dd className={styles.factValue}>{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <Preview action={action} />

      {counting ? <Progress size="sm" tone="warning" value={fraction} ariaLabel="Time left before auto-deny" /> : null}
      <span className={styles.srOnly} role="status">
        {lastSeconds ? "Denies in 10 seconds" : ""}
      </span>

      <footer className={reviewStyles.footer}>
        <KeyHint>⌘⏎ approve · Esc deny</KeyHint>
        <span className={reviewStyles.actions}>
          <Button appearance="outline" mode="neutral" aria-keyshortcuts="Escape" onClick={onDeny}>
            {denyLabel}
          </Button>
          <Button appearance="solid" mode="primary" iconStart="Check" aria-keyshortcuts="Meta+Enter Control+Enter" onClick={onApprove}>
            {approveLabel}
          </Button>
        </span>
      </footer>
    </article>
  );
}
