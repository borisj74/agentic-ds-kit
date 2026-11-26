"use client";

import { useId } from "react";
import { Button } from "../Button";
import { DropdownMenu } from "../DropdownMenu";
import { Tooltip } from "../Tooltip";
import { cx } from "../shared/cx";
import type { MessageActionsProps } from "./MessageActions.types";
import styles from "./MessageActions.module.css";
import { useKitLabels } from "../shared/labels";
import { nisthaAttr } from "../shared/inspect";

export type { MessageActionsProps, MessageFeedback } from "./MessageActions.types";

/** The compact action row on a chat message: copy, retry or edit, feedback, and a More menu. Icon Buttons with Tooltips. */
export function MessageActions({
  label = "Message actions",
  onCopy,
  copied = false,
  onRetry,
  retrying = false,
  onEdit,
  onFeedback,
  feedback = null,
  thanksText = "Thanks, noted",
  reasons = [],
  onReason,
  selectedReason = null,
  moreItems,
  onAction,
  visible = "always",
  disabled = false,
  className,
  ref,
  ...rest
}: MessageActionsProps) {
  const labels = useKitLabels();
  const reasonsId = useId().replace(/:/g, "");
  const hasFeedback = Boolean(onFeedback);
  const picked = feedback === "down" && selectedReason ? selectedReason : null;
  const thanks = feedback === "up" ? thanksText : picked && thanksText ? `${thanksText}: ${picked}` : "";

  return (
    <div {...rest} {...nisthaAttr("messageactions", rest)} ref={ref} className={cx(styles.wrap, visible === "hover" && styles.hover, className)}>
      <div className={styles.row}>
        <div role="toolbar" aria-label={label} aria-disabled={disabled || undefined} className={styles.toolbar}>
          {onCopy ? (
            copied ? (
              <Button size="sm" appearance="soft" mode="neutral" iconStart="Check" className={styles.copied} onClick={onCopy} disabled={disabled}>
                Copied
              </Button>
            ) : (
              <Tooltip content="Copy">
                <Button size="sm" appearance="ghost" mode="neutral" iconStart="Copy" ariaLabel={labels.copy} onClick={onCopy} disabled={disabled} />
              </Tooltip>
            )
          ) : null}
          {onRetry ? (
            retrying ? (
              <Button size="sm" appearance="soft" mode="neutral" iconStart="RotateCcw" loading>
                Retrying…
              </Button>
            ) : (
              <Tooltip content="Retry">
                <Button size="sm" appearance="ghost" mode="neutral" iconStart="RotateCcw" ariaLabel={labels.retry} onClick={onRetry} disabled={disabled} />
              </Tooltip>
            )
          ) : null}
          {onEdit ? (
            <Tooltip content="Edit">
              <Button size="sm" appearance="ghost" mode="neutral" iconStart="Pencil" ariaLabel={labels.edit} onClick={onEdit} disabled={disabled} />
            </Tooltip>
          ) : null}
          {hasFeedback ? (
            <>
              <span className={styles.divider} aria-hidden="true" />
              <Tooltip content="Good response">
                <Button
                  size="sm"
                  appearance={feedback === "up" ? "soft" : "ghost"}
                  mode="neutral"
                  iconStart="ThumbsUp"
                  ariaLabel={labels.goodResponse}
                  aria-pressed={feedback === "up"}
                  className={feedback === "up" ? styles.on : undefined}
                  onClick={() => onFeedback?.(feedback === "up" ? null : "up")}
                  disabled={disabled}
                />
              </Tooltip>
              <Tooltip content="Bad response">
                <Button
                  size="sm"
                  appearance={feedback === "down" ? "soft" : "ghost"}
                  mode="neutral"
                  iconStart="ThumbsDown"
                  ariaLabel={labels.badResponse}
                  aria-pressed={feedback === "down"}
                  onClick={() => onFeedback?.(feedback === "down" ? null : "down")}
                  disabled={disabled}
                />
              </Tooltip>
            </>
          ) : null}
          {moreItems?.length ? (
            <DropdownMenu
              size="sm"
              appearance="ghost"
              mode="neutral"
              iconStart="Ellipsis"
              ariaLabel={labels.moreActions}
              align="start"
              disabled={disabled}
              groups={[{ items: moreItems }]}
              onSelect={(id) => onAction?.(id)}
            />
          ) : null}
        </div>
        <span className={styles.thanks} role="status">
          {thanks || null}
        </span>
      </div>
      {feedback === "down" && reasons.length ? (
        <div className={styles.reasons} role="group" aria-labelledby={`${reasonsId}-label`}>
          <span id={`${reasonsId}-label`} className={styles.srOnly}>
            {labels.whatWentWrong}
          </span>
          {reasons.map((reason) => {
            const on = reason === selectedReason;
            return (
              <Button
                key={reason}
                size="sm"
                appearance={on ? "soft" : "outline"}
                mode={on ? "primary" : "neutral"}
                iconStart={on ? "Check" : undefined}
                aria-pressed={on}
                onClick={() => onReason?.(reason)}
                disabled={disabled}
              >
                {reason}
              </Button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
