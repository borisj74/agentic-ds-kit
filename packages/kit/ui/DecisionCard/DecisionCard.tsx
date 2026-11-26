"use client";

import { useId, type KeyboardEvent } from "react";
import { CircleHelp, CircleX } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Button } from "../Button";
import { Field } from "../Field";
import { RadioGroup } from "../RadioGroup";
import { Textarea } from "../Textarea";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { useResolvedFocus } from "../shared/useResolvedFocus";
import { ResolvedRow, reviewStyles } from "../shared/ResolvedRow";
import { handleReviewKeys } from "../shared/reviewKeys";
import type { DecisionCardProps } from "./DecisionCard.types";
import styles from "./DecisionCard.module.css";
import { nisthaAttr } from "../shared/inspect";

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
    return (
      <ResolvedRow
        {...rest} {...nisthaAttr("decisioncard", rest)}
        ref={mergeRefs(focus.rowRef, ref)}
        className={className}
        outcome={status === "resolved" ? "yes" : "skipped"}
        label={label}
        text={resolvedLabel ?? chosen}
        meta={resolvedAt}
        aria-label={`${label}: ${title}`}
      />
    );
  }

  const canConfirm = Boolean(value.trim()) && !sending;

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (sending) return;
    handleReviewKeys(event, { onYes: canConfirm ? onConfirm : undefined, onNo: onSkip });
  }

  return (
    <section
      {...rest} {...nisthaAttr("decisioncard", rest)}
      ref={ref}
      tabIndex={-1}
      className={cx(styles.card, reviewStyles.focusRing, sending && styles.sending, className)}
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
            // A disabled option stays in the group and says why, so it is announced, not skipped.
            description: option.disabled && option.disabledReason ? option.disabledReason : option.description,
            disabled: option.disabled,
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

      <footer className={reviewStyles.footer}>
        <span className={reviewStyles.actions}>
          {onSkip ? (
            <Button appearance="outline" mode="neutral" aria-keyshortcuts="Escape" disabled={sending} onClick={onSkip}>
              Skip for now
            </Button>
          ) : null}
          {/* Confirm is the one solid primary while it waits; sending or after an error it steps back to outline. */}
          <Button
            appearance={sending || status === "error" ? "outline" : "solid"}
            mode="primary"
            shortcut={sending ? undefined : "⌘⏎"}
            aria-keyshortcuts="Meta+Enter Control+Enter"
            iconStart={sending ? "LoaderCircle" : "Check"}
            className={sending ? styles.spin : undefined}
            disabled={!canConfirm && !sending}
            onClick={sending ? undefined : onConfirm}
          >
            {sending ? "Sending…" : "Confirm"}
          </Button>
        </span>
      </footer>
      <span className={styles.srOnly} role="status">
        {sending ? "Sending your answer" : ""}
      </span>
    </section>
  );
}
