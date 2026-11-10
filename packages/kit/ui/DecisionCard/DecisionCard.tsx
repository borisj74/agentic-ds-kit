"use client";

import { useId, type KeyboardEvent } from "react";
import { ArrowRight, CircleCheck, CircleHelp, CircleX } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Button } from "../Button";
import { Field } from "../Field";
import { RadioGroup } from "../RadioGroup";
import { Textarea } from "../Textarea";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { useResolvedFocus } from "../shared/useResolvedFocus";
import type { DecisionCardProps } from "./DecisionCard.types";
import styles from "./DecisionCard.module.css";

export type { DecisionCardProps, DecisionCardStatus, DecisionOption } from "./DecisionCard.types";

/**
 * An agent presents a choice mid-run and waits. Not ApprovalCard (one action), PermissionRequest
 * (standing access) or AlertDialog.
 */
export function DecisionCard({
  title,
  question,
  meta,
  options = [],
  allowFreeText = false,
  freeTextLabel = "Your answer",
  freeTextHint = "One or two sentences is enough.",
  value = "",
  onValueChange,
  status = "pending",
  errorMessage = "The answer was not sent.",
  resolvedLabel,
  resolvedAt,
  onConfirm,
  onSkip,
  className,
  ref,
  ...rest
}: DecisionCardProps) {
  const titleId = useId();
  const base = useId();
  const resolved = status === "resolved" || status === "skipped";
  const focus = useResolvedFocus(resolved);
  const sending = status === "sending";
  const freeText = allowFreeText || options.length === 0;

  if (resolved) {
    const chosen = options.find((option) => option.id === value)?.label ?? value;
    const label = status === "resolved" ? "Chose" : "Skipped";
    const Icon = status === "resolved" ? CircleCheck : ArrowRight;
    return (
      <section
        {...rest}
        ref={mergeRefs(focus.rowRef, ref)}
        tabIndex={-1}
        className={cx(styles.resolved, styles[status], className)}
        aria-label={`${label}: ${title}`}
      >
        <Icon size={16} strokeWidth={ICON_STROKE} className={styles.resolvedIcon} aria-hidden="true" />
        <span className={styles.resolvedLabel}>{label}</span>
        <span className={styles.resolvedText}>
          <span aria-hidden="true">· </span>
          {resolvedLabel ?? chosen}
        </span>
        {resolvedAt ? <span className={styles.resolvedAt}>{resolvedAt}</span> : null}
      </section>
    );
  }

  const canConfirm = Boolean(value.trim()) && !sending;

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && canConfirm && onConfirm) {
      event.preventDefault();
      onConfirm();
    }
  }

  return (
    <section
      {...rest}
      ref={ref}
      className={cx(styles.card, sending && styles.sending, className)}
      aria-labelledby={titleId}
      aria-busy={sending || undefined}
      onKeyDown={handleKeyDown}
      onFocusCapture={focus.onFocusCapture}
      onBlurCapture={focus.onBlurCapture}
    >
      <header className={styles.header}>
        <CircleHelp size={16} strokeWidth={ICON_STROKE} className={styles.icon} aria-hidden="true" />
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        {meta ? <span className={styles.meta}>{meta}</span> : null}
      </header>
      <p className={styles.question}>{question}</p>

      {options.length > 0 ? (
        <RadioGroup
          name={`${base}-choice`}
          legend={question}
          hideLegend
          layout="card"
          size="sm"
          disabled={sending}
          value={value || undefined}
          onChange={onValueChange}
          options={options.map((option) => ({
            value: option.id,
            label: option.label,
            description: option.description,
            badge: option.recommended ? "Recommended" : undefined,
            badgeTone: "neutral",
          }))}
        />
      ) : null}

      {freeText && options.length === 0 ? (
        <Field label={freeTextLabel} htmlFor={`${base}-text`} hint={freeTextHint}>
          <Textarea id={`${base}-text`} rows={2} value={value} disabled={sending} onChange={(next) => onValueChange?.(next)} />
        </Field>
      ) : null}

      {status === "error" ? (
        <p className={styles.error} role="alert">
          <CircleX size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
          {errorMessage}
        </p>
      ) : null}

      <footer className={styles.footer}>
        {onSkip ? (
          <Button appearance="ghost" mode="neutral" disabled={sending} onClick={onSkip}>
            Skip for now
          </Button>
        ) : (
          <span />
        )}
        <Button
          shortcut={sending ? undefined : "⌘⏎"}
          aria-keyshortcuts="Meta+Enter Control+Enter"
          iconStart={sending ? "LoaderCircle" : undefined}
          className={sending ? styles.spin : undefined}
          disabled={!canConfirm && !sending}
          onClick={sending ? undefined : onConfirm}
        >
          {sending ? "Sending…" : "Confirm"}
        </Button>
      </footer>
      <span className={styles.srOnly} role="status">
        {sending ? "Sending your answer" : ""}
      </span>
    </section>
  );
}
