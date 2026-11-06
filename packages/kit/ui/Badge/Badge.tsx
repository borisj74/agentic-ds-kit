"use client";

import { X } from "lucide-react";
import type { BadgeProps, BadgeTone } from "./Badge.types";
import { cx } from "../shared/cx";
import styles from "./Badge.module.css";

export type { BadgeProps, BadgeTone, BadgeAppearance, BadgeSize } from "./Badge.types";

const ICON_SIZE = { sm: 12, md: 14, lg: 16 } as const;

function resolvedTone(tone: BadgeTone): Exclude<BadgeTone, "brand"> {
  return tone === "brand" ? "primary" : tone;
}

export function Badge({
  children,
  tone = "neutral",
  appearance = "soft",
  size = "md",
  removable = false,
  disabled = false,
  onRemove,
  className,
  ref,
  ...rest
}: BadgeProps) {
  const iconPx = ICON_SIZE[size];
  const toneClass = resolvedTone(tone);

  return (
    <span
      {...rest}
      ref={ref}
      className={cx(
        styles.badge,
        styles[appearance],
        styles[toneClass],
        styles[size],
        disabled && styles.disabled,
        className,
      )}
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
