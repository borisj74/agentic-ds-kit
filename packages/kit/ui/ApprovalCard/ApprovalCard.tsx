"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, FilePen, Pencil, ShieldAlert, SquareTerminal, Timer, X } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Progress } from "../Progress";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { useResolvedFocus } from "../shared/useResolvedFocus";
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

function LeadIcon({ risk, kind }: { risk: ApprovalCardRisk; kind: ApprovalCardAction["kind"] }) {
  const Icon = risk === "high" ? ShieldAlert : kind === "diff" ? Pencil : SquareTerminal;
  return (
    <span className={cx(styles.lead, styles[`lead-${risk}`])} aria-hidden="true">
      <Icon size={16} strokeWidth={ICON_STROKE} />
    </span>
  );
}

function Preview({ action }: { action: ApprovalCardAction }) {
  if (action.kind === "command") {
    return (
      <figure className={styles.preview}>
        <figcaption className={styles.previewHead}>
          <SquareTerminal size={16} strokeWidth={ICON_STROKE} className={styles.previewIcon} aria-hidden="true" />
          <span className={styles.previewLabel}>Command</span>
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
 * The agent asks before it acts: risk, an exact preview of what will run, and keyboard-first
 * Approve (Enter) / Deny (Escape). Resolved cards collapse to one line.
 */
export function ApprovalCard({
  title,
  description,
  risk = "medium",
  action,
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
    const Icon = status === "approved" ? Check : status === "denied" ? X : Timer;
    const label = status === "approved" ? "Approved" : status === "denied" ? "Denied" : "Expired";
    const meta =
      status === "expired" ? "auto-denied" : [resolvedBy, resolvedAt].filter(Boolean).join(" · ") || undefined;
    return (
      <article
        {...rest} {...nisthaAttr("approvalcard", rest)}
        ref={mergeRefs(focus.rowRef, ref)}
        tabIndex={-1}
        className={cx(styles.resolved, styles[status], className)}
        aria-label={`${label}: ${title}`}
      >
        <Icon size={16} strokeWidth={ICON_STROKE} className={styles.resolvedIcon} aria-hidden="true" />
        <span className={styles.resolvedLabel}>{label}</span>
        <span className={styles.resolvedSummary}>{summaryOf(action)}</span>
        {meta ? <span className={styles.resolvedMeta}>{meta}</span> : null}
      </article>
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.defaultPrevented) return;
    const target = event.target as HTMLElement;
    // Leave Enter alone on other buttons and fields inside the card.
    const onOtherControl = target !== event.currentTarget && target.closest("button, a, input, textarea, select");
    if (event.key === "Escape" && onDeny) {
      event.preventDefault();
      onDeny();
    } else if (event.key === "Enter" && onApprove && !onOtherControl) {
      event.preventDefault();
      onApprove();
    }
  }

  const fraction = counting && remaining !== undefined ? (remaining / countdownSec) * 100 : 0;

  return (
    <article
      {...rest} {...nisthaAttr("approvalcard", rest)}
      ref={ref}
      tabIndex={-1}
      className={cx(styles.card, className)}
      onFocusCapture={focus.onFocusCapture}
      onBlurCapture={focus.onBlurCapture}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onKeyDown={handleKeyDown}
    >
      <header className={styles.header}>
        <LeadIcon risk={risk} kind={action.kind} />
        <div className={styles.heading}>
          <h3 id={titleId} className={styles.title}>
            {title}
          </h3>
          {description ? (
            <p id={descriptionId} className={styles.description}>
              {description}
            </p>
          ) : null}
        </div>
        <Badge tone={RISK_TONE[risk]} size="sm" className={styles.risk}>
          {RISK_LABEL[risk]}
        </Badge>
      </header>

      <Preview action={action} />

      {counting && remaining !== undefined ? (
        <div className={styles.countdown}>
          <p className={styles.countdownText}>
            <Timer size={16} strokeWidth={ICON_STROKE} className={styles.countdownIcon} aria-hidden="true" />
            <span>Auto-deny in</span>
            <span className={styles.clock} role="timer" aria-live="off">
              {formatClock(remaining)}
            </span>
          </p>
          <Progress size="sm" tone="warning" value={fraction} ariaLabel="Time left before auto-deny" />
        </div>
      ) : null}

      <footer className={styles.actions}>
        <Button appearance="outline" mode="neutral" shortcut="Esc" aria-keyshortcuts="Escape" onClick={onDeny}>
          {denyLabel}
        </Button>
        <Button appearance="solid" mode="primary" shortcut="⏎" aria-keyshortcuts="Enter" onClick={onApprove}>
          {approveLabel}
        </Button>
      </footer>
    </article>
  );
}
