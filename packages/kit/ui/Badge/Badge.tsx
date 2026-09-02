"use client";

import { X } from "lucide-react";
import type { BadgeProps } from "./Badge.types";
import styles from "./Badge.module.css";

export type { BadgeProps, BadgeTone, BadgeSize } from "./Badge.types";

const ICON_SIZE = { sm: 12, md: 14, lg: 16 } as const;

export function Badge({
  children,
  tone = "neutral",
  size = "md",
  removable = false,
  disabled = false,
  onRemove,
}: BadgeProps) {
  const iconPx = ICON_SIZE[size];

  return (
    <span
      className={`${styles.badge} ${styles[tone]} ${styles[size]}${disabled ? ` ${styles.disabled}` : ""}`}
      aria-disabled={disabled || undefined}
    >
      {children}
      {removable ? (
        <button
          type="button"
          className={styles.remove}
          aria-label={`Remove ${children}`}
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            onRemove?.();
          }}
        >
          <X size={iconPx} color="currentColor" aria-hidden />
        </button>
      ) : null}
    </span>
  );
}
