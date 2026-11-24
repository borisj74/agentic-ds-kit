"use client";

import { useEffect, useRef } from "react";
import { CircleX } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Button } from "../Button";
import { cx } from "../shared/cx";
import { nisthaAttr } from "../shared/inspect";
import { useKitLabels } from "../shared/labels";
import type { LoadErrorProps, LoadErrorSize } from "./LoadError.types";
import styles from "./LoadError.module.css";

export type { LoadErrorProps, LoadErrorSize } from "./LoadError.types";

const ICON_SIZE: Record<LoadErrorSize, number> = { sm: 16, md: 16, lg: 20 };

/* When Try again is pressed, the host often swaps this for a Skeleton and back. If the same error
   comes back, the new LoadError takes focus back, but only when focus was lost with the old button.
   Matching on the message keeps another card's error from taking focus. */
const REFOCUS_WINDOW_MS = 10_000;
let lastRetry: { at: number; message: string } | null = null;

export function LoadError({ message, reference, onRetry, size = "sm", className, ref, ...rest }: LoadErrorProps) {
  const labels = useKitLabels();
  const retryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!lastRetry || lastRetry.message !== message || Date.now() - lastRetry.at > REFOCUS_WINDOW_MS) return;
    const active = document.activeElement;
    if (active && active !== document.body) return;
    lastRetry = null;
    retryRef.current?.focus();
    // Mount only: a later message change is not a retry coming back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      {...rest}
      {...nisthaAttr("loaderror", rest)}
      ref={ref}
      role="alert"
      data-size={size}
      className={cx(styles.root, styles[size], className)}
    >
      <div className={styles.copy}>
        <div className={styles.lead}>
          <div className={styles.mediaWell} aria-hidden>
            <CircleX size={ICON_SIZE[size]} strokeWidth={ICON_STROKE} aria-hidden="true" />
          </div>
          <p className={styles.message}>{message}</p>
        </div>
        {reference ? <p className={styles.reference}>{reference}</p> : null}
      </div>
      {onRetry ? (
        <Button
          ref={retryRef}
          size="sm"
          appearance="outline"
          mode="neutral"
          iconStart="RotateCcw"
          onClick={() => {
            lastRetry = { at: Date.now(), message };
            onRetry();
          }}
        >
          {labels.tryAgain}
        </Button>
      ) : null}
    </div>
  );
}
