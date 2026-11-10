"use client";

import { CircleX } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Button } from "../Button";
import { cx } from "./cx";
import styles from "./LoadError.module.css";

/**
 * Internal: the "Couldn't load … · Retry" row the SaaS pattern cards share. role=alert, danger-subtle
 * surface, outline Retry. Not exported from the package.
 */
export function LoadError({ message, onRetry, className }: { message: string; onRetry?: () => void; className?: string }) {
  return (
    <div className={cx(styles.error, className)} role="alert">
      <CircleX size={16} strokeWidth={ICON_STROKE} aria-hidden="true" className={styles.icon} />
      <span className={styles.text}>{message}</span>
      {onRetry ? (
        <Button size="sm" appearance="outline" mode="neutral" iconStart="RotateCcw" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
