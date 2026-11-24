"use client";

import { CircleAlert, CircleCheck, CircleX } from "lucide-react";
import { Button } from "../Button";
import type { SaveBarProps, SaveBarState } from "./SaveBar.types";
import { cx } from "../shared/cx";
import { useNarrow } from "../shared/useNarrow";
import { ICON_STROKE } from "../../lib/icon";
import { nisthaAttr } from "../shared/inspect";
import styles from "./SaveBar.module.css";

export type { SaveBarProps, SaveBarState } from "./SaveBar.types";

/** Below this bar width (30rem, 480px) the status stacks over the buttons and the buttons go to lg 40. */
const NARROW_REM = 30;

const ICONS = { saved: CircleCheck, dirty: CircleAlert, error: CircleX } as const;

/** The status line when no `message` is set. */
export function saveBarStatus(state: SaveBarState, changes: number, savedAt?: string): string {
  if (state === "saved") return savedAt ? `Saved at ${savedAt}` : "All changes saved";
  if (state === "error") return "Not saved";
  if (changes === 0) return "Unsaved changes";
  return changes === 1 ? "1 unsaved change" : `${changes} unsaved changes`;
}

/** The muted line under the status: the changed fields, then when it was last saved. Empty when saved. */
export function saveBarDetail(state: SaveBarState, changes: string[], savedAt?: string): string {
  if (state === "saved") return "";
  const parts: string[] = [];
  if (changes.length > 0) parts.push(changes.join(", "));
  if (savedAt) parts.push(`last saved ${savedAt}`);
  return parts.join(" · ");
}

export function SaveBar({
  state = "dirty",
  changes = [],
  savedAt,
  message,
  onDiscard,
  onSave,
  saveLabel = "Save changes",
  discardLabel = "Discard",
  saving = false,
  className,
  ref,
  ...rest
}: SaveBarProps) {
  const { ref: sizeRef, narrow } = useNarrow<HTMLDivElement>(NARROW_REM);
  const status = message ?? saveBarStatus(state, changes.length, savedAt);
  const detail = saveBarDetail(state, changes, savedAt);
  const Icon = ICONS[state];
  const size = narrow ? "lg" : "md";

  return (
    <div
      aria-label={saveLabel}
      {...rest}
      {...nisthaAttr("savebar", rest)}
      ref={ref}
      role="region"
      className={cx(styles.root, className)}
      data-state={state}
    >
      <div ref={sizeRef} className={styles.bar}>
        <div className={styles.status}>
          <Icon className={styles.icon} size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
          <div className={styles.text}>
            <p className={styles.title} role="status" aria-live="polite">
              {status}
            </p>
            {detail ? <p className={styles.detail}>{detail}</p> : null}
          </div>
        </div>
        <div className={styles.actions}>
          {onDiscard && state !== "saved" ? (
            <Button
              className={styles.discard}
              size={size}
              appearance="outline"
              mode="neutral"
              disabled={saving}
              onClick={onDiscard}
            >
              {discardLabel}
            </Button>
          ) : null}
          <Button
            className={styles.save}
            size={size}
            appearance="solid"
            mode="primary"
            disabled={state === "saved"}
            loading={saving}
            onClick={onSave}
          >
            {saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
